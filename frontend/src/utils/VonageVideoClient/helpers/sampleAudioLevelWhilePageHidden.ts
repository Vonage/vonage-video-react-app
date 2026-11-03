import type { Subscriber } from '@vonage/client-sdk-video';
import tryCatch from '@common/execution/tryCatch';
import isNil from '@common/assertions/isNil';

// Hidden pages get no animation frames, which is what drives the SDK's audioLevelUpdated event.
const HIDDEN_PAGE_SAMPLE_INTERVAL_MS = 500;

type SampleAudioLevelWhilePageHiddenArgs = {
  subscriber: Subscriber;
  onAudioLevel: (audioLevel: number) => void;
};

/**
 * Used to avoid active speaker long delay.
 * Reads the subscriber's incoming audio level from WebRTC stats while the page is hidden,
 * for example while the call is shown in a Picture-in-Picture window.
 * @param {SampleAudioLevelWhilePageHiddenArgs} args - The subscriber and the audio level callback
 * @returns {() => void} Stops sampling
 */
const sampleAudioLevelWhilePageHidden = ({
  subscriber,
  onAudioLevel,
}: SampleAudioLevelWhilePageHiddenArgs): (() => void) => {
  let intervalId: ReturnType<typeof setInterval> | undefined;
  let isStopped = false;

  const sample = async () => {
    const { result: report } = await tryCatch(() => subscriber.getRtcStatsReport());
    const audioLevel = isNil(report) ? null : getInboundAudioLevel(report);
    if (isStopped || isNil(audioLevel)) return;

    onAudioLevel(audioLevel);
  };

  const handleVisibilityChange = () => {
    clearInterval(intervalId);
    intervalId = undefined;
    if (document.visibilityState !== 'hidden') return;

    intervalId = setInterval(() => void sample(), HIDDEN_PAGE_SAMPLE_INTERVAL_MS);
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  handleVisibilityChange();

  return () => {
    isStopped = true;
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    clearInterval(intervalId);
  };
};

function getInboundAudioLevel(report: Map<string, unknown>): number | null {
  const inboundAudioStats = [...report.values()].find(
    (stats): stats is { audioLevel: number } =>
      typeof stats === 'object' &&
      stats !== null &&
      'type' in stats &&
      stats.type === 'inbound-rtp' &&
      'kind' in stats &&
      stats.kind === 'audio' &&
      'audioLevel' in stats &&
      typeof stats.audioLevel === 'number'
  );

  return inboundAudioStats?.audioLevel ?? null;
}

export default sampleAudioLevelWhilePageHidden;
