import { Publisher, Subscriber } from '@vonage/client-sdk-video';
import { Box, Element } from 'opentok-layout-js';
import { MaybeElement } from '../../layoutManager';
import { LayoutMode } from '../../../Context/SessionProvider/session';
import { SubscriberWrapper } from '../../../types/session';

const isLayoutElement = (element: Element | MaybeElement): element is Element => {
  return element.width !== undefined && element.height !== undefined;
};

/**
 * Determines if a given ID is active speaker, or if there is no active speaker, if this is the first index.
 * @param {string | undefined} activeSpeakerId - current active speaker id
 * @param {string} id - subscriber ID to be tested
 * @param {number} index - subscriber index
 * @returns {boolean} True if the ID is the current active speaker, false if not
 */
const isActiveSpeaker = (activeSpeakerId: string | undefined, id: string, index: number) => {
  // We display a subscriber as active speaker if it is the matching ID
  // also if there is no current active speaker we display the first subscriber as active speaker
  return activeSpeakerId === id || (activeSpeakerId === undefined && index === 0);
};

/**
 * Gets width and height in object from Subscriber or Publisher object for use in layout Element
 * @param {(Publisher | Subscriber | null)} video - Subscriber or Publisher object
 * @returns {object} dimensions
 */
const getVideoDimensions = (video: Publisher | Subscriber | null) => {
  return {
    width: video?.videoWidth(),
    height: video?.videoHeight(),
  };
};
/**
 * Gets the layout Element for camera Publisher
 * never big, never fixed ratio. Height and width from publisher.
 * @param {(Publisher | null)} publisher - the camera publisher
 * @returns {Element} - publisher layout Element
 */
const getPublisherLayoutElement = (publisher: Publisher | null) => ({
  ...getVideoDimensions(publisher),
  big: false,
  fixedRatio: false,
});

/**
 * Determines if we should display as subscriber as big or not
 *  We display subscriber as large if it is screenshare or active speaker given that layout mode is active speaker and
 * screenshare is not being displayed
 * @param {SubscriberWrapper} subWrapper - Subscriber that we are checking
 * @param {boolean} hasPinnedSubscribers - whether there are currently pinned subscribers
 * @param {boolean} sessionHasScreenshare - whether there is currently a screenshare in the session
 * @param {LayoutMode} layoutMode - current layout mode
 * @param {(string | undefined)} activeSpeakerId - current active speaker id
 * @param {number} index - subscriber index, in active speaker mode we will make first subscriber big if no current active speaker or screenshare
 * @returns {boolean} True if we should display as big, false if not
 */
const shouldDisplayBig = (
  subWrapper: SubscriberWrapper,
  hasPinnedSubscribers: boolean,
  sessionHasScreenshare: boolean,
  layoutMode: LayoutMode,
  activeSpeakerId: string | undefined,
  index: number
) => {
  // We display subscriber as large if it is screenshare or active speaker given that layout mode is active speaker and
  // screenshare is not being displayed
  if (subWrapper.isScreenshare) {
    return true;
  }
  if (!sessionHasScreenshare) {
    if (subWrapper.isPinned) {
      return true;
    }

    if (
      layoutMode === 'active-speaker' &&
      hasPinnedSubscribers === false &&
      isActiveSpeaker(activeSpeakerId, subWrapper.id, index)
    ) {
      return true;
    }
  }
  return false;
};

/**
 * Gets the array of subscriber layout Elements:
 * - height and width from subscriber
 * - isBig for screenshare or active speaker
 * - fixedRatio only for screenshare
 * @param {boolean} hasPinnedSubscribers - whether there are currently pinned subscribers
 * @param {SubscriberWrapper[]} subscribersInDisplayOrder - subscriber array in order to be displayed
 * @param {boolean} sessionHasScreenshare - boolean indicating if a screenshare is present in the session, used to determine whether to make the active speaker big or not
 * @param {LayoutMode} layoutMode - layout mode, to determine whether to make active speaker big or not
 * @param {(string | undefined)} activeSpeakerId - current active speaker id
 * @returns {Element[]} elements - array of subscriber Elements in order of display
 */
const getSubscriberLayoutElements = (
  hasPinnedSubscribers: boolean,
  subscribersInDisplayOrder: SubscriberWrapper[],
  sessionHasScreenshare: boolean,
  layoutMode: LayoutMode,
  activeSpeakerId: string | undefined
) => {
  return subscribersInDisplayOrder.map((subWrapper, index) => {
    return {
      ...getVideoDimensions(subWrapper.subscriber),
      big: shouldDisplayBig(
        subWrapper,
        hasPinnedSubscribers,
        sessionHasScreenshare,
        layoutMode,
        activeSpeakerId,
        index
      ),
      fixedRatio: subWrapper.isScreenshare,
    };
  });
};

/**
 * Gets the Element for screenshare publisher - always big, height and width provider by publisher. Fixed ratio true for screenshare to avoid cutting off parts
 * of screen
 * @param {Publisher | null} screensharingPublisher - the Publisher object
 * @returns {Element} element - the Element object
 */
const getScreenShareLayoutElement = (screensharingPublisher: Publisher | null) => {
  return {
    width: screensharingPublisher?.videoWidth(),
    height: screensharingPublisher?.videoHeight(),
    big: true,
    fixedRatio: true,
  };
};

/**
 * Layout properties for the hidden participants tile. Width and height are to ensure correct aspect ratio.
 */
const hiddenParticipantTileLayoutElement = {
  width: 1280,
  height: 720,
  big: false,
  fixedRatio: false,
};

export type GetLayoutElementArrayProps = {
  activeSpeakerId: string | undefined;
  hasPinnedSubscribers: boolean;
  hiddenSubscribers: SubscriberWrapper[];
  isSharingScreen: boolean;
  layoutMode: LayoutMode;
  publisher: Publisher | null;
  screensharingPublisher: Publisher | null;
  sessionHasScreenshare: boolean;
  subscribersInDisplayOrder: SubscriberWrapper[];
};

/**
 * Util to create an array of Layout elements for the layout manager library:
 * @param {GetLayoutElementArrayProps} props - combination of call state and video elements needed to determine layout positions
 * @returns {Element[]} elements - an array or Element objects
 */
const getLayoutElementArray = ({
  activeSpeakerId,
  hasPinnedSubscribers,
  hiddenSubscribers,
  isSharingScreen,
  layoutMode,
  publisher,
  screensharingPublisher,
  sessionHasScreenshare,
  subscribersInDisplayOrder,
}: GetLayoutElementArrayProps): Element[] => {
  // Order of elements here must match the order in which we destruct the boxes later:
  // Publisher first, then subscribers, then local screenshare if present, then hidden participants tile if present
  const elements: MaybeElement[] = [
    getPublisherLayoutElement(publisher),
    ...getSubscriberLayoutElements(
      hasPinnedSubscribers,
      subscribersInDisplayOrder,
      sessionHasScreenshare,
      layoutMode,
      activeSpeakerId
    ),
  ];

  if (isSharingScreen) {
    elements.push(getScreenShareLayoutElement(screensharingPublisher));
  }
  if (hiddenSubscribers.length) {
    elements.push(hiddenParticipantTileLayoutElement);
  }
  return elements.filter((element): element is Element => isLayoutElement(element));
};

export type LayoutBoxes = {
  publisherBox?: Box;
  hiddenParticipantsBox?: Box;
  localScreenshareBox?: Box;
  subscriberBoxes?: Box[];
};

export default getLayoutElementArray;
