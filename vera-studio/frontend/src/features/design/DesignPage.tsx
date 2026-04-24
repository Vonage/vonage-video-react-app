import type { FC } from 'react';
import { TokenEditor, PreviewPanel } from './components';

type DesignProps = Record<string, never>;

const Design: FC<DesignProps> = () => {
  return (
    <>
      <div className="min-h-0 col-span-2 flex flex-col gap-4">
        <TokenEditor />
      </div>

      <PreviewPanel />
    </>
  );
};

export default Design;
