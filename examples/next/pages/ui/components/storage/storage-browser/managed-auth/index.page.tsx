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

type ActionItem = {
  someValue: string;
  name: string;
  fail?: boolean;
  id: string;
};
type MyAction = ActionHandler<ActionItem, string>;

const myAction: MyAction = (input) => {
  if (input.data.fail) {
    return {
      result: Promise.reject({
        message: 'Noooooooo',
        status: 'FAILED',
      }),
    };
  }

  return {
    result: Promise.resolve({
      value: input.data.name,
      status: 'COMPLETE',
    }),
  };
};

const coolAction: ActionConfig<typeof myAction, 'PartyView'> = {
  handler: myAction,
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
  const [actionType, setActionType] = React.useState(undefined);
  const locationsState = useView('Locations');
  const _location = locationsState.pageItems[0];

  const [task, atomicHandler] = useAction('coolAction');
  if (task) {
    console.log('task', task);
  }

  // must be memoized
  const actionItems: ActionItem[] = React.useMemo(
    () => [
      {
        name: 'Not failing',
        someValue: 'additonal input value',
        id: 'must be unique',
      },
      {
        name: 'should fail',
        someValue: '',
        id: 'also must be unique',
        fail: true,
      },
    ],
    []
  );

  // @ts-expect-error
  const [out, batchHandler] = useAction('coolAction', {
    items: actionItems,
    onTaskSuccess: (__, value) => {
      console.log('task success', value);
    },
  });

  // eslint-disable-next-line no-console
  console.log('out', out.tasks);

  const handleBatchAction = () => {
    // @ts-expect-error
    batchHandler();
  };

  const atomicTaskid = React.useRef(crypto.randomUUID()).current;

  const handleAtomicAction = (fail?: boolean) =>
    atomicHandler({
      // only required if no location selected
      location: _location,
      data: { key: '', someValue: '', name: 'lame', id: atomicTaskid, fail },
      options: {
        onSuccess: (data, value) => {
          console.log('success', value);
        },
        onError: (data, message) => {
          console.log('message', message);
        },
      },
    });

  const state = useView('LocationDetail');
  const { location } = state;

  // add view name slots
  return (
    <>
      {/* add type for LocatonActionView slot usage */}
      {/* <StorageBrowser.LocationActionView type="coolAction" /> */}
      {/* below will not work unless UI comp is generated  */}
      {/* <StorageBrowser.CustomView type="" /> */}
      {!location.current ? (
        <StorageBrowser.LocationsView {...locationsState} />
      ) : null}
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
        <>
          <Button
            onClick={() => {
              handleAtomicAction();
            }}
          >
            Atomic Success
          </Button>
          <Button
            onClick={() => {
              handleAtomicAction(true);
            }}
          >
            Atomic Fail
          </Button>
          <Button
            onClick={() => {
              handleBatchAction();
            }}
          >
            Batch Run
          </Button>
        </>
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
