import React from 'react';

import {
  LocationActionView as LocationActionViewDefault,
  LocationActionViewProps,
} from './LocationActionView';
import {
  LocationDetailView as LocationDetailViewDefault,
  LocationDetailViewProps,
} from './LocationDetailView';
import {
  LocationsView as LocationsViewDefault,
  LocationsViewProps,
} from './LocationsView';
import { useStore } from '../providers/store';
import { Action_Configs } from '../actions/configs/__types';

const ERROR_MESSAGE = '`useViews` must be called from within a `ViewsProvider`';

export interface DefaultViews<T = string> {
  LocationActionView: (
    props: LocationActionViewProps<T>
  ) => React.JSX.Element | null;
  LocationDetailView: (
    props: LocationDetailViewProps
  ) => React.JSX.Element | null;
  LocationsView: (props: LocationsViewProps) => React.JSX.Element | null;
}

export interface Views<T = string> extends Partial<DefaultViews<T>> {}

const ViewsContext = React.createContext<DefaultViews | undefined>(undefined);

export function ViewsProvider({
  children,
  views,
  actions,
}: {
  children?: React.ReactNode;
  actions: Action_Configs;
  views?: Views;
}): React.JSX.Element {
  // destructure `views` to prevent extraneous rerender of components in the
  // scenario of an unstable reference provided as `views`
  const { LocationDetailView, LocationActionView, LocationsView } = views ?? {};

  const viewsRef = React.useRef(views);

  const value = React.useMemo(() => {
    const customViewMap = !actions.custom
      ? undefined
      : Object.entries(actions?.custom ?? {}).reduce(
          (acc, [actionName, { viewName }]) => ({
            ...acc,
            // @ts-expect-error
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            [actionName]: viewsRef.current?.[viewName],
          }),
          {}
        );

    return {
      ...customViewMap,
      LocationActionView: LocationActionView ?? LocationActionViewDefault,
      LocationDetailView: LocationDetailView ?? LocationDetailViewDefault,
      LocationsView: LocationsView ?? LocationsViewDefault,
    };
  }, [LocationDetailView, LocationActionView, LocationsView, actions.custom]);

  return (
    <ViewsContext.Provider value={value}>{children}</ViewsContext.Provider>
  );
}

export function useViews(): DefaultViews {
  const context = React.useContext(ViewsContext);
  if (!context) {
    throw new Error(ERROR_MESSAGE);
  }

  return context;
}
