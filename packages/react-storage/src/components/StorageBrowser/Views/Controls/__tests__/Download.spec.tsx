import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as StorageModule from 'aws-amplify/storage';

import createProvider from '../../../createProvider';
import { DownloadControl } from '../Download';

const getUrlSpy = jest.spyOn(StorageModule, 'getUrl');

const listLocations = jest.fn(() =>
  Promise.resolve({ locations: [], nextToken: undefined })
);

const config = {
  getLocationCredentials: jest.fn(),
  listLocations,
  region: 'region',
  registerAuthListener: jest.fn(),
};

const Provider = createProvider({ config });

describe('DownloadControl', () => {
  it('renders the DownloadControl', async () => {
    await waitFor(() => {
      expect(
        render(
          <Provider>
            <DownloadControl fileKey="" />
          </Provider>
        ).container
      ).toBeDefined();
    });

    const button = screen.getByRole('button', {
      name: 'Download item',
    });

    const icon = button.querySelector('svg');

    expect(button).toBeInTheDocument();
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('calls getUrl onClick', async () => {
    // @TODO: mock location correctly so when the
    // click for the link to download happens, it doesn't console.error
    const user = userEvent.setup();

    getUrlSpy.mockResolvedValueOnce({
      url: new URL('https://docs.amplify.aws/'),
      expiresAt: new Date(),
    });

    render(
      <Provider>
        <DownloadControl fileKey="" />
      </Provider>
    );

    const button = screen.getByRole('button', {
      name: 'Download item',
    });

    act(() => {
      user.click(button);
    });

    await waitFor(() => {
      expect(getUrlSpy).toHaveBeenCalled();
    });
  });
});
