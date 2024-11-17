import React, { useState } from 'react';

import { isFunction } from '@aws-amplify/ui';

import { copyHandler, LocationData } from '../../../actions/handlers';
import { Task, useProcessTasks } from '../../../tasks';
import { useGetActionInput } from '../../../providers/configuration';
import { useStore } from '../../../providers/store';

import { CopyViewState, UseCopyViewOptions } from './types';
import { useFolders } from './useFolders';

export const useCopyView = (options?: UseCopyViewOptions): CopyViewState => {
  const { onExit } = options ?? {};
  const [
    {
      location,
      locationItems: { fileDataItems },
    },
    dispatchStoreAction,
  ] = useStore();

  const getInput = useGetActionInput();
  const [destination, setDestination] = useState(location);

  const data = React.useMemo(
    () =>
      fileDataItems?.map((item) => ({
        ...item,
        // generate new `id` on each `destination.key` change to refresh
        // task data in `useProcessTasks`
        id: crypto.randomUUID(),
        key: `${destination.key}${item.fileKey}`,
        sourceKey: item.key,
      })),
    [destination.key, fileDataItems]
  );
  const [destination, setDestination] = useState(location);

  const folders = useFolders({ destination, setDestination });

  const [processState, handleProcess] = useProcessTasks(copyHandler, data, {
    concurrency: 4,
  });

  const { isProcessing, isProcessingComplete, statusCounts, tasks } =
    processState;
  const { current } = location;
  const { onInitialize } = folders;

  // initial load
  React.useEffect(() => {
    onInitialize();
  }, [onInitialize]);

  const onActionStart = () => {
    handleProcess({ config: getInput() });
  };

  const onActionCancel = () => {
    tasks.forEach((task) => {
      if (isFunction(task.cancel)) task.cancel();
    });
  };

  const onActionExit = () => {
    // clear files state
    dispatchStoreAction({ type: 'RESET_LOCATION_ITEMS' });
    // clear selected action
    dispatchStoreAction({ type: 'RESET_ACTION_TYPE' });
    if (isFunction(onExit)) onExit(current);
  };

  const onTaskRemove = React.useCallback(
    ({ data }: Task) => {
      dispatchStoreAction({ type: 'REMOVE_LOCATION_ITEM', id: data.id });
    },
    [dispatchStoreAction]
  );

  const onSelectDestination = (
    selectedDestination: LocationData,
    path?: string
  ) => {
    setDestination({
      current: selectedDestination,
      path: path ?? '',
      key: `${selectedDestination.prefix ?? ''}${path}`,
    });
  };

  return {
    destination,
    isProcessing,
    isProcessingComplete,
    folders,
    location,
    statusCounts,
    tasks,
    onActionCancel,
    onActionStart,
    onActionExit,
    onSelectDestination,
    onTaskRemove,
  };
};
