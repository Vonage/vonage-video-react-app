import { ReactElement } from 'react';
import Box from '@mui/material/Box';

type SpatialAudioDebugOverlayProps = {
  pan: number;
};

const PAN_THRESHOLD = 0.05;

/**
 * SpatialAudioDebugOverlay Component
 *
 * Renders a small pill badge on a video tile showing the current stereo pan value
 * for the subscriber. Only visible when SPATIAL_AUDIO_DEBUG is true.
 *
 * - Blue  ◀  negative pan (left channel)
 * - Grey  ●  pan near zero (centre)
 * - Amber ▶  positive pan (right channel)
 *
 * @param {SpatialAudioDebugOverlayProps} props
 *  @property {number} pan - Pan value in the range [-1, +1].
 * @returns {ReactElement} The overlay badge.
 */
const SpatialAudioDebugOverlay = ({ pan }: SpatialAudioDebugOverlayProps): ReactElement => {
  const isLeft = pan < -PAN_THRESHOLD;
  const isRight = pan > PAN_THRESHOLD;

  const direction = isLeft ? '◀' : isRight ? '▶' : '●';
  const color = isLeft ? '#60a5fa' : isRight ? '#fb923c' : '#9ca3af';
  const formatted = pan >= 0 ? `+${pan.toFixed(2)}` : pan.toFixed(2);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '0.5rem',
        left: '0.5rem',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        borderRadius: '4px',
        padding: '4px 6px',
        fontFamily: 'monospace',
        fontSize: '0.85rem',
        lineHeight: 1.5,
        zIndex: 10,
        pointerEvents: 'none',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}
    >
      <Box sx={{ color: '#e5e7eb', fontWeight: 'bold', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
        Stereo Panning Debug
      </Box>
      <Box sx={{ color }}>
        {direction} {formatted}
      </Box>
    </Box>
  );
};

export default SpatialAudioDebugOverlay;
