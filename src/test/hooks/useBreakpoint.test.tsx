import { describe, expect, it as test, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

// Mock react-responsive
vi.mock("react-responsive", () => ({
  useMediaQuery: vi.fn(() => true)
}));

// Import after mocks
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useMediaQuery } from "react-responsive";

describe("useBreakpoint", () => {
  beforeEach(() => {
    // Reset the mock before each test
    vi.mocked(useMediaQuery).mockClear();
  });

  test("should return true for isLg when large screen is matched", () => {
    // Set up the mock to return true
    vi.mocked(useMediaQuery).mockReturnValue(true);
    
    const { result } = renderHook(() => useBreakpoint("lg"));
    
    expect(result.current.isLg).toBe(true);
    expect(useMediaQuery).toHaveBeenCalled();
  });
  
  test("should return false for isLg when large screen is not matched", () => {
    // Set up the mock to return false
    vi.mocked(useMediaQuery).mockReturnValue(false);
    
    const { result } = renderHook(() => useBreakpoint("lg"));
    
    expect(result.current.isLg).toBe(false);
  });
  
  test("should return true for isSm when small screen is matched", () => {
    // Set up the mock to return true
    vi.mocked(useMediaQuery).mockReturnValue(true);
    
    const { result } = renderHook(() => useBreakpoint("sm"));
    
    expect(result.current.isSm).toBe(true);
    expect(useMediaQuery).toHaveBeenCalled();
  });
  
  test("should return true for isMd when medium screen is matched", () => {
    // Set up the mock to return true
    vi.mocked(useMediaQuery).mockReturnValue(true);
    
    const { result } = renderHook(() => useBreakpoint("md"));
    
    expect(result.current.isMd).toBe(true);
    expect(useMediaQuery).toHaveBeenCalled();
  });
});