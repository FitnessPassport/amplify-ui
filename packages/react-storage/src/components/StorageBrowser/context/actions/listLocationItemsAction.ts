import {
  StorageSubpathStrategy,
  list,
  ListPaginateInput,
  ListOutput,
} from '../../storage-internal';

import {
  ListActionInput,
  ListActionOptions,
  ListActionOutput,
  ListPrefetchOptions,
  LocationItem,
} from '../types';

export interface ListLocationItemsActionInput
  extends ListActionInput<ListActionOptions> {}

export interface ListLocationItemsActionOutput
  extends ListActionOutput<LocationItem> {}

type ListOutputItem = ListOutput['items'][number];

const parseResultItems = (
  items: ListOutputItem[],
  path: string
): LocationItem[] =>
  items
    .filter((item): item is ListOutputItem => {
      // filter out default prefix item
      return item.path !== path;
    })
    .map(({ path: _path, lastModified, size }) => {
      const key = _path.slice(path.length);
      // Mark zero byte files as Folders
      if (size === 0 && key.endsWith('/')) {
        return { key, type: 'FOLDER' };
      }

      return {
        key,
        lastModified: lastModified!,
        size: size!,
        type: 'FILE',
      };
    });

const parseResultExcludedPaths = (
  paths: string[] | undefined,
  path: string
): LocationItem[] =>
  paths?.map((key) => ({ key: key.slice(path.length), type: 'FOLDER' })) ?? [];

export const parseResult = (
  output: ListOutput,
  path: string
): LocationItem[] => {
  return [
    ...parseResultExcludedPaths(output.excludedSubpaths, path),
    ...parseResultItems(output.items, path),
  ];
};

const MAX_PAGE_SIZE = 1000;

async function listWithPrefetch(
  path: string,
  listInputOptions: ListPaginateInput['options'],
  prefetch: ListPrefetchOptions
) {
  const result: LocationItem[] = [];
  let nextNextToken = listInputOptions?.nextToken;
  do {
    const output = await list({
      path,
      options: {
        ...listInputOptions,
        nextToken: nextNextToken,
      },
    });
    const parsedOutput = parseResult(output, path);
    result.push(...parsedOutput);
    nextNextToken = output.nextToken;
  } while (nextNextToken && result.length < prefetch.maxResults);

  return { result, nextToken: nextNextToken };
}

export async function listLocationItemsAction(
  prevState: ListLocationItemsActionOutput,
  input: ListLocationItemsActionInput
): Promise<ListLocationItemsActionOutput> {
  const { config, options, prefix: path } = input ?? {};
  const { delimiter, nextToken, pageSize, refresh, reset, prefetch } =
    options ?? {};

  if (reset) {
    return { result: [], nextToken: undefined };
  }

  const {
    accountId,
    bucket: bucketName,
    credentialsProvider,
    region,
  } = (typeof config === 'function' ? config() : config) ?? {};

  const bucket = { bucketName, region };
  const subpathStrategy: StorageSubpathStrategy = {
    delimiter,
    strategy: delimiter ? 'exclude' : 'include',
  };

  // `ListObjectsV2` returns the root `key` on initial request, which is from
  // filtered from `results` by `parseResult`, creatimg a scenario where the
  // return count of `results` to be one item less than provided the `pageSize`.
  // To mitigate, if a `pageSize` is provided and there are no previous `results`
  // or `refresh` is `true` increment the provided `pageSize` by `1`
  const hasPrevResults = !!prevState.result.length;
  const resolvedPageSize =
    pageSize && (!hasPrevResults || refresh) ? pageSize + 1 : pageSize;

  const listInput: ListPaginateInput = {
    path,
    options: {
      bucket,
      expectedBucketOwner: accountId,
      locationCredentialsProvider: credentialsProvider,
      // ignore provided `nextToken` on `refresh`
      nextToken: refresh ? undefined : nextToken,
      pageSize: resolvedPageSize,
      subpathStrategy,
    },
  };

  if (prefetch) {
    return await listWithPrefetch(
      path,
      {
        ...listInput.options,
        pageSize: MAX_PAGE_SIZE,
      },
      prefetch
    );
  } else {
    const output = await list(listInput);

    const result = [
      ...(refresh ? [] : prevState.result),
      ...parseResult(output, path),
    ];

    return { result, nextToken: output.nextToken };
  }
}
