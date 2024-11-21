import {
  listLocationItemsHandler,
  listLocationsHandler,
  createFolderHandler,
  uploadHandler,
  copyHandler,
  deleteHandler,
  downloadHandler,
} from '../handlers';

import {
  CopyActionConfig,
  CreateFolderActionConfig,
  DeleteActionConfig,
  UploadActionConfig,
} from './__types';

import {
  ListLocationItemsActionConfig,
  ListLocationsActionConfig,
} from './types';

export const copyActionConfig: CopyActionConfig = {
  componentName: 'CopyView',
  actionListItem: {
    disable: (selected) => !selected || selected.length === 0,
    hide: (permissions) => !permissions.includes('write'),
    icon: 'copy-file',
    label: 'Copy',
  },
  handler: copyHandler,
};

export const deleteActionConfig: DeleteActionConfig = {
  componentName: 'DeleteView',
  actionListItem: {
    disable: (selected) => !selected || selected.length === 0,
    hide: (permissions) => !permissions.includes('delete'),
    icon: 'delete-file',
    label: 'Delete',
  },
  handler: deleteHandler,
};

export const createFolderActionConfig: CreateFolderActionConfig = {
  componentName: 'CreateFolderView',

  actionListItem: {
    disable: () => false,
    hide: (permissions) => !permissions.includes('write'),
    icon: 'create-folder',
    label: 'Create folder',
  },
  handler: createFolderHandler,
};

export const listLocationItemsActionConfig: ListLocationItemsActionConfig = {
  componentName: 'LocationDetailView',
  handler: listLocationItemsHandler,
};

export const listLocationsActionConfig: ListLocationsActionConfig = {
  componentName: 'LocationsView',
  handler: listLocationsHandler,
};

export const uploadActionConfig: UploadActionConfig = {
  componentName: 'UploadView',
  actionListItem: {
    disable: () => false,
    fileSelection: 'FILE',
    hide: (permissions) => !permissions.includes('write'),
    icon: 'upload-file',
    label: 'Upload',
  },
  handler: uploadHandler,
};

export const defaultActionViewConfigs = {
  copy: copyActionConfig,
  createFolder: createFolderActionConfig,
  download: downloadHandler,
  delete: deleteActionConfig,
  upload: uploadActionConfig,
};

export type DefaultActionViewType = keyof typeof defaultActionViewConfigs;

export const DEFAULT_ACTION_VIEW_TYPES = Object.keys(
  defaultActionViewConfigs
) as DefaultActionViewType[];

export const isDefaultActionViewType = (
  value?: string
): value is DefaultActionViewType =>
  DEFAULT_ACTION_VIEW_TYPES.some((type) => type === value);

export const defaultActionConfigs = {
  ...defaultActionViewConfigs,
  listLocationItems: listLocationItemsActionConfig,
  listLocations: listLocationsActionConfig,
};
