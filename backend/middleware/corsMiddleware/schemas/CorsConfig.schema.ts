import { z } from 'zod';

const WILDCARD_PLACEHOLDER = 'wildcard';

const AllowedOriginSchema = z.string().refine(isOriginPattern, {
  message:
    'must be an http(s) origin without a path, like https://app.example.com, with at most one "*" in the first host label',
});

/** `*` on its own allows any origin; otherwise a non-empty list of origins. */
const CorsConfigSchema = z.object({
  corsAllowedOrigins: z.union([z.literal('*'), z.array(AllowedOriginSchema).min(1)]),
});

export type CorsConfig = z.infer<typeof CorsConfigSchema>;

export default CorsConfigSchema;

function isOriginPattern(value: string): boolean {
  const wildcardCount = value.split('*').length - 1;
  const candidate = value.replace('*', WILDCARD_PLACEHOLDER).toLowerCase();

  if (wildcardCount > 1 || !URL.canParse(candidate)) return false;

  const url = new URL(candidate);
  const isHttp = url.protocol === 'https:' || url.protocol === 'http:';
  const isBareOrigin = url.origin === candidate;
  const isWildcardInFirstLabel =
    wildcardCount === 0 || url.hostname.split('.')[0].includes(WILDCARD_PLACEHOLDER);

  return isHttp && isBareOrigin && isWildcardInFirstLabel;
}
