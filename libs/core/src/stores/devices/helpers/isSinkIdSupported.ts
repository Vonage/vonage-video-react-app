const isSinkIdSupported = () => {
  return 'setSinkId' in HTMLMediaElement.prototype;
};

export default isSinkIdSupported;
