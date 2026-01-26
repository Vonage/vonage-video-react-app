import {
  AppBar,
  AppBarProps as MUIAppBarProps,
  ToolbarProps as MUIToolbarProps,
  Toolbar,
} from '@mui/material';
import { ReactNode } from 'react';

export type HeaderProps = {
  children: ReactNode;
  appBarProps?: MUIAppBarProps;
  toolbarProps?: MUIToolbarProps;
};

const Header = ({
  children,
  appBarProps: { sx: appBarPropsSx, ...appBarProps } = {},
  toolbarProps: { sx: toolbarPropsSx, ...toolbarProps } = {},
}: HeaderProps) => {
  return (
    <AppBar
      sx={{
        boxShadow: 'none',
        height: '88px',
        ...appBarPropsSx,
      }}
      {...appBarProps}
    >
      <Toolbar
        sx={{
          ...toolbarPropsSx,
        }}
        {...toolbarProps}
      >
        {children}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
