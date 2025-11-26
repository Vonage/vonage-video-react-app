import { List as MUIList, ListProps as MUIListProps } from '@mui/material';

type ListProps = MUIListProps;

const List = (listProps: ListProps) => {
  return <MUIList {...listProps} />;
};

export default List;
