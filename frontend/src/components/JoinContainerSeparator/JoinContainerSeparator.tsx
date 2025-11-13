import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Stack from '@ui/Stack';
import Typography from '@ui/Typography';
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
      <Typography variant="body2" sx={(theme) => ({ color: theme.palette.tertiary.main })}>
        {t('common.or')}
      </Typography>
      <Separator orientation="right" />
    </Stack>
  );
};

export default JoinContainerSeparator;
