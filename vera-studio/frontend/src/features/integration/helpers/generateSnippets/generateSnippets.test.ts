import { describe, expect, it } from 'vitest';
import {
  generateBuiltInMiddlewareSnippet,
  generateExpressAppSnippet,
  generateHandlerConfigSnippet,
} from './generateSnippets';

describe('generateSnippets', () => {
  it('generates auth-specific handler config', () => {
    expect(generateHandlerConfigSnippet('jwt')).toContain("authType: 'jwt'");
    expect(generateHandlerConfigSnippet('apiKey')).toContain("authType: 'apiKey'");
    expect(generateHandlerConfigSnippet('signature')).toContain("authType: 'signature'");
  });

  it('wraps handler in express app snippets', () => {
    expect(generateExpressAppSnippet('jwt')).toContain('app.use(');
    expect(generateBuiltInMiddlewareSnippet('jwt')).toContain('.use(authMiddleware)');
  });
});
