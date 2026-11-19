import { env } from '../../../env';

function isCaptionsTabAvailable(): boolean {
  return env.ALLOW_CAPTIONS && env.ALLOW_CAPTION_TRANSLATION;
}

export default isCaptionsTabAvailable;
