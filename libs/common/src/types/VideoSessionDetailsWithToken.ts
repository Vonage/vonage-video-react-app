import { Prettify } from './Prettify';
import VideoSessionDetails from './VideoSessionDetails';

export type VideoSessionDetailsWithToken = Prettify<VideoSessionDetails & { token: string }>;

export default VideoSessionDetailsWithToken;
