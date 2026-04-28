import { PreviewButton } from '../../components';

const ButtonsTab = () => (
  <div className="grid gap-4">
    <div className="flex gap-4 flex-wrap">
      <PreviewButton style={{ background: 'var(--vera-primary)', color: 'var(--vera-on-primary)' }}>
        Primary
      </PreviewButton>
      <PreviewButton
        style={{ background: 'var(--vera-secondary)', color: 'var(--vera-on-secondary)' }}
      >
        Secondary
      </PreviewButton>
      <PreviewButton style={{ background: 'var(--vera-error)', color: 'var(--vera-on-error)' }}>
        Danger
      </PreviewButton>
      <PreviewButton
        className="border"
        style={{
          background: 'transparent',
          borderColor: 'var(--vera-border)',
          color: 'var(--vera-on-surface)',
        }}
      >
        Outline
      </PreviewButton>
    </div>

    <div className="flex gap-4 flex-wrap">
      <PreviewButton
        disabled
        style={{ background: 'var(--vera-disabled)', color: 'var(--vera-text-disabled)' }}
      >
        Disabled
      </PreviewButton>
      <PreviewButton
        style={{ background: 'var(--vera-information)', color: 'var(--vera-on-information)' }}
      >
        Information
      </PreviewButton>
      <PreviewButton style={{ background: 'var(--vera-warning)', color: 'var(--vera-on-warning)' }}>
        Warning
      </PreviewButton>
      <PreviewButton style={{ background: 'var(--vera-success)', color: 'var(--vera-on-success)' }}>
        Success
      </PreviewButton>
    </div>
  </div>
);

export default ButtonsTab;
