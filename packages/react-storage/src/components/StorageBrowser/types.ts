import React from 'react';

import { ListLocations } from './actions';
import { ___UseActionFinal, Action_Configs } from './actions/configs/__types';
import { UseView } from './views/createUseView';

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
  actions?: Action_Configs;
  config: Config;
  components?: Components;
}

export interface StorageBrowserProps<T = string, V = {}> {
  views?: Views<T> & V;
  displayText?: StorageBrowserDisplayText;
}

export interface StorageBrowserType<T = string, K = {}> {
  (props: StorageBrowserProps<T, K>): React.JSX.Element;
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

export type DefaultActionType<T = string> = Exclude<
  T,
  keyof NonNullable<Action_Configs['default']>
>;

export type DerivedCustomViews<T extends Action_Configs> = {
  [K in keyof T['custom'] as K extends DefaultActionType<K>
    ? T['custom'][K] extends { viewName: `${string}View` }
      ? T['custom'][K]['viewName']
      : never
    : never]?: () => React.JSX.Element | null;
} & {
  // intentionally incomplete
  UploadView?: () => React.JSX.Element | null;
};

export interface StorageBrowserProviderProps extends StoreProviderProps {
  displayText?: StorageBrowserDisplayText;
}

export interface CreateStorageBrowserOutput<T extends Action_Configs> {
  StorageBrowser: StorageBrowserType<string, DerivedCustomViews<T>>;
  useAction: ___UseActionFinal<T>;
  useView: UseView;
  views: DerivedCustomViews<T>;
}
