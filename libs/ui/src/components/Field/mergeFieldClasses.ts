import { extendTailwindMerge } from 'tailwind-merge';
import { veraTypographyCssVariableNames } from '../../theme/helpers/veraUI.types';

const mergeFieldClasses = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        { text: Object.keys(veraTypographyCssVariableNames).map((token) => `vera-${token}`) },
      ],
    },
  },
});

export default mergeFieldClasses;
