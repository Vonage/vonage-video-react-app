import type { SubscriberWrapper } from '../../types/session';

export type MiniModeParticipant = {
  element: HTMLVideoElement | HTMLObjectElement | null;
  name: string;
  initials: string;
};

type PublisherSnapshot = {
  element: HTMLVideoElement | HTMLObjectElement | null | undefined;
  name: string;
  initials: string;
};

/**
 * Picks the camera feed to show in Mini Mode: the active speaker if they are
 * a camera subscriber, otherwise the first camera subscriber, otherwise local.
 * @param {SubscriberWrapper[]} subscriberWrappers - Current remote participants
 * @param {string | undefined} activeSpeakerId - Active-speaker wrapper id
 * @param {PublisherSnapshot} publisher - Local publisher video and name
 * @returns {MiniModeParticipant} Tile to host in the floating window
 */
const resolveMiniModeParticipant = (
  subscriberWrappers: SubscriberWrapper[],
  activeSpeakerId: string | undefined,
  publisher: PublisherSnapshot
): MiniModeParticipant => {
  const cameraSubscribers = subscriberWrappers.filter((wrapper) => !wrapper.isScreenshare);
  const activeSpeaker =
    cameraSubscribers.find((wrapper) => wrapper.id === activeSpeakerId) ?? cameraSubscribers[0];

  if (activeSpeaker) {
    return {
      element: activeSpeaker.element,
      name: activeSpeaker.subscriber.stream?.name ?? '',
      initials: activeSpeaker.subscriber.stream?.initials ?? '',
    };
  }

  return {
    element: publisher.element ?? null,
    name: publisher.name,
    initials: publisher.initials,
  };
};

export default resolveMiniModeParticipant;
