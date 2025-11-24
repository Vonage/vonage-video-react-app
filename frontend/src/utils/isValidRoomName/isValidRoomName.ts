const isValidRoomName = (name: string) => {
  if (name.length < 1 || name.length > 100) {
    return false;
  }
  // Regular expression to allow letters, numbers, underscores, hyphens, and plus sign only
  const regex = /^[a-z0-9_+-]+$/;
  return regex.test(name);
};

export default isValidRoomName;
