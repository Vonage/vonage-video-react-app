import { MenuItem as MUIMenuItem, MenuItemProps as MUIMenuItemProps } from '@mui/material';

export type MenuItemProps = MUIMenuItemProps;

const MenuItem = (menuItemProps: MenuItemProps) => {
  return <MUIMenuItem {...menuItemProps} />;
};

export default MenuItem;
