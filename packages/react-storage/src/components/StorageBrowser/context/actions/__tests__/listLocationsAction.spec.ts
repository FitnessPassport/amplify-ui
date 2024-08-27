import { ListLocations } from '@aws-amplify/storage/storage-browser';
import { createListLocationsAction } from '../listLocationsAction';
import { LocationAccess } from '../../types';

const fakeLocation: LocationAccess = {
  scope: 's3://some-bucket/*',
  permission: 'READ',
  type: 'BUCKET',
};

const generateMockLocations = (size: number) =>
  Array<LocationAccess>(size).fill(fakeLocation);

const listLocations: ListLocations = ({ pageSize } = {}) => {
  return Promise.resolve({
    locations: generateMockLocations(pageSize!),
    nextToken: undefined,
  });
};

const mockListLocations = jest.fn(listLocations);

describe('createListLocationsAction', () => {
  beforeEach(() => {
    mockListLocations.mockClear();
  });
  it('returns the expected output shape in the happy path', async () => {
    mockListLocations.mockResolvedValueOnce({
      locations: generateMockLocations(100),
      nextToken: 'next',
    });
    const listLocationsAction = createListLocationsAction(mockListLocations);

    const output = await listLocationsAction(
      { nextToken: undefined, result: [] },
      { options: { pageSize: 100 } }
    );

    expect(output.result).toHaveLength(100);
    expect(output.nextToken).toBe('next');
  });

  it('merges the current action result with the previous action result', async () => {
    mockListLocations
      .mockResolvedValueOnce({
        locations: generateMockLocations(100),
        nextToken: 'next',
      })
      .mockResolvedValueOnce({
        locations: generateMockLocations(100),
        nextToken: 'next-oooo',
      });

    const listLocationsAction = createListLocationsAction(mockListLocations);
    const { result, nextToken } = await listLocationsAction(
      { nextToken: undefined, result: [] },
      { options: { pageSize: 100 } }
    );

    expect(result).toHaveLength(100);
    expect(nextToken).toBe('next');

    const { result: nextResult, nextToken: nextNextToken } =
      await listLocationsAction(
        { result, nextToken },
        { options: { pageSize: 100 } }
      );

    expect(nextResult).toHaveLength(200);
    expect(nextNextToken).not.toBe(nextToken);
    expect(nextNextToken).toBe('next-oooo');
  });

  it('should paginate with default page limit and provide next token', async () => {
    // assume, total items: 1500; default page limit: 1000
    mockListLocations.mockResolvedValueOnce({
      locations: generateMockLocations(600),
      nextToken: 'next',
    });
    mockListLocations.mockResolvedValueOnce({
      locations: generateMockLocations(400),
      nextToken: 'next-oooo',
    });

    const listLocationsAction = createListLocationsAction(mockListLocations);

    const output = await listLocationsAction(
      { nextToken: undefined, result: [] },
      {}
    );

    expect(mockListLocations).toHaveBeenCalledTimes(2);
    expect(mockListLocations).toHaveBeenCalledWith({
      pageSize: 1000,
      nextToken: undefined,
    });
    expect(mockListLocations).toHaveBeenCalledWith({
      pageSize: 400,
      nextToken: 'next',
    });

    expect(output.result).toHaveLength(1000);
    expect(output.nextToken).toBe('next-oooo');
  });

  it('should paginate with input page limit and conclude', async () => {
    // assume, total items: 70; requested page limit: 100
    mockListLocations.mockResolvedValueOnce({
      locations: generateMockLocations(50),
      nextToken: 'next',
    });
    mockListLocations.mockResolvedValueOnce({
      locations: generateMockLocations(20),
      nextToken: undefined,
    });

    const listLocationsAction = createListLocationsAction(mockListLocations);

    const output = await listLocationsAction(
      { nextToken: undefined, result: [] },
      { options: { pageSize: 100 } }
    );

    expect(mockListLocations).toHaveBeenCalledTimes(2);
    expect(mockListLocations).toHaveBeenCalledWith({
      pageSize: 100,
      nextToken: undefined,
    });
    expect(mockListLocations).toHaveBeenCalledWith({
      pageSize: 50,
      nextToken: 'next',
    });

    expect(output.result).toHaveLength(70);
    expect(output.nextToken).toBeUndefined();
  });

  it.todo('handles a search action as expected');
  it.todo('handles a refresh action as expected');
});
