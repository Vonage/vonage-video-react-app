import { Router } from 'express';
import loadConfig from '../../helpers/config';
import makeSignInHandler from './handlers/signInHandler';
import makeCallbackHandler from './handlers/callbackHandler';
import makeSignOutHandler from './handlers/signOutHandler';
import readCallbackPath from './helpers/readCallbackPath';
import { SIGN_IN_PATH, SIGN_OUT_PATH } from './constants';

const authRouter = Router();
const authConfig = loadConfig();

authRouter.get(SIGN_IN_PATH, makeSignInHandler());
authRouter.get(SIGN_OUT_PATH, makeSignOutHandler());

if (authConfig.authEnabled) {
  authRouter.get(readCallbackPath(authConfig), makeCallbackHandler());
}

export default authRouter;
