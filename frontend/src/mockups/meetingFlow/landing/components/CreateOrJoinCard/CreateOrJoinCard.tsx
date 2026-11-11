import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Card, { type CardProps } from '@ui/components/Card';
import NewRoomButton from '@components/NewRoomButton';
import JoinContainerSeparator from '@components/JoinContainerSeparator';
import RoomIdJoinField from '../RoomIdJoinField';

/**
 * Today's RoomJoinContainer card, with the join field relabelled "Room id". Extra content goes after the join field.
 */
const CreateOrJoinCard = ({ children, ...props }: CardProps<'form'>): ReactElement => {
  const { t } = useTranslation();

  return (
    <Card component="form" {...props}>
      <h6 className="font-vera-plain text-vera-heading-4 text-vera-text-secondary mb-4">
        {t('button.startNewRoom')}
      </h6>
      <NewRoomButton handleNewRoom={() => {}} />
      <JoinContainerSeparator />
      <h6 className="font-vera-plain text-vera-heading-4 text-vera-text-secondary mb-4">
        {t('button.joinExistingMeeting')}
      </h6>
      <RoomIdJoinField />
      {children}
    </Card>
  );
};

export default CreateOrJoinCard;
