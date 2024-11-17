import React from 'react';

import { ViewElement } from '../../../context/elements';
import { ActionCancelControl } from '../../../controls/ActionCancelControl';
import { ActionExitControl } from '../../../controls/ActionExitControl';
import { ActionStartControl } from '../../../controls/ActionStartControl';
import { DataTableControl } from '../../../controls/DataTableControl';
import { MessageControl } from '../../../controls/MessageControl';
import { StatusDisplayControl } from '../../../controls/StatusDisplayControl';
import { TitleControl } from '../../../controls/TitleControl';

import { STORAGE_BROWSER_BLOCK } from '../../../constants';
import { resolveClassName } from '../../utils';

import { DeleteViewProvider } from './DeleteViewProvider';
import { useDeleteView } from './useDeleteView';
import { DeleteViewComponent } from './types';

export const DeleteView: DeleteViewComponent = ({ className, ...props }) => {
  const state = useDeleteView(props);

  return (
    <div className={resolveClassName(STORAGE_BROWSER_BLOCK, className)}>
      <DeleteViewProvider {...state}>
        <ActionExitControl />
        <TitleControl />
        <DataTableControl />
        <ViewElement className={`${STORAGE_BROWSER_BLOCK}__summary`}>
          <StatusDisplayControl />
        </ViewElement>
        <ViewElement className={`${STORAGE_BROWSER_BLOCK}__footer`}>
          <ViewElement className={`${STORAGE_BROWSER_BLOCK}__message`}>
            <MessageControl />
          </ViewElement>
          <ViewElement className={`${STORAGE_BROWSER_BLOCK}__buttons`}>
            <ActionCancelControl />
            <ActionStartControl />
          </ViewElement>
        </ViewElement>
      </DeleteViewProvider>
    </div>
  );
};

DeleteView.displayName = 'DeleteView';

DeleteView.Provider = DeleteViewProvider;
DeleteView.Cancel = ActionCancelControl;
DeleteView.Exit = ActionExitControl;
DeleteView.Message = MessageControl;
DeleteView.Start = ActionStartControl;
DeleteView.Statuses = StatusDisplayControl;
DeleteView.Tasks = DataTableControl;
DeleteView.Title = TitleControl;
