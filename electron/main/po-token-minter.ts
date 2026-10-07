import { is } from "@electron-toolkit/utils";
import { app, BrowserWindow, session, type Session } from "electron";
import { readFile } from "fs/promises";
import { join } from "path";
import {
  PO_MINTER_GLOBAL,
  type PoTokenMintConfig,
  type PoTokenProvider,
} from "../../src/po-minter/providers";

/**
 * Mints proof-of-origin tokens in a hidden window on the provider's origin.
 *
 * YouTube streams only about a minute of most videos to a client that cannot
 * show a token from its BotGuard check, which only yields a usable token on
 * youtube.com. This loads the provider's page in a window of its own, runs
 * public/po-minter.js in it, and returns the token; the renderer reaches it over
 * the "mint-po-token" IPC channel. The InfoGata extension does the same in a
 * hidden frame for the web app.
 */

/** A window is cheap to keep while tracks play and pointless once they stop. */
const IDLE_CLOSE_MS = 10 * 60_000;
/** The first mint waits on the provider's page and BotGuard; later ones are instant. */
const MINT_TIMEOUT_MS = 45_000;

/**
 * In memory (no "persist:"), so it starts empty every run and never shares a
 * cookie jar with the app or a login window.
 */
const PARTITION = "po-minter";

let minterSession: Session | undefined;

/**
 * The page is anonymous: no cookie goes out and none is set, so the provider's
 * scripts never act on anyone's account. Its UA is plain Chrome; Electron's own
 * names Electron and the app.
 */
const getMinterSession = () => {
  if (minterSession) return minterSession;
  const ses = session.fromPartition(PARTITION);
  ses.setUserAgent(
    ses
      .getUserAgent()
      .replace(/ Electron\/\S+/, "")
      .replace(new RegExp(` ${app.getName()}/\\S+`, "i"), "")
  );
  ses.webRequest.onBeforeSendHeaders((details, callback) => {
    const requestHeaders = { ...details.requestHeaders };
    for (const name of Object.keys(requestHeaders)) {
      if (name.toLowerCase() === "cookie") delete requestHeaders[name];
    }
    callback({ requestHeaders });
  });
  ses.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = { ...details.responseHeaders };
    for (const name of Object.keys(responseHeaders)) {
      if (name.toLowerCase() === "set-cookie") delete responseHeaders[name];
    }
    callback({ responseHeaders });
  });
  ses.setPermissionRequestHandler((_webContents, _permission, callback) =>
    callback(false)
  );
  minterSession = ses;
  return ses;
};

let minterWindow: BrowserWindow | undefined;
let minterUrl: string | undefined;
let loaded: Promise<BrowserWindow> | undefined;

const closeWindow = () => {
  const window = minterWindow;
  minterWindow = undefined;
  minterUrl = undefined;
  loaded = undefined;
  if (window && !window.isDestroyed()) window.destroy();
};

const ensureWindow = (provider: PoTokenProvider): Promise<BrowserWindow> => {
  if (
    loaded &&
    minterWindow &&
    !minterWindow.isDestroyed() &&
    minterUrl === provider.frameUrl
  ) {
    return loaded;
  }
  closeWindow();

  const window = new BrowserWindow({
    show: false,
    webPreferences: {
      session: getMinterSession(),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      // Hidden, but its timers still have to run for BotGuard.
      backgroundThrottling: false,
    },
  });
  window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  minterWindow = window;
  minterUrl = provider.frameUrl;
  loaded = window.loadURL(provider.frameUrl).then(
    () => window,
    (error) => {
      if (minterWindow === window) closeWindow();
      throw error;
    }
  );
  return loaded;
};

/** po-minter.js's source; it sits with the renderer build. */
let minterSource: Promise<string> | undefined;

const loadMinterSource = () => {
  minterSource ??= readFile(
    is.dev
      ? join(app.getAppPath(), "public/po-minter.js")
      : join(__dirname, "../renderer/po-minter.js"),
    "utf8"
  ).catch((error) => {
    minterSource = undefined;
    throw error;
  });
  return minterSource;
};

type MintOutcome = { token: string } | { error: string };

/** Serialized into the page, so it closes over nothing. */
const callMinter = async (
  globalName: string,
  config: PoTokenMintConfig,
  contentBinding: string
): Promise<MintOutcome> => {
  const api = (window as unknown as Record<string, { mint: (c: PoTokenMintConfig, b: string) => Promise<string> }>)[globalName];
  if (!api) return { error: "The minter script is not loaded" };
  try {
    return { token: await api.mint(config, contentBinding) };
  } catch (e) {
    return { error: String(e instanceof Error ? e.message : e) };
  }
};

let idleTimer: ReturnType<typeof setTimeout> | undefined;

const scheduleIdleClose = () => {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(closeWindow, IDLE_CLOSE_MS);
};

const withTimeout = <T>(promise: Promise<T>, ms: number, message: string) =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });

/** Whether `webContents` is the minter's own window, which must never reach IPC. */
export const isMinterWindow = (webContents: Electron.WebContents) =>
  !!minterWindow && !minterWindow.isDestroyed() && minterWindow.webContents === webContents;

/** One mint at a time, so tracks starting together share one window. */
let queue: Promise<unknown> = Promise.resolve();

export const mintPoToken = (
  provider: PoTokenProvider,
  config: PoTokenMintConfig,
  contentBinding: string
): Promise<string> => {
  const run = async () => {
    scheduleIdleClose();
    const window = await ensureWindow(provider);
    // The page may have navigated (a consent wall, say) since it loaded.
    if (new URL(window.webContents.getURL()).origin !== config.origin) {
      closeWindow();
      throw new Error(`The minter page is not on ${config.origin}`);
    }
    // po-minter.js installs its API once and ignores being run again.
    await window.webContents.executeJavaScript(await loadMinterSource());
    const outcome: MintOutcome = await withTimeout(
      window.webContents.executeJavaScript(
        `(${callMinter.toString()})(${JSON.stringify(PO_MINTER_GLOBAL)}, ${JSON.stringify(config)}, ${JSON.stringify(contentBinding)})`
      ),
      MINT_TIMEOUT_MS,
      "No answer from the minter page"
    );
    scheduleIdleClose();
    if ("error" in outcome) throw new Error(outcome.error);
    return outcome.token;
  };

  const next = queue.then(run, run);
  queue = next.catch(() => undefined);
  return next;
};

/** Closes the window at quit, so it does not hold the app open. */
export const closePoTokenMinter = () => {
  clearTimeout(idleTimer);
  closeWindow();
};
