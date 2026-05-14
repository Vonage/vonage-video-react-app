/**
 * Raised-hand glyph. Kept as a standalone constant — NOT a member of
 * `emojiMap` — because `EmojiGrid` renders every `emojiMap` value as a
 * selectable flying reaction, and raise-hand is a dedicated persistent
 * feature, not a transient reaction. Shared by the raise-hand button,
 * badge, and queue so the glyph is defined in exactly one place.
 */
export const RAISED_HAND_EMOJI = '✋';

const emojiMap = {
  THUMBS_UP: '👍',
  THUMBS_DOWN: '👎',
  WAVE: '👋',
  CLAP: '👏',
  ROCKET: '🚀',
  CELEBRATION: '🎉',
  PRAY: '🙏',
  FLEX: '💪',
  HEART: '❤️',
  CRY: '😭',
  ASTONISHED: '😮',
  JOY: '😂',
};

export default emojiMap;
