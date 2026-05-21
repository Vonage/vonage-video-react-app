import { isFunction } from '@common/assertions';
import React from 'react';

/**
 * In a collection of React nodes, finds the first node that matches the provided display name.
 */
function findSlotByDisplayName({
  children,
  displayName,
}: {
  children: React.ReactNode[];
  displayName: string;
}): React.ReactNode {
  return (
    children.find?.((child: unknown) => {
      const isValidElement = React.isValidElement(child) && isFunction(child.type);
      if (!isValidElement) return false;

      return (child.type as React.ComponentType).displayName === displayName;
    }) ?? null
  );
}

export default findSlotByDisplayName;
