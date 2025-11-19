import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@ui/Box';
import Typography from '@ui/Typography';
import useCustomTheme from '@Context/Theme';

/**
 * LandingPageWelcome Component
 * This component includes a welcome message to the users visiting the landing page.
 * @returns {ReactElement} - the landing page component
 */
const LandingPageWelcome = (): ReactElement => {
  const { t } = useTranslation();
  const theme = useCustomTheme();
  const primaryWord = t('landing.primary.word');

  const renderTitle = (titleKey: string) => {
    const text = t(titleKey);
    const isPrimaryWord = text.toLowerCase().includes(primaryWord.toLowerCase());

    return (
      <Typography
        key={titleKey}
        variant="h1"
        sx={{
          color: isPrimaryWord ? theme.colors.textPrimary : theme.colors.textSecondary,
          mr: { xs: 1, md: 0 },
        }}
      >
        {text}
      </Typography>
    );
  };

  return (
    <Box
      sx={{
        maxWidth: '48rem',
        pl: { xs: 0, lg: 4 },
        mb: { xs: 0, md: 16 },
        ml: { xs: 0, md: 2 },
        textAlign: 'left',
      }}
    >
      <Box
        sx={{
          pb: { xs: 0, md: 5 },
          color: theme.colors.textSecondary,
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: { xs: 'row', md: 'column' },
          width: 'fit-content',
        }}
      >
        <>
          {renderTitle('landing.welcome.title.1')}
          {renderTitle('landing.welcome.title.2')}
          {renderTitle('landing.welcome.title.3')}
        </>
      </Box>

      <Typography
        variant="h4"
        sx={{
          color: theme.colors.textTertiary,
          mt: 1,
          display: {
            xs: 'none',
            sm: 'block',
          },
        }}
      >
        {t('landing.welcome.subtitle')}
      </Typography>
    </Box>
  );
};

export default LandingPageWelcome;
