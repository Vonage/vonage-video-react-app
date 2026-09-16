import React from 'react';
import Box from '@mui/material/Box';
import type { Theme as MaterialThemeType } from '@mui/material';
import type { OverrideProps } from '@mui/material/OverridableComponent';
import type { BoxTypeMap } from '@mui/system';
import type { OverridableComponent } from '@mui/types';
import classNames from 'classnames';
import { twMerge } from 'tailwind-merge';

type CardTypeMap<
  AdditionalProps = object,
  RootComponent extends React.ElementType = 'div',
> = BoxTypeMap<AdditionalProps, RootComponent, MaterialThemeType>;

export type CardProps<
  RootComponent extends React.ElementType = CardTypeMap['defaultComponent'],
  AdditionalProps = object,
> = OverrideProps<CardTypeMap<AdditionalProps, RootComponent>, RootComponent>;

const Card = ({ className, ...cardProps }: CardProps) => {
  return (
    <Box
      className={twMerge(
        classNames(
          'max-w-full flex-1 flex flex-col items-start bg-vera-surface p-0 md:p-10 rounded-lg',
          className
        )
      )}
      {...cardProps}
    />
  );
};

export default Card as OverridableComponent<CardTypeMap>;
