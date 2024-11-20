import { createContextUtilities } from '@aws-amplify/ui-react-core';
import { ActionConfigs } from './types';

export interface ActionConfigsProviderProps {
  actions?: ActionConfigs;
  children?: React.ReactNode;
}

const defaultValue: { actions?: ActionConfigs } = { actions: undefined };
export const { useActionConfigs, ActionConfigsProvider } =
  createContextUtilities({ contextName: 'ActionConfigs', defaultValue });

export function useActionConfig<T extends keyof ActionConfigs>(
  type?: T
): ActionConfigs[T] {
  const { actions } = useActionConfigs();

  if (!type) throw new Error('`type` must be provided to `useActionConfig`');

  const config = actions?.[type];
  if (!config) {
    throw new Error(`No configuration for \`type\` value of \`${type}\``);
  }

  return config;
}
