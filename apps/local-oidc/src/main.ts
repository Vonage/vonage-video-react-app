import { randomBytes } from 'node:crypto';
import express from 'express';

/**
 * Dev/CI-only OIDC provider: the endpoints the backend calls, approving every request for one
 * fixed user. No login form, no validation beyond what the flow needs. Never deploy it.
 */
const port = Number(process.env.LOCAL_OIDC_PORT ?? 3346);
const accessTokenLifetimeSeconds = Number(process.env.LOCAL_OIDC_ACCESS_TOKEN_TTL_SECONDS ?? 3600);
const subject = 'local-user';

type TokenGrant = { clientId: string; scope: string; expiresAt: number };

const authorizationCodes = new Map<string, Omit<TokenGrant, 'expiresAt'>>();
const accessTokens = new Map<string, TokenGrant>();
const refreshTokens = new Map<string, Omit<TokenGrant, 'expiresAt'>>();

const generateToken = () => randomBytes(24).toString('base64url');

function issueTokens(grant: Omit<TokenGrant, 'expiresAt'>) {
  const accessToken = generateToken();
  accessTokens.set(accessToken, {
    ...grant,
    expiresAt: Date.now() + accessTokenLifetimeSeconds * 1000,
  });

  const refreshToken = grant.scope.includes('offline_access') ? generateToken() : undefined;
  if (refreshToken) refreshTokens.set(refreshToken, grant);

  return {
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: accessTokenLifetimeSeconds,
    scope: grant.scope,
    id_token: generateToken(),
    ...(refreshToken ? { refresh_token: refreshToken } : {}),
  };
}

const app = express();
app.use(express.urlencoded({ extended: false }));

app.get('/authorize', (req, res) => {
  const query = req.query as Record<string, string>;

  const code = generateToken();
  authorizationCodes.set(code, { clientId: query.client_id, scope: query.scope ?? 'openid' });

  const callbackUrl = new URL(query.redirect_uri);
  callbackUrl.searchParams.set('code', code);
  callbackUrl.searchParams.set('state', query.state);

  res.redirect(callbackUrl.toString());
});

app.post('/token', (req, res) => {
  const {
    grant_type: grantType,
    code,
    refresh_token: refreshToken,
  } = req.body as Record<string, string>;

  const usedToken = grantType === 'refresh_token' ? refreshToken : code;
  const grants = grantType === 'refresh_token' ? refreshTokens : authorizationCodes;
  const grant = grants.get(usedToken);
  grants.delete(usedToken);

  if (!grant) {
    res.status(400).json({ error: 'invalid_grant' });
    return;
  }

  res.json(issueTokens(grant));
});

app.post('/introspect', (req, res) => {
  const grant = accessTokens.get(String(req.body.token));

  if (!grant || grant.expiresAt <= Date.now()) {
    res.json({ active: false });
    return;
  }

  res.json({
    active: true,
    sub: subject,
    client_id: grant.clientId,
    scope: grant.scope,
    exp: Math.floor(grant.expiresAt / 1000),
  });
});

app.post('/revoke', (req, res) => {
  accessTokens.delete(String(req.body.token));
  refreshTokens.delete(String(req.body.token));
  res.status(200).end();
});

app.get('/logout', (req, res) => {
  const postLogoutRedirectUri = req.query.post_logout_redirect_uri;

  if (typeof postLogoutRedirectUri === 'string') {
    res.redirect(postLogoutRedirectUri);
    return;
  }

  res.send('Signed out');
});

app.listen(port, () => {
  console.log(`local-oidc listening on http://localhost:${port}`);
});
