import React from 'react';
import isFunction from 'json-storage-formatter/isFunction';
import type { CleanupFunction, RefCreator } from './useStableRef.types';
import useNonDisposableStableRef from './hooks/useNonDisposableStableRef';
import useSimpleRef from './hooks/useSimpleRef';
import useDisposableStableRef from './hooks/useDisposableStableRef';
import { isNil } from '@common/assertions';

/**
 * @description Hook to create a stable ref value.
 * @param value The value that that the ref will hold
 * @returns <T> stable React ref object containing the value.
 */
function useStableRef<T>(value: T): React.RefObject<T>;

/**
 * @description Run the builder on render phase to create a stable ref value.
 * The builder must be pure since React may invoke it multiple times in dev mode.
 * Do not build sources that need disposal during render phase.
 * @param {RefCreator<T>} callback A function that creates the value that the ref will hold
 * @param deps Dependency list to determine when to recreate the value
 * @returns A stable React ref object containing the value.
 */
function useStableRef<T>(callback: RefCreator<T>, deps: React.DependencyList): React.RefObject<T>;

/**
 * @description Creates a disposable stable ref value.
 * The builder is invoke once the component is mounted. So is not available during render phase.
 * @param {RefCreator<T>} callback A function that creates the value that the ref will hold
 * @param {CleanupFunction<T>} cleanup A function that cleans up the value when it is recreated
 * @param deps Dependency list to determine when to recreate the value
 * @returns A stable React ref object containing the value.
 */
function useStableRef<T>(
  callback: RefCreator<T>,
  cleanup: CleanupFunction<T>,
  deps: React.DependencyList
): React.RefObject<T>;

function useStableRef<T>(
  param1: T | RefCreator<T>,
  param2?: CleanupFunction<T> | React.DependencyList,
  param3?: React.DependencyList
): React.RefObject<T> {
  const dependencies = isFunction(param2) ? param3 : param2;

  const isSimpleRef = isNil(dependencies);

  // simple non reactive ref
  if (isSimpleRef) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSimpleRef(param1 as T);
  }

  const builder = param1 as RefCreator<T>;
  const cleanup = isFunction(param2) ? param2 : undefined;

  const isDisposableRef = !isNil(cleanup);

  // non reactive computed on render stable ref, non disposable, should be pure
  if (!isDisposableRef) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useNonDisposableStableRef(builder, dependencies);
  }

  // disposable stable ref, not available during render phase
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useDisposableStableRef({
    builder,
    cleanup,
    dependencies,
  });
}

export default useStableRef;
