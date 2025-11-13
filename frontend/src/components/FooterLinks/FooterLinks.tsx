import { ReactElement } from 'react';
import Stack from '@ui/Stack';
import Typography from '@ui/Typography';
import { useTranslation } from 'react-i18next';
import GHRepoButton from '../GHRepoButton';

/**
 * FooterLinks Component
 *
 * Component holding different icon-buttons.
 * @returns {ReactElement} The FooterLinks component.
 */
const FooterLinks = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <Stack direction="row" alignItems="center" data-testid="footer-links" sx={{ py: 1 }}>
      <GHRepoButton />
      <Typography
        variant="body2"
        sx={(theme) => ({
          color: theme.palette.text.tertiary,
          display: { xs: 'none', md: 'block' },
        })}
        ml={1}
      >
        {t('footer.github.title')}
      </Typography>
    </Stack>
  );
};

export default FooterLinks;
