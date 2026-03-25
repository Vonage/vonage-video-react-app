/**
 * Whether the browser supports the Web Audio API features required for Spatial Audio.
 *
 * Checks for:
 * - `AudioContext` — the core Web Audio API interface
 * - `createStereoPanner` — required to create the `StereoPannerNode` used for panning
 *
 * Supported in Chrome 41+, Firefox 37+, Safari 14.1+, Edge 12+.
 * Not supported in Internet Explorer.
 *
 * @returns {boolean} `true` if the browser supports the Web Audio API with StereoPannerNode.
 */
const hasWebAudioSupport = (): boolean =>
  typeof AudioContext !== 'undefined' &&
  typeof AudioContext.prototype.createStereoPanner === 'function';

export default hasWebAudioSupport;
