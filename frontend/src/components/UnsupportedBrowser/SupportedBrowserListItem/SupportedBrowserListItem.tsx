import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import ListItem from '@ui/ListItem';
import ListItemIcon from '@ui/ListItemIcon';
import Link from '@ui/Link';
import Tooltip from '@ui/Tooltip';
import IconButton from '@ui/IconButton';
import ListItemText from '@ui/ListItemText';
import VividIcon from '@components/VividIcon';

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
    <ListItem key={browser}>
      <ListItemIcon>
        <Link href={url} target="_blank">
          <Tooltip title={t('unsupportedBrowser.supported.downloadLink', { browser })}>
            <IconButton>
              <VividIcon name="popup-line" customSize={-4} />
            </IconButton>
          </Tooltip>
        </Link>
      </ListItemIcon>

      <ListItemText primary={`${browser}`} />
    </ListItem>
  );
};

export default SupportedBrowserListItem;
