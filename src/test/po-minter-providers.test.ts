import { describe, expect, it } from "vitest";
import {
  PO_TOKEN_PROVIDERS,
  checkPoTokenRequest,
} from "../po-minter/providers";

const YOUTUBE = "https://www.youtube.com";
const VIDEO_ID = "uC8sc0cQa9M";

describe("checkPoTokenRequest", () => {
  it("accepts a known origin and a valid binding", () => {
    const check = checkPoTokenRequest(YOUTUBE, VIDEO_ID);
    expect(check.ok).toBe(true);
    if (!check.ok) return;
    expect(check.provider).toBe(PO_TOKEN_PROVIDERS[YOUTUBE]);
    expect(check.provider.frameUrl).toBe("https://www.youtube.com/");
    expect(check.config).toEqual({
      origin: YOUTUBE,
      challengeCall: "window.ytAtN(",
      requestKey: "O43z0dpjhgX20SCx4KAo",
      integrityTokenPath: "/api/jnn/v1/GenerateIT",
    });
  });

  it("refuses origins it has no provider for", () => {
    expect(checkPoTokenRequest("https://example.com", VIDEO_ID).ok).toBe(false);
    expect(checkPoTokenRequest("https://youtube.com", VIDEO_ID).ok).toBe(false);
    expect(checkPoTokenRequest(undefined, VIDEO_ID).ok).toBe(false);
  });

  it("refuses inherited property names as origins", () => {
    expect(checkPoTokenRequest("constructor", VIDEO_ID).ok).toBe(false);
    expect(checkPoTokenRequest("__proto__", VIDEO_ID).ok).toBe(false);
  });

  it("refuses bindings the provider does not mint for", () => {
    expect(checkPoTokenRequest(YOUTUBE, "short").ok).toBe(false);
    expect(checkPoTokenRequest(YOUTUBE, "uC8sc0cQa9M!").ok).toBe(false);
    expect(checkPoTokenRequest(YOUTUBE, 12345678901).ok).toBe(false);
  });

  it("applies overrides that stay on the provider's origin", () => {
    const check = checkPoTokenRequest(YOUTUBE, VIDEO_ID, {
      requestKey: "newKey_123",
      integrityTokenPath: "/api/jnn/v2/GenerateIT",
    });
    expect(check.ok && check.config.requestKey).toBe("newKey_123");
    expect(check.ok && check.config.integrityTokenPath).toBe("/api/jnn/v2/GenerateIT");
  });

  it("treats null overrides like none", () => {
    expect(checkPoTokenRequest(YOUTUBE, VIDEO_ID, null).ok).toBe(true);
  });

  it("refuses overrides that could leave the provider's origin", () => {
    for (const integrityTokenPath of [
      "https://evil.example/GenerateIT",
      "//evil.example/GenerateIT",
      "/api/../GenerateIT",
      "api/jnn/v1/GenerateIT",
      "/api?x=1",
    ]) {
      expect(checkPoTokenRequest(YOUTUBE, VIDEO_ID, { integrityTokenPath }).ok).toBe(false);
    }
  });

  it("refuses malformed overrides", () => {
    expect(checkPoTokenRequest(YOUTUBE, VIDEO_ID, "x").ok).toBe(false);
    expect(checkPoTokenRequest(YOUTUBE, VIDEO_ID, { requestKey: "has space" }).ok).toBe(false);
    expect(checkPoTokenRequest(YOUTUBE, VIDEO_ID, { requestKey: 5 }).ok).toBe(false);
  });
});
