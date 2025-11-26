import {
  AppBar,
  AppBarProps as MUIAppBarProps,
  ToolbarProps as MUIToolbarProps,
  Toolbar,
} from '@mui/material';
import { ReactNode } from 'react';

type HeaderProps = {
  children: ReactNode;
  appBarProps?: MUIAppBarProps;
  toolbarProps?: MUIToolbarProps;
};

const Header = ({ children, appBarProps, toolbarProps }: HeaderProps) => {
  return (
    <AppBar {...appBarProps}>
      <Toolbar {...toolbarProps}>{children}</Toolbar>
    </AppBar>
  );
};

export default Header;
