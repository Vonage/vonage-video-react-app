import { flatPaths } from '.';

const leftNavBarItems = [
  {
    label: 'Integration',
    iconName: 'code-line',
    path: flatPaths.createHandler,
  },
  {
    label: 'Design',
    iconName: 'palette-line',
    path: flatPaths.design,
  },
] as const;

export default leftNavBarItems;
