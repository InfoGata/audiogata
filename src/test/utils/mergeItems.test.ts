import { describe, expect, test } from "vitest";
import { mergeItems } from "../../utils";
import { Track, Album, Artist } from "../../plugintypes";

describe("mergeItems", () => {
  test("merges two arrays of tracks with unique IDs", () => {
    const arr1: Track[] = [
      { id: "1", name: "Track 1" },
      { id: "2", name: "Track 2" },
    ];
    
    const arr2: Track[] = [
      { id: "3", name: "Track 3" },
      { id: "4", name: "Track 4" },
    ];
    
    const result = mergeItems(arr1, arr2);
    expect(result).toHaveLength(4);
    expect(result.map(t => t.id)).toEqual(expect.arrayContaining(["1", "2", "3", "4"]));
  });
  
  test("resolves conflicts by using track from second array", () => {
    const arr1: Track[] = [
      { id: "1", name: "Track 1" },
      { id: "2", name: "Track 2 Original" },
    ];
    
    const arr2: Track[] = [
      { id: "2", name: "Track 2 Updated" },
      { id: "3", name: "Track 3" },
    ];
    
    const result = mergeItems(arr1, arr2);
    expect(result).toHaveLength(3);
    
    const track2 = result.find(t => t.id === "2");
    expect(track2?.name).toBe("Track 2 Updated");
  });
  
  test("handles empty arrays", () => {
    expect(mergeItems([], [])).toEqual([]);
    
    const arr1: Track[] = [
      { id: "1", name: "Track 1" },
      { id: "2", name: "Track 2" },
    ];
    
    expect(mergeItems(arr1, [])).toEqual(arr1);
    expect(mergeItems([], arr1)).toEqual(arr1);
  });
  
  test("ignores items without IDs", () => {
    const arr1: Track[] = [
      { id: "1", name: "Track 1" },
      { name: "Track without ID" },
    ];
    
    const arr2: Track[] = [
      { id: "2", name: "Track 2" },
      { name: "Another track without ID" },
    ];
    
    const result = mergeItems(arr1, arr2);
    expect(result).toHaveLength(2);
    expect(result.map(t => t.id)).toEqual(expect.arrayContaining(["1", "2"]));
  });
  
  test("works with other types like Album", () => {
    const arr1: Album[] = [
      { id: "1", name: "Album 1" },
      { id: "2", name: "Album 2" },
    ];
    
    const arr2: Album[] = [
      { id: "2", name: "Album 2 Updated" },
      { id: "3", name: "Album 3" },
    ];
    
    const result = mergeItems(arr1, arr2);
    expect(result).toHaveLength(3);
    expect(result.find(a => a.id === "2")?.name).toBe("Album 2 Updated");
  });
  
  test("works with other types like Artist", () => {
    const arr1: Artist[] = [
      { id: "1", name: "Artist 1" },
      { id: "2", name: "Artist 2" },
    ];
    
    const arr2: Artist[] = [
      { id: "2", name: "Artist 2 Updated" },
      { id: "3", name: "Artist 3" },
    ];
    
    const result = mergeItems(arr1, arr2);
    expect(result).toHaveLength(3);
    expect(result.find(a => a.id === "2")?.name).toBe("Artist 2 Updated");
  });
  
  test("works with custom types having an id property", () => {
    interface CustomType {
      id?: string;
      title: string;
      value: number;
    }
    
    const arr1: CustomType[] = [
      { id: "1", title: "Item 1", value: 100 },
      { id: "2", title: "Item 2", value: 200 },
    ];
    
    const arr2: CustomType[] = [
      { id: "2", title: "Item 2 Updated", value: 250 },
      { id: "3", title: "Item 3", value: 300 },
    ];
    
    const result = mergeItems(arr1, arr2);
    expect(result).toHaveLength(3);
    const updatedItem = result.find(item => item.id === "2");
    expect(updatedItem?.title).toBe("Item 2 Updated");
    expect(updatedItem?.value).toBe(250);
  });
});