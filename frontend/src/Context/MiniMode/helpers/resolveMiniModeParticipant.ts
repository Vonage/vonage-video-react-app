import type { Publisher } from '@vonage/client-sdk-video';
import type { SubscriberWrapper } from '../../../types/session';

export type MiniModeHostedElement = HTMLVideoElement | HTMLObjectElement | null;

export type MiniModeParticipant = {
  element: MiniModeHostedElement;
  name: string;
  initials: string;
  hasVideo: boolean;
};

type ResolveMiniModeParticipantArgs = {
  subscriberWrappers: SubscriberWrapper[];
  activeSpeakerId: string | undefined;
  publisher: Publisher | null;
  publisherVideoElement: MiniModeHostedElement;
  isPublisherVideoEnabled: boolean;
};

/**
 * Picks who Mini Mode shows: the active speaker's camera, else the first camera, else the local publisher.
 * @param {ResolveMiniModeParticipantArgs} args - Current subscribers, active speaker, and local publisher state
 * @returns {MiniModeParticipant} The participant to show in the Mini Mode window
 */
const resolveMiniModeParticipant = ({
  subscriberWrappers,
  activeSpeakerId,
  publisher,
  publisherVideoElement,
  isPublisherVideoEnabled,
}: ResolveMiniModeParticipantArgs): MiniModeParticipant => {
  const cameraSubscribers = subscriberWrappers.filter(({ isScreenshare }) => !isScreenshare);
  const shownSubscriber =
    cameraSubscribers.find(({ id }) => id === activeSpeakerId) ?? cameraSubscribers[0];

  if (shownSubscriber) {
    const { stream } = shownSubscriber.subscriber;
    return {
      element: shownSubscriber.element,
      name: stream?.name ?? '',
      initials: stream?.initials ?? '',
      hasVideo: !!stream?.hasVideo,
    };
  }

  return {
    element: publisherVideoElement,
    name: publisher?.stream?.name ?? '',
    initials: publisher?.stream?.initials ?? '',
    hasVideo: isPublisherVideoEnabled,
  };
};

export default resolveMiniModeParticipant;
