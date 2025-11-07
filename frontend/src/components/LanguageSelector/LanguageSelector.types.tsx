import { Lang } from '../../env';

export type LanguageOption = {
  code: Lang;
  name: string;
  flag: string;
};

export type LanguageSelectorProps = {
  showFlag?: boolean;
  className?: string;
};
