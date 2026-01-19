import { Tabs as MUITabs, TabsProps as MUITabsProps } from '@mui/material';

export type TabsProps = MUITabsProps;

const Tabs = (tabsProps: TabsProps) => {
  return <MUITabs {...tabsProps} />;
};

export default Tabs;
