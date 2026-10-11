import { Capacitor, CapacitorHttp, HttpOptions } from "@capacitor/core";

/**
 * Plugin network requests on Android and iOS, sent with CapacitorHttp
 * directly instead of through its patched fetch. The patch can't carry bytes
 * either way: it sends an ArrayBuffer body as `{}`, runs a Uint8Array body
 * through TextDecoder, and reads every non-JSON response as UTF-8 text. That
 * breaks anything binary, such as YouTube's SABR requests (a protobuf body,
 * a UMP response).
 *
 * Returns undefined for bodies it doesn't handle (FormData, streams), which
 * are left to fetch.
 */
export const nativeNetworkRequest = async (
  input: string,
  init?: RequestInit
): Promise<
  | {
      body: Blob;
      headers: Record<string, string>;
      status: number;
      statusText: string;
      url: string;
    }
  | undefined
> => {
  const headers = Object.fromEntries(new Headers(init?.headers).entries());
  const options: HttpOptions = {
    url: input,
    method: init?.method ?? "GET",
    headers,
    responseType: "arraybuffer",
  };

  const body = init?.body;
  if (body == null) {
    // No body.
  } else if (typeof body === "string" || body instanceof URLSearchParams) {
    options.data = body.toString();
  } else if (
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body) ||
    body instanceof Blob
  ) {
    options.data = await blobToBase64(new Blob([body]));
    options.dataType = "file";
    // Android writes no body at all without a content type.
    if (!headers["content-type"]) {
      headers["content-type"] =
        body instanceof Blob && body.type
          ? body.type
          : "application/octet-stream";
    }
  } else {
    return undefined;
  }

  // Native can't be stopped once started; an abort only drops its answer.
  const signal = init?.signal;
  signal?.throwIfAborted();
  const request = CapacitorHttp.request(options);
  const response = signal
    ? await Promise.race([
        request,
        new Promise<never>((_, reject) =>
          signal.addEventListener("abort", () => reject(signal.reason), {
            once: true,
          })
        ),
      ])
    : await request;
  return {
    body: responseDataToBlob(response),
    headers: response.headers,
    status: response.status,
    statusText: "",
    url: response.url,
  };
};

const blobToBase64 = async (blob: Blob): Promise<string> => {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
};

/**
 * Native parses JSON whatever the response type, and base64 encodes the rest,
 * except that Android reads an error response (400 and up) as text.
 */
const responseDataToBlob = ({
  data,
  headers,
  status,
}: {
  data: unknown;
  headers: Record<string, string>;
  status: number;
}): Blob => {
  const contentType =
    Object.entries(headers).find(
      ([key]) => key.toLowerCase() === "content-type"
    )?.[1] ?? "";
  if (data == null) {
    return new Blob([], { type: contentType });
  }
  if (typeof data !== "string") {
    return new Blob([JSON.stringify(data)], { type: contentType });
  }
  if (Capacitor.getPlatform() === "android" && status >= 400) {
    return new Blob([data], { type: contentType });
  }
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: contentType });
};
