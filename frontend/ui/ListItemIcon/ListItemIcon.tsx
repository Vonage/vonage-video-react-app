import {
  ListItemIcon as MUIListItemIcon,
  ListItemIconProps as MUIListItemIconProps,
} from '@mui/material';

type ListItemIconProps = MUIListItemIconProps;

const ListItemIcon = (listItemIconProps: ListItemIconProps) => {
  return <MUIListItemIcon {...listItemIconProps} />;
};

export default ListItemIcon;
