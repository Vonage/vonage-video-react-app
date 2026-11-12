import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@ui/components/Card';
import NewRoomButton from '../NewRoomButton';
import JoinContainerSeparator from '../JoinContainerSeparator';
import JoinExistingRoom from '../JoinExistingRoom';
import CreateRoomWizard from '../CreateRoomWizard';

/**
 * RoomJoinContainer Component
 *
 * This component renders UI elements for creating a new room or joining an existing one.
 * @returns {ReactElement} The room join container component.
 */
const RoomJoinContainer = (): ReactElement => {
  const { t } = useTranslation();
  const [isCreateRoomWizardOpen, setIsCreateRoomWizardOpen] = useState(false);

  const handleNewRoom = () => {
    setIsCreateRoomWizardOpen(true);
  };

  return (
    <Card component="form" className="lg:max-w-125">
      <h6 className="font-vera-plain text-vera-heading-4 text-vera-text-secondary mb-4">
        {t('button.startNewRoom')}
      </h6>
      <NewRoomButton handleNewRoom={handleNewRoom} />

      <JoinContainerSeparator />

      <h6 className="font-vera-plain text-vera-heading-4 text-vera-text-secondary mb-4">
        {t('button.joinRoom')}
      </h6>

      <JoinExistingRoom />

      {isCreateRoomWizardOpen && (
        <CreateRoomWizard onClose={() => setIsCreateRoomWizardOpen(false)}>
          <CreateRoomWizard.Step step="details">
            <CreateRoomWizard.DetailsStep />
          </CreateRoomWizard.Step>
          <CreateRoomWizard.Step step="share">
            <CreateRoomWizard.ShareStep />
          </CreateRoomWizard.Step>
        </CreateRoomWizard>
      )}
    </Card>
  );
};

export default RoomJoinContainer;
