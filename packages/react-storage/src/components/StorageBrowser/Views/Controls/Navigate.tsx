import React from 'react';
import { withBaseElementProps } from '@aws-amplify/ui-react-core/elements';

import type { OmitElements } from '../types';
import { StorageBrowserElements } from '../../context/elements';
import { CLASS_BASE } from '../constants';
import { useControl } from '../../context/controls';

const { Span, Button, Nav, OrderedList, ListItem } = StorageBrowserElements;
const BLOCK_NAME = `${CLASS_BASE}__navigate`;

/* <Separator /> */

const Separator = withBaseElementProps(Span, {
  className: `${BLOCK_NAME}__separator`,
  children: '/',
});

type RenderNavigateItemProps = {
  item: string;
  current?: boolean;
  onClick?: () => void;
};

/* <NavigateItem /> */
type RenderNavigateItem = (props: RenderNavigateItemProps) => React.JSX.Element;

interface NavigateItem<
  T extends StorageBrowserElements = StorageBrowserElements,
> extends RenderNavigateItem,
    Pick<T, 'Button' | 'ListItem'> {
  Separator: T['Span'];
}

const NavigateItemContainer = withBaseElementProps(ListItem, {
  className: `${BLOCK_NAME}__item`,
});

const NavigateButton = withBaseElementProps(Button, {
  className: `${BLOCK_NAME}__button`,
});

const NavigateItem: NavigateItem = ({ item: name, current, onClick }) => {
  return (
    <NavigateItemContainer>
      <NavigateButton onClick={onClick}>{name}</NavigateButton>
      {current ? null : <Separator />}
    </NavigateItemContainer>
  );
};

NavigateItem.Button = NavigateButton;
NavigateItem.Separator = Separator;
NavigateItem.ListItem = ListItem;

/* <NavigateContainer /> */
const NavigateContainer: typeof Nav = React.forwardRef(function Container(
  { children, ...props },
  ref
) {
  return (
    <Nav
      {...props}
      aria-label={props['aria-label'] ?? 'Breadcrumbs'}
      className={props.className ?? `${BLOCK_NAME}__container`}
      ref={ref}
    >
      <OrderedList className={`${props.className ?? BLOCK_NAME}__list`}>
        {children}
      </OrderedList>
    </Nav>
  );
});

/* <NavigateControl /> */
export interface _NavigateControl<
  T extends StorageBrowserElements = StorageBrowserElements,
> {
  (props: { renderNavigateItem?: RenderNavigateItem }): React.JSX.Element;
  Container: T['Nav'];
  NavigateItem: NavigateItem<T>;
}

export interface NavigateControl<
  T extends StorageBrowserElements = StorageBrowserElements,
> extends OmitElements<_NavigateControl<T>, 'Container' | 'NavigateItem'> {
  (props: { renderNavigateItem?: RenderNavigateItem }): React.JSX.Element;
}

export const NavigateControl: NavigateControl = (_props) => {
  const [state, handleUpdateState] = useControl({ type: 'NAVIGATE' });

  return (
    <NavigateContainer>
      <NavigateItemContainer>
        <NavigateButton
          onClick={() => handleUpdateState({ type: 'DESELECT_LOCATION' })}
        >
          Home
        </NavigateButton>
        {state.location ? <Separator /> : null}
      </NavigateItemContainer>
      {/* {state.location.current && (
        <NavigateItemContainer>
          <NavigateButton
            onClick={() => {
              if (state?.location.current) {
                handleUpdateState({
                  type: 'SELECT_LOCATION',
                  location: state.location.current,
                });
              }
            }}
          >
            {state.location.current.bucket}
          </NavigateButton>
          {state.history.list && state.history.list.length > 0 ? (
            <Separator />
          ) : null}
        </NavigateItemContainer>
      )} */}
      {/* {state.history &&
        state.history.list?.map((folder, index) => (
          <NavigateItem
            key={index}
            item={folder}
            current={
              folder === state.history.list?.[state.history.list.length - 1]
            }
            onClick={() => {
              handleUpdateState({
                type: 'EXIT_FOLDER',
                index,
              });
            }}
          />
        ))} */}
    </NavigateContainer>
  );
};
