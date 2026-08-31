import type { Mockable } from '@common/types/Mockable';
import { setupPartialMock } from '../../../../test/helpers';
import { languagesMock, type LanguagesMock } from '../../../mocks';

const makeLanguagesMock = (
  mock: Mockable<LanguagesMock> & Pick<LanguagesMock, 'language'>
): LanguagesMock => {
  return setupPartialMock('navigator.language', languagesMock, {
    ...mock,
  } as Mockable<LanguagesMock>);
};

export default makeLanguagesMock;
