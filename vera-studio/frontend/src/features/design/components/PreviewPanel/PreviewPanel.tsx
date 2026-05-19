import { useState } from 'react';
import { ButtonsTab, ColorsTab, LayoutTab, TypographyTab } from './tabs';
import { ToggleButton } from '../../../../components';
import useVeraStudio from '../../../../hooks/useVeraStudio';
import useCssVars from '../../../../hooks/useCssVars';

type PreviewTab = 'colors' | 'typography' | 'buttons' | 'layout';
type ThemeMode = 'light' | 'dark';

const PREVIEW_TABS: PreviewTab[] = ['layout', 'buttons', 'typography', 'colors'];
const THEME_MODES: ThemeMode[] = ['light', 'dark'];

const activeTabStyle = {
  borderColor: 'var(--vera-primary)',
  background: 'var(--vera-information-background)',
  color: 'var(--vera-primary)',
};

const inactiveTabStyle = {
  borderColor: 'var(--vera-border)',
  background: 'var(--vera-surface)',
  color: 'var(--vera-on-surface)',
};

const PreviewPanel = () => {
  const [selectedTheme] = useVeraStudio((state) => state.selectedTheme);
  const [activeTab, setActiveTab] = useState<PreviewTab>('layout');
  const cssVariables = useCssVars();

  return (
    <div
      className="border-l border-slate-200 h-full overflow-auto p-3"
      style={{
        ...cssVariables,
        background: 'var(--vera-background)',
        color: 'var(--vera-on-background)',
        fontFamily: 'var(--vera-font-family-plain)',
      }}
    >
      <div className="flex justify-between gap-4 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {PREVIEW_TABS.map((tab) => (
            <ToggleButton
              key={tab}
              isActive={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              style={activeTab === tab ? activeTabStyle : inactiveTabStyle}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </ToggleButton>
          ))}
        </div>

        <div className="flex gap-1.5">
          {THEME_MODES.map((mode) => (
            <ToggleButton
              key={mode}
              isActive={selectedTheme === mode}
              onClick={() => useVeraStudio.actions.setSelectedTheme(mode)}
              style={selectedTheme === mode ? activeTabStyle : inactiveTabStyle}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </ToggleButton>
          ))}
        </div>
      </div>

      <div className="mt-3">
        {activeTab === 'layout' && <LayoutTab />}
        {activeTab === 'buttons' && <ButtonsTab />}
        {activeTab === 'typography' && <TypographyTab />}
        {activeTab === 'colors' && <ColorsTab />}
      </div>
    </div>
  );
};

export default PreviewPanel;
