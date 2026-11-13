import serverSettingsStore from './serverSettingsStore';
import ServerSettingsSynchronizer from './ServerSettingsSynchronizer';

const StoreProvider = serverSettingsStore.Provider;
type ServerSettingsProviderProps = Parameters<typeof StoreProvider>[0] & {
  sessionKey: string | null;
};

const ServerSettingsProvider = ({
  children,
  sessionKey,
  ...props
}: ServerSettingsProviderProps) => (
  <StoreProvider {...props}>
    <ServerSettingsSynchronizer sessionKey={sessionKey}>{children}</ServerSettingsSynchronizer>
  </StoreProvider>
);

const makeProviderWrapper = ({
  sessionKey,
  ...options
}: NonNullable<Parameters<typeof StoreProvider.makeProviderWrapper>[0]> & {
  sessionKey: string | null;
}) => {
  const { wrapper: Wrapper, ...rest } = StoreProvider.makeProviderWrapper(options);

  return {
    ...rest,
    wrapper: ({ children, ...props }: Parameters<typeof Wrapper>[0]) => (
      <Wrapper {...props}>
        <ServerSettingsSynchronizer sessionKey={sessionKey}>{children}</ServerSettingsSynchronizer>
      </Wrapper>
    ),
  };
};

export default Object.assign(ServerSettingsProvider, { ...StoreProvider, makeProviderWrapper });
