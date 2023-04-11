import { describe, test, expect } from "vitest";
import { Track } from "../plugintypes";
import { mergeTracks } from "../utils";

describe("utils", () => {
  test("mergeTracks", () => {
    const arr1: Track[] = [
      {
        id: "1",
        name: "Test Name",
      },
      {
        id: "2",
        name: "Test Name 2",
      },
    ];

    const arr2: Track[] = [
      {
        id: "3",
        name: "Test Name 3",
      },
      {
        id: "2",
        name: "Test Name arr2",
      },
    ];

    const newTracks = mergeTracks(arr1, arr2);
    expect(newTracks.length === 3).toBeTruthy();
    expect(newTracks[1].name === "Test Name arr2").toBeTruthy();
  });
});
