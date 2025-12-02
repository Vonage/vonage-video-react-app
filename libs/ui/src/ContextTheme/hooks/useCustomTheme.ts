import { useContext } from 'react';
import themeContext from '../themeContext';

const useCustomTheme = () => {
  const customTheme = useContext(themeContext);

  if (!customTheme) {
    throw new Error('useCustomTheme must be used within a ThemeProvider');
  }

  return customTheme;
};

export default useCustomTheme;
