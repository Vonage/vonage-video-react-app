import { ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme, useMediaQuery } from '@mui/material';
import Box from '@ui/Box';
import Typography from '@ui/Typography';

/**
 * LandingPageWelcome Component
 * This component includes a welcome message to the users visiting the landing page.
 * @returns {ReactElement} - the landing page component
 */
const LandingPageWelcome = (): ReactElement => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));
  const title = t('landing.welcome.title');
  const words = useMemo(() => title.split(' '), [title]);

  return (
    <Box
      sx={{
        maxWidth: '48rem',
        pl: { xs: 2, xl: 4 },
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
            variant="h2"
            sx={{
              color: index === 1 ? 'primary.main' : 'text.primary',
              lineHeight: 1.2,
              mr: { xs: 1, md: 0 },
              fontSize: theme.typography.h2.fontSize,
              [theme.breakpoints.between('sm', 'md')]: {
                fontSize: theme.typography.h3.fontSize,
              },
              [theme.breakpoints.down('sm')]: {
                fontSize: theme.typography.h4.fontSize,
              },
            }}
          >
            {word}
          </Typography>
        ))}
      </Box>

      {isSmUp && (
        <Typography
          variant="h5"
          sx={{
            color: 'text.secondary',
            mt: 1,
          }}
        >
          {t('landing.welcome.subtitle')}
        </Typography>
      )}
    </Box>
  );
};

export default LandingPageWelcome;
