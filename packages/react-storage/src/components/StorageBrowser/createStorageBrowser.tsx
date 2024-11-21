import React from 'react';

import { DEFAULT_COMPOSABLES } from './composables';
import { elementsDefault } from './context/elements';
import { ComponentsProvider } from './ComponentsProvider';
import { componentsDefault } from './componentsDefault';
import { ErrorBoundary } from './ErrorBoundary';

import { createConfigurationProvider, StoreProvider } from './providers';
import { StorageBrowserDefault } from './StorageBrowserDefault';
import { assertRegisterAuthListener } from './validators';
import {
  CopyView,
  CreateFolderView,
  DeleteView,
  LocationActionView,
  LocationDetailView,
  LocationsView,
  UploadView,
  ViewsProvider,
} from './views';
import { defaultActionConfigs } from './actions';

import { DisplayTextProvider } from './displayText';
import { useView } from './views/createUseView';

import {
  CreateStorageBrowserInput,
  CreateStorageBrowserOutput,
  StorageBrowserProviderProps,
  StorageBrowserType,
} from './types';
import { Action_Configs, createUseActions } from './actions/configs/__types';

export function createStorageBrowser<I extends CreateStorageBrowserInput>(
  input: I
): CreateStorageBrowserOutput<
  I['actions'] extends Action_Configs ? I['actions'] : Action_Configs
> {
  assertRegisterAuthListener(input.config.registerAuthListener);

  const {
    accountId,
    customEndpoint,
    registerAuthListener,
    getLocationCredentials,
    region,
  } = input.config;

  const ConfigurationProvider = createConfigurationProvider({
    accountId,
    // @ts-expect-error
    actions: {
      ...input.actions?.custom,
      ...defaultActionConfigs,
      listLocations: {
        componentName: 'LocationsView',
        handler: input.config.listLocations,
      },
    },
    customEndpoint,
    displayName: 'ConfigurationProvider',
    getLocationCredentials,
    region,
    registerAuthListener,
  });

  const composables = {
    // fallback composables
    ...DEFAULT_COMPOSABLES,
    // default components
    ...componentsDefault,
    // override components
    ...input.components,
  };

  /**
   * Provides state, configuration and action values that are shared between
   * the primary View components
   */
  function Provider({ children, ...props }: StorageBrowserProviderProps) {
    return (
      <StoreProvider {...props}>
        <ConfigurationProvider>
          <DisplayTextProvider displayText={props.displayText}>
            <ComponentsProvider
              composables={composables}
              elements={elementsDefault}
            >
              {children}
            </ComponentsProvider>
          </DisplayTextProvider>
        </ConfigurationProvider>
      </StoreProvider>
    );
  }

  const StorageBrowser: StorageBrowserType = ({ views, displayText }) => (
    <ErrorBoundary>
      <Provider displayText={displayText}>
        <ViewsProvider views={views}>
          <StorageBrowserDefault />
        </ViewsProvider>
      </Provider>
    </ErrorBoundary>
  );

  StorageBrowser.LocationActionView = LocationActionView;
  StorageBrowser.LocationDetailView = LocationDetailView;
  StorageBrowser.LocationsView = LocationsView;

  StorageBrowser.CopyView = CopyView;
  StorageBrowser.CreateFolderView = CreateFolderView;
  StorageBrowser.DeleteView = DeleteView;
  StorageBrowser.UploadView = UploadView;

  StorageBrowser.Provider = Provider;

  StorageBrowser.displayName = 'StorageBrowser';

  const actions: Action_Configs = {
    default: { ...defaultActionConfigs, ...input.actions },
    custom: input.actions?.custom,
  };

  const useAction = createUseActions(actions);

  return { StorageBrowser, useAction, useView };
}
