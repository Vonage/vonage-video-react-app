import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Stack from '@ui/Stack';
import Separator from '../Separator';

/**
 * JoinContainerSeparator Component
 *
 * Component used as a visual separator between two UI elements.
 * @returns {ReactElement} The JoinContainerSeparator component.
 */
const JoinContainerSeparator = (): ReactElement => {
  const { t } = useTranslation();
  return (
    <Stack direction="row" alignItems="center" width="100%">
      <Separator orientation="left" />
      {t('common.or')}
      <Separator orientation="right" />
    </Stack>
  );
};

export default JoinContainerSeparator;
