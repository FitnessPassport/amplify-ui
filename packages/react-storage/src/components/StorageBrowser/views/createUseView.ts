import { Action_Configs } from '../actions/configs/_types';

import {
  useCopyView,
  useCreateFolderView,
  useUploadView,
  useDeleteView,
  ActionViewState,
  useActionView,
} from './LocationActionView';
import { useLocationsView } from './LocationsView';
import { useLocationDetailView } from './LocationDetailView';
import { ResolveActionHandler } from '../actions/configs';
import { isObject } from '@aws-amplify/ui';

const DEFAULT_USE_VIEWS = {
  CopyView: useCopyView,
  CreateFolderView: useCreateFolderView,
  DeleteView: useDeleteView,
  LocationDetailView: useLocationDetailView,
  LocationsView: useLocationsView,
  UploadView: useUploadView,
} as const;

type StringWithoutSpaces<T extends string> = Exclude<
  T,
  ` ${string}` | `${string} ` | `${string} ${string}`
>;
type ActionName = StringWithoutSpaces<string>;

type DefaultUseViews = typeof DEFAULT_USE_VIEWS;

type ViewConfig = { componentName: `${string}View` };
type ViewConfigs<K extends ActionName = ActionName> = Record<
  K,
  Partial<ViewConfig>
>;

export type ViewKey<T> = T extends Record<
  string,
  { componentName?: `${infer U}View` }
>
  ? U
  : never;

type UseViewState<T extends string> = `${T}View` extends keyof DefaultUseViews
  ? ReturnType<DefaultUseViews[`${T}View`]>
  : ActionViewState;

export type DerivedViewConfigs<T> = {
  [K in keyof T as T[K] extends {
    componentName?: `${string}View`;
    // handler: Function;
  }
    ? K
    : never]: T[K];
};

// type DefaultOnly<T> = Extract<>

const isViewConfig = (value: unknown): value is ViewConfig =>
  (value as ViewConfig).componentName
    ? (value as ViewConfig).componentName.endsWith('View')
    : false;

export const deriveViewConfigs = <T extends Action_Configs>(
  configs: T
): DerivedViewConfigs<T> =>
  !isObject(configs)
    ? ({} as DerivedViewConfigs<T>)
    : Object.entries(configs).reduce(
        (viewConfigs, [key, config]) =>
          !isViewConfig(config)
            ? viewConfigs
            : { ...viewConfigs, [key]: config },
        {} as DerivedViewConfigs<T>
      );

export type UseView<T extends ViewConfigs = ViewConfigs> = <
  K extends ViewKey<T>,
>(
  type: K
) => UseViewState<K>;

type CreateUseView = <T extends ViewConfigs>(configs: T) => UseView<T>;

const isDefaultUseViewName = (
  viewName?: string
): viewName is keyof DefaultUseViews =>
  Object.keys(DEFAULT_USE_VIEWS).some((key) => key === viewName);

type UseViews<T> = {
  [K in keyof T]: K extends keyof DefaultUseViews
    ? null
    : () => ActionViewState;
};
export const createUseView: CreateUseView = <T extends ViewConfigs>(
  configs: T
) => {
  const hooks: UseViews<T> = Object.values(configs).reduce(
    (out, { componentName }) =>
      !isDefaultUseViewName(componentName)
        ? out
        : {
            ...out,
            [componentName.slice(0, -4)]: isDefaultUseViewName(componentName)
              ? DEFAULT_USE_VIEWS[componentName]
              : useActionView,
          },
    {} as UseViews<T>
  );

  return function useView(type) {
    // todo: add assertion here

    return hooks[type]();
  };
};
