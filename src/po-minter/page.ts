import { BotGuardClient } from "bgutils-js/botguard";
import { WebPoMinter } from "bgutils-js/webpo";
import { getHeaders, parseLooseJSON } from "bgutils-js/utils";
import type { WebPoSignalOutput } from "bgutils-js/shared-types";
import {
  PO_MINTER_GLOBAL,
  type PoMinterApi,
  type PoTokenMintConfig,
} from "./providers";

/**
 * Runs as the provider's own page in the desktop and Android apps' hidden
 * minter page, and is built on its own into public/po-minter.js
 * (vite.po-minter.config.ts) so both can inject it as plain source. A port of
 * the InfoGata extension's entrypoints/po-minter.ts; keep the two in step.
 *
 * It uses the BotGuard VM the site's own page loaded rather than loading one,
 * and the challenge it reads comes from that same page load, so the two always
 * match.
 */

const VM_TIMEOUT_MS = 15_000;
const VM_POLL_MS = 250;

type BgChallenge = { program: string; globalName: string };

type MinterState = {
  requestKey: string;
  integrityTokenPath: string;
  minter: WebPoMinter;
  /** When to build a new minter; the site's refresh threshold before expiry. */
  refreshAt: number;
};

const install = () => {
  const target = window as unknown as Record<string, unknown>;
  // Injected on every page load; the first injection's state is the one to keep.
  if (target[PO_MINTER_GLOBAL]) return;

  let state: MinterState | undefined;
  let building: Promise<MinterState> | undefined;

  /** The challenge object anywhere inside the page's call argument. */
  const findBgChallenge = (value: unknown): BgChallenge | undefined => {
    if (!value || typeof value !== "object") return undefined;
    const record = value as Record<string, unknown>;
    const challenge = record.bgChallenge as Partial<BgChallenge> | undefined;
    if (challenge?.program && challenge.globalName) {
      return challenge as BgChallenge;
    }
    for (const child of Object.values(record)) {
      const found = findBgChallenge(child);
      if (found) return found;
    }
    return undefined;
  };

  const readChallenge = (challengeCall: string): BgChallenge => {
    // The page mentions the call more than once (its own definition among
    // them), so every occurrence is tried, not just the first.
    for (const script of Array.from(document.scripts)) {
      const text = script.text;
      for (
        let start = text.indexOf(challengeCall);
        start !== -1;
        start = text.indexOf(challengeCall, start + 1)
      ) {
        const match = text
          .slice(start + challengeCall.length)
          .match(/^\s*({[\s\S]*?})\s*\)/);
        if (!match?.[1]) continue;
        try {
          const challenge = findBgChallenge(parseLooseJSON(match[1]));
          if (challenge) return challenge;
        } catch {
          // Not the argument we want; keep looking.
        }
      }
    }
    throw new Error("The page carries no BotGuard challenge");
  };

  const waitForVm = async (globalName: string) => {
    const deadline = Date.now() + VM_TIMEOUT_MS;
    while (!target[globalName]) {
      if (Date.now() > deadline) {
        throw new Error("The page never loaded BotGuard");
      }
      await new Promise((resolve) => setTimeout(resolve, VM_POLL_MS));
    }
  };

  const build = async (config: PoTokenMintConfig): Promise<MinterState> => {
    const challenge = readChallenge(config.challengeCall);
    await waitForVm(challenge.globalName);

    const botguard = await BotGuardClient.create({
      program: challenge.program,
      globalName: challenge.globalName,
      globalObject: window,
    });
    const webPoSignalOutput: WebPoSignalOutput = [];
    const botguardResponse = await botguard.snapshot({ webPoSignalOutput });

    // Same origin as the page, and anonymous: the token does not need the
    // user's account.
    const response = await fetch(config.integrityTokenPath, {
      method: "POST",
      headers: getHeaders(),
      credentials: "omit",
      body: JSON.stringify([config.requestKey, botguardResponse]),
    });
    if (!response.ok) {
      throw new Error(`Integrity token request failed: ${response.status}`);
    }
    const [integrityToken, estimatedTtlSecs, mintRefreshThreshold, websafeFallbackToken] =
      (await response.json()) as [string, number, number, string];

    const minter = await WebPoMinter.create(
      { integrityToken, estimatedTtlSecs, mintRefreshThreshold, websafeFallbackToken },
      webPoSignalOutput
    );
    return {
      requestKey: config.requestKey,
      integrityTokenPath: config.integrityTokenPath,
      minter,
      refreshAt: Date.now() + (estimatedTtlSecs - mintRefreshThreshold) * 1000,
    };
  };

  const getMinter = async (config: PoTokenMintConfig): Promise<WebPoMinter> => {
    const usable =
      state &&
      state.requestKey === config.requestKey &&
      state.integrityTokenPath === config.integrityTokenPath &&
      Date.now() < state.refreshAt;
    if (usable) return state!.minter;

    // Concurrent mints share one build rather than each running BotGuard.
    building ??= build(config).finally(() => {
      building = undefined;
    });
    state = await building;
    return state.minter;
  };

  const api: PoMinterApi = {
    mint: async (config, contentBinding) => {
      if (location.origin !== config.origin) {
        throw new Error("Not the minter page");
      }
      const minter = await getMinter(config);
      return await minter.mintAsWebsafeString(contentBinding);
    },
  };

  Object.defineProperty(target, PO_MINTER_GLOBAL, { value: api });
};

install();
