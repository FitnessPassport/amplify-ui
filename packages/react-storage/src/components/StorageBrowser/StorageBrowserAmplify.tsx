import React from 'react';

import { elementsDefault } from './context/elements';
import { createStorageBrowser } from './createStorageBrowser';
import { StorageBrowserProps as StorageBrowserPropsBase } from './types';
import { createAmplifyAuthAdapter } from './adapters';
import { componentsDefault } from './componentsDefault';
import {
  defaultStorageBrowserActions,
  Action_Configs,
} from './actions/configs/__types';

export interface StorageBrowserProps extends StorageBrowserPropsBase {
  actions?: Action_Configs;
}

export const StorageBrowser = ({
  actions,
  views,
  displayText,
}: StorageBrowserProps): React.JSX.Element => {
  const { StorageBrowser } = React.useRef(
    createStorageBrowser({
      actions: {
        default: { ...defaultStorageBrowserActions, ...actions?.default },
        custom: actions?.custom,
      },
      elements: elementsDefault,
      components: componentsDefault,
      config: createAmplifyAuthAdapter(),
    })
  ).current;

  return <StorageBrowser views={views} displayText={displayText} />;
};
