import Button from '@ui/Button';
import { MouseEvent, ReactElement, TouchEvent } from 'react';
import { useTranslation } from 'react-i18next';

export type GoToLandingPageButtonProps = {
  handleLanding: (event: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>) => void;
};

/**
 * GoToLandingPageButton Component
 *
 * This component returns a button that takes a user back to the landing page
 * @param {GoToLandingPageButtonProps} props - the props for this component.
 *  @property {Function} handleLanding - the function that handles the action of going back to the landing page.
 * @returns {ReactElement} - the button to go back to the landing page.
 */
const GoToLandingPageButton = ({ handleLanding }: GoToLandingPageButtonProps): ReactElement => {
  const { t } = useTranslation();

  return (
    <Button data-testid="go-to-landing-button" variant="outlined" onClick={handleLanding} fullWidth>
      {t('goodBye.back')}
    </Button>
  );
};

export default GoToLandingPageButton;
