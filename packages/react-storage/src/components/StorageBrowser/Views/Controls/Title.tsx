import React from 'react';
import { withBaseElementProps } from '@aws-amplify/ui-react-core/elements';

import { StorageBrowserElements } from '../../context/elements';

const { Heading } = StorageBrowserElements;

const BLOCK_NAME = 'title';

export interface TitleControl<
  T extends StorageBrowserElements = StorageBrowserElements,
> {
  (): React.JSX.Element;
  Heading: T['Heading'];
}

const Title = withBaseElementProps(Heading, {
  className: `${BLOCK_NAME}`,
  // TODO: Temp, title text needs to come from context
  children: 'Location title',
});

export const TitleControl: TitleControl = () => <Title />;

TitleControl.Heading = Title;
