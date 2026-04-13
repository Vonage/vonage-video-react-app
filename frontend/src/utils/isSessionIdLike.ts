const isSessionIdLike = (roomName: string) => {
  const parts = roomName.split('_');
  const looksLikeBase64 = /^[a-z0-9+/=-]+$/i.test(parts[1]);

  const isSessionId =
    parts.length === 2 && parts[0].length > 0 && parts[1].length > 50 && looksLikeBase64;

  return Boolean(isSessionId);
};

export default isSessionIdLike;
