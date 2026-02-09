import Button from '@mui/material/Button';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

/**
 * GoToLandingPageButton Component
 *
 * This component returns a button that takes a user back to the landing page
 * @returns {ReactElement} - the button to go back to the landing page.
 */
const GoToLandingPageButton = (): ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const handleLanding = () => {
    navigate('/');
  };

  return (
    <Button data-testid="go-to-landing-button" variant="outlined" onClick={handleLanding} fullWidth>
      {t('goodBye.back')}
    </Button>
  );
};

export default GoToLandingPageButton;
