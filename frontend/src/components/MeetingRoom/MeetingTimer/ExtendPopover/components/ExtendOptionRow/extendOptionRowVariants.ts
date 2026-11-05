import { tv } from 'tailwind-variants';

const extendOptionRowVariants = tv(
  {
    base: 'flex items-center gap-3 rounded-vera-medium border px-3 py-2',
    variants: {
      isSelected: {
        true: 'border-vera-primary bg-vera-background',
        false: 'border-vera-border',
      },
      isAvailable: {
        true: 'cursor-pointer',
        false: 'cursor-not-allowed opacity-50',
      },
    },
  },
  { twMerge: false }
);

export default extendOptionRowVariants;
