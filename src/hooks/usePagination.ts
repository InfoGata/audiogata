import React from "react";
import { PageInfo } from "../plugintypes";

const usePagination = (currentPage?: PageInfo) => {
  const [page, setPage] = React.useState<PageInfo>();
  const resetPage = () => {
    setPage(undefined);
  };

  if (!currentPage) {
    return {
      page: undefined,
      hasPreviousPage: false,
      hasNextPage: false,
      onPreviousPage: () => {},
      onNextPage: () => {},
      resetPage,
    };
  }

  const hasPreviousPage = currentPage.offset !== 0;
  const nextOffset = currentPage.offset + currentPage.resultsPerPage;
  // If no totalResults just check if nextPage exists
  const hasNextPage = currentPage.totalResults
    ? nextOffset < currentPage.totalResults
    : !!currentPage.nextPage;

  const onPreviousPage = () => {
    const prevOffset = currentPage.offset - currentPage.resultsPerPage;
    const newPage: PageInfo = {
      offset: prevOffset,
      totalResults: currentPage.totalResults,
      resultsPerPage: currentPage.resultsPerPage,
      prevPage: currentPage.prevPage,
    };
    setPage(newPage);
  };

  const onNextPage = () => {
    const newPage: PageInfo = {
      offset: nextOffset,
      totalResults: currentPage.totalResults,
      resultsPerPage: currentPage.resultsPerPage,
      nextPage: currentPage.nextPage,
    };
    setPage(newPage);
  };

  return {
    page,
    hasPreviousPage,
    hasNextPage,
    onPreviousPage,
    onNextPage,
    resetPage,
  };
};

export default usePagination;
