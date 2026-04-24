import classNames from 'classnames';
import type { ComponentProps, FC } from 'react';
import { useLocation } from 'react-router';
import { useVeraStudio } from '../hooks';
import { twMerge } from 'tailwind-merge';

type StudioHeaderProps = ComponentProps<'div'> & {};

const StudioHeader: FC<StudioHeaderProps> = ({ className, ...props }) => {
  const { pathname } = useLocation();
  const [isLoading] = useVeraStudio((state) => state.isLoading);
  const isDesignRoute = pathname.startsWith('/design');
  const [isSaving] = useVeraStudio((state) => state.isSaving);

  const onSaveClick = () => {
    const shouldSave = window.confirm('Save current token changes?');

    if (!shouldSave) return;

    void useVeraStudio.actions.saveTokens();
  };

  const shouldShowSaveButton = isDesignRoute && !isLoading;

  return (
    <header
      className={twMerge(
        classNames(
          'StudioHeader border-b border-slate-200 flex justify-between items-center px-4 h-14 bg-white',
          className
        )
      )}
      {...props}
    >
      <div>
        <h1 className="m-0 text-base font-semibold">Vera Studio</h1>
        <div className="text-xs text-slate-500">Getting started with your new video app</div>
      </div>

      {shouldShowSaveButton && (
        <button
          onClick={onSaveClick}
          disabled={isSaving}
          className={classNames(
            'border border-slate-300 bg-blue-50 rounded-lg px-3 py-2 font-bold',
            isSaving ? 'cursor-not-allowed' : 'cursor-pointer'
          )}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      )}
    </header>
  );
};

export default StudioHeader;
