import { ReactElement } from 'react';
import Emoji from '../Emoji/Emoji';
import useSessionContext from '../../../hooks/useSessionContext';

/**
 * EmojisOrigin Component
 *
 * Displays the emojis sent from any users in the meeting. All emojis will be initially rendered from this point.
 * @returns {ReactElement} - The EmojisOrigin Component.
 */
const EmojisOrigin = (): ReactElement => {
  const { emojiQueue } = useSessionContext();

  return (
    <>
      {emojiQueue.map((emojiWrapper) => {
        return <Emoji key={emojiWrapper.time} emojiWrapper={emojiWrapper} />;
      })}
    </>
  );
};

export default EmojisOrigin;
