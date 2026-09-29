import type { VideoLayerStats } from '@vonage/client-sdk-video';

const readHighestLayerResolution = (
  layers: VideoLayerStats[] | undefined
): { width: number; height: number } | null => {
  const sizes = (layers ?? [])
    .map((layer) => ({ width: layer.width, height: layer.height }))
    .filter((size) => typeof size.width === 'number' && typeof size.height === 'number')
    .filter((size) => size.width > 0 && size.height > 0);

  if (!sizes.length) return null;

  return sizes.reduce(
    (largest, size) => (size.width * size.height > largest.width * largest.height ? size : largest),
    sizes[0]
  );
};

export default readHighestLayerResolution;
