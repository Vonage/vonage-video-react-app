import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import ListItem from '@mui/material/ListItem';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import VividIcon from '@ui/VividIcon';
import { Typography } from '@mui/material';
import Separator from '@components/Separator';
import Box from '@mui/material/Box';

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

  return (
    <Box sx={{ mb: 2 }}>
      <ListItem
        sx={{ mb: 1 }}
        key={browser}
        secondaryAction={
          <Link href={url} target="_blank" sx={{ textDecoration: 'none' }}>
            <IconButton>
              <VividIcon
                name="open-line"
                customSize={-6}
                style={{ color: 'var(--vera-primary)' }}
              />
            </IconButton>
            <Typography
              variant="body2"
              component="span"
              sx={{ ml: 0.75 }}
              className="text-vera-text-primary"
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
