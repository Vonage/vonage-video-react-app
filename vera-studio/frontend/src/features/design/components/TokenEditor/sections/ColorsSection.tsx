import { colorTokenMetadata } from '../../../../../helpers';
import useVeraStudio from '../../../../../hooks/useVeraStudio';
import tokenEditor$ from '../tokenEditor$';

const isSixDigitHexColor = (value: string): boolean => /^#[0-9A-Fa-f]{6}$/.test(value);

const toLabel = (value: string): string =>
  value
    .replace(/([A-Z])/g, ' $1')
    .replace(/-/g, ' ')
    .replace(/^./, (character) => character.toUpperCase())
    .trim();

const ColorsSection = () => {
  const [tokens] = useVeraStudio((state) => state.tokens);
  const [selectedTheme] = useVeraStudio((state) => state.selectedTheme);
  const searchTerm = tokenEditor$.use.select(({ searchTerm }) => searchTerm);
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredTokens = colorTokenMetadata.filter((token) => {
    if (!normalizedSearchTerm) return true;
    const searchableValue =
      `${token.tokenKey} ${toLabel(token.tokenKey)} ${token.description}`.toLowerCase();
    return searchableValue.includes(normalizedSearchTerm);
  });

  return (
    <section>
      <div className="grid md:grid-cols-2 gap-4">
        {filteredTokens.length === 0 && (
          <div className="text-xs text-slate-500">No color tokens match this search.</div>
        )}

        {filteredTokens.map((token) => {
          if (!tokens) return null;

          const colors = (tokens[selectedTheme] ?? {}) as Record<string, string>;
          const colorValue = colors[token.configKey] ?? '#000000';

          return (
            <div
              key={`${selectedTheme}-${token.tokenKey}`}
              className="border border-slate-200 rounded-lg px-2.5 py-2 bg-white"
            >
              <div className="text-sm font-semibold">{toLabel(token.tokenKey)}</div>
              <div className="text-xs text-slate-600 mt-0.5">{token.description}</div>
              <div className="flex gap-4 mt-2 items-center">
                <div
                  className="w-5 h-5 rounded-md border border-slate-300 shrink-0"
                  style={{ background: colorValue }}
                />
                <input
                  type="text"
                  value={colorValue}
                  onChange={(event) => {
                    const nextThemeColors: Record<string, string> = {
                      ...((tokens[selectedTheme] ?? {}) as Record<string, string>),
                      [token.configKey]: event.target.value,
                    };
                    useVeraStudio.actions.updateTokens({
                      [selectedTheme]: nextThemeColors,
                    });
                  }}
                  className="w-40 border border-slate-300 rounded-md px-2 py-1 font-mono text-sm outline-none focus:border-blue-500"
                />
                <input
                  type="color"
                  disabled={!isSixDigitHexColor(colorValue)}
                  value={isSixDigitHexColor(colorValue) ? colorValue : '#000000'}
                  onChange={(event) => {
                    const nextThemeColors: Record<string, string> = {
                      ...((tokens[selectedTheme] ?? {}) as Record<string, string>),
                      [token.configKey]: event.target.value,
                    };
                    useVeraStudio.actions.updateTokens({
                      [selectedTheme]: nextThemeColors,
                    });
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ColorsSection;
