import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
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
    <Stack direction="row" alignItems="center" width="100%" sx={{ my: 4 }}>
      <Separator orientation="left" />
      <Typography variant="body2" className="text-vera-text-tertiary" sx={{ mx: 2 }}>
        {t('common.or')}
      </Typography>
      <Separator orientation="right" />
    </Stack>
  );
};

export default JoinContainerSeparator;
