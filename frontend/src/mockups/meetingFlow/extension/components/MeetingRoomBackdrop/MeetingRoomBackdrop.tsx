import { Children, type PropsWithChildren, type ReactElement } from 'react';
import findSlotByDisplayName from '@ui/helpers/findSlotByDisplayName';
import AvatarInitials from '@components/AvatarInitials';
import ToolbarButton from '@components/MeetingRoom/ToolbarButton';
import VividIcon from '@ui/components/VividIcon';
import { MeetingRoomBackdropSlots } from './constants/meetingRoomBackdropSlots';
import MeetingRoomBackdropSlot from './components/MeetingRoomBackdropSlot';

const participants = [
  { name: 'Ana García', initials: 'AG' },
  { name: 'Ben Okafor', initials: 'BO' },
  { name: 'Chen Wei', initials: 'CW' },
  { name: 'Dana Novak', initials: 'DN' },
];

const toolbarIcons = [
  'microphone-solid',
  'video-solid',
  'screen-share-solid',
  'emoji-solid',
  'chat-solid',
  'group-solid',
];

/**
 * Static stand-in for the meeting room: dark canvas, four camera-off tiles and the toolbar.
 */
const MeetingRoomBackdrop = ({ children }: PropsWithChildren): ReactElement => {
  const childrenArray = Children.toArray(children);
  const overlay = findSlotByDisplayName({
    children: childrenArray,
    displayName: MeetingRoomBackdropSlots.Overlay,
  });
  const toolbarStart = findSlotByDisplayName({
    children: childrenArray,
    displayName: MeetingRoomBackdropSlots.ToolbarStart,
  });
  const toolbarEnd = findSlotByDisplayName({
    children: childrenArray,
    displayName: MeetingRoomBackdropSlots.ToolbarEnd,
  });

  return (
    <div className="relative flex h-dvh w-full flex-col bg-vera-dark-background">
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 p-4">
        {participants.map(({ name, initials }) => (
          <div
            key={name}
            className="relative flex items-center justify-center overflow-hidden rounded-vera-large bg-vera-dark-grey"
          >
            <AvatarInitials initials={initials} username={name} height={180} width={180} />
            <span className="absolute bottom-1 left-2.5 rounded-vera-medium bg-vera-dark-grey-opacity px-2 py-1 font-vera-plain text-vera-body-base text-vera-accent">
              {name}
            </span>
          </div>
        ))}
      </div>
      <div className="flex h-20 items-center justify-between gap-3 p-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">{toolbarStart}</div>
        <div className="flex items-center gap-3">
          {toolbarIcons.map((icon, index) => (
            <ToolbarButton
              key={icon}
              aria-hidden
              tabIndex={-1}
              className={index > 1 ? 'max-sm:hidden!' : undefined}
              icon={
                <VividIcon
                  name={icon}
                  customSize={-4}
                  style={{ color: 'var(--vera-on-dark-grey)' }}
                />
              }
            />
          ))}
          {toolbarEnd}
          <ToolbarButton
            aria-hidden
            tabIndex={-1}
            className="bg-vera-error! hover:bg-vera-error-hover!"
            icon={
              <VividIcon
                name="end-call-solid"
                customSize={-4}
                style={{ color: 'var(--vera-on-dark-grey)' }}
              />
            }
          />
        </div>
        <div className="flex-1 max-sm:hidden" />
      </div>
      {overlay}
    </div>
  );
};

/**
 * Layer above the canvas for prompts and banners.
 */
MeetingRoomBackdrop.Overlay = MeetingRoomBackdropSlot(MeetingRoomBackdropSlots.Overlay);

/**
 * Left end of the toolbar, where the time and room name sit today.
 */
MeetingRoomBackdrop.ToolbarStart = MeetingRoomBackdropSlot(MeetingRoomBackdropSlots.ToolbarStart);

/**
 * Extra toolbar buttons placed before the exit button.
 */
MeetingRoomBackdrop.ToolbarEnd = MeetingRoomBackdropSlot(MeetingRoomBackdropSlots.ToolbarEnd);

export default MeetingRoomBackdrop;
