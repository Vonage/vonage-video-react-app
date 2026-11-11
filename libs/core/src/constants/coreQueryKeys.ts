const coreQueryKeys = {
  serverSettings: (params: { sessionKey: string | null }) => {
    return ['vonage-video', 'serverSettings', params] as const;
  },
  archives: (params: {
    sessionKey: string | undefined;
    count: number | undefined;
    offset: number | undefined;
  }) => {
    return ['vonage-video', 'archives', params] as const;
  },
  publisherStats: (params: {
    publisherId: string | undefined;
    isPublisherStatisticsEnabled: boolean;
  }) => {
    return ['vonage-video', 'publisherStats', params] as const;
  },
  subscriberStats: (params: { subscriberId: string | undefined }) => {
    return ['vonage-video', 'subscriberStats', params] as const;
  },
};

export default coreQueryKeys;
