import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import Separator from '../Separator';

/**
 * JoinContainerSeparator Component
 *
 * Component used as a visual separator between two UI elements.
 * @returns {ReactElement} The JoinContainerSeparator component.
 */
const JoinContainerSeparator = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center w-full my-8">
      <Separator orientation="left" />
      <Typography variant="body2" className="text-vera-text-tertiary" sx={{ mx: 2 }}>
        {t('common.or')}
      </Typography>
      <Separator orientation="right" />
    </div>
  );
};

export default JoinContainerSeparator;
