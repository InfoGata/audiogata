import type { PluginFrameContainer } from "@/contexts/PluginsContext";
import { CloudSyncError, type CloudSyncProvider } from "./CloudSyncProvider";

const toBase64 = (data: Uint8Array): string => {
  let binary = "";
  // Chunked: String.fromCharCode(...data) overflows the stack on large documents.
  for (let i = 0; i < data.length; i += 0x8000) {
    binary += String.fromCharCode(...data.subarray(i, i + 0x8000));
  }
  return btoa(binary);
};

const fromBase64 = (base64: string): Uint8Array =>
  Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

/** Stores the document through a plugin's onSyncUpload/onSyncDownload. */
export class PluginSyncProviderAdapter implements CloudSyncProvider {
  readonly pluginId: string;

  constructor(private plugin: PluginFrameContainer) {
    this.pluginId = plugin.id || "unknown";
  }

  async upload(docUrl: string, data: Uint8Array): Promise<void> {
    const response = await this.plugin.remote.onSyncUpload({
      docUrl,
      data: toBase64(data),
    });
    if (!response?.success) {
      throw new CloudSyncError(response?.error || "Upload failed", this.pluginId);
    }
  }

  async download(docUrl: string): Promise<Uint8Array | null> {
    const response = await this.plugin.remote.onSyncDownload({ docUrl });
    if (response?.error) {
      throw new CloudSyncError(response.error, this.pluginId);
    }
    return response?.data ? fromBase64(response.data) : null;
  }
}
