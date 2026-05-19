import classNames from 'classnames';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  paths,
  backendIntegrationContent,
  frontendIntegrationContent,
  buildContent,
} from '../features/integration/constants';
import { useNavBarSelection } from '../hooks';
import { twMerge } from 'tailwind-merge';

type IntegrationsMenuProps = Record<string, never>;

const options = [
  {
    label: backendIntegrationContent.title,
    description: backendIntegrationContent.description,
    routePath: paths.integration.backend.root,
  },
  {
    label: frontendIntegrationContent.title,
    description: frontendIntegrationContent.description,
    routePath: paths.integration.frontend.root,
  },
  {
    label: buildContent.title,
    description: buildContent.description,
    routePath: paths.integration.build.root,
  },
];

const IntegrationsMenu: FC<IntegrationsMenuProps> = () => {
  const navigate = useNavigate();
  const { selectedPath } = useNavBarSelection();

  return (
    <>
      {options.map((option) => {
        const isSelected = selectedPath.startsWith(option.routePath);

        return (
          <section
            className={twMerge(
              classNames('bg-white py-2 px-4 cursor-pointer  flex gap-4 items-center', {
                'bg-blue-100': isSelected,
                'bg-slate-50 hover:bg-slate-200': !isSelected,
              })
            )}
            key={option.routePath}
            onClick={() => navigate(option.routePath)}
          >
            <h2 className="text-sm font-semibold ">{option.label}</h2>
          </section>
        );
      })}
    </>
  );
};

export default IntegrationsMenu;
