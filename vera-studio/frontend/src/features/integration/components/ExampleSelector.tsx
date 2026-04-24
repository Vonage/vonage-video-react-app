import classNames from 'classnames';
import { backendIntegrationContent, frontendIntegrationContent, flatPaths } from '../constants';
import { useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { useNavBarSelection } from '../../../hooks';
import { Separator } from '../../../components';

const { createHandler, expressIntegration, advancedUsage } = backendIntegrationContent.middlePanel;
const { room, client } = frontendIntegrationContent.middlePanel;

const serverExamples = [
  {
    path: flatPaths.createHandler,
    label: createHandler.title,
    description: createHandler.description,
  },
  {
    path: flatPaths.expressIntegration,
    label: expressIntegration.title,
    description: expressIntegration.description,
  },
  {
    path: flatPaths.advancedUseCases,
    label: advancedUsage.title,
    description: advancedUsage.description,
  },
] as const;

const clientExamples = [
  {
    path: flatPaths.room,
    label: room.title,
    description: room.description,
  },
  {
    path: flatPaths.client,
    label: client.title,
    description: client.description,
  },
] as const;

export const ExampleSelector = () => {
  const { selectedPath } = useNavBarSelection();
  const navigate = useNavigate();

  const isServerIntegration = selectedPath.startsWith('/integration/server');
  const examples = isServerIntegration ? serverExamples : clientExamples;

  return (
    <div className="flex flex-col gap-4 py-4">
      <label className="text-xs font-semibold text-slate-700">
        {isServerIntegration
          ? backendIntegrationContent.middlePanel.title
          : frontendIntegrationContent.middlePanel.title}
      </label>

      <Separator />

      {examples.map(({ path, label, description }) => {
        const isSelected = selectedPath === path;

        const handleSelectExample = () => {
          navigate(path);
        };

        return (
          <button
            key={path}
            onClick={handleSelectExample}
            className={twMerge(
              classNames(
                'flex flex-col items-start text-left gap-2 p-3 rounded-lg transition-colors cursor-pointer',

                {
                  'bg-blue-50 border border-blue-300': isSelected,
                  'bg-slate-50 border border-slate-200 hover:bg-slate-100': !isSelected,
                }
              )
            )}
          >
            <span className="text-xs font-semibold text-slate-900">{label}</span>
            <span className="text-xs text-slate-600">{description}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ExampleSelector;
