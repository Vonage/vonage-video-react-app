import { colorTokenMetadata } from '../../../../../../helpers';

const toLabel = (value: string): string =>
  value
    .replace(/([A-Z])/g, ' $1')
    .replace(/-/g, ' ')
    .replace(/^./, (character) => character.toUpperCase())
    .trim();

const ColorsTab = () => (
  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-32 md:pb-92">
    {colorTokenMetadata.map((token) => {
      const cssVariableName = `--vera-${token.configKey.replace(/([A-Z])/g, '-$1').toLowerCase()}`;

      return (
        <div
          key={token.tokenKey}
          className="rounded-lg px-2.5 py-2.5"
          style={{
            background: 'var(--vera-surface)',
            border: '1px solid var(--vera-border)',
          }}
        >
          <div
            className="h-12"
            style={{
              background: `var(${cssVariableName})`,
              border: '1px solid var(--vera-border)',
              borderRadius: 'var(--vera-border-radius-extra-small)',
            }}
          />
          <div className="mt-1.5 text-sm font-bold" style={{ color: 'var(--vera-on-surface)' }}>
            {toLabel(token.tokenKey)}
          </div>
          <div className="mt-0.5 text-xs" style={{ color: 'var(--vera-text-tertiary)' }}>
            {cssVariableName}
          </div>
        </div>
      );
    })}
  </div>
);

export default ColorsTab;
