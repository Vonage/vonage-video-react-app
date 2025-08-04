import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
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
    <div className="flex w-full items-center">
      <Separator orientation="left" />
      {t('common.or')}
      <Separator orientation="right" />
    </div>
  );
};

export default JoinContainerSeparator;
