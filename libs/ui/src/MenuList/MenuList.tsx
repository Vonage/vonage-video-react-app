import { MenuList as MUIMenuList, MenuListProps as MUIMenuListProps } from '@mui/material';

type MenuListProps = MUIMenuListProps;

const MenuList = (menuListProps: MenuListProps) => {
  return <MUIMenuList {...menuListProps} />;
};

export default MenuList;
