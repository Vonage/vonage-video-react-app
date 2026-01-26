import { useContext } from 'react';
import themeContext from '../../themeContext';

const useTheme = () => {
  const customTheme = useContext(themeContext);

  if (!customTheme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return customTheme;
};

export default useTheme;
