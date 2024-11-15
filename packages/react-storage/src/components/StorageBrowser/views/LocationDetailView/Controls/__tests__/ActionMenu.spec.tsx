import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import * as TempActions from '../../../../do-not-import-from-here/createTempActionsProvider';

import { LocationData } from '../../../../actions';
import * as StoreModule from '../../../../providers/store';
import { STORAGE_BROWSER_BLOCK_TO_BE_UPDATED } from '../../../../constants';

import { ActionsMenuControl } from '../ActionsMenu';

const TEST_ACTIONS = {
  wild_crazy_guy: {
    options: { displayName: 'steve martin' },
  },
};

jest.spyOn(TempActions, 'useTempActions').mockReturnValue(TEST_ACTIONS);

const location: LocationData = {
  id: 'an-id-👍🏼',
  bucket: 'test-bucket',
  permissions: ['list'],
  prefix: 'test-prefix/',
  type: 'PREFIX' as const,
};
const dispatchStoreAction = jest.fn();
jest.spyOn(StoreModule, 'useStore').mockReturnValue([
  {
    location: { current: location },
    locationItems: { fileDataItems: undefined },
  } as StoreModule.UseStoreState,
  dispatchStoreAction,
]);

describe('ActionsMenuControl', () => {
  afterEach(jest.clearAllMocks);

  it('renders a `ActionsMenuControl`', () => {
    const { getByRole } = render(<ActionsMenuControl />);
    const toggle = getByRole('button', { name: 'Actions' });
    const menu = getByRole('menu', { name: 'Actions' });

    expect(menu).toBeInTheDocument();
    expect(toggle).toBeInTheDocument();
  });

  it('applies correct classes when toggled', () => {
    const { getByRole } = render(<ActionsMenuControl />);
    const toggle = getByRole('button', { name: 'Actions' });
    const menu = getByRole('menu', { name: 'Actions' });

    fireEvent.click(toggle);

    expect(menu.classList).toContain(
      `${STORAGE_BROWSER_BLOCK_TO_BE_UPDATED}__actions-menu-list--open`
    );
  });

  it('closes the menu on action select', () => {
    const { getByRole, getByText } = render(<ActionsMenuControl />);
    const toggle = getByRole('button', { name: 'Actions' });
    const menu = getByRole('menu', { name: 'Actions' });

    fireEvent.click(toggle);
    expect(menu.classList).toContain(
      `${STORAGE_BROWSER_BLOCK_TO_BE_UPDATED}__actions-menu-list--open`
    );

    const menuItem = getByText(TEST_ACTIONS.wild_crazy_guy.options.displayName);
    expect(menuItem).toBeInTheDocument();

    fireEvent.click(menuItem);

    expect(menu.classList).not.toContain(
      `${STORAGE_BROWSER_BLOCK_TO_BE_UPDATED}__actions-menu-list--open`
    );
  });
});
