import { ReactElement } from 'react';
import Box from '@ui/Box';
import GHRepoButton from '../GHRepoButton';

/**
 * BannerLinks Component
 *
 * Component holding different icon-buttons.
 * @returns {ReactElement} The BannerLinks component.
 */
const BannerLinks = (): ReactElement => {
  return (
    <Box display="flex" alignItems="center" data-testid="banner-links">
      <GHRepoButton />
    </Box>
  );
};

export default BannerLinks;
