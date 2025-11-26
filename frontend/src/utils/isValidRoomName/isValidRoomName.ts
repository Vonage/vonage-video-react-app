const isValidRoomName = (name: string) => {
  // Regular expression to allow letters, numbers, underscores, hyphens, and plus sign only
  const regex = /^[a-z0-9_+-]+$/;
  return regex.test(name) && name.length >= 1 && name.length <= 100;
};

export default isValidRoomName;
