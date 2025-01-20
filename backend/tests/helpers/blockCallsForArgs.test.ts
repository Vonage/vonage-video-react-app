import util from 'util';
import { describe, jest } from '@jest/globals';
import blockCallsForArgs from '../../helpers/blockCallsForArgs';
import delay from '../../helpers/delay';

describe('blockCallsForArgs', () => {
  it('executes function with args', async () => {
    const fn = jest.fn<() => Promise<string>>().mockResolvedValue('result');
    const blockedFn = blockCallsForArgs(fn);
    const result = await blockedFn('someKey');
    expect(result).toBe('result');
  });

  it('only executes 2nd call after 1st has resolved', async () => {
    const fn1Promise = Promise.withResolvers();
    const mockInternalFn = jest.fn<() => number>().mockReturnValueOnce(1).mockReturnValueOnce(2);

    const fn = jest.fn<() => Promise<number>>().mockImplementation(async () => {
      await fn1Promise.promise;
      return mockInternalFn();
    });
    const blockedFn = blockCallsForArgs(fn);
    const asyncResult1 = blockedFn('someKey', 1);
    const asyncResult2 = blockedFn('someKey', 2);

    expect(fn).toHaveBeenCalledWith('someKey', 1);
    // Await some delays in order to give async functions a chance to run
    await delay(0);
    await delay(0);
    await delay(0);

    // Ensure 2nd call has not been made
    expect(fn).not.toHaveBeenCalledWith('someKey', 2);

    // Resolve first call and await results
    fn1Promise.resolve(null);
    expect(await asyncResult1).toBe(1);
    expect(await asyncResult2).toBe(2);

    // Ensure 2nd call has been made
    expect(fn).toHaveBeenCalledWith('someKey', 2);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('executes all n>1 call after 1st has resolved', async () => {
    const fn1Promise = Promise.withResolvers();
    const mockInternalFn = jest.fn<() => number>().mockReturnValueOnce(1).mockReturnValueOnce(2);

    const fn = jest.fn<() => Promise<number>>().mockImplementation(async () => {
      await fn1Promise.promise;
      return mockInternalFn();
    });
    const blockedFn = blockCallsForArgs(fn);
    const asyncResults = [...Array(5).keys()].map((i) => {
      return blockedFn('someKey', i + 1);
    });

    expect(fn).toHaveBeenCalledWith('someKey', 1);
    // Await some delays in order to give async functions a chance to run
    await delay(0);
    await delay(0);
    await delay(0);

    // Ensure 2nd call has not been made
    expect(fn).not.toHaveBeenCalledWith('someKey', 2);

    // Resolve first call and await results
    fn1Promise.resolve(null);
    await Promise.all(asyncResults);
    // Ensure 2nd call has been made
    expect(fn).toHaveBeenCalledWith('someKey', 2);
    expect(fn).toHaveBeenCalledWith('someKey', 3);
    expect(fn).toHaveBeenCalledWith('someKey', 4);
    expect(fn).toHaveBeenCalledWith('someKey', 5);
    expect(fn).toHaveBeenCalledTimes(5);
  });

  it('does not block calls for other keys', async () => {
    const fn1Promise = Promise.withResolvers();
    const fn = jest
      .fn<(key: string) => Promise<string>>()
      .mockImplementation(async (key: string) => {
        // In this mock function we make the fn wait if key is 'someKey'
        if (key === 'someKey') {
          await fn1Promise.promise;
        }
        return key;
      });
    const blockedFn = blockCallsForArgs(fn);
    const asyncResult1 = blockedFn('someKey', 1);
    const result2 = await blockedFn('someOtherKey', 2);

    expect(result2).toBe('someOtherKey');
    expect(util.inspect(asyncResult1).includes('pending'));
    await fn1Promise.resolve(null);
    expect(await asyncResult1).toBe('someKey');
  });
});
