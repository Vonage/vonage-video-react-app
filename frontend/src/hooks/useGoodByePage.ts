import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Archive } from '../api/archiving/model';
import useArchives from './useArchives';
import useSessionKeyParam from './useSessionKeyParam';
import { isErrorLike } from '@common/assertions';

type UseGoodByePageResult = {
  sessionKey: string | null;
  archives: Archive[] | 'error';
  header: string;
  caption: string;
  isSelfDeclinedRecording: boolean;
};

const useGoodByePage = (): UseGoodByePageResult => {
  const { t } = useTranslation();
  const location = useLocation();
  const { sessionKey } = useSessionKeyParam();

  const { data, error } = useArchives({ sessionKey });

  const header: string = location.state?.header || t('goodbye.default.header');
  const caption: string = location.state?.caption || t('goodbye.default.message');
  const isSelfDeclinedRecording: boolean = location.state?.isSelfDeclinedRecording || false;

  return {
    sessionKey,
    archives: data ? data.items : ((isErrorLike(error) ? error.message : 'error') as 'error'),
    header,
    caption,
    isSelfDeclinedRecording,
  };
};

export default useGoodByePage;
