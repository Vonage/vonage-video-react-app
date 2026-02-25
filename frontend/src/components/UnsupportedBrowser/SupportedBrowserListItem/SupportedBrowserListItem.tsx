import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import ListItem from '@mui/material/ListItem';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import VividIcon from '@components/VividIcon';
import { Typography } from '@mui/material';
import Separator from '@components/Separator';
import Box from '@mui/material/Box';
import useTheme from '@ui/theme';

export type SupportedBrowserListItemProps = {
  url: string;
  browser: string;
};

/**
 * Displays a list item for a specified browser, including a button to open its download URL.
 * @param {SupportedBrowserListItemProps} props - The props for the component
 * @returns {ReactElement} - The rendered component.
 */
const SupportedBrowserListItem = ({
  url,
  browser,
}: SupportedBrowserListItemProps): ReactElement => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box sx={{ mb: 2 }}>
      <ListItem
        sx={{ mb: 1 }}
        key={browser}
        secondaryAction={
          <Link href={url} target="_blank" sx={{ textDecoration: 'none' }}>
            <IconButton>
              <VividIcon name="open-line" customSize={-6} sx={{ color: theme.colors.primary }} />
            </IconButton>
            <Typography
              variant="body2"
              component="span"
              sx={{ ml: 0.75, color: theme.colors.textPrimary }}
            >
              {t('unsupportedBrowser.supported.visitPage')}
            </Typography>
          </Link>
        }
      >
        <ListItemText primary={<Typography variant="body1">{browser}</Typography>} />
      </ListItem>
      <Separator width="100%" />
    </Box>
  );
};

export default SupportedBrowserListItem;
