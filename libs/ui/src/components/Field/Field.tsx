import React from 'react';
import type { ComponentProps, PropsWithChildren, ReactElement } from 'react';
import FieldDescription from './FieldDescription';
import FieldInput from './FieldInput';
import FieldLabel from './FieldLabel';
import { findSlotByDisplayName } from '../../helpers';
import { twMerge } from 'tailwind-merge';

export enum FieldSlots {
  Label = 'Field.Label',
  Input = 'Field.Input',
  Description = 'Field.Description',
}

const FieldRoot = ({
  children,
  className,
  ...props
}: PropsWithChildren<ComponentProps<'div'>>): ReactElement => {
  const childrenArray = React.Children.toArray(children);

  const label = findSlotByDisplayName({
    children: childrenArray,
    displayName: FieldSlots.Label,
  });

  const input = findSlotByDisplayName({
    children: childrenArray,
    displayName: FieldSlots.Input,
  });

  const description = findSlotByDisplayName({
    children: childrenArray,
    displayName: FieldSlots.Description,
  });

  const remainingChildren = childrenArray.filter(
    (child) => ![label, input, description].includes(child)
  );

  return (
    <div className={twMerge('Field flex flex-col gap-1.5', className)} {...props}>
      <div className="flex items-center justify-between gap-4">
        {label}
        {input}
      </div>
      {description}
      {remainingChildren}
    </div>
  );
};

(FieldLabel as unknown as { displayName: string }).displayName = FieldSlots.Label;
(FieldInput as unknown as { displayName: string }).displayName = FieldSlots.Input;
(FieldDescription as unknown as { displayName: string }).displayName = FieldSlots.Description;

const Field = Object.assign(FieldRoot, {
  Label: FieldLabel,
  Input: FieldInput,
  Description: FieldDescription,
});

export default Field;
