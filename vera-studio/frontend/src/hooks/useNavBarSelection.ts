import { useLocation } from 'react-router-dom';
import { type StudioPath } from '../features/integration/constants';

const useNavBarSelection = () => {
  const { pathname } = useLocation();
  const rootPath = pathname.split('/')[1];

  return {
    selectedPath: pathname as StudioPath,
    rootPath: `/${rootPath}` as StudioPath,
  };
};

export default useNavBarSelection;
