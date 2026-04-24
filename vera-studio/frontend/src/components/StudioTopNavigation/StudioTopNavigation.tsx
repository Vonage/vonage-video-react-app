import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import useNavBarSelection from '../../hooks/useNavBarSelection';
import { leftNavBarItems } from '../../features/integration/constants';

const StudioTopNavigation = () => {
  const { selectedPath } = useNavBarSelection();

  return (
    <nav
      className="md:hidden px-3 py-2 border-b border-slate-200 bg-white flex items-center gap-4 text-sm"
      aria-label="Studio sections"
    >
      {leftNavBarItems.map((sectionLink) => {
        const isSelected = selectedPath === sectionLink.path;

        return (
          <NavLink
            key={sectionLink.path}
            to={sectionLink.path}
            className={classNames('text-sm font-medium transition-colors', {
              'text-blue-700 underline decoration-2 underline-offset-4': isSelected,
              'text-slate-600 hover:text-slate-900': !isSelected,
            })}
          >
            {sectionLink.label}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default StudioTopNavigation;
