import type { Mockable } from '@common/types/Mockable';
import { setupPartialMock } from '../../../../test/helpers';
import { languagesMock, type LanguagesMock } from '../../../mocks';

const makeLanguagesMock = <T extends LanguagesMock>(mock?: Mockable<T>): LanguagesMock => {
  return setupPartialMock('navigator.language', languagesMock, {
    ...mock,
    language: mock?.language ?? languagesMock.language,
  } as Mockable<LanguagesMock>);
};

export default makeLanguagesMock;
