import {
  ListItemText as MUIListItemText,
  ListItemTextProps as MUIListItemTextProps,
} from '@mui/material';

type ListItemTextProps = MUIListItemTextProps;

const ListItemText = (listItemTextProps: ListItemTextProps) => {
  return <MUIListItemText {...listItemTextProps} />;
};

export default ListItemText;
