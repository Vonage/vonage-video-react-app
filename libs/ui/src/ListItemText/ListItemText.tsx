import {
  ListItemText as MUIListItemText,
  ListItemTextProps as MUIListItemTextProps,
} from '@mui/material';

export type ListItemTextProps = MUIListItemTextProps;

const ListItemText = (listItemTextProps: ListItemTextProps) => {
  return <MUIListItemText {...listItemTextProps} />;
};

export default ListItemText;
