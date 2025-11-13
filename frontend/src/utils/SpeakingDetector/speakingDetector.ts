import { EventEmitter } from 'events';

export type SpeakingDetectorOptions = {
  selectedMicrophoneId: string | undefined;
};

const AUTO_HIDE_MUTE_INDICATION_POPUP_DELAY = 3 * 1000;
const INDICATION_INTERVAL_TIME = 10000;

/**
 * SpeakingDetector class - keeps track of whether a user tries to speak while muted and emits events 'isSpeakingWhileMuted' and 'isSpeakingWhileMutedOff'. It leverages an
 * audio context
 * See for reference:
 *  - https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
 *  - https://developer.vonage.com/en/blog/how-to-create-a-loudness-detector-using-vonage-video-api
 * @class SpeakingDetector
 * @augments {EventEmitter}
 */
class SpeakingDetector extends EventEmitter {
  selectedMicrophoneId: string | undefined;
  audioContext: AudioContext | null = null;
  stream: MediaStream | null = null;
  source: MediaStreamAudioSourceNode | null = null;
  analyser: AnalyserNode | null = null;
  indicationShownRecently: boolean = false;
  detectSpeakingTimer: number | undefined = undefined;
  turnMuteIndicationOffTimer: number | undefined = undefined;
  isSpeakingWhileMuted: boolean = false;

  constructor({ selectedMicrophoneId }: SpeakingDetectorOptions) {
    super();
    this.selectedMicrophoneId = selectedMicrophoneId;
  }

  /**
   * Turns off the mute indication
   */
  turnMuteIndicationOff = () => {
    if (this.turnMuteIndicationOffTimer !== undefined) {
      clearTimeout(this.turnMuteIndicationOffTimer);
      this.turnMuteIndicationOffTimer = undefined;
    }
    this.isSpeakingWhileMuted = false;
    this.emit('isSpeakingWhileMutedOff');
  };

  /**
   * Turns off the speaking detector and cleans up resources
   */
  turnSpeakingDetectorOff = () => {
    if (this.analyser) {
      this.analyser.disconnect();
    }
    if (this.source) {
      this.source.disconnect();
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
    if (this.audioContext) {
      void this.audioContext.close();
    }
    if (this.detectSpeakingTimer !== undefined) {
      clearTimeout(this.detectSpeakingTimer); // Clear the detectSpeakingTimer
      this.detectSpeakingTimer = undefined;
    }
    this.analyser = null;
    this.source = null;
    this.stream = null;
    this.audioContext = null;
    this.indicationShownRecently = false;
    this.turnMuteIndicationOff();
  };

  /**
   * Turns on the speaking detector by setting up audio context and analyser
   */
  turnSpeakingDetectorOn = async () => {
    try {
      if (!this.selectedMicrophoneId) {
        return;
      }
      this.audioContext = new AudioContext();
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: this.selectedMicrophoneId,
        },
      });

      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();

      this.source.connect(this.analyser);

      this.analyser.fftSize = 2048;
      const bufferLength = this.analyser.fftSize;
      const timeDomainData = new Uint8Array(bufferLength);

      const detectSpeaking = () => {
        if (!this.analyser) {
          return;
        }
        if (document.visibilityState === 'visible') {
          this.analyser.getByteTimeDomainData(timeDomainData);

          let max = 0;
          for (let index = timeDomainData.length - 1; index >= 0; index -= 1) {
            max = Math.max(max, Math.abs(timeDomainData[index] - 128));
          }
          const loudness = max / 128;
          if (loudness > 0.2 && !this.indicationShownRecently) {
            // If the calculated loudness exceeds a threshold (0.2 in this case) and no indication has been shown recently
            //  it indicates that the user might be speaking.
            if (!this.isSpeakingWhileMuted && this.turnMuteIndicationOffTimer === undefined) {
              this.isSpeakingWhileMuted = true;
              this.emit('isSpeakingWhileMuted');
              // we turn off the notification after the auto hide period
              this.turnMuteIndicationOffTimer = window.setTimeout(() => {
                this.turnMuteIndicationOff();
                this.indicationShownRecently = true;
                setTimeout(() => {
                  this.indicationShownRecently = false;
                }, INDICATION_INTERVAL_TIME);
              }, AUTO_HIDE_MUTE_INDICATION_POPUP_DELAY);
            }
          }
        }

        this.detectSpeakingTimer = window.setTimeout(detectSpeaking, 200);
      };

      detectSpeaking();
    } catch (e) {
      throw new Error(`error starting speaking detector : ${e}`);
    }
  };

  cleanup = () => {
    this.turnSpeakingDetectorOff();
  };
}

export default SpeakingDetector;
