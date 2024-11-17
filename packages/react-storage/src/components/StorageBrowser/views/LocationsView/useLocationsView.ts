import React from 'react';

import { usePaginate } from '../hooks/usePaginate';
import {
  createFileDataItemFromLocation,
  ListLocationsExcludeOptions,
  LocationData,
  useListLocations,
} from '../../actions';
import { useStore } from '../../providers/store';
import { useSearch } from '../hooks/useSearch';

import { LocationsViewState, UseLocationsViewOptions } from './types';
import { useDownloadAction } from '../../actions/configs/_types';

const DEFAULT_EXCLUDE: ListLocationsExcludeOptions = {
  exactPermissions: ['delete', 'write'],
};
const DEFAULT_PAGE_SIZE = 100;
export const DEFAULT_LIST_OPTIONS = {
  exclude: DEFAULT_EXCLUDE,
  pageSize: DEFAULT_PAGE_SIZE,
};

export const useLocationsView = (
  options?: UseLocationsViewOptions
): LocationsViewState => {
  const [state, handleList] = useListLocations();
  const { data, message, hasError, isLoading } = state;

  const [_, handleDownload] = useDownloadAction();

  const [, dispatchStoreAction] = useStore();
  const { items, nextToken, search } = data;
  const hasNextToken = !!nextToken;
  const { hasExhaustedSearch = false } = search ?? {};

  const onNavigate = options?.onNavigate;
  const initialValues = options?.initialValues ?? {};

  const listOptionsRef = React.useRef({
    ...DEFAULT_LIST_OPTIONS,
    ...initialValues,
  });
  const listOptions = listOptionsRef.current;

  // initial load
  React.useEffect(() => {
    handleList({ options: { ...listOptions, refresh: true } });
  }, [handleList, listOptions]);

  // set up pagination
  const paginateCallback = () => {
    if (!nextToken) return;
    handleList({ options: { ...listOptions, nextToken } });
  };

  const {
    currentPage,
    onPaginate,
    handleReset,
    highestPageVisited,
    pageItems,
  } = usePaginate({
    items,
    paginateCallback,
    pageSize: listOptions.pageSize,
    hasNextToken,
  });

  const onSearch = (query: string) => {
    handleReset();
    handleList({
      options: {
        ...listOptions,
        search: {
          query,
          filterBy: (location: LocationData) => {
            return location.prefix ? 'prefix' : 'bucket';
          },
        },
      },
    });
  };

  const { searchQuery, onSearchQueryChange, onSearchSubmit, resetSearch } =
    useSearch({ onSearch });

  const shouldShowEmptyMessage =
    pageItems.length === 0 && !isLoading && !hasError;

  return {
    isLoading,
    hasError,
    message,
    page: currentPage,
    hasNextPage: hasNextToken,
    highestPageVisited,
    pageItems,
    shouldShowEmptyMessage,
    searchQuery,
    hasExhaustedSearch,
    onDownload: (location: LocationData) => {
      handleDownload({
        data: createFileDataItemFromLocation(location),
        location,
      });
    },
    onNavigate: (location: LocationData) => {
      onNavigate?.(location);
      dispatchStoreAction({ type: 'NAVIGATE', location });
    },
    onRefresh: () => {
      resetSearch();
      handleReset();
      handleList({ options: { ...listOptions, refresh: true } });
    },
    onPaginate,
    onSearch: onSearchSubmit,
    onSearchQueryChange,
    onSearchClear: () => {
      resetSearch();
      handleReset();
      handleList({
        options: { ...listOptions, refresh: true },
      });
    },
  };
};
