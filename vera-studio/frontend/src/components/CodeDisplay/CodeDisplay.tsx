import { useState, type PropsWithChildren } from 'react';
import classNames from 'classnames';
import { motion } from 'motion/react';
import VividIcon from '@ui/VividIcon';
import { Prism } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

type CodeDisplayProps = PropsWithChildren<{
  code: string;
  language?: string;
  className?: string;
}>;

export const CodeDisplay = ({ code, language = 'typescript', className }: CodeDisplayProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);

    setIsCopied(true);

    window.setTimeout(() => {
      setIsCopied(false);
    }, 1200);
  };

  return (
    <div className={classNames('rounded-lg border border-slate-300 relative', className)}>
      <motion.button
        type="button"
        onClick={() => {
          void copyCode();
        }}
        className="absolute top-2 right-2 z-10 inline-flex items-center justify-center rounded-md border border-slate-300 bg-white p-1.5 text-slate-700 hover:bg-slate-50 cursor-pointer"
        title={isCopied ? 'Copied' : 'Copy'}
        aria-label="Copy code snippet"
        animate={{ scale: isCopied ? 1.1 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <VividIcon name={isCopied ? 'check-line' : 'copy-2-line'} />
      </motion.button>

      <Prism
        language={language}
        style={oneLight}
        customStyle={{
          margin: 0,
          padding: '1.3rem 0.875rem 0.875rem',
          fontSize: '0.75rem',
          lineHeight: 1.5,
          borderRadius: 0,
        }}
        wrapLongLines
      >
        {code}
      </Prism>
    </div>
  );
};

export default CodeDisplay;
