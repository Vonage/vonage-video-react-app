import { Tab as MUITab, TabProps as MUITabProps } from '@mui/material';

type TabProps = MUITabProps;

const Tab = (tabProps: TabProps) => {
  return <MUITab {...tabProps} />;
};

export default Tab;
