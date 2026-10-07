import { Capacitor, registerPlugin } from "@capacitor/core";
import isElectron from "is-electron";
import { checkPoTokenRequest, type PoTokenMintConfig, type PoTokenOverrides } from "./providers";

/**
 * Proof-of-origin tokens on the desktop and Android apps, which have no
 * InfoGata extension: each loads the provider's page in a hidden window or
 * WebView of its own and runs public/po-minter.js there.
 */

interface PoTokenMinterPlugin {
  mint(options: {
    frameUrl: string;
    config: PoTokenMintConfig;
    contentBinding: string;
  }): Promise<{ token: string }>;
}

/** android/app/src/main/java/com/audiogata/app/PoTokenMinterPlugin.java */
const PoTokenMinter = registerPlugin<PoTokenMinterPlugin>("PoTokenMinter");

/** Rejects where minting is not available, or for an origin or binding it cannot mint for. */
export const mintPoTokenNatively = async (
  origin: string,
  contentBinding: string,
  overrides?: PoTokenOverrides
): Promise<string> => {
  // The main process checks the request itself.
  if (isElectron() && window.api?.mintPoToken) {
    return await window.api.mintPoToken(origin, contentBinding, overrides);
  }
  if (Capacitor.getPlatform() === "android") {
    const check = checkPoTokenRequest(origin, contentBinding, overrides);
    if (!check.ok) throw new Error(check.error);
    const { token } = await PoTokenMinter.mint({
      frameUrl: check.provider.frameUrl,
      config: check.config,
      contentBinding,
    });
    return token;
  }
  throw new Error("Proof-of-origin tokens are not available here");
};
