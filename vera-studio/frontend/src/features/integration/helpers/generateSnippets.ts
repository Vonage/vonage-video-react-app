import type { AuthType } from '../stores/integrationExamples$';

/**
 * Utility: indent multi-line code blocks safely
 */
function indent(code: string, spaces = 2) {
  const pad = ' '.repeat(spaces);

  return code
    .trim()
    .split('\n')
    .map((line) => (line ? pad + line : line))
    .join('\n');
}

export function generateHandlerConfigSnippet(authType: AuthType): string {
  if (authType === 'jwt') {
    return `createVideoHandler({
  auth: {
    authType: 'jwt',
    applicationId: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
    privateKey: \`-----BEGIN PRIVATE KEY----- ... \`,
  },
})`;
  }

  if (authType === 'signature') {
    return `createVideoHandler({
  auth: {
    authType: 'signature',
    apiKey: '12345678',
    signature: {
      secret: 'your-signature-secret-here',
      algorithm: 'sha256',
    },
  },
})`;
  }

  return `createVideoHandler({
  auth: {
    authType: 'apiKey',
    apiKey: '12345678',
    apiSecret: 'your-api-secret-here',
  },
})`;
}

export function generateExpressAppSnippet(authType: AuthType): string {
  const handler = indent(generateHandlerConfigSnippet(authType), 2);

  return `const app = express();

app.use(
  '/video',
${handler}
);`;
}

export function generateExpressAppWithMiddlewareSnippet(authType: AuthType): string {
  const handler = indent(generateHandlerConfigSnippet(authType), 2);

  return `const app = express();

app.use(cors());
app.use(helmet());
app.use(rateLimit());

app.use(
  '/video',

  // You can decorate your handler with express middlewares at will.
  authMiddleware,

${handler}
);`;
}

export function generateBuiltInMiddlewareSnippet(authType: AuthType): string {
  const handler = indent(generateHandlerConfigSnippet(authType), 2);

  return `app.use(
  '/video',

${handler}

  // Built-in handler middleware
  .use(authMiddleware)

  // Action-specific middleware
  .use('sessionCreate', (opts) => {
    const { videoAction, ctx, next } = opts;
    const { user } = ctx;

    assertUserHasPermission(user, videoAction);

    return next();
  })
);`;
}
