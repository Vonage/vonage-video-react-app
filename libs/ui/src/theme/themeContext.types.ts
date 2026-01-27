export type WeightTokenItem = {
  value: string | number;
  type: 'fontWeight';
  description: string;
};

export type TypefaceTokenItem = {
  value: string;
  type: 'fontFamily';
  description: string;
};

export type TypeScaleTokenItem = {
  fontSize: { value: string; description: string };
  lineHeight: { value: string; description: string };
  fontWeight: { value: number; description: string };
};

export type Device = 'desktop' | 'mobile';

export type TypeScaleTokens = {
  headline: TypeScaleTokenItem;
  subtitle: TypeScaleTokenItem;
  'heading-1': TypeScaleTokenItem;
  'heading-2': TypeScaleTokenItem;
  'heading-3': TypeScaleTokenItem;
  'heading-4': TypeScaleTokenItem;
  'body-extended': TypeScaleTokenItem;
  'body-extended-semibold': TypeScaleTokenItem;
  'body-base': TypeScaleTokenItem;
  'body-base-semibold': TypeScaleTokenItem;
  caption: TypeScaleTokenItem;
  'caption-semibold': TypeScaleTokenItem;
};

export type TypographyTokens = {
  typeface: {
    plain: TypefaceTokenItem;
  };
  typeScale: Record<Device, TypeScaleTokens>;
  weight: {
    headline: WeightTokenItem;
    subtitle: WeightTokenItem;
    'heading-1': WeightTokenItem;
    'heading-2': WeightTokenItem;
    'heading-3': WeightTokenItem;
    'heading-4': WeightTokenItem;
    'body-extended': WeightTokenItem;
    'body-extended-semibold': WeightTokenItem;
    'body-base': WeightTokenItem;
    'body-base-semibold': WeightTokenItem;
    caption: WeightTokenItem;
    'caption-semibold': WeightTokenItem;
  };
};

export type ColorTokenItem = {
  value: string;
  type: 'color';
  description: string;
};

export type ColorsTokens = {
  primary: ColorTokenItem;
  'text-primary': ColorTokenItem;
  'on-primary': ColorTokenItem;
  'primary-hover': ColorTokenItem;

  secondary: ColorTokenItem;
  'text-secondary': ColorTokenItem;
  'on-secondary': ColorTokenItem;
  'secondary-hover': ColorTokenItem;

  tertiary: ColorTokenItem;
  'text-tertiary': ColorTokenItem;
  'on-tertiary': ColorTokenItem;
  'tertiary-hover': ColorTokenItem;

  accent: ColorTokenItem;
  'on-accent': ColorTokenItem;

  background: ColorTokenItem;
  'on-background': ColorTokenItem;

  surface: ColorTokenItem;
  'on-surface': ColorTokenItem;

  'alert-background': ColorTokenItem;
  'alert-background-hover': ColorTokenItem;
  'alert-text': ColorTokenItem;

  error: ColorTokenItem;
  'on-error': ColorTokenItem;
  'error-hover': ColorTokenItem;

  warning: ColorTokenItem;
  'on-warning': ColorTokenItem;
  'warning-hover': ColorTokenItem;

  success: ColorTokenItem;
  'on-success': ColorTokenItem;
  'success-hover': ColorTokenItem;

  information: ColorTokenItem;
  'on-information': ColorTokenItem;
  'information-hover': ColorTokenItem;
  'information-background': ColorTokenItem;

  border: ColorTokenItem;

  'dark-background': ColorTokenItem;
  'dark-grey': ColorTokenItem;
  'dark-grey-hover': ColorTokenItem;
  'on-dark-grey': ColorTokenItem;
  'dark-grey-opacity': ColorTokenItem;

  disabled: ColorTokenItem;
  'text-disabled': ColorTokenItem;
  'skeleton-like': ColorTokenItem;
};

export type ShapeTokenItem = {
  value: string;
  type: 'radius';
  description: string;
};

export type ShapesTokens = {
  none: ShapeTokenItem;
  'extra-small': ShapeTokenItem;
  small: ShapeTokenItem;
  medium: ShapeTokenItem;
  large: ShapeTokenItem;
  'extra-large': ShapeTokenItem;
};

export type ThemeTokens = {
  typography: TypographyTokens;
  colors: ColorsTokens;
  shapes: ShapesTokens;
};

export type Camelize<S extends string> = S extends `${infer Head}-${infer Tail}`
  ? `${Head}${Capitalize<Camelize<Tail>>}`
  : S;

export type ThemeColors = Record<Camelize<keyof ColorsTokens>, string>;

export type ThemeShapes = {
  borderRadiusNone: string;
  borderRadiusExtraSmall: string;
  borderRadiusSmall: string;
  borderRadiusMedium: string;
  borderRadiusLarge: string;
  borderRadiusExtraLarge: string;
};

export type ThemeTypography = TypographyTokens;

export type ThemeTypeScale = keyof ThemeTypography['typeScale'];

export type ThemeTypeface = keyof ThemeTypography['typeface'];

export type ThemeWeight = keyof ThemeTypography['weight'];

export type Theme = {
  colors: ThemeColors;
  shapes: ThemeShapes;
  typography: ThemeTypography;
};

export type PartialTheme = {
  colors?: Partial<ThemeColors>;
  shapes?: Partial<ThemeShapes>;
  typography?: {
    typeface?: Partial<Record<string, TypefaceTokenItem>>;
    typeScale?: Partial<Record<Device, Partial<TypeScaleTokens>>>;
    weight?: Partial<Record<string, WeightTokenItem>>;
  };
};

export default Theme;
