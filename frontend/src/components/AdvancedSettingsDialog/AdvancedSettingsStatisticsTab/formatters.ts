type Resolution = {
  width: number | null;
  height: number | null;
};

export function formatInteger(value: number): string {
  return value.toLocaleString();
}

export function formatOptionalInteger(value: number | null): string {
  if (value === null) {
    return '–';
  }

  return value.toLocaleString();
}

export function formatBytes(value: number): string {
  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  if (value < 1024 * 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function formatResolution(resolution: Resolution | null): string {
  if (!resolution?.width || !resolution?.height) {
    return '–';
  }

  return `${resolution.width}x${resolution.height}`;
}

export function formatFrameRate(frameRate: number | null): string {
  if (!frameRate) {
    return '–';
  }

  return `${Math.round(frameRate)} fps`;
}

export function formatBitrate(bitrateBps: number | null): string {
  if (bitrateBps === null || bitrateBps <= 0) {
    return '–';
  }

  if (bitrateBps < 1000) {
    return `${Math.round(bitrateBps)} bps`;
  }

  if (bitrateBps < 1000 * 1000) {
    return `${(bitrateBps / 1000).toFixed(1)} kbps`;
  }

  return `${(bitrateBps / (1000 * 1000)).toFixed(2)} Mbps`;
}

export function formatPacketLoss(packetLossRatio: number | null): string {
  if (packetLossRatio === null) {
    return '–';
  }

  return `${(packetLossRatio * 100).toFixed(2)}%`;
}

export function formatDuration(milliseconds: number | null): string {
  if (milliseconds === null) {
    return '–';
  }

  if (milliseconds < 1000) {
    return `${milliseconds} ms`;
  }

  return `${(milliseconds / 1000).toFixed(1)} s`;
}
