import React from 'react';

import { humanFileSize } from '@aws-amplify/ui';

import { TABLE_HEADER_BUTTON_CLASS_NAME } from '../../components/DataTable';
import { ButtonElement, StorageBrowserElements } from '../../context/elements';
import { useControl } from '../../context/controls';
import { compareNumbers, compareStrings } from '../../context/controls/Table';
import { TaskStatus } from '../../context/types';
import { IconVariant } from '../../context/elements/IconElement';

import { getPercentValue } from '../utils';
import { CLASS_BASE } from '../constants';
import { Controls } from '../Controls';
import {
  TableDataText,
  Column,
  RenderRowItem,
  SortState,
} from '../Controls/Table';

import { Title } from './Controls/Title';
import { STATUS_DISPLAY_VALUES } from './constants';
import { CancelableTask, useHandleUpload } from './useHandleUpload';

const { Icon, DefinitionDetail, DefinitionList, DefinitionTerm } =
  StorageBrowserElements;

const { Cancel, Exit, Overwrite, Primary, Summary, Table } = Controls;

interface LocationActionViewColumns extends CancelableTask {
  type: string;
  folder: string;
}

interface ActionIconProps {
  status?: TaskStatus | 'CANCELED';
}

const DEFAULT_OVERWRITE_PROTECTION = true;
const LOCATION_ACTION_VIEW_COLUMNS: Column<LocationActionViewColumns>[] = [
  {
    key: 'key',
    header: 'Name',
  },
  {
    key: 'folder',
    header: 'Folder',
  },
  {
    key: 'type',
    header: 'Type',
  },
  {
    key: 'size',
    header: 'Size',
  },
  {
    key: 'status',
    header: 'Status',
  },
  {
    key: 'progress',
    header: 'Progress',
  },
  {
    key: 'cancel',
    header: 'Cancel',
  },
];

export const ICON_CLASS = `${CLASS_BASE}__action-status`;
const DESTINATION_CLASS = `${CLASS_BASE}__destination`;

export const ActionIcon = ({ status }: ActionIconProps): React.JSX.Element => {
  let variant: IconVariant = 'action-initial';

  switch (status) {
    case 'INITIAL':
    case 'QUEUED':
      variant = 'action-queued';
      break;
    case 'PENDING':
      variant = 'action-progress';
      break;
    case 'COMPLETE':
      variant = 'action-success';
      break;
    case 'FAILED':
      variant = 'action-error';
      break;
    case 'CANCELED':
      variant = 'action-canceled';
      break;
  }

  return (
    <Icon
      variant={variant}
      className={`${ICON_CLASS} ${ICON_CLASS}--${variant}`}
    />
  );
};

const Destination = ({ children }: { children?: React.ReactNode }) => {
  return (
    <DefinitionList className={DESTINATION_CLASS}>
      <DefinitionTerm className={`${DESTINATION_CLASS}__term`}>
        Destination:
      </DefinitionTerm>
      <DefinitionDetail className={`${DESTINATION_CLASS}__detail`}>
        {children}
      </DefinitionDetail>
    </DefinitionList>
  );
};

const LocationActionViewColumnSortMap = {
  key: compareStrings,
  size: compareNumbers,
  status: compareStrings,
  progress: compareNumbers,
  type: compareStrings,
  folder: compareStrings,
};

const renderRowItem: RenderRowItem<LocationActionViewColumns> = (
  row,
  index
) => {
  const renderTableData = (
    columnKey: keyof LocationActionViewColumns,
    row: LocationActionViewColumns
  ) => {
    switch (columnKey) {
      case 'key': {
        // Render the key without the parent folders
        const folder = row.key.lastIndexOf('/') + 1;

        return (
          <TableDataText>
            <ActionIcon status={row.status} />
            {row.key.slice(folder, row.key.length)}
          </TableDataText>
        );
      }
      case 'folder': {
        return <TableDataText>{row.folder}</TableDataText>;
      }
      case 'type': {
        return <TableDataText>{row.type}</TableDataText>;
      }
      case 'size':
        return <TableDataText>{humanFileSize(row.size, true)}</TableDataText>;
      case 'status':
        return (
          <TableDataText>{STATUS_DISPLAY_VALUES[row.status]}</TableDataText>
        );
      case 'progress':
        return (
          <TableDataText>{`${getPercentValue(row.progress)}%`}</TableDataText>
        );
      case 'cancel':
        if (row.cancel) {
          return (
            <Cancel
              onClick={row.cancel}
              ariaLabel={`Cancel upload for ${row.key}`}
            />
          );
        }

        return null;
      default:
        return null;
    }
  };

  return (
    <Table.TableRow key={index}>
      {LOCATION_ACTION_VIEW_COLUMNS.map((column) => {
        return (
          <Table.TableData
            key={`${index}-${column.header}`}
            variant={column.key}
          >
            {renderTableData(column.key, row)}
          </Table.TableData>
        );
      })}
    </Table.TableRow>
  );
};

