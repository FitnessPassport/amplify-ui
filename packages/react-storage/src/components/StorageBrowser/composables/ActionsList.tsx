import React from 'react';

import { ButtonElement, IconElement, ViewElement } from '../context/elements';
import { STORAGE_BROWSER_BLOCK } from '../constants';

const MENU_BLOCK_NAME = `${STORAGE_BROWSER_BLOCK}__actions-menu`;

const BUTTON_CLASS_NAME = `${MENU_BLOCK_NAME}__action-button`;
const MENU_CLASS_NAME = `${MENU_BLOCK_NAME}__menu`;
const TOGGLE_CLASS_NAME = `${MENU_BLOCK_NAME}__toggle`;

const ACTION_ITEM_VARIANT = 'actions-menu-item';

export interface ActionsListItem {
  disabled: boolean;
  hidden: boolean;
  icon: React.ReactNode | undefined;
  id: string;
  label: string;
  value: string;
}

export interface ActionsListItemProps {
  label?: string;
  icon?: React.ReactNode;
  isDisabled?: boolean;
  onSelect?: () => void;
}

export interface ActionsListProps {
  actions?: ActionsListItem[];
  onSelect?: (action: string) => void;
}

export function ActionsListItem({
  label,
  icon,
  isDisabled,
  onSelect,
}: ActionsListItemProps): React.JSX.Element {
  return (
    <ButtonElement
      disabled={isDisabled}
      onClick={onSelect}
      className={BUTTON_CLASS_NAME}
      role="menuitem"
      variant={ACTION_ITEM_VARIANT}
    >
      {!icon ? (
        label
      ) : (
        <>
          {icon} {label}
        </>
      )}
    </ButtonElement>
  );
}

export function ActionsList({
  actions,
  onSelect,
}: ActionsListProps): React.JSX.Element {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <ViewElement className={MENU_BLOCK_NAME}>
      <ButtonElement
        aria-label="Actions"
        className={TOGGLE_CLASS_NAME}
        disabled={!actions?.length}
        actionsList-testid="ACTIONS_MENU_TOGGLE"
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
        variant="actions-menu-toggle"
      >
        <IconElement
          className={`${TOGGLE_CLASS_NAME}__icon`}
          variant="vertical-kebab"
        />
      </ButtonElement>
      <ViewElement
        aria-label="Actions"
        className={`${MENU_CLASS_NAME}${
          isOpen ? ` ${MENU_CLASS_NAME}--open` : ''
        }`}
        actionsList-testid="ACTIONS_MENU_LIST"
        role="menu"
        variant="actions-menu-list"
      >
        {!actions
          ? null
          : actions?.map(({ disabled, hidden, id, value, ...props }) =>
              hidden ? null : (
                <ActionsListItem
                  {...props}
                  isDisabled={disabled}
                  key={id}
                  onSelect={() => {
                    onSelect?.(value);
                    setIsOpen(false);
                  }}
                />
              )
            )}
      </ViewElement>
    </ViewElement>
  );
}
