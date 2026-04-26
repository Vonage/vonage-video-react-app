import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import VividIcon from '@ui/VividIcon';
import useNavBarSelection from '../../hooks/useNavBarSelection';
import { twMerge } from 'tailwind-merge';
import { leftNavBarItems } from '../../features/integration/constants';

const StudioLeftNavigation = () => {
  const { selectedPath } = useNavBarSelection();

  return (
    <nav
      className="hidden md:flex border-r border-slate-200 bg-white h-full items-start justify-center"
      aria-label="Studio sections"
    >
      <div className="mt-3 flex flex-col gap-4">
        {leftNavBarItems.map((sectionLink) => {
          const isSelected = selectedPath.startsWith(sectionLink.path);

          return (
            <NavLink
              key={sectionLink.path}
              to={sectionLink.path}
              title={sectionLink.label}
              aria-label={sectionLink.label}
              className={twMerge(
                classNames(
                  'h-9 w-9 rounded-lg border transition-colors flex items-center justify-center',
                  {
                    'text-blue-700 bg-blue-100 border-blue-300 shadow-[inset_0_0_0_1px_rgba(29,78,216,0.25)]':
                      isSelected,
                    'text-slate-600 bg-white border-slate-200 hover:bg-slate-50': !isSelected,
                  }
                )
              )}
            >
              <VividIcon name={sectionLink.iconName} />
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default StudioLeftNavigation;
