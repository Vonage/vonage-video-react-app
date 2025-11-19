import { useContext } from 'react';
import themeContext from '../themeContext';

const useCustomTheme = () => {
  const customTheme = useContext(themeContext);

  if (!customTheme) {
    throw new Error('useCustomTheme must be used within a CustomThemeProvider');
  }

  return customTheme;
};

export default useCustomTheme;
