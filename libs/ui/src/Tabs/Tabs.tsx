import { Tabs as MUITabs, TabsProps as MUITabsProps } from '@mui/material';

type TabsProps = MUITabsProps;

const Tabs = (tabsProps: TabsProps) => {
  return <MUITabs {...tabsProps} />;
};

export default Tabs;
