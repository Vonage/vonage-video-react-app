import React from 'react';
import useTheme from '../theme';
import Box from '@mui/material/Box';
import type { Theme as MaterialThemeType } from '@mui/material';
import type { OverrideProps } from '@mui/material/OverridableComponent';
import type { BoxTypeMap } from '@mui/system';
import type { OverridableComponent } from '@mui/types';

type CardTypeMap<
  AdditionalProps = object,
  RootComponent extends React.ElementType = 'div',
> = BoxTypeMap<AdditionalProps, RootComponent, MaterialThemeType>;

export type CardProps<
  RootComponent extends React.ElementType = CardTypeMap['defaultComponent'],
  AdditionalProps = object,
> = OverrideProps<CardTypeMap<AdditionalProps, RootComponent>, RootComponent>;

const Card = (({ sx, ...cardProps }: CardProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        maxWidth: { xs: '100%', md: '500px' },
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        bgcolor: theme.colors.surface,
        padding: { xs: '0px', md: '40px' },
        borderRadius: theme.shapes.borderRadiusMedium,
        ...sx,
      }}
      {...cardProps}
    />
  );
}) as OverridableComponent<CardTypeMap>;

export default Card;
