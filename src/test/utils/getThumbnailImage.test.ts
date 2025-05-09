import { describe, expect, test } from "vitest";
import { getThumbnailImage } from "../../utils";
import { ImageInfo } from "../../plugintypes";

describe("getThumbnailImage", () => {
  test("returns undefined when no images provided", () => {
    expect(getThumbnailImage(undefined, 200)).toBeUndefined();
    expect(getThumbnailImage([], 200)).toBeUndefined();
  });

  test("returns largest image URL when all images are smaller than requested size", () => {
    const images: ImageInfo[] = [
      { url: "small.jpg", height: 50, width: 50 },
      { url: "medium.jpg", height: 100, width: 100 },
      { url: "large.jpg", height: 150, width: 150 },
    ];
    
    // The function should return the largest image when none are bigger than the requested size
    expect(getThumbnailImage(images, 200)).toBe("large.jpg");
  });

  test("returns first image URL bigger than or equal to requested size", () => {
    const images: ImageInfo[] = [
      { url: "small.jpg", height: 50, width: 50 },
      { url: "medium.jpg", height: 200, width: 200 },
      { url: "large.jpg", height: 300, width: 300 },
    ];
    
    expect(getThumbnailImage(images, 200)).toBe("medium.jpg");
  });

  test("handles images without height/width properties", () => {
    const images: ImageInfo[] = [
      { url: "small.jpg" },
      { url: "medium.jpg", height: 200, width: 200 },
    ];
    
    expect(getThumbnailImage(images, 100)).toBe("medium.jpg");
  });

  test("handles unsorted image arrays", () => {
    const images: ImageInfo[] = [
      { url: "large.jpg", height: 300, width: 300 },
      { url: "small.jpg", height: 50, width: 50 },
      { url: "medium.jpg", height: 200, width: 200 },
    ];
    
    expect(getThumbnailImage(images, 200)).toBe("medium.jpg");
  });
});