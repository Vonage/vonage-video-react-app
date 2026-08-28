import type { VideoLayerStats } from '@vonage/client-sdk-video';

const readHighestLayerFrameRate = (layers: VideoLayerStats[] | undefined): number | null => {
  const frameRates = (layers ?? [])
    .map((layer) => layer.encodedFrameRate)
    .filter((frameRate): frameRate is number => typeof frameRate === 'number');

  return frameRates.length ? Math.max(...frameRates) : null;
};

export default readHighestLayerFrameRate;
