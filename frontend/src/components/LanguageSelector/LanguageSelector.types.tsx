import { Lang } from '@common/types';

export type LanguageOption = {
  code: Lang;
  name: string;
  flag: string;
};

export type LanguageSelectorProps = {
  showFlag?: boolean;
};
