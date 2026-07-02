import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const useGoodByePage = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const header: string = location.state?.header || t('goodbye.default.header');
  const caption: string = location.state?.caption || t('goodbye.default.message');
  const isSelfDeclinedRecording: boolean = location.state?.isSelfDeclinedRecording || false;

  return {
    header,
    caption,
    isSelfDeclinedRecording,
  };
};

export default useGoodByePage;
