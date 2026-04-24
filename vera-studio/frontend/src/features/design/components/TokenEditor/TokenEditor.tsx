import {
  ColorsSection,
  TypographySection,
  BorderRadiusSection,
  FontFamilySection,
} from './sections';
import tokenEditor$ from './tokenEditor$';

const InnerTokenEditor = () => {
  const { setSearchTerm } = tokenEditor$.use.actions();
  const searchTerm = tokenEditor$.use.select(({ searchTerm }) => searchTerm);

  return (
    <>
      <div className="px-3 pt-3">
        <div className="sticky top-0 z-10 bg-slate-50 pb-0.5">
          <input
            type="text"
            value={searchTerm}
            placeholder="Search tokens by name or description"
            onChange={(event) => {
              setSearchTerm(event.target.value);
            }}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 overflow-auto h-full pb-32 md:pb-92">
        <details className="px-3" open>
          <summary className="cursor-pointer font-bold mb-2">Colors</summary>
          <ColorsSection />
        </details>

        <details className="px-3" {...(searchTerm ? { open: true } : {})}>
          <summary className="cursor-pointer font-bold mb-2">Typography</summary>
          <TypographySection />
        </details>

        <details className="px-3" {...(searchTerm ? { open: true } : {})}>
          <summary className="cursor-pointer font-bold mb-2">Border Radius</summary>
          <BorderRadiusSection />
        </details>

        <details className="px-3 pb-3" {...(searchTerm ? { open: true } : {})}>
          <summary className="cursor-pointer font-bold mb-2">Font Family</summary>
          <FontFamilySection />
        </details>
      </div>
    </>
  );
};

const TokenEditor = () => {
  return (
    <tokenEditor$.Provider>
      <InnerTokenEditor />
    </tokenEditor$.Provider>
  );
};

export default TokenEditor;
