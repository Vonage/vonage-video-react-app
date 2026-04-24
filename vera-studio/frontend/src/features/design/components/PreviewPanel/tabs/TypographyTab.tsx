import { typographyTokenMetadata } from '../../../../../helpers';

const TypographyTab = () => (
  <div className="grid gap-4">
    {typographyTokenMetadata.map((token) => {
      const tokenName = token.tokenKey;

      return (
        <div
          key={token.tokenKey}
          className="p-4"
          style={{
            border: '1px solid var(--vera-border)',
            borderRadius: 'var(--vera-border-radius-small)',
            background: 'var(--vera-surface)',
          }}
        >
          <div className="text-xs mb-1" style={{ color: 'var(--vera-text-tertiary)' }}>
            {tokenName}
          </div>
          <div
            style={{
              color: 'var(--vera-on-surface)',
              fontFamily: 'var(--vera-font-family-plain)',
              fontSize: `var(--vera-typography-${tokenName}-font-size)`,
              lineHeight: `var(--vera-typography-${tokenName}-line-height)`,
              fontWeight: `var(--vera-typography-${tokenName}-font-weight)`,
            }}
          >
            The quick brown fox jumps over the lazy dog.
          </div>
        </div>
      );
    })}
  </div>
);

export default TypographyTab;
