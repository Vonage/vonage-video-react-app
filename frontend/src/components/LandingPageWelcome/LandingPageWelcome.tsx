import { ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@ui/Box';
import Typography from '@ui/Typography';

/**
 * LandingPageWelcome Component
 * This component includes a welcome message to the users visiting the landing page.
 * @returns {ReactElement} - the landing page component
 */
const LandingPageWelcome = (): ReactElement => {
  const { t } = useTranslation();
  const title = t('landing.welcome.title');
  const words = useMemo(() => title.split(' '), [title]);

  return (
    <Box
      sx={{
        maxWidth: '48rem',
        pl: { xs: 0, lg: 4 },
        mb: { xs: 0, md: 6 },
        ml: { xs: 0, md: 2 },
        textAlign: 'left',
      }}
    >
      <Box
        sx={{
          pb: { xs: 0, md: 5 },
          color: 'text.primary',
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: { xs: 'row', md: 'column' },
          width: 'fit-content',
        }}
      >
        {words.map((word, index) => (
          <Typography
            key={word}
            variant="h1"
            sx={{
              color: index === 1 ? 'text.main' : 'text.primary',
              lineHeight: 1.2,
              mr: { xs: 1, md: 0 },
            }}
          >
            {word}
          </Typography>
        ))}
      </Box>

      <Typography
        variant="h5"
        sx={{
          color: 'text.tertiary',
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
