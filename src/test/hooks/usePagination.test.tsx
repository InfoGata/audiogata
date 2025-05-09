import { describe, expect, test } from "vitest";
import { renderHook, act } from "@testing-library/react";
import usePagination from "../../hooks/usePagination";
import { PageInfo } from "../../plugintypes";

describe("usePagination", () => {
  test("should return default values when no page info is provided", () => {
    const { result } = renderHook(() => usePagination());
    
    expect(result.current.page).toBeUndefined();
    expect(result.current.hasPreviousPage).toBe(false);
    expect(result.current.hasNextPage).toBe(false);
    
    // These functions should exist but not throw errors when called
    expect(() => result.current.onPreviousPage()).not.toThrow();
    expect(() => result.current.onNextPage()).not.toThrow();
    expect(() => result.current.resetPage()).not.toThrow();
  });

  test("should handle first page correctly", () => {
    const pageInfo: PageInfo = {
      offset: 0,
      resultsPerPage: 10,
      totalResults: 30,
    };
    
    const { result } = renderHook(() => usePagination(pageInfo));
    
    expect(result.current.page).toBeUndefined(); // initially undefined until navigation
    expect(result.current.hasPreviousPage).toBe(false);
    expect(result.current.hasNextPage).toBe(true);
    
    // Go to next page
    act(() => {
      result.current.onNextPage();
    });
    
    expect(result.current.page).toEqual({
      offset: 10,
      resultsPerPage: 10,
      totalResults: 30,
      nextPage: undefined,
    });
  });

  test("should handle middle page correctly", () => {
    const pageInfo: PageInfo = {
      offset: 10,
      resultsPerPage: 10,
      totalResults: 30,
    };
    
    const { result } = renderHook(() => usePagination(pageInfo));
    
    expect(result.current.hasPreviousPage).toBe(true);
    expect(result.current.hasNextPage).toBe(true);
    
    // Go to previous page
    act(() => {
      result.current.onPreviousPage();
    });
    
    expect(result.current.page).toEqual({
      offset: 0,
      resultsPerPage: 10,
      totalResults: 30,
      prevPage: undefined,
    });
    
    // Reset to original and then go to next page
    act(() => {
      result.current.resetPage();
    });
    
    expect(result.current.page).toBeUndefined();
    
    // Re-render with the initial pageInfo to simulate a reset
    const { result: newResult } = renderHook(() => usePagination(pageInfo));
    
    act(() => {
      newResult.current.onNextPage();
    });
    
    expect(newResult.current.page).toEqual({
      offset: 20,
      resultsPerPage: 10,
      totalResults: 30,
      nextPage: undefined,
    });
  });

  test("should handle last page correctly", () => {
    const pageInfo: PageInfo = {
      offset: 20,
      resultsPerPage: 10,
      totalResults: 30,
    };
    
    const { result } = renderHook(() => usePagination(pageInfo));
    
    expect(result.current.hasPreviousPage).toBe(true);
    expect(result.current.hasNextPage).toBe(false);
    
    // Go to previous page
    act(() => {
      result.current.onPreviousPage();
    });
    
    expect(result.current.page).toEqual({
      offset: 10,
      resultsPerPage: 10,
      totalResults: 30,
      prevPage: undefined,
    });
  });

  test("should handle nextPage string for pagination without totalResults", () => {
    const pageInfo: PageInfo = {
      offset: 0,
      resultsPerPage: 10,
      nextPage: "next-page-token",
    };
    
    const { result } = renderHook(() => usePagination(pageInfo));
    
    expect(result.current.hasPreviousPage).toBe(false);
    expect(result.current.hasNextPage).toBe(true);
    
    // Go to next page
    act(() => {
      result.current.onNextPage();
    });
    
    expect(result.current.page).toEqual({
      offset: 10,
      resultsPerPage: 10,
      nextPage: "next-page-token",
    });
  });

  test("should not show next page when at the end and no nextPage token", () => {
    const pageInfo: PageInfo = {
      offset: 0,
      resultsPerPage: 10,
      // No nextPage token and no totalResults
    };
    
    const { result } = renderHook(() => usePagination(pageInfo));
    
    expect(result.current.hasPreviousPage).toBe(false);
    expect(result.current.hasNextPage).toBe(false);
  });
});