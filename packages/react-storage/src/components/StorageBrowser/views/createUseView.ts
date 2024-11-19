import {
  useCopyView,
  useCreateFolderView,
  useUploadView,
  useDeleteView,
} from './LocationActionView';
import { useLocationsView } from './LocationsView';
import { useLocationDetailView } from './LocationDetailView';

const DEFAULT_USE_VIEWS = {
  Copy: useCopyView,
  CreateFolder: useCreateFolderView,
  Delete: useDeleteView,
  LocationDetail: useLocationDetailView,
  Locations: useLocationsView,
  Upload: useUploadView,
};

type DefaultUseViews = typeof DEFAULT_USE_VIEWS;
export type UseViewType = keyof DefaultUseViews;

export type ViewKey<T> = T extends Record<
  string,
  { componentName?: `${infer U}View` }
>
  ? U
  : T extends Record<infer K, any>
  ? K
  : never;

export type UseView = <
  K extends keyof DefaultUseViews,
  S extends DefaultUseViews[K],
>(
  type: K,
  options?: S extends (options?: infer U) => any ? U : never
) => ReturnType<S>;

export const useView: UseView = (type, options) =>
  // @ts-expect-error
  DEFAULT_USE_VIEWS[type](options);
