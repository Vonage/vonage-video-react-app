import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import VividIcon from '@ui/components/VividIcon';
import meetingExtension$ from '../../context/meetingExtensionContext';
import useExtensionCopy from '../../hooks/useExtensionCopy';

/**
 * Entry point of variant A at any time: an "Extend meeting" item in the toolbar overflow menu.
 */
const ExtensionOverflowMenu = (): ReactElement => {
  const { t } = useTranslation();
  const { isAtCap, endsAtLabel, atCapLabel } = useExtensionCopy();
  const { setOpen } = meetingExtension$.use.actions();

  return (
    <Paper className="absolute bottom-24 right-4 w-80 overflow-hidden rounded-vera-large! max-sm:inset-x-4 max-sm:w-auto">
      <MenuList>
        <MenuItem disabled={isAtCap} className="whitespace-normal!" onClick={() => setOpen(true)}>
          <ListItemIcon>
            <VividIcon name={isAtCap ? 'lock-line' : 'add-time-line'} customSize={-5} />
          </ListItemIcon>
          <ListItemText
            primary={
              isAtCap
                ? t('meetingFlow.extension.menuEntryDisabled')
                : t('meetingFlow.extension.menuEntry')
            }
            secondary={
              isAtCap ? atCapLabel : t('meetingFlow.extension.endsAt', { time: endsAtLabel })
            }
          />
        </MenuItem>
      </MenuList>
    </Paper>
  );
};

export default ExtensionOverflowMenu;
