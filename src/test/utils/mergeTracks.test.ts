import { describe, expect, test } from "vitest";
import { mergeTracks } from "../../utils";
import { Track } from "../../plugintypes";

describe("mergeTracks", () => {
  test("merges two arrays of tracks with unique IDs", () => {
    const arr1: Track[] = [
      { id: "1", name: "Track 1" },
      { id: "2", name: "Track 2" },
    ];
    
    const arr2: Track[] = [
      { id: "3", name: "Track 3" },
      { id: "4", name: "Track 4" },
    ];
    
    const result = mergeTracks(arr1, arr2);
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
    
    const result = mergeTracks(arr1, arr2);
    expect(result).toHaveLength(3);
    
    const track2 = result.find(t => t.id === "2");
    expect(track2?.name).toBe("Track 2 Updated");
  });
  
  test("handles empty arrays", () => {
    expect(mergeTracks([], [])).toEqual([]);
    
    const arr1: Track[] = [
      { id: "1", name: "Track 1" },
      { id: "2", name: "Track 2" },
    ];
    
    expect(mergeTracks(arr1, [])).toEqual(arr1);
    expect(mergeTracks([], arr1)).toEqual(arr1);
  });
  
  test("ignores tracks without IDs", () => {
    const arr1: Track[] = [
      { id: "1", name: "Track 1" },
      { name: "Track without ID" },
    ];
    
    const arr2: Track[] = [
      { id: "2", name: "Track 2" },
      { name: "Another track without ID" },
    ];
    
    const result = mergeTracks(arr1, arr2);
    expect(result).toHaveLength(2);
    expect(result.map(t => t.id)).toEqual(expect.arrayContaining(["1", "2"]));
  });
});