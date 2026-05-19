import { fontFamilyDescription } from '../../../../../../helpers';
import useVeraStudio from '../../../../../../hooks/useVeraStudio';
import tokenEditor$ from '../../tokenEditor$';

const FontFamilySection = () => {
  const [tokens] = useVeraStudio((state) => state.tokens);
  const searchTerm = tokenEditor$.use.select(({ searchTerm }) => searchTerm);
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const searchableValue =
    `font family plain primary font family ${fontFamilyDescription}`.toLowerCase();

  if (normalizedSearchTerm && !searchableValue.includes(normalizedSearchTerm)) {
    return <div className="text-xs text-slate-500">No font family tokens match this search.</div>;
  }

  if (!tokens) return null;

  return (
    <section className="border border-slate-200 rounded-lg px-2.5 py-2.5 bg-white">
      <div className="font-bold text-sm">Primary Font Family</div>
      <div className="text-xs text-slate-600 mt-1">{fontFamilyDescription}</div>
      <input
        type="text"
        value={tokens.fontFamilyPlain ?? ''}
        onChange={(event) =>
          useVeraStudio.actions.updateTokens({ fontFamilyPlain: event.target.value })
        }
        className="w-full mt-2 border border-slate-300 rounded-md px-2.5 py-2 text-sm outline-none focus:border-blue-500"
        style={{ fontFamily: tokens.fontFamilyPlain }}
      />
    </section>
  );
};

export default FontFamilySection;
