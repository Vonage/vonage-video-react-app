export type SessionId = `${string}_${string}` & { __brand: 'SessionId' };

export default SessionId;
