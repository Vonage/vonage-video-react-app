import { isMobile } from '@web/platform';
import frontendLogger from '../../../logger';
import isFrontFacingLabel from '../isFrontFacingLabel';
import isRearFacingLabel from '../isRearFacingLabel';

/**
 * On mobile, resolves the actual accessible deviceId for a front or rear camera
 * by requesting getUserMedia with a facingMode constraint, letting the browser
 * pick a working camera rather than relying on a specific deviceId.
 *
 * On non-mobile, or if the label is neither front nor rear, returns the original
 * deviceId unchanged. Falls back to the original deviceId if getUserMedia fails.
 *
 * @param deviceId - The deviceId to resolve
 * @param label - The device label, used to determine facing mode
 * @returns The resolved (working) deviceId, or the original if resolution fails
 */
async function resolveMobileVideoSource(deviceId: string, label?: string | null): Promise<string> {
  frontendLogger.log('resolveMobileVideoSource - entry', {
    isMobile: isMobile(),
    deviceId: deviceId.slice(0, 12),
    label,
  });
  if (!isMobile() || !deviceId) return deviceId;

  let facingMode: 'user' | 'environment' | null = null;
  if (isFrontFacingLabel(label ?? undefined)) facingMode = 'user';
  else if (isRearFacingLabel(label ?? undefined)) facingMode = 'environment';

  if (!facingMode) return deviceId;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { exact: facingMode } },
    });
    const resolvedId = stream.getVideoTracks()[0]?.getSettings().deviceId;
    stream.getTracks().forEach((t) => t.stop());
    frontendLogger.log('resolveMobileVideoSource - resolved deviceId', {
      resolvedId: resolvedId?.slice(0, 12) ?? 'none (fallback)',
    });
    return resolvedId ?? deviceId;
  } catch (err) {
    frontendLogger.log(
      'resolveMobileVideoSource - getUserMedia failed, falling back to original deviceId',
      { err }
    );
    return deviceId;
  }
}

export default resolveMobileVideoSource;
