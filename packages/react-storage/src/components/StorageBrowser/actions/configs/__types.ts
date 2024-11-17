import React from 'react';
import { IconVariant } from '../../context/elements';
import { ActionState, LocationPermissions } from '../../actions';

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
  DownloadHandlerData,
  DeleteHandlerData,
  LocationData,
} from '../handlers';

import { Tasks, useProcessTasks } from '../../tasks';
import { useGetActionInput } from '../../providers/configuration';

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
  icon: IconVariant;

  /**
   * list item label
   */
  label: string;
}

/**
 * defines an action to be included in the actions list of the `LocationDetailView` with
 * a dedicated subcomponent of the `LocationActionView`
 */
interface ActionConfig<
  T extends ActionHandler<any> = ActionHandler,
  K extends ComponentName = ComponentName,
> {
  /**
   * action handler
   */
  handler: T extends ActionHandler<infer U> ? ActionHandler<U> : never;

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

const maybeNotSoCool: ActionHandler<{ someValue: string }, { bonus: number }> =
  null as unknown as ActionHandler<{ someValue: string }>;

const coolAction: ActionConfig<typeof maybeNotSoCool, 'PartyView'> = {
  handler: maybeNotSoCool,
  viewName: 'PartyView',
  actionListItem: {
    icon: 'sort-indeterminate',
    label: 'pick me',
  },
};

const default_Actions = {
  copy: copyActionConfig,
  createFolder: createFolderActionConfig,
  delete: deleteActionConfig,
  download: downloadHandler,
  upload: uploadActionConfig,
};

const custom_Actions = {
  coolAction,
  download: uploadActionConfig,
};

type Custom_ActionConfigs = Record<ActionName, ActionConfig>;

interface Action_Configs {
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

type ActionHandler<T = any, U = any> = TaskHandler<
  TaskHandlerInput<T & TaskData>,
  TaskHandlerOutput & U
>;

type UploadActionHandler = ActionHandler<UploadHandlerData>;

type HandleAction<T, K> = (input: {
  data: Omit<T, keyof TaskData>;
  location?: LocationData;
  options?: {
    onSuccess?: (input: { id: string; result: K }) => void;
  };
}) => void;

type UseActionHandlerState<T extends TaskData, K> = [
  { reset: () => void; tasks: Tasks<T> },
  HandleAction<T, K>,
];

export const useActionHandler = <T extends TaskData, K>(
  action: ActionHandler<T, K>
): UseActionHandlerState<T, K> => {
  const getConfig = useGetActionInput();

  const [{ reset, tasks }, processTask] = useProcessTasks(action);

  const handler: HandleAction<T, K> = React.useCallback(
    ({ data: _data, location }) => {
      const config = getConfig(location);
      const data = { ..._data, id: crypto.randomUUID() } as T;

      processTask({ config, data });
    },
    [getConfig, processTask]
  );

  return [{ reset, tasks }, handler];
};

type TellMe = ResolvedActionTypes<{
  default: typeof default_Actions;
  custom: typeof custom_Actions;
}>;

type ExtractTaskData<T extends ActionHandler<any>> = T extends ActionHandler<
  infer K
>
  ? K & TaskData
  : never;

type __Maybe = ExtractTaskData<UploadActionHandler>;

type ALLL = {
  [K in keyof TellMe]: () => UseActionHandlerState<ExtractTaskData<TellMe[K]>>;
};

const useCoolestAction = null as unknown as ALLL['coolAction'];

const useSilly = () => {
  const [__out, __handle] = useCoolestAction();

  __handle({
    data: { someValue: '' },
  });
};
