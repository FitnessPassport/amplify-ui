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
  FileData,
  DownloadHandlerData,
} from '../handlers';

import { Task, Tasks, useProcessTasks } from '../../tasks';
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

interface HandleActionInput {
  location?: LocationData;
}
type HandleTasksAction = (input?: HandleActionInput) => void;

interface HandleTaskActionInput<T, K> extends HandleActionInput {
  data: T;
  options?: {
    onSuccess?: (data: { id: string; key: string }, value: K) => void;
    onError?: (
      data: { id: string; key: string },
      message: string | undefined
    ) => void;
  };
}

type HandlerInput<T extends TaskData, K, U = undefined> = U extends undefined
  ? HandleTaskActionInput<T, K>
  : HandleActionInput;

type HandleTaskAction<T, K> = (input: HandleTaskActionInput<T, K>) => void;

interface TasksActionHandlerState<T extends TaskData> {
  reset: () => void;
  tasks: Tasks<T>;
}

type UseTasksActionHandlerState<T extends TaskData> = [
  TasksActionHandlerState<T>,
  HandleTasksAction,
];

// interface TaskActionHandlerState<T extends TaskData> {
//   task: Task<T>;
// }

type UseTaskActionHandlerState<T extends TaskData, K> = [
  Task<T>,
  HandleTaskAction<T, K>,
];

type UseActionHandlerState<
  T extends TaskData,
  K,
  U = undefined,
> = U extends undefined
  ? UseTaskActionHandlerState<T, K>
  : UseTasksActionHandlerState<T>;

interface ActionHandlerOptions<U extends TaskData = TaskData> {
  items: U[];
  onTaskSuccess?: (task: Task<U>) => void;
}

export const useActionHandler = <
  U,
  RValue,
  TData extends U & TaskData = U & TaskData,
  Opts extends ActionHandlerOptions<TData> | undefined = undefined,
>(
  action: ActionHandler<U, RValue>,
  options?: Opts
): UseActionHandlerState<TData, RValue, Opts> => {
  const { items, onTaskSuccess } = options ?? {};
  const getConfig = useGetActionInput({
    errorMessage:
      '`useAction` must be called from within `StorageBrowser.Provider`',
  });

  const {
    location: { current },
  } = useStore()[0];

  const [{ reset, tasks }, processTask] = useProcessTasks(action, items, {
    // @ts-expect-error
    onTaskSuccess,
    ...(items ? { concurrency: 4 } : undefined),
  });

  const handler = React.useCallback(
    (input: HandlerInput<TData, RValue, Opts>) => {
      const { location } = input ?? {};
      const config = getConfig(location ?? current);
      if ((input as HandleTaskActionInput<TData, RValue>)?.data) {
        reset();
        // @ts-expect-error
        processTask({ ...input, config });
      }

      // @ts-expect-error
      processTask({ config });
    },
    [current, getConfig, processTask, reset]
  );

  if (items) {
    // eslint-disable-next-line no-console
    console.log('tasks', tasks);
    // @ts-expect-error
    return [{ reset, tasks }, handler];
  }

  // @ts-expect-error
  return [tasks?.[0], handler];
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
  _type: K,
  opts?: __UseActionValues<T>[K] extends { tasks: Task<infer I>[] }
    ? ActionHandlerOptions<I>
    : never
) => __UseActionValues<T>[K];

export const createUseActions = <T extends Action_Configs>(
  _configs: T
): ___UseActionFinal<T> => {
  const { custom } = _configs ?? {};

  const customActions = !custom
    ? {}
    : Object.entries(custom).reduce((actions, [key, { handler }]) => {
        return {
          ...actions,
          [key]: (opts) => {
            return useActionHandler(handler, opts);
          },
        };
      }, {});

  return <K extends keyof __UseActionValues<T>>(
    _type: K,
    opts: any
  ): __UseActionValues<T>[K] => {
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return customActions[_type](opts);
  };
};

// const downloadItems: DownloadHandlerData[] = [];

// // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useDownloadAction = () => useActionHandler(downloadHandler);

// // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useDeleteAction = () => useActionHandler(deleteHandler);

// type CustomAction = ActionHandler<FileData[]>;

// const useMe = (): void => {
//   const [state, handle] = useDownloadAction();
//   const __out = state.tasks;
//   const _maybe = handle({ location: {} });
// };

// export const action: CustomAction = (_input) => {
//   return {
//     result: Promise.resolve({ value: undefined, status: 'COMPLETE' }),
//   };
// };
