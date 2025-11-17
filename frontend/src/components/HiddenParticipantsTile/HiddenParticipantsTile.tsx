import { ReactElement } from 'react';
import { AvatarGroup } from '@mui/material';
import { Box } from 'opentok-layout-js';
import { SubscriberWrapper } from '@app-types/session';
import getBoxStyle from '@utils/helpers/getBoxStyle';
import useSessionContext from '@hooks/useSessionContext';
import useShouldShowParticipantList from '@Context/AppConfig/hooks/useShouldShowParticipantList';
import AvatarInitials from '../AvatarInitials';

export type HiddenParticipantsTileProps = {
  box: Box;
  hiddenSubscribers: SubscriberWrapper[];
};
/**
 * HiddenParticipantsTile Component
 * A clickable tile matching VideoTile style to represent the Subscribers that are hidden from the call.
 * Will show the initial Avatars of the first two hidden subscribers
 * @param {HiddenParticipantsTileProps} props - the props for this component
 * @property {Box} box - Box specifying position and size of tile
 * @property {() => void} handleClick - click handler, e.g. open participant list
 * @property {SubscriberWrapper[]} hiddenSubscribers - Array of hidden subscribers
 * @returns {ReactElement} HiddenParticipantsTile instance
 */
const HiddenParticipantsTile = ({
  box,
  hiddenSubscribers,
}: HiddenParticipantsTileProps): ReactElement => {
  const { toggleParticipantList } = useSessionContext();

  const showParticipantList = useShouldShowParticipantList();

  const { height, width } = box;
  const diameter = Math.min(height, width) * 0.38;
  return (
    <button
      id="hidden-participants"
      data-testid="hidden-participants"
      className={`absolute m-1 flex items-center justify-center rounded-xl bg-notVeryGray-100 transition-colors ${
        showParticipantList ? 'cursor-pointer hover:bg-[rgb(76,80,82)]' : 'cursor-default'
      }`}
      style={getBoxStyle(box)}
      onClick={showParticipantList ? toggleParticipantList : () => {}}
      type="button"
    >
      <AvatarGroup
        total={hiddenSubscribers.length}
        className="border-none"
        sx={{
          '& .MuiAvatar-root': {
            transitionDuration: '150ms',
            height: `${diameter}px`,
            width: `${diameter}px`,
            fontSize: `${diameter / 3}pt`,
          },
        }}
      >
        {hiddenSubscribers.slice(0, 2).map((wrapper) => {
          const { initials, streamId, name } = wrapper?.subscriber?.stream ?? {};
          const sx = { position: 'relative' };

          return <AvatarInitials key={streamId} initials={initials} username={name} sx={sx} />;
        })}
      </AvatarGroup>
    </button>
  );
};

export default HiddenParticipantsTile;
