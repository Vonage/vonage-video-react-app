(() => {
  const originalConsoleLog = console.log;
  const bannedMessages = new Set(['getLayout apply']);

  console.log = (...args: string[]) => {
    if (bannedMessages.has(args[0])) return;

    originalConsoleLog(...args);
  };
})();
