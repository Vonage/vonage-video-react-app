import { Router } from 'express';
import makeSignInHandler from './handlers/signInHandler';
import makeCallbackHandler from './handlers/callbackHandler';
import { SIGN_IN_PATH } from './constants';

const authRouter = Router();

authRouter.get(SIGN_IN_PATH, makeSignInHandler());
authRouter.get('/api/auth/callback/okta', makeCallbackHandler());

export default authRouter;
