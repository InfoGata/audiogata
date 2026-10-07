/**
 * Sites the desktop and Android apps can mint proof-of-origin tokens for.
 *
 * The same table lives in the InfoGata extension (src/po-token-providers.ts);
 * keep the two in step. The plugin API only names an origin and a content
 * binding; what each site needs is here.
 */

export type PoTokenProvider = {
  /**
   * Loaded in the hidden minter page. Unlike the extension's, it carries no
   * marker: the page is a window of its own rather than a frame that header
   * rules have to pick out, and YouTube drops unknown query parameters anyway.
   */
  frameUrl: string;
  /** Tokens are bound to this; anything else is refused before a page loads. */
  bindingPattern: RegExp;
  /** An inline script on the page whose argument carries the challenge. */
  challengeCall: string;
  /** Identifies the site to the integrity token exchange. */
  requestKey: string;
  /** Path on the provider's origin that exchanges a BotGuard response for an integrity token. */
  integrityTokenPath: string;
};

export const PO_TOKEN_PROVIDERS: Record<string, PoTokenProvider> = {
  "https://www.youtube.com": {
    frameUrl: "https://www.youtube.com/",
    // Video ids
    bindingPattern: /^[A-Za-z0-9_-]{11}$/,
    challengeCall: "window.ytAtN(",
    requestKey: "O43z0dpjhgX20SCx4KAo",
    integrityTokenPath: "/api/jnn/v1/GenerateIT",
  },
};

/**
 * Values a plugin may substitute when a site changes them faster than the
 * apps can ship. Both are data: the key is opaque, and the path stays on the
 * provider's origin.
 */
export type PoTokenOverrides = {
  requestKey?: string;
  integrityTokenPath?: string;
};

/** What the page script needs, with any overrides applied. */
export type PoTokenMintConfig = {
  origin: string;
  challengeCall: string;
  requestKey: string;
  integrityTokenPath: string;
};

/** Where the page script leaves its API on the minter page's window. */
export const PO_MINTER_GLOBAL = "__infogataPoMinter";

export type PoMinterApi = {
  mint: (config: PoTokenMintConfig, contentBinding: string) => Promise<string>;
};

export type PoTokenRequestCheck =
  | { ok: true; provider: PoTokenProvider; config: PoTokenMintConfig }
  | { ok: false; error: string };

const REQUEST_KEY_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
// The second character is not a slash: "//host/path" is protocol-relative and
// would take the exchange to another origin.
const PATH_PATTERN = /^\/[A-Za-z0-9_\-.][A-Za-z0-9_\-/.]{0,199}$/;

/** Everything a plugin sends is checked here before any page loads. */
export const checkPoTokenRequest = (
  origin: unknown,
  contentBinding: unknown,
  overrides?: unknown
): PoTokenRequestCheck => {
  const provider =
    typeof origin === "string" && Object.hasOwn(PO_TOKEN_PROVIDERS, origin)
      ? PO_TOKEN_PROVIDERS[origin]
      : undefined;
  if (typeof origin !== "string" || !provider) {
    return { ok: false, error: `Cannot mint tokens for ${String(origin)}` };
  }
  if (typeof contentBinding !== "string" || !provider.bindingPattern.test(contentBinding)) {
    return { ok: false, error: "Invalid content binding" };
  }

  const config: PoTokenMintConfig = {
    origin,
    challengeCall: provider.challengeCall,
    requestKey: provider.requestKey,
    integrityTokenPath: provider.integrityTokenPath,
  };

  if (overrides !== undefined && overrides !== null) {
    if (typeof overrides !== "object") {
      return { ok: false, error: "Invalid overrides" };
    }
    const { requestKey, integrityTokenPath } = overrides as PoTokenOverrides;
    if (requestKey !== undefined) {
      if (typeof requestKey !== "string" || !REQUEST_KEY_PATTERN.test(requestKey)) {
        return { ok: false, error: "Invalid requestKey override" };
      }
      config.requestKey = requestKey;
    }
    if (integrityTokenPath !== undefined) {
      if (
        typeof integrityTokenPath !== "string" ||
        !PATH_PATTERN.test(integrityTokenPath) ||
        integrityTokenPath.includes("..")
      ) {
        return { ok: false, error: "Invalid integrityTokenPath override" };
      }
      config.integrityTokenPath = integrityTokenPath;
    }
  }

  return { ok: true, provider, config };
};
