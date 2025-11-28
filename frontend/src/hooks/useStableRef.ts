import React, { useRef } from 'react';
import isNil from 'lodash/isNil';
import isFunction from 'lodash/isFunction';
import shallowCompare from 'react-global-state-hooks/shallowCompare';

type RefCreator<T> = () => T;

const symbol = Symbol('internal stable ref');

/**
 * @description Hook to create a stable ref value.
 * @param value The value that that the ref will hold
 * @returns <T> stable React ref object containing the value.
 */
function useStableRef<T>(value: T): React.RefObject<T>;

/**
 * @description Hook to create a stable ref value.
 * @param {RefCreator<T>} callback A function that creates the value that the ref will hold
 * @param deps Dependency list to determine when to recreate the value
 * @returns A stable React ref object containing the value.
 */
function useStableRef<T>(callback: RefCreator<T>, deps: React.DependencyList): React.RefObject<T>;

function useStableRef<T>(
  param1: T | RefCreator<T>,
  deps?: React.DependencyList
): React.RefObject<T> {
  const ref = useRef<T | typeof symbol>(symbol);
  const dependenciesRef = useRef<React.DependencyList>(deps);

  (() => {
    if (isNil(deps)) {
      ref.current = param1 as T;

      return;
    }

    const shouldRecreate =
      isFunction(param1) &&
      (ref.current === symbol || !shallowCompare(dependenciesRef.current, deps));

    if (!shouldRecreate) {
      return;
    }

    ref.current = param1();
  })();

  dependenciesRef.current = deps;

  return ref as React.RefObject<T>;
}

export default useStableRef;
