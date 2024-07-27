import React from 'react';
import { render, waitFor } from '@testing-library/react';

import createProvider from '../../../createProvider';

import { LocationDetailView } from '../LocationDetailView';

const listLocations = jest.fn(() =>
  Promise.resolve({ locations: [], nextToken: undefined })
);

const Provider = createProvider({ config: { listLocations } });

describe('LocationDetailView', () => {
  it('renders a `LocationDetailView`', async () => {
    await waitFor(() => {
      expect(
        render(
          <Provider>
            <LocationDetailView />
          </Provider>
        ).container
      ).toBeDefined();
    });
  });
});
