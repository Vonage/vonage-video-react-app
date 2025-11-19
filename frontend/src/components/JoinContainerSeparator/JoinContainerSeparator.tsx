import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Stack from '@ui/Stack';
import Typography from '@ui/Typography';
import useCustomTheme from '@Context/Theme';
import Separator from '../Separator';

/**
 * JoinContainerSeparator Component
 *
 * Component used as a visual separator between two UI elements.
 * @returns {ReactElement} The JoinContainerSeparator component.
 */
const JoinContainerSeparator = (): ReactElement => {
  const { t } = useTranslation();
  const theme = useCustomTheme();

  return (
    <Stack direction="row" alignItems="center" width="100%" sx={{ my: 4 }}>
      <Separator orientation="left" />
      <Typography
        variant="body2"
        sx={{
          color: theme.colors.textTertiary,
          mx: 2,
        }}
      >
        {t('common.or')}
      </Typography>
      <Separator orientation="right" />
    </Stack>
  );
};

export default JoinContainerSeparator;