export const UploadControls = (): JSX.Element => {
  const [{ history, path }] = useControl({ type: 'NAVIGATE' });

  const [preventOverwrite, setPreventOverwrite] = React.useState(
    DEFAULT_OVERWRITE_PROTECTION
  );
  const [{ selected }, handleUpdateState] = useControl({
    type: 'ACTION_SELECT',
  });

  const [tasks, handleUpload, handleFileSelect, handleCancel] = useHandleUpload(
    { prefix: path, preventOverwrite }
  );

  const handleFileInput = React.useRef<HTMLInputElement>(null);
  const handleFolderInput = React.useRef<HTMLInputElement>(null);

  // Noticed that in Safari, the file picker was not registering the on change event
  // unless I made sure that the useEffect for clicking the file input was only clicked once
  const initialRun = React.useRef(false);

  let tableData = tasks.map((task) => {
    const { webkitRelativePath } = task.data;

    const folder =
      webkitRelativePath?.length > 0
        ? webkitRelativePath.slice(0, webkitRelativePath.lastIndexOf('/') + 1)
        : '/';

    return { ...task, type: task.data.type ?? '-', folder };
  });

  React.useEffect(() => {
    if (!initialRun.current) {
      if (selected.type === 'UPLOAD_FILES') {
        handleFileInput.current?.click();
      } else if (selected.type === 'UPLOAD_FOLDER') {
        handleFolderInput.current?.click();
      }

      initialRun.current = true;
    }
  }, [selected.type]);

  const [compareFn, setCompareFn] = React.useState<(a: any, b: any) => number>(
    () => compareStrings
  );
  const [sortState, setSortState] = React.useState<
    SortState<LocationActionViewColumns>
  >({
    selection: 'key',
    direction: 'ascending',
  });

  const { direction, selection } = sortState;

  tableData =
    direction === 'ascending'
      ? tableData.sort((a, b) => compareFn(a[selection], b[selection]))
      : tableData.sort((a, b) => compareFn(b[selection], a[selection]));

  const renderHeaderItem = React.useCallback(
    (column: Column<LocationActionViewColumns>) => {
      // Defining this function inside the `UploadControls` to get access
      // to the current sort state
      const { header, key } = column;

      return (
        <Table.TableHeader
          key={header}
          variant={key}
          aria-sort={selection === key ? direction : 'none'}
        >
          {key in LocationActionViewColumnSortMap ? (
            <ButtonElement
              variant="sort"
              className={TABLE_HEADER_BUTTON_CLASS_NAME}
              onClick={() => {
                setCompareFn(
                  () =>
                    LocationActionViewColumnSortMap[
                      key as keyof typeof LocationActionViewColumnSortMap
                    ]
                );

                setSortState((prevState) => ({
                  selection: column.key,
                  direction:
                    prevState.direction === 'ascending'
                      ? 'descending'
                      : 'ascending',
                }));
              }}
            >
              {column.header}
              {selection === column.key ? (
                <Icon
                  variant={
                    direction === 'none'
                      ? 'sort-indeterminate'
                      : `sort-${direction}`
                  }
                />
              ) : (
                <Icon variant="sort-indeterminate" />
              )}
            </ButtonElement>
          ) : (
            column.header
          )}
        </Table.TableHeader>
      );
    },
    [direction, selection]
  );

  const taskCount = tasks.length;

  const processingTasks = tasks.filter(({ status }) => status === 'PENDING');
  const hasCompleted =
    !!taskCount &&
    tasks.every(
      ({ status }) =>
        status === 'CANCELED' || status === 'COMPLETE' || status === 'FAILED'
    );

  const hasStarted = !!processingTasks.length;

  const disableCancel = !taskCount || !hasStarted || hasCompleted;
  const disablePrimary = !taskCount || hasStarted || hasCompleted;
  const disableOverwrite = hasStarted || hasCompleted;
  const disableSelectFiles = hasStarted || hasCompleted;

  const queuedTasks = tasks.filter(
    ({ status }) => status === 'QUEUED' || status === 'INITIAL'
  ).length;
  const canceledTasks = tasks.filter(
    ({ status }) => status === 'CANCELED'
  ).length;
  const failedTasks = tasks.filter(({ status }) => status === 'FAILED').length;
  const completeTasks = tasks.filter(
    ({ status }) => status === 'COMPLETE'
  ).length;

  return (
    <>
      <input
        data-testid="amplify-file-select"
        type="file"
        style={{ display: 'none' }}
        multiple
        onChange={({ target }) => {
          handleFileSelect([...(target.files ?? [])]);
        }}
        ref={handleFileInput}
      />
      <input
        data-testid="amplify-folder-select"
        type="file"
        style={{ display: 'none' }}
        onChange={({ target }) => {
          handleFileSelect([...(target.files ?? [])]);
        }}
        // @ts-expect-error webkitdirectory is not typed
        webkitdirectory=""
        ref={handleFolderInput}
      />
      <Exit onClick={() => handleUpdateState({ type: 'CLEAR' })} />
      <Title />
      <Primary
        disabled={disablePrimary}
        onClick={() => {
          handleUpload();
        }}
      >
        Start
      </Primary>
      <ButtonElement
        variant="cancel"
        disabled={disableCancel}
        className={`${CLASS_BASE}__cancel`}
        onClick={() => {
          handleCancel();
        }}
      >
        Cancel
      </ButtonElement>
      <ButtonElement
        disabled={disableSelectFiles}
        className={`${CLASS_BASE}__add-folder`}
        variant="add-folder"
        onClick={() => {
          handleFolderInput?.current?.click();
        }}
      >
        Add folder
      </ButtonElement>
      <ButtonElement
        disabled={disableSelectFiles}
        className={`${CLASS_BASE}__add-files`}
        variant="add-files"
        onClick={() => {
          handleFileInput?.current?.click();
        }}
      >
        Add files
      </ButtonElement>
      <Destination>{history[history.length - 1].prefix}</Destination>
      <Overwrite
        defaultChecked={!preventOverwrite}
        disabled={disableOverwrite}
        handleChange={() => {
          setPreventOverwrite((overwrite) => !overwrite);
        }}
      />
      {taskCount ? (
        <Summary
          total={taskCount}
          complete={completeTasks}
          failed={failedTasks}
          canceled={canceledTasks}
          queued={queuedTasks}
        />
      ) : null}
      <Table
        data={tableData}
        columns={LOCATION_ACTION_VIEW_COLUMNS}
        renderHeaderItem={renderHeaderItem}
        renderRowItem={renderRowItem}
      />
    </>
  );
};
