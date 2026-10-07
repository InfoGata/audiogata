import { ManifestAuthentication } from "@/plugintypes";
import type { PoTokenOverrides } from "@/po-minter/providers";

export interface Api {
  openLoginWindow: (auth: ManifestAuthentication, pluginId: string) => void;
  /** Rejects for origins or bindings the app cannot mint for. */
  mintPoToken: (
    origin: string,
    contentBinding: string,
    overrides?: PoTokenOverrides
  ) => Promise<string>;
}
