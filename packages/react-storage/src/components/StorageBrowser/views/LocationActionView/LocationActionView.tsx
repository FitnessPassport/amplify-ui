import React from 'react';

import { isDefaultActionViewType } from '../../actions';
import { useStore } from '../../providers/store';

import { CreateFolderView } from './CreateFolderView';
import { CopyView } from './CopyView';
import { DeleteView } from './DeleteView';
import { UploadView } from './UploadView';
import { useViews } from '../context';

export interface LocationActionViewProps<T = string> {
  onExit?: () => void;
  type?: T;
}

export const LocationActionView = ({
  type,
  ...props
}: LocationActionViewProps): React.JSX.Element | null => {
  const [{ actionType = type }] = useStore();
  const views = useViews();

  // eslint-disable-next-line no-console
  console.log('views', views);
  // eslint-disable-next-line no-console
  console.log('actiontype', actionType);

  // @ts-expect-error
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const MaybeComponent = actionType ? views?.[actionType] : undefined;

  if (MaybeComponent) {
    return <MaybeComponent />;
  }

  if (!isDefaultActionViewType(actionType)) return null;

  return (
    <>
      {actionType === 'createFolder' ? (
        <CreateFolderView {...props} />
      ) : actionType === 'delete' ? (
        <DeleteView {...props} />
      ) : actionType === 'copy' ? (
        <CopyView {...props} />
      ) : (
        <UploadView {...props} />
      )}
    </>
  );
};
