import { borderTokenMetadata } from '../../../../../helpers';
import useVeraStudio from '../../../../../hooks/useVeraStudio';
import tokenEditor$ from '../tokenEditor$';

const toLabel = (value: string): string =>
  value
    .replace(/([A-Z])/g, ' $1')
    .replace(/-/g, ' ')
    .replace(/^./, (character) => character.toUpperCase())
    .trim();

const toPixelNumber = (value: string | undefined): number => {
  if (!value) return 0;
  const sanitizedValue = value.replace('px', '').trim();
  const parsedValue = Number(sanitizedValue);
  if (Number.isNaN(parsedValue)) return 0;
  return parsedValue;
};

const BorderRadiusSection = () => {
  const [tokens] = useVeraStudio((state) => state.tokens);
  const searchTerm = tokenEditor$.use.select(({ searchTerm }) => searchTerm);
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredTokens = borderTokenMetadata.filter((token) => {
    if (!normalizedSearchTerm) return true;
    const searchableValue =
      `${token.tokenKey} ${toLabel(token.tokenKey)} ${token.description}`.toLowerCase();
    return searchableValue.includes(normalizedSearchTerm);
  });

  return (
    <section className="grid gap-4">
      {filteredTokens.length === 0 && (
        <div className="text-xs text-slate-500">No border radius tokens match this search.</div>
      )}

      {filteredTokens.map((token) => {
        if (!tokens) return null;

        const value = (tokens[token.configKey] as string | undefined) ?? '0px';
        const pixelValue = toPixelNumber(value);

        return (
          <div
            key={token.tokenKey}
            className="border border-slate-200 rounded-lg px-2.5 py-2.5 bg-white"
          >
            <div className="font-bold text-sm">{toLabel(token.tokenKey)}</div>
            <div className="text-xs text-slate-600 mt-1">{token.description}</div>
            <div className="flex gap-4 mt-2 items-center">
              <input
                type="range"
                min={0}
                max={40}
                value={pixelValue}
                onChange={(event) =>
                  useVeraStudio.actions.updateTokens({
                    [token.configKey]: `${event.target.value}px`,
                  })
                }
              />
              <input
                type="text"
                value={value}
                onChange={(event) =>
                  useVeraStudio.actions.updateTokens({
                    [token.configKey]: event.target.value,
                  })
                }
                className="border border-slate-300 rounded-md px-2 py-1 w-24 text-sm outline-none focus:border-blue-500"
              />
              <div
                className="w-9 h-8 bg-blue-50 border border-slate-300"
                style={{ borderRadius: value }}
              />
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default BorderRadiusSection;
