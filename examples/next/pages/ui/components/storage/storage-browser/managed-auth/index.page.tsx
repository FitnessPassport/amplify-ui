import React from 'react';

import {
  ActionConfig,
  ActionHandler,
  createStorageBrowser,
  defaultStorageBrowserActions,
} from '@aws-amplify/ui-react-storage/browser';

import { managedAuthAdapter } from '../managedAuthAdapter';
import { SignIn, SignOutButton } from './routed/components';

import '@aws-amplify/ui-react/styles/reset.css';
import '@aws-amplify/ui-react-storage/styles.css';
import '@aws-amplify/ui-react-storage/storage-browser-styles.css';

import { Button, Flex, View } from '@aws-amplify/ui-react';

const maybeNotSoCool: ActionHandler<
  { someValue: string; name: string },
  { bonus: string }
> = (input) => {
  return {
    result: Promise.resolve({
      message: 'Noooooooo',
      value: { bonus: input.data.name },
      status: 'COMPLETE',
    }),
  };
};

const coolAction: ActionConfig<typeof maybeNotSoCool, 'PartyView'> = {
  handler: maybeNotSoCool,
  viewName: 'PartyView',
  actionListItem: {
    icon: 'sort-indeterminate',
    label: 'pick me',
  },
};

const { StorageBrowser, useAction, useView } = createStorageBrowser({
  actions: { default: defaultStorageBrowserActions, custom: { coolAction } },
  config: managedAuthAdapter,
});

const MyView = () => {
  const [actionOutput, handler] = useAction('coolAction');

  // eslint-disable-next-line no-console
  console.log('actionOutput', actionOutput);

  const [actionType, setActionType] = React.useState(undefined);

  // eslint-disable-next-line no-console
  console.log('actionType', actionType);

  const state = useView('LocationDetail');
  const { location } = state;

  return (
    <>
      {!location.current ? <StorageBrowser.LocationsView /> : null}
      {location.current && !actionType ? (
        <StorageBrowser.LocationDetailView.Provider {...state}>
          <StorageBrowser.LocationDetailView
            onActionSelect={(actionType) => {
              setActionType(actionType);
            }}
          />
        </StorageBrowser.LocationDetailView.Provider>
      ) : null}
      {location.current && actionType === 'coolAction' ? (
        <Button
          onClick={() => {
            handler({
              data: {
                someValue: 'a value!',
                key: 'item key',
                name: 'action',
              },
              options: {
                onSuccess: (data, value) => {
                  // eslint-disable-next-line no-console
                  console.log('data', data);
                  // eslint-disable-next-line no-console
                  console.log('value', value);
                },
                onError: (data, message) => {
                  // eslint-disable-next-line no-console
                  console.log('data', data);
                  // eslint-disable-next-line no-console
                  console.log('message', message);
                },
              },
            });
          }}
        >
          Custom
        </Button>
      ) : null}
      {location.current && actionType && actionType !== 'coolAction' ? (
        <StorageBrowser.LocationActionView
          onExit={() => {
            setActionType(null);
          }}
        />
      ) : null}
    </>
  );
};

function Example() {
  const [showSignIn, setShowSignIn] = React.useState(false);

  return !showSignIn ? (
    <SignIn onSignIn={() => setShowSignIn(true)} />
  ) : (
    <Flex
      direction="column"
      width="100vw"
      height="100vh"
      overflow="hidden"
      padding="xl"
    >
      <SignOutButton onSignOut={() => setShowSignIn(false)} />
      <View flex="1" overflow="hidden">
        <StorageBrowser.Provider
          displayText={{ LocationsView: { title: 'Home - Managed Auth' } }}
        >
          <MyView />
        </StorageBrowser.Provider>
      </View>
    </Flex>
  );
}

export default Example;
