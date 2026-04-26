import classNames from 'classnames';
import type { ComponentProps, FC } from 'react';
import { useLocation } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { useVeraStudio } from '../hooks';
import { twMerge } from 'tailwind-merge';
import { paths } from '../features/integration/constants';
import { Button } from '../components';

type StudioHeaderProps = ComponentProps<'div'> & {};

type LocationState = {
  returnTo?: string;
};

const StudioHeader: FC<StudioHeaderProps> = ({ className, ...props }) => {
  const { pathname, state } = useLocation();
  const navigate = useNavigate();
  const [isLoading] = useVeraStudio((state) => state.isLoading);
  const isDesignRoute = pathname.startsWith('/design');
  const [isSaving] = useVeraStudio((state) => state.isSaving);

  const returnTo = (state as LocationState | null)?.returnTo;

  const onSaveClick = async () => {
    const shouldSave = window.confirm('Save current token changes?');

    if (!shouldSave) return;

    await useVeraStudio.actions.saveTokens();

    if (returnTo) {
      navigate(returnTo);
    }
  };

  const onBuildRoomClick = async () => {
    const shouldSave = window.confirm('Save current token changes and go to Build Room?');

    if (!shouldSave) return;

    await useVeraStudio.actions.saveTokens();

    navigate(paths.integration.build.buildRoom.root);
  };

  const shouldShowSaveButton = isDesignRoute && !isLoading;

  const handleNavigateToIntegration = () => {
    navigate(paths.integration.root);
  };

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
      <button
        type="button"
        onClick={handleNavigateToIntegration}
        className="text-left cursor-pointer"
      >
        <h1 className="m-0 text-base font-semibold">Vera Studio</h1>
        <div className="text-xs text-slate-500">Getting started with your new video app</div>
      </button>

      {shouldShowSaveButton && (
        <div className="flex gap-2">
          <Button onClick={onSaveClick} disabled={isSaving} variant="secondary">
            {isSaving ? 'Saving...' : 'Save'}
          </Button>

          {returnTo && (
            <Button onClick={onBuildRoomClick} disabled={isSaving}>
              Build room
            </Button>
          )}
        </div>
      )}
    </header>
  );
};

export default StudioHeader;
