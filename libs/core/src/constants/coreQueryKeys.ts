const coreQueryKeys = {
  serverSettings: (params: { sessionKey: string | null }) => {
    return ['vonage-video', 'serverSettings', params] as const;
  },
};

export default coreQueryKeys;
