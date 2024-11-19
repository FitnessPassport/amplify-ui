import React from 'react';

import { isFunction, isUndefined } from '@aws-amplify/ui';
import { useDataState } from '@aws-amplify/ui-react-core';

import { usePaginate } from '../hooks/usePaginate';
import { useStore } from '../../providers/store';
import {
  FileData,
  LocationData,
  listLocationItemsHandler,
  useActionConfigs,
} from '../../actions';
import { createEnhancedListHandler } from '../../actions/useAction/createEnhancedListHandler';
import { useGetActionInput } from '../../providers/configuration';
import { useSearch } from '../hooks/useSearch';

import { useDownloadAction } from '../../actions/configs/__types';

import { Tasks } from '../../tasks';
import { DownloadHandlerData, FileDataItem } from '../../actions';
import { LocationDetailViewState, UseLocationDetailViewOptions } from './types';

const DEFAULT_PAGE_SIZE = 100;
export const DEFAULT_LIST_OPTIONS = {
  delimiter: '/',
  pageSize: DEFAULT_PAGE_SIZE,
};

const listLocationItemsAction = createEnhancedListHandler(
  listLocationItemsHandler
);

const getDownloadErrorMessageFromFailedDownloadTask = (
  tasks: Tasks<DownloadHandlerData>
): string | undefined => {
  if (!tasks.length) {
    return undefined;
  }

  return `Failed to download ${
    tasks[0].data.fileKey ?? tasks[0].data.key
  } due to error: ${tasks[0].message}.`;
};

