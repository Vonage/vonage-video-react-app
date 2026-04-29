type WithLoadingIndicatorArgs<Result> = {
  message: string;
  task: () => Promise<Result>;
};

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const FRAME_INTERVAL_MILLISECONDS = 80;

async function withLoadingIndicator<Result>(
  args: WithLoadingIndicatorArgs<Result>
): Promise<Result> {
  const { message, task } = args;

  let frameIndex = 0;

  const intervalId = setInterval(function renderFrame() {
    const frame = SPINNER_FRAMES[frameIndex % SPINNER_FRAMES.length];
    process.stdout.write(`\r${frame} ${message}`);
    frameIndex++;
  }, FRAME_INTERVAL_MILLISECONDS);

  try {
    const result = await task();
    clearInterval(intervalId);
    process.stdout.write(`\r✔ ${message}\n`);
    return result;
  } catch (error) {
    clearInterval(intervalId);
    process.stdout.write(`\r✖ ${message}\n`);
    throw error;
  }
}

export default withLoadingIndicator;
