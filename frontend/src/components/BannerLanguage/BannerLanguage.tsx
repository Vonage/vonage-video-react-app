import Box from '@mui/material/Box';
import LanguageSelector from '../LanguageSelector';
import type { BoxProps } from '@mui/material';

type BannerLanguageProps = BoxProps;

/**
 * BannerLanguage Component
 *
 * This component provides a language selection feature for the banner.
 * @returns {ReactElement} The BannerLanguage component.
 */
const BannerLanguage: React.FC<BannerLanguageProps> = (props) => {
  return (
    <Box display="flex" alignItems="center" data-testid="banner-language" {...props}>
      <LanguageSelector />
    </Box>
  );
};

export default BannerLanguage;
