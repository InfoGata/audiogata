import { ManifestAuthentication } from "@/plugintypes";

export interface Api {
  openLoginWindow: (auth: ManifestAuthentication, pluginId: string) => void;
}
