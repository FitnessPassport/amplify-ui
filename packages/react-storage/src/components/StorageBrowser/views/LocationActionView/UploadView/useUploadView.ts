import React from 'react';

import { uploadHandler } from '../../../actions';

import { useGetActionInput } from '../../../providers/configuration';
import { FileItems, useStore } from '../../../providers/store';
import { Task, useProcessTasks } from '../../../tasks';

import { DEFAULT_ACTION_CONCURRENCY } from '../constants';
import { UploadViewState, UseUploadViewOptions } from './types';
import { DEFAULT_OVERWRITE_ENABLED } from './constants';
import { isUndefined } from '@aws-amplify/ui';
import { isFileTooBig } from '../../../validators';

interface FilesData {
  invalidFiles: FileItems | undefined;
  validFiles: FileItems | undefined;
  data: FileItems | undefined;
}

export const useUploadView = (
  options?: UseUploadViewOptions
): UploadViewState => {
  const { onExit: _onExit } = options ?? {};
  const getInput = useGetActionInput();
  const [{ files, location }, dispatchStoreAction] = useStore();
  const { current } = location;

  const filesData = React.useMemo(
    () =>
      (files ?? [])?.reduce(
        (curr: FilesData, item) => {
          if (isFileTooBig(item.file)) {
            curr.invalidFiles = isUndefined(curr.invalidFiles)
              ? [item]
              : curr.invalidFiles.concat(item);
          } else {
            curr.validFiles = isUndefined(curr.validFiles)
              ? [item]
              : curr.validFiles.concat(item);

            const parsedFileItem = {
              ...item,
              key: `${location.key}${item.key}`,
            };

            curr.data = isUndefined(curr.data)
              ? [parsedFileItem]
              : curr.data.concat(parsedFileItem);
          }

          return curr;
        },
        { invalidFiles: undefined, validFiles: undefined, data: undefined }
      ),
    [files, location.key]
  );

  const { data, invalidFiles } = filesData;

  const [isOverwritingEnabled, setIsOverwritingEnabled] = React.useState(
    DEFAULT_OVERWRITE_ENABLED
  );

  const [
    { isProcessing, isProcessingComplete, statusCounts, tasks },
    handleProcess,
  ] = useProcessTasks(uploadHandler, data, {
    concurrency: DEFAULT_ACTION_CONCURRENCY,
  });

  const onDropFiles = React.useCallback(
    (files: File[]) => {
      if (files) {
        dispatchStoreAction({ type: 'ADD_FILE_ITEMS', files });
      }
    },
    [dispatchStoreAction]
  );

  const onSelectFiles = React.useCallback(
    (type?: 'FILE' | 'FOLDER') => {
      dispatchStoreAction({ type: 'SELECT_FILES', selectionType: type });
    },
    [dispatchStoreAction]
  );

  const onActionStart = React.useCallback(() => {
    invalidFiles?.forEach((file) => {
      dispatchStoreAction({ type: 'REMOVE_FILE_ITEM', id: file.id });
    });

    handleProcess({
      config: getInput(),
      options: { preventOverwrite: !isOverwritingEnabled },
    });
  }, [
    dispatchStoreAction,
    invalidFiles,
    isOverwritingEnabled,
    getInput,
    handleProcess,
  ]);

  const onActionCancel = React.useCallback(() => {
    tasks.forEach((task) => task.cancel?.());
  }, [tasks]);

  const onActionExit = React.useCallback(() => {
    // clear files state
    dispatchStoreAction({ type: 'RESET_FILE_ITEMS' });
    // clear selected action
    dispatchStoreAction({ type: 'RESET_ACTION_TYPE' });
    _onExit?.(current);
  }, [dispatchStoreAction, _onExit, current]);

  const onToggleOverwrite = React.useCallback(() => {
    setIsOverwritingEnabled((prev) => !prev);
  }, []);

  const onTaskRemove = React.useCallback(
    ({ data }: Task) => {
      dispatchStoreAction({ type: 'REMOVE_FILE_ITEM', id: data.id });
    },
    [dispatchStoreAction]
  );

  return {
    isProcessing,
    isProcessingComplete,
    isOverwritingEnabled,
    location,
    invalidFiles,
    statusCounts,
    tasks,
    onActionCancel,
    onActionExit,
    onActionStart,
    onDropFiles,
    onTaskRemove,
    onSelectFiles,
    onToggleOverwrite,
  };
};