export const useLocationDetailView = (
  options?: UseLocationDetailViewOptions
): LocationDetailViewState => {
  const getConfig = useGetActionInput();
  const { initialValues, onExit, onNavigate } = options ?? {};

  const listOptionsRef = React.useRef({
    ...DEFAULT_LIST_OPTIONS,
    ...initialValues,
  });

  const listOptions = listOptionsRef.current;

  const [{ location, locationItems }, dispatchStoreAction] = useStore();
  const { current, key } = location;
  const { permissions, prefix } = current ?? {};
  const { fileDataItems } = locationItems;
  const hasInvalidPrefix = isUndefined(prefix);

  const [{ reset: resetDownloads, tasks }, handleDownload] =
    useDownloadAction();

  const [{ data, isLoading, hasError, message }, handleList] = useDataState(
    listLocationItemsAction,
    { items: [], nextToken: undefined }
  );

  // set up pagination
  const { items, nextToken, search } = data;
  const { hasExhaustedSearch = false } = search ?? {};
  const hasNextToken = !!nextToken;
  const paginateCallback = () => {
    if (hasInvalidPrefix || !nextToken) return;
    dispatchStoreAction({ type: 'RESET_LOCATION_ITEMS' });
    handleList({
      config: getConfig(),
      prefix: key,
      options: { ...listOptions, nextToken },
    });
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

  const onSearch = (query: string, includeSubfolders?: boolean) => {
    if (hasInvalidPrefix) return;
    const searchOptions = {
      ...listOptions,
      delimiter: includeSubfolders ? undefined : listOptions.delimiter,
      search: {
        query,
        filterBy: 'key' as const,
        groupBy: includeSubfolders ? listOptions.delimiter : undefined,
      },
    };

    handleReset();
    handleList({ config: getConfig(), prefix: key, options: searchOptions });
    resetDownloads();
    dispatchStoreAction({ type: 'RESET_LOCATION_ITEMS' });
  };

  const {
    searchQuery,
    isSearchingSubfolders,
    onSearchQueryChange,
    onSearchSubmit,
    onToggleSearchSubfolders,
    resetSearch,
  } = useSearch({ onSearch });

  const onRefresh = () => {
    if (hasInvalidPrefix) return;

    handleReset();
    resetSearch();
    handleList({
      config: getConfig(),
      prefix: key,
      options: { ...listOptions, refresh: true },
    });
    resetDownloads();
    dispatchStoreAction({ type: 'RESET_LOCATION_ITEMS' });
  };

  React.useEffect(() => {
    if (hasInvalidPrefix) return;
    handleList({
      config: getConfig(),
      prefix: key,
      options: { ...listOptions, refresh: true },
    });
    handleReset();
  }, [
    handleList,
    handleReset,
    listOptions,
    hasInvalidPrefix,
    getConfig,
    prefix,
    key,
  ]);

  // Logic for Select All Files functionality
  const fileItems = React.useMemo(
    () => pageItems.filter((item): item is FileData => item.type === 'FILE'),
    [pageItems]
  );
  const areAllFilesSelected = fileDataItems?.length === fileItems.length;
  const shouldShowEmptyMessage =
    pageItems.length === 0 && !isLoading && !hasError;

  const { actions: _actions } = useActionConfigs() ?? {};

  const actions = React.useMemo(() => {
    if (!permissions) {
      return [];
    }

    return Object.entries(_actions).map(([actionType, config]) => {
      const { actionListItem } = config ?? {};

      const { icon, hide, disable, label } = actionListItem ?? {};

      return {
        actionType,
        icon,
        isDisabled: isFunction(disable)
          ? disable(fileDataItems)
          : disable ?? false,
        isHidden: isFunction(hide) ? hide(permissions) : hide,
        label,
      };
    });
  }, [_actions, fileDataItems, permissions]);

  return {
    actions,
    page: currentPage,
    pageItems,
    location,
    areAllFilesSelected,
    fileDataItems,
    hasFiles: fileItems.length > 0,
    hasError,
    hasDownloadError: tasks.some((task) => task.status === 'FAILED'),
    hasNextPage: hasNextToken,
    highestPageVisited,
    message,
    downloadErrorMessage: getDownloadErrorMessageFromFailedDownloadTask(tasks),
    shouldShowEmptyMessage,
    isLoading,
    isSearchingSubfolders,
    onPaginate,
    searchQuery,
    hasExhaustedSearch,
    onRefresh,
    onNavigate: (location: LocationData, path?: string) => {
      onNavigate?.(location, path);
      resetSearch();
      dispatchStoreAction({ type: 'NAVIGATE', location, path });
      dispatchStoreAction({ type: 'RESET_LOCATION_ITEMS' });
    },
    onDropFiles: (files: File[]) => {
      dispatchStoreAction({ type: 'ADD_FILE_ITEMS', files });

      const actionType = 'upload';
      dispatchStoreAction({ type: 'SET_ACTION_TYPE', actionType });
      options?.onActionSelect?.(actionType);
    },
    onDownload: (data: FileDataItem) => {
      handleDownload({ data });
    },
    onNavigateHome: () => {
      onExit?.();
      dispatchStoreAction({ type: 'RESET_LOCATION' });

      handleList({
        config: getConfig(),
        // @todo: prefix should not be required to refresh
        prefix: prefix ?? '',
        options: { reset: true },
      });
      dispatchStoreAction({ type: 'RESET_ACTION_TYPE' });
      dispatchStoreAction({ type: 'RESET_LOCATION_ITEMS' });
    },
    onActionSelect: (actionType) => {
      options?.onActionSelect?.(actionType);
      dispatchStoreAction({ type: 'SET_ACTION_TYPE', actionType });
    },
    onSelect: (isSelected: boolean, fileItem: FileData) => {
      dispatchStoreAction(
        isSelected
          ? { type: 'REMOVE_LOCATION_ITEM', id: fileItem.id }
          : { type: 'SET_LOCATION_ITEMS', items: [fileItem] }
      );
    },
    onSelectAll: () => {
      dispatchStoreAction(
        areAllFilesSelected
          ? { type: 'RESET_LOCATION_ITEMS' }
          : { type: 'SET_LOCATION_ITEMS', items: fileItems }
      );
    },
    onSearch: onSearchSubmit,
    onSearchClear: () => {
      resetSearch();
      if (hasInvalidPrefix) return;
      handleList({
        config: getConfig(),
        prefix: key,
        options: { ...listOptions, refresh: true },
      });
      handleReset();
    },
    onSearchQueryChange,
    onToggleSearchSubfolders,
  };
};
