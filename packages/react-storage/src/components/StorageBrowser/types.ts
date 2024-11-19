import React from 'react';

import { ListLocations } from './actions';
import { ___UseActionFinal, Action_Configs } from './actions/configs/__types';
import { UseView } from './views/createUseView';

import { StorageBrowserElements } from './context/elements';
import { Components } from './ComponentsProvider';

import { RegisterAuthListener, StoreProviderProps } from './providers';

import {
  CopyViewType,
  CreateFolderViewType,
  DeleteViewType,
  UploadViewType,
  LocationActionViewProps,
  LocationDetailViewType,
  LocationsViewType,
  Views,
} from './views';

import { GetLocationCredentials } from './credentials/types';
import { StorageBrowserDisplayText } from './displayText';

export interface Config {
  accountId?: string;
  customEndpoint?: string;
  getLocationCredentials: GetLocationCredentials;
  listLocations: ListLocations;
  registerAuthListener: RegisterAuthListener;
  region: string;
}

export interface CreateStorageBrowserInput {
  actions: Action_Configs;
  config: Config;
  components?: Components;
  elements?: Partial<StorageBrowserElements>;
}

export interface StorageBrowserProps<T = string> {
  views?: Views<T>;
  displayText?: StorageBrowserDisplayText;
}

export interface StorageBrowserType<T = string, K = {}> {
  (
    props: StorageBrowserProps & Exclude<K, keyof StorageBrowserProps>
  ): React.JSX.Element;
  displayName: string;
  Provider: (props: StorageBrowserProviderProps) => React.JSX.Element;
  CopyView: CopyViewType;
  CreateFolderView: CreateFolderViewType;
  DeleteView: DeleteViewType;
  UploadView: UploadViewType;
  LocationActionView: (
    props: LocationActionViewProps<T>
  ) => React.JSX.Element | null;
  LocationDetailView: LocationDetailViewType;
  LocationsView: LocationsViewType;
}

export type ActionViewName<T = string> = Exclude<
  T,
  'listLocationItems' | 'listLocations' | 'download'
>;

export interface StorageBrowserProviderProps extends StoreProviderProps {
  displayText?: StorageBrowserDisplayText;
}

export interface CreateStorageBrowserOutput<T extends Action_Configs> {
  StorageBrowser: StorageBrowserType;
  useAction: ___UseActionFinal<T>;
  useView: UseView;
}
