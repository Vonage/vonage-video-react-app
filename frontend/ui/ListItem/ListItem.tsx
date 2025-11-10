import { ListItem as MUIListItem, ListItemProps as MUIListItemProps } from '@mui/material';

type ListItemProps = MUIListItemProps;

const ListItem = (listItemProps: ListItemProps) => {
  return <MUIListItem {...listItemProps} />;
};

export default ListItem;
