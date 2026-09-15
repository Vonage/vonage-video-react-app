import { Router } from 'express';
import makeSignInHandler from './handlers/signInHandler';
import makeCallbackHandler from './handlers/callbackHandler';

const authRouter = Router();

authRouter.get('/auth/signin', makeSignInHandler());
authRouter.get('/api/auth/callback/okta', makeCallbackHandler());

export default authRouter;
