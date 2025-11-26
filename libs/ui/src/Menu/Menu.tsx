import { Menu as MUIMenu, MenuProps as MUIMenuProps } from '@mui/material';

type MenuProps = MUIMenuProps;

const Menu = (menuProps: MenuProps) => {
  return <MUIMenu {...menuProps} />;
};

export default Menu;
