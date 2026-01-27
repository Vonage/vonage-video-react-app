import React from 'react';
import Box, { BoxProps } from '../Box/Box';
import useTheme from '../theme';

export type CardProps<C extends React.ElementType = 'div'> = BoxProps<C>;

const Card = <C extends React.ElementType = 'div'>({ sx, ...cardProps }: CardProps<C>) => {
  const theme = useTheme();

  return (
    <Box<C>
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
      {...(cardProps as BoxProps<C>)}
    />
  );
};

export default Card;
