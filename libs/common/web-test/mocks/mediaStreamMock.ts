import { Prettify } from '@common/types';

export type MediaStream = Prettify<Awaited<ReturnType<MediaDevices['getUserMedia']>>>;

const mediaStreamMock = (): MediaStream => {
  return {
    active: false,
    id: '',
    onaddtrack: null,
    onremovetrack: null,
    addTrack: function (_track: MediaStreamTrack): void {
      throw new Error('MediaStream: addTrack() must be mocked explicitly in your test.');
    },
    clone: function (): globalThis.MediaStream {
      throw new Error('MediaStream: clone() must be mocked explicitly in your test.');
    },
    getAudioTracks: function (): MediaStreamTrack[] {
      throw new Error('MediaStream: getAudioTracks() must be mocked explicitly in your test.');
    },
    getTrackById: function (_trackId: string): MediaStreamTrack | null {
      throw new Error('MediaStream: getTrackById() must be mocked explicitly in your test.');
    },
    getTracks: function (): MediaStreamTrack[] {
      throw new Error('MediaStream: getTracks() must be mocked explicitly in your test.');
    },
    getVideoTracks: function (): MediaStreamTrack[] {
      throw new Error('MediaStream: getVideoTracks() must be mocked explicitly in your test.');
    },
    removeTrack: function (_track: MediaStreamTrack): void {
      throw new Error('MediaStream: removeTrack() must be mocked explicitly in your test.');
    },
    addEventListener: function (): void {
      throw new Error('MediaStream: addEventListener() must be mocked explicitly in your test.');
    },
    removeEventListener: function (): void {
      throw new Error('MediaStream: removeEventListener() must be mocked explicitly in your test.');
    },
    dispatchEvent: function (_event: Event): boolean {
      throw new Error('MediaStream: dispatchEvent() must be mocked explicitly in your test.');
    },
  };
};

export default mediaStreamMock;
