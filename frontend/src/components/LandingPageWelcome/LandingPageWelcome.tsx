import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * LandingPageWelcome Component
 * This component includes a welcome message to the users visiting the landing page.
 * @returns {ReactElement} - the landing page component
 */
const LandingPageWelcome = (): ReactElement => {
  const { t } = useTranslation();
  const primaryWord = t('landing.primary.word');

  const renderTitle = (titleKey: string) => {
    const text = t(titleKey);
    const isPrimaryWord = text.toLowerCase().includes(primaryWord.toLowerCase());

    return (
      <Typography
        key={titleKey}
        variant="h1"
        className={classNames({
          'text-vera-text-primary': isPrimaryWord,
          'text-vera-text-secondary': !isPrimaryWord,
        })}
      >
        {text}
      </Typography>
    );
  };

  return (
    <Box
      sx={{
        maxWidth: '48rem',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Box
        className="text-vera-text-secondary"
        sx={{
          pl: { xs: 3, sm: 0 },
          pb: { xs: 0, md: 5 },
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: { xs: 'row', md: 'column' },
          width: 'fit-content',
          gap: 1,
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
        className="text-vera-text-tertiary"
        sx={{
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
