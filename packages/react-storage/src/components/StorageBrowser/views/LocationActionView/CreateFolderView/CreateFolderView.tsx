import React from 'react';

import { ActionStartControl } from '../../../controls/ActionStartControl';
import { ActionExitControl } from '../../../controls/ActionExitControl';
import { FolderNameFieldControl } from '../../../controls/FolderNameFieldControl';
import { MessageControl } from '../../../controls/MessageControl';
import { TitleControl } from '../../../controls/TitleControl';
import { ControlsContextProvider } from '../../../controls/context';
import { useDisplayText } from '../../../displayText';
import { resolveClassName } from '../../utils';
import { CreateFolderViewProps } from './types';
import { useCreateFolderView } from './useCreateFolderView';
import { isValidFolderName } from './utils';
import { STORAGE_BROWSER_BLOCK } from '../../../constants';
import { ViewElement } from '../../../context/elements';

export function CreateFolderView({
  className,
  ...props
}: CreateFolderViewProps): React.JSX.Element {
  const {
    CreateFolderView: {
      actionExitLabel,
      actionStartLabel,
      folderNameLabel,
      folderNamePlaceholder,
      getActionCompleteMessage,
      getValidationMessage,
      title,
    },
  } = useDisplayText();

  const {
    folderName,
    folderNameId,
    isProcessing,
    isProcessingComplete,
    onActionStart,
    onActionExit,
    onFolderNameChange,
    statusCounts,
  } = useCreateFolderView(props);

  const [validationMessage, setValidationMessage] = React.useState<
    string | undefined
  >();

  const message = isProcessingComplete
    ? getActionCompleteMessage({ counts: statusCounts })
    : undefined;

  const onValidateFolderName = (value: string) => {
    setValidationMessage(() =>
      isValidFolderName(value) ? undefined : getValidationMessage(value)
    );
  };

  const isActionStartDisabled =
    !folderName.length ||
    !!validationMessage ||
    isProcessing ||
    isProcessingComplete;

  return (
    <div className={resolveClassName(STORAGE_BROWSER_BLOCK, className)}>
      <ControlsContextProvider
        data={{
          actionExitLabel,
          folderNameId,
          folderNameLabel,
          folderNamePlaceholder,
          folderNameValidationMessage: validationMessage,
          actionStartLabel,
          isActionStartDisabled,
          isActionExitDisabled: isProcessing,
          isLoading: isProcessing,
          message,
          title,
        }}
        onActionExit={onActionExit}
        onActionStart={onActionStart}
        onFolderNameChange={onFolderNameChange}
        onValidateFolderName={onValidateFolderName}
      >
        <ActionExitControl />
        <TitleControl />
        <FolderNameFieldControl />
        <ViewElement className={`${STORAGE_BROWSER_BLOCK}__footer`}>
          <ViewElement className={`${STORAGE_BROWSER_BLOCK}__message`}>
            <MessageControl />
          </ViewElement>
          <ViewElement className={`${STORAGE_BROWSER_BLOCK}__buttons`}>
            <ActionStartControl />
          </ViewElement>
        </ViewElement>
      </ControlsContextProvider>
    </div>
  );
}
