import util from 'util';
import { describe, jest } from '@jest/globals';
import blockCallsForArgs from '../helpers/blockCallsForArgs';
import delay from '../helpers/delay';

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

  it('a waiter does not release a later owner lock (mutual exclusion holds for 3+ concurrent calls)', async () => {
    // Orchestrate the interleaving A(owner) -> B(waiter) -> [A done] -> B runs ->
    // D(new owner) -> [B done] -> E. With the bug, B's trailing cleanup deletes D's
    // lock, so E starts running concurrently with the still-in-flight D — two owners
    // at once. With the fix, E must wait for D.
    const gates: Record<string, PromiseWithResolvers<null>> = {};
    ['A', 'B', 'D', 'E'].forEach((id) => {
      gates[id] = Promise.withResolvers<null>();
    });

    const started: string[] = [];
    const fn = jest
      .fn<(key: string, ...args: unknown[]) => Promise<string>>()
      .mockImplementation(async (_key: string, ...args: unknown[]) => {
        const id = args[0] as string;
        started.push(id);
        await gates[id].promise;
        return id;
      });

    const blockedFn = blockCallsForArgs(fn);
    const key = 'room';

    const promiseA = blockedFn(key, 'A'); // owner
    const promiseB = blockedFn(key, 'B'); // waiter on A
    await delay(0);

    // A finishes -> B wakes and enters fn; the key lock is momentarily free.
    gates.A.resolve(null);
    await promiseA;
    await delay(0);

    // A new owner D arrives while B is still inside fn.
    const promiseD = blockedFn(key, 'D');
    await delay(0);

    // B finishes -> with the bug this deletes D's lock.
    gates.B.resolve(null);
    await promiseB;
    await delay(0);

    // E arrives. It must observe D's lock and wait, not become a second owner.
    const promiseE = blockedFn(key, 'E');
    await delay(0);

    expect(started).not.toContain('E');

    gates.D.resolve(null);
    gates.E.resolve(null);
    await Promise.all([promiseD, promiseE]);
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
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await fn1Promise.resolve(null);
    expect(await asyncResult1).toBe('someKey');
  });
});
