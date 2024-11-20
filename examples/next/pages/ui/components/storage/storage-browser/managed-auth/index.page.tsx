import React from 'react';
import { getUrl } from '@aws-amplify/storage/internals';

import {
  ActionConfig,
  ActionHandler,
  createStorageBrowser,
  defaultStorageBrowserActions,
  FileDataItem,
} from '@aws-amplify/ui-react-storage/browser';

import { managedAuthAdapter } from '../managedAuthAdapter';
import { SignIn, SignOutButton } from './routed/components';
import {
  Button,
  Flex,
  Link,
  StepperField,
  Text,
  View,
} from '@aws-amplify/ui-react';

import '@aws-amplify/ui-react-storage/styles.css';
import '@aws-amplify/ui-react-storage/storage-browser-styles.css';

type GetLink = ActionHandler<{ duration: number }, string>;

const getLink: GetLink = ({ data, config }) => {
  const result = getUrl({
    path: data.key,
    options: {
      bucket: { bucketName: config.bucket, region: config.region },
      locationCredentialsProvider: config.credentials,
      expiresIn: data.duration * 60,
      validateObjectExistence: true,
    },
  }).then((res) => ({
    status: 'COMPLETE' as const,
    value: res.url.toString(),
  }));

  return { result };
};

const generateLink: ActionConfig<GetLink, 'LinkActionView'> = {
  handler: getLink,
  viewName: 'LinkActionView',
  actionListItem: {
    icon: 'download',
    label: 'Generate Download Links',
    disable: (selected) => !selected?.length,
  },
};

const { StorageBrowser, useAction, useView } = createStorageBrowser({
  actions: { default: defaultStorageBrowserActions, custom: { generateLink } },
  config: managedAuthAdapter,
});

const LinkActionView = ({
  files,
  onExit,
}: {
  files: FileDataItem[];
  onExit: () => void;
}) => {
  const [duration, setDuration] = React.useState(60);

  const items = React.useMemo(
    () => (!files ? [] : files.map((item) => ({ ...item, duration }))),
    [files, duration]
  );

  // @ts-expect-error
  const [{ tasks }, handleCreate] = useAction('generateLink', { items });

  return (
    <Flex direction="column">
      <Button onClick={onExit}>Exit</Button>
      <StepperField
        label="Duration"
        step={15}
        value={duration}
        min={15}
        max={300}
        onStepChange={(value) => {
          setDuration(value);
        }}
      />
      <Button
        onClick={() =>
          // @ts-expect-error
          handleCreate()
        }
      >
        Start
      </Button>
      {!tasks
        ? null
        : tasks.map(({ data, status }) => {
            return (
              <Flex direction="row" key={data.fileKey}>
                <Text>{data.fileKey}</Text>
                {data.value?.url ? (
                  <Link href={data.value?.url}>link</Link>
                ) : null}
                <Text>{status}</Text>
              </Flex>
            );
          })}
    </Flex>
  );
};

const MyStorageNrowser = () => {
  const [actionType, setActionType] = React.useState(undefined);
  const locationsState = useView('Locations');

  const state = useView('LocationDetail');
  const { location } = state;

  return (
    <>
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

      {location.current && actionType == 'generateLink' ? (
        <LinkActionView
          files={state.fileDataItems}
          onExit={() => {
            setActionType(undefined);
          }}
        />
      ) : null}
      {location.current && actionType && actionType !== 'generateLink' ? (
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
          <MyStorageNrowser />
        </StorageBrowser.Provider>
      </View>
    </Flex>
  );
}

export default Example;
