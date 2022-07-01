import React from "react";
import { PageInfo } from "../plugintypes";

const usePagination = (currentPage?: PageInfo) => {
  const [page, setPage] = React.useState<PageInfo>();
  if (!currentPage) {
    return {
      page: undefined,
      hasPreviousPage: false,
      hasNextPage: false,
      onPreviousPage: () => {},
      onNextPage: () => {},
    };
  }

  const hasPreviousPage = currentPage.offset !== 0;
  const nextOffset = currentPage.offset + currentPage.resultsPerPage;
  const hasNextPage = nextOffset < currentPage.totalResults;

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
  };
};

export default usePagination;
