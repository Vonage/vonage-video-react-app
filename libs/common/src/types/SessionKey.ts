export type SessionKey = `${string}.${string}.${string}` & {
  __brand: 'SessionKey';
};

export default SessionKey;
