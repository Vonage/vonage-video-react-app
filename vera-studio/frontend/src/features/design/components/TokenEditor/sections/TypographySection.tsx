import { typographyTokenMetadata } from '../../../../../helpers';
import useVeraStudio from '../../../../../hooks/useVeraStudio';
import tokenEditor$ from '../tokenEditor$';
import { useMemo } from 'react';

type TypographyValue = {
  fontSize?: string;
  lineHeight?: string;
  fontWeight?: string;
  mobileFontSize?: string;
  mobileLineHeight?: string;
  mobileFontWeight?: string;
};

const toLabel = (value: string): string =>
  value
    .replace(/([A-Z])/g, ' $1')
    .replace(/-/g, ' ')
    .replace(/^./, (character) => character.toUpperCase())
    .trim();

const inputClass =
  'border border-slate-300 rounded-md px-2 py-1 text-sm outline-none focus:border-blue-500';

const TypographySection = () => {
  const [tokens] = useVeraStudio((state) => state.tokens);

  const searchTerm = tokenEditor$.use.select(({ searchTerm }) => searchTerm.trim().toLowerCase());

  const filteredTokens = useMemo(
    () =>
      typographyTokenMetadata.filter((token) => {
        if (!searchTerm) return true;

        const searchableValue = [
          token.tokenKey,
          toLabel(token.tokenKey),
          token.fontSizeDescription,
          token.lineHeightDescription,
          token.fontWeightDescription,
        ]
          .join(' ')
          .toLowerCase();

        return searchableValue.includes(searchTerm);
      }),
    [searchTerm]
  );

  return (
    <section className="grid gap-4">
      {filteredTokens.length === 0 && (
        <div className="text-xs text-slate-500">No typography tokens match this search.</div>
      )}

      {filteredTokens.map((token) => {
        if (!tokens) return null;

        const typographyValue = (tokens[token.configKey] ?? {}) as TypographyValue;

        return (
          <div key={token.tokenKey} className="border border-slate-200 rounded-lg p-2.5 bg-white">
            <div className="font-bold text-sm">{toLabel(token.tokenKey)}</div>
            <div className="text-xs text-slate-600 mt-1">
              {token.fontSizeDescription} | {token.lineHeightDescription}
            </div>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <input
                type="text"
                value={typographyValue.fontSize ?? ''}
                placeholder="Desktop font size"
                onChange={(event) =>
                  useVeraStudio.actions.updateTokens({
                    [token.configKey]: { ...typographyValue, fontSize: event.target.value },
                  })
                }
                className={inputClass}
              />
              <input
                type="text"
                value={typographyValue.lineHeight ?? ''}
                placeholder="Desktop line height"
                onChange={(event) =>
                  useVeraStudio.actions.updateTokens({
                    [token.configKey]: { ...typographyValue, lineHeight: event.target.value },
                  })
                }
                className={inputClass}
              />
              <input
                type="number"
                value={typographyValue.fontWeight ?? ''}
                placeholder="Desktop weight"
                onChange={(event) =>
                  useVeraStudio.actions.updateTokens({
                    [token.configKey]: { ...typographyValue, fontWeight: event.target.value },
                  })
                }
                className={inputClass}
              />
              <input
                type="text"
                value={typographyValue.mobileFontSize ?? ''}
                placeholder="Mobile font size"
                onChange={(event) =>
                  useVeraStudio.actions.updateTokens({
                    [token.configKey]: { ...typographyValue, mobileFontSize: event.target.value },
                  })
                }
                className={inputClass}
              />
              <input
                type="text"
                value={typographyValue.mobileLineHeight ?? ''}
                placeholder="Mobile line height"
                onChange={(event) =>
                  useVeraStudio.actions.updateTokens({
                    [token.configKey]: { ...typographyValue, mobileLineHeight: event.target.value },
                  })
                }
                className={inputClass}
              />
              <input
                type="number"
                value={typographyValue.mobileFontWeight ?? ''}
                placeholder="Mobile weight"
                onChange={(event) =>
                  useVeraStudio.actions.updateTokens({
                    [token.configKey]: { ...typographyValue, mobileFontWeight: event.target.value },
                  })
                }
                className={inputClass}
              />
            </div>
            <div className="text-xs text-slate-500 mt-1.5">{token.fontWeightDescription}</div>
          </div>
        );
      })}
    </section>
  );
};

export default TypographySection;
