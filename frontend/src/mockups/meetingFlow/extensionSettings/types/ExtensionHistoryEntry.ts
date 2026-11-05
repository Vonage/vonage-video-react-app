export type ExtensionHistoryEntry = {
  minutes: number;
  extendedBy: { kind: 'self' } | { kind: 'participant'; name: string };
  extendedAt: Date;
};
