import { ReactElement } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import useTheme from '@ui/theme';
import GHRepoButton from '../GHRepoButton';

/**
 * FooterLinks Component
 *
 * Component holding different icon-buttons.
 * @returns {ReactElement} The FooterLinks component.
 */
const FooterLinks = (): ReactElement => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Stack direction="row" alignItems="center" data-testid="footer-links" sx={{ py: 1 }}>
      <GHRepoButton />
      <Typography
        variant="body2"
        sx={{
          color: theme.colors.textTertiary,
          display: { xs: 'none', md: 'block' },
          ml: 1,
        }}
      >
        {t('footer.github.title')}
      </Typography>
    </Stack>
  );
};

export default FooterLinks;
