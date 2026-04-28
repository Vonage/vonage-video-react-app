import classNames from 'classnames';
import {
  backendIntegrationContent,
  frontendIntegrationContent,
  buildContent,
  flatPaths,
} from '../../constants';
import { useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { useNavBarSelection } from '../../../../hooks';
import { Separator } from '../../../../components';

const { createHandler, expressIntegration, advancedUsage } = backendIntegrationContent.middlePanel;
const { room, client } = frontendIntegrationContent.middlePanel;
const { customizeRoom } = buildContent.middlePanel;

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

const buildExamples = [
  {
    path: flatPaths.buildCustomize,
    label: customizeRoom.title,
    description: customizeRoom.description,
  },
] as const;

export const ExampleSelector = () => {
  const { selectedPath } = useNavBarSelection();
  const navigate = useNavigate();

  const isServerIntegration = selectedPath.startsWith('/integration/server');
  const isBuildSection = selectedPath.startsWith('/integration/build');
  const examples = (() => {
    if (isServerIntegration) return serverExamples;
    if (isBuildSection) return buildExamples;
    return clientExamples;
  })();

  return (
    <div className="flex flex-col gap-4 py-4">
      <label className="text-xs font-semibold text-slate-700">
        {(() => {
          if (isServerIntegration) return backendIntegrationContent.middlePanel.title;
          if (isBuildSection) return buildContent.middlePanel.title;
          return frontendIntegrationContent.middlePanel.title;
        })()}
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
