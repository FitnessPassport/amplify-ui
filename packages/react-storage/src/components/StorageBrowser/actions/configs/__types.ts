import React from 'react';
import { StorageBrowserIconType } from '../../context/elements';
import { LocationPermissions } from '../../actions';

import {
  LocationItemData,
  CreateFolderHandler,
  DeleteHandler,
  CopyHandler,
  TaskHandler,
  DownloadHandler,
  deleteHandler,
  downloadHandler,
  copyHandler,
  createFolderHandler,
  uploadHandler,
  TaskHandlerInput,
  TaskData,
  UploadHandlerData,
  TaskHandlerOutput,
  LocationData,
} from '../handlers';

import { Tasks, useProcessTasks } from '../../tasks';
import { useGetActionInput } from '../../providers/configuration';
import { useStore } from '../../providers/store';

const copyActionConfig: CopyActionConfig = {
  viewName: 'CopyView',
  actionListItem: {
    disable: (selected) => !selected,
    hide: (permissions) => !permissions.includes('write'),
    icon: 'copy-file',
    label: 'Copy Files',
  },
  handler: copyHandler,
};

const createFolderActionConfig: CreateFolderActionConfig = {
  viewName: 'CreateFolderView',
  actionListItem: {
    disable: (selected) => !!selected,
    hide: (permissions) => !permissions.includes('write'),
    icon: 'create-folder',
    label: 'Create Folder',
  },
  handler: createFolderHandler,
};

const uploadActionConfig: UploadActionConfig = {
  viewName: 'UploadView',
  actionListItem: {
    disable: (selectedValues) => !!selectedValues,
    hide: (permissions) => !permissions.includes('write'),
    icon: 'upload-file',
    label: 'Upload',
  },
  handler: uploadHandler,
};

const deleteActionConfig: DeleteActionConfig = {
  viewName: 'DeleteView',
  actionListItem: {
    disable: (selected) => !selected,
    hide: (permissions) => !permissions.includes('delete'),
    icon: 'delete-file',
    label: 'Delete Files',
  },
  handler: deleteHandler,
};

type StringWithoutSpaces<T extends string> = Exclude<
  T,
  ` ${string}` | `${string} ` | `${string} ${string}`
>;

type ComponentName = Capitalize<`${string}View`>;
type ActionName = StringWithoutSpaces<string>;

interface ActionListItemConfig {
  /**
   * conditionally disable item selection based on currently selected values
   * @default false
   */
  disable?: (selectedValues: LocationItemData[] | undefined) => boolean;

  /**
   * conditionally render list item based on location permission
   * @default false
   */
  hide?: (permissions: LocationPermissions) => boolean;

  /**
   * list item icon
   */
  icon: StorageBrowserIconType;

  /**
   * list item label
   */
  label: string;
}

/**
 * defines an action to be included in the actions list of the `LocationDetailView` with
 * a dedicated subcomponent of the `LocationActionView`
 */
export interface ActionConfig<
  T extends ActionHandler = ActionHandler,
  K extends ComponentName = ComponentName,
> {
  /**
   * action handler
   */
  handler: T extends ActionHandler<infer U, infer G>
    ? ActionHandler<U, G>
    : never;

  /**
   * The view slot name associated with the action provided on the
   * `StorageBrowser` through the `views` prop
   */
  viewName: K;

  /**
   * configure action list item behavior. provide multiple configs
   * to create additional list items for a single action
   */
  actionListItem: ActionListItemConfig;
}

interface UploadActionConfig
  extends ActionConfig<UploadActionHandler, 'UploadView'> {}

interface DeleteActionConfig
  extends ActionConfig<DeleteHandler, 'DeleteView'> {}

interface CopyActionConfig extends ActionConfig<CopyHandler, 'CopyView'> {}

interface CreateFolderActionConfig
  extends ActionConfig<CreateFolderHandler, 'CreateFolderView'> {}

interface Default_ActionConfigs {
  createFolder: CreateFolderActionConfig;
  upload: UploadActionConfig;
  delete: DeleteActionConfig;
  download: DownloadHandler;
  copy: CopyActionConfig;
}

export const defaultStorageBrowserActions = {
  copy: copyActionConfig,
  createFolder: createFolderActionConfig,
  delete: deleteActionConfig,
  download: downloadHandler,
  upload: uploadActionConfig,
};

type Custom_ActionConfigs = Record<ActionName, ActionConfig>;

export interface Action_Configs {
  default?: Default_ActionConfigs;
  custom?: Custom_ActionConfigs;
}

type ResolvedHandlerType<T> = {
  [K in keyof T]: T[K] extends { handler: infer X } | infer X ? X : never;
};

type ResolvedActionTypes<T> = T extends {
  default?: Default_ActionConfigs;
  custom?: infer U;
}
  ? ResolvedHandlerType<
      Default_ActionConfigs & Omit<U, keyof Default_ActionConfigs>
    >
  : never;

export type ActionHandler<T = any, U = any> = TaskHandler<
  TaskHandlerInput<T & TaskData>,
  TaskHandlerOutput<U>
>;

type UploadActionHandler = ActionHandler<UploadHandlerData>;

type HandleAction<T, K> = (input: {
  data: Omit<T, 'id'>;
  location?: LocationData;
  options?: {
    onSuccess?: (data: { id: string; key: string }, value: K) => void;
    onError?: (
      data: { id: string; key: string },
      message: string | undefined
    ) => void;
  };
}) => void;

type UseActionHandlerState<T, K> = [
  { reset: () => void; tasks: Tasks<T & TaskData> },
  HandleAction<T, K>,
];

export const useActionHandler = <TData, RValue>(
  action: ActionHandler<TData, RValue>
): UseActionHandlerState<TData & TaskData, RValue> => {
  const getConfig = useGetActionInput({
    errorMessage:
      '`useAction` must be called from inside `StorageBrowser.Provider`',
  });

  const {
    location: { current },
  } = useStore()[0];

  const [{ reset, tasks }, processTask] = useProcessTasks(action);

  const handler: HandleAction<TData, RValue> = React.useCallback(
    ({ data: _data, location, options }) => {
      const config = getConfig(location ?? current);
      const data = { ..._data, id: crypto.randomUUID() };

      // @ts-expect-error
      processTask({ config, data, options });
    },
    [current, getConfig, processTask]
  );

  return [{ reset, tasks }, handler];
};

type CreateUseActionHandlerState<T extends ActionHandler> =
  T extends ActionHandler<infer K, infer F>
    ? UseActionHandlerState<K & TaskData, F>
    : never;

type __UseActionValues<T extends Action_Configs> = {
  [K in keyof ResolvedActionTypes<T>]: CreateUseActionHandlerState<
    ResolvedActionTypes<T>[K]
  >;
};

export type ___UseActionFinal<T extends Action_Configs> = <
  K extends keyof __UseActionValues<T>,
>(
  _type: K
) => __UseActionValues<T>[K];

export const createUseActions = <T extends Action_Configs>(
  _configs: T
): ___UseActionFinal<T> => {
  const { custom } = _configs ?? {};

  const customActions = !custom
    ? {}
    : Object.entries(custom).reduce((actions, [key, { handler }]) => {
        return { ...actions, [key]: () => useActionHandler(handler) };
      }, {});

  return <K extends keyof __UseActionValues<T>>(
    _type: K
  ): __UseActionValues<T>[K] => {
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return customActions[_type]();
  };
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useDownloadAction = () => useActionHandler(downloadHandler);
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useDeleteAction = () => useActionHandler(deleteHandler);
