const LayoutTab = () => (
  <div
    className="overflow-hidden"
    style={{
      border: '1px solid var(--vera-border)',
      borderRadius: 'var(--vera-border-radius-medium)',
      background: 'var(--vera-background)',
    }}
  >
    <header
      className="h-14 flex items-center justify-between px-4"
      style={{
        background: 'var(--vera-primary)',
        color: 'var(--vera-on-primary)',
        fontFamily: 'var(--vera-font-family-plain)',
      }}
    >
      <div className="font-bold">Studio Header</div>
      <div className="text-sm opacity-90">Live token preview</div>
    </header>

    <div className="p-4 grid gap-4">
      <div
        style={{
          fontSize: 'var(--vera-typography-heading-3-font-size)',
          lineHeight: 'var(--vera-typography-heading-3-line-height)',
          fontWeight: 'var(--vera-typography-heading-3-font-weight)',
          color: 'var(--vera-on-background)',
        }}
      >
        Sample Dashboard
      </div>

      <div
        className="px-3 py-3"
        style={{
          background: 'var(--vera-surface)',
          color: 'var(--vera-on-surface)',
          border: '1px solid var(--vera-border)',
          borderRadius: 'var(--vera-border-radius-large)',
        }}
      >
        <div
          style={{
            fontSize: 'var(--vera-typography-body-base-semibold-font-size)',
            lineHeight: 'var(--vera-typography-body-base-semibold-line-height)',
            fontWeight: 'var(--vera-typography-body-base-semibold-font-weight)',
          }}
        >
          Simple Card Title
        </div>
        <div
          className="mt-1"
          style={{
            fontSize: 'var(--vera-typography-body-base-font-size)',
            lineHeight: 'var(--vera-typography-body-base-line-height)',
          }}
        >
          This preview card reflects current color, typography, and border-radius values.
        </div>
      </div>

      <div
        className="px-2.5 py-2.5"
        style={{
          background: 'var(--vera-alert-background)',
          color: 'var(--vera-alert-text)',
          borderRadius: 'var(--vera-border-radius-small)',
          border: '1px solid var(--vera-border)',
        }}
      >
        Alert background + text sample.
      </div>
    </div>
  </div>
);

export default LayoutTab;
