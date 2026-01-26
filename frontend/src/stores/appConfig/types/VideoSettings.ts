type VideoSettings = {
  allowBackgroundEffects: boolean;
  allowCameraControl: boolean;
  allowVideoOnJoin: boolean;
  defaultResolution:
    | '1920x1080'
    | '1280x960'
    | '1280x720'
    | '640x480'
    | '640x360'
    | '320x240'
    | '320x180';
};

export default VideoSettings;
