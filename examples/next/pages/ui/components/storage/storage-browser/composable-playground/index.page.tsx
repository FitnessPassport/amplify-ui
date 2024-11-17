import React from 'react';

import {
  createManagedAuthAdapter,
  CreateStorageBrowserInput,
  createStorageBrowser,
} from '@aws-amplify/ui-react-storage/browser';

import { Auth } from '../managedAuthAdapter';

import { Button, Flex, Breadcrumbs } from '@aws-amplify/ui-react';

import '@aws-amplify/ui-react/styles/reset.css';
import '@aws-amplify/ui-react-storage/styles.css';
import '@aws-amplify/ui-react-storage/storage-browser-styles.css';

const components: CreateStorageBrowserInput['components'] = {
  Navigation: ({ items }) => (
    <Breadcrumbs.Container>
      {items.map(({ isCurrent, name, onNavigate }) => (
        <Breadcrumbs.Item key={name}>
          <Breadcrumbs.Link isCurrent={isCurrent} onClick={onNavigate}>
            {name}
          </Breadcrumbs.Link>
        </Breadcrumbs.Item>
      ))}
    </Breadcrumbs.Container>
  ),
};

export const auth = new Auth({ persistCredentials: true });

const config = createManagedAuthAdapter({
  credentialsProvider: auth.credentialsProvider,
  region: process.env.NEXT_PUBLIC_MANAGED_AUTH_REGION,
  accountId: process.env.NEXT_PUBLIC_MANAGED_AUTH_ACCOUNT_ID,
  registerAuthListener: auth.registerAuthListener,
});

const { StorageBrowser, useView } = createStorageBrowser({
  components,
  config,
});

function LocationActionView({ type }: { type?: string }) {
  if (!type) return null;

  return (
    <dialog open>
      {type === 'delete' ? (
        <MyDeleteView />
      ) : type ? (
        <StorageBrowser.LocationActionView />
      ) : null}
    </dialog>
  );
}

const { DeleteView } = StorageBrowser;

const MyDeleteView = () => {
  const viewState = useView('Delete');
  const { isProcessing } = viewState;
  return (
    <DeleteView.Provider {...viewState}>
      {isProcessing ? <h1>DELETING</h1> : null}
      <DeleteView.Start />
      <DeleteView.Tasks />
    </DeleteView.Provider>
  );
};

function MyStorageBrowser() {
  const [type, setActionType] = React.useState<string | undefined>(undefined);

  return (
    <Flex>
      <Flex direction={'column'}>
        <StorageBrowser.LocationsView />
      </Flex>
      <Flex minWidth={'50vw'} direction={'column'}>
        <StorageBrowser.LocationDetailView
          onActionSelect={(actionType) => {
            setActionType(actionType);
          }}
        />
      </Flex>
      <LocationActionView type={type} />
    </Flex>
  );
}

function Example() {
  const [authenticated, setAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>();

  return !authenticated ? (
    <Flex>
      <Button
        onClick={() => {
          setIsLoading(true);
          auth.signIn({
            onSignIn: () => {
              setAuthenticated(true);
              setIsLoading(false);
            },
            onError: (e: Error) => {
              setErrorMessage(e.message);
              setIsLoading(false);
            },
          });
        }}
      >
        Sign In
      </Button>
      {isLoading ? <span>Authenticating...</span> : null}
      {errorMessage ? <span>{errorMessage}</span> : null}
    </Flex>
  ) : (
    <>
      <Button
        onClick={() => {
          auth.signOut({ onSignOut: () => setAuthenticated(false) });
        }}
      >
        Sign Out
      </Button>
      <StorageBrowser.Provider
        displayText={{
          LocationsView: { title: 'Home - Composable Playground' },
        }}
      >
        <MyStorageBrowser />
      </StorageBrowser.Provider>
    </>
  );
}

export default Example;
