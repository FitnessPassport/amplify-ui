import React from 'react';
import { useDataState } from '@aws-amplify/ui-react-core';
import { listLocationsAction } from '../../context/actions';
import { Controls } from '../Controls';
import { CommonControl, ViewComponent } from '../types';
import { StorageBrowserElements } from '../../context/elements';
import { CLASS_BASE } from '../constants';

const { Divider, Message, Navigate, Paginate, Refresh, Search, Table, Title } =
  Controls;

interface LocationsListViewControls<
  T extends StorageBrowserElements = StorageBrowserElements,
  // exlcude `Toggle` from `Search` for Locations List
> extends Exclude<
    Pick<Controls<T>, CommonControl | 'Paginate' | 'Refresh' | 'Search'>,
    Controls<T>['Search']['Toggle']
  > {
  (): React.JSX.Element;
}

export interface LocationsListView<
  T extends StorageBrowserElements = StorageBrowserElements,
> extends ViewComponent<T, LocationsListViewControls<T>> {}

const LocationsListViewControls: LocationsListViewControls = () => (
  <div className={`${CLASS_BASE}__header`}>
    <Navigate />
    <div className={`${CLASS_BASE}__header__primary`}>
      <Title />
      <div className={`${CLASS_BASE}__header__primary__actions`}>
        <Refresh />
      </div>
    </div>
    <div className={`${CLASS_BASE}-header__secondary`}>
      <Paginate />
    </div>
  </div>
);

LocationsListViewControls.Divider = Divider;
LocationsListViewControls.Message = Message;
LocationsListViewControls.Navigate = Navigate;
LocationsListViewControls.Paginate = Paginate;
LocationsListViewControls.Refresh = Refresh;
LocationsListViewControls.Search = Search;
LocationsListViewControls.Title = Title;

export const LocationsListView: LocationsListView = () => {
  const [{ data, isLoading }, handleListLocations] = useDataState(
    listLocationsAction,
    { locations: [], nextToken: undefined }
  );

  React.useEffect(() => {
    handleListLocations({ options: { pageSize: 100 } });
  }, [handleListLocations]);

  const hasLocations = !!data.locations.length;
  const listLocations = !hasLocations
    ? null
    : data.locations.map(({ name }) => <p key={name}>{name}</p>);

  return (
    <div className={CLASS_BASE}>
      <LocationsListViewControls />
      {!hasLocations && isLoading ? 'loading...' : listLocations}
    </div>
  );
};

LocationsListView.Controls = LocationsListViewControls;
LocationsListView.Table = Table;
