import {
  DataTableHeader,
  DataTableProps,
} from '../../../composables/DataTable';
import { LocationData } from '../../../actions';
import {
  createFileDataItem,
  FileDataItem,
  LocationItemData,
} from '../../../actions/handlers';
import { getFileRowContent } from './getFileRowContent';
import { getFolderRowContent } from './getFolderRowContent';
import { FileData } from '../../../actions/handlers';

import { LOCATION_DETAIL_VIEW_HEADERS } from './constants';
import { LocationState } from '../../../providers/store/location';
import { HeaderKeys, LocationDetailViewHeaders } from './types';
import { WithKey } from '../../../components/types';

export const getLocationDetailViewTableData = ({
  areAllFilesSelected,
  location,
  fileDataItems,
  hasFiles,
  showPaths,
  pageItems,
  selectFileLabel,
  selectAllFilesLabel,
  getDateDisplayValue,
  onDownload,
  onNavigate,
  onSelect,
  onSelectAll,
}: {
  areAllFilesSelected: boolean;
  location: LocationState;
  fileDataItems?: FileData[];
  hasFiles: boolean;
  showPaths: boolean;
  pageItems: LocationItemData[];
  selectFileLabel: string;
  selectAllFilesLabel: string;
  getDateDisplayValue: (date: Date) => string;
  onDownload: (fileItem: FileDataItem) => void;
  onNavigate: (location: LocationData, path?: string) => void;
  onSelect: (isSelected: boolean, fileItem: FileData) => void;
  onSelectAll: () => void;
}): DataTableProps => {
  const headerCheckbox: WithKey<DataTableHeader, HeaderKeys> = {
    key: 'checkbox',
    type: 'checkbox',
    content: {
      checked: areAllFilesSelected,
      label: selectAllFilesLabel,
      onSelect: onSelectAll,
      id: 'header-checkbox',
    },
  };

  const pathHeader: WithKey<DataTableHeader, HeaderKeys> = {
    key: 'path',
    type: 'sort',
    content: { label: 'Path' },
  };

  const [noopCheckbox, nameHeader, ...rest] = LOCATION_DETAIL_VIEW_HEADERS;

  const headers: LocationDetailViewHeaders = [
    hasFiles ? headerCheckbox : noopCheckbox,
    nameHeader,
    ...(showPaths ? [pathHeader] : []),
    ...rest,
  ];

  const rows: DataTableProps['rows'] = pageItems.map((locationItem) => {
    const { id, key, type } = locationItem;
    switch (type) {
      case 'FILE': {
        const { lastModified, size } = locationItem;
        const { current } = location;
        const isSelected =
          fileDataItems?.some((item) => item.id === id) ?? false;
        const onFileDownload = () => {
          onDownload(createFileDataItem(locationItem));
        };
        const onFileSelect = () => {
          onSelect(isSelected, locationItem);
        };
        return {
          key: id,
          content: getFileRowContent({
            headers,
            permissions: current?.permissions ?? [],
            isSelected,
            lastModified,
            getDateDisplayValue,
            rowId: id,
            rowKey: key,
            selectFileLabel,
            size,
            onDownload: onFileDownload,
            onSelect: onFileSelect,
          }),
        };
      }
      case 'FOLDER': {
        const { current } = location;
        const itemLocationPath = key.slice(current?.prefix.length);
        const onFolderNavigate = () => {
          if (!current) {
            return;
          }
          onNavigate({ ...current, id }, itemLocationPath);
        };
        return {
          key: id,
          content: getFolderRowContent({
            headers,
            rowKey: key,
            rowId: id,
            onNavigate: onFolderNavigate,
          }),
        };
      }
    }
  });

  return { headers, rows };
};
