/**
 * Root dispatcher for publishing dev packages to GitHub Packages.
 *
 * Usage:
 *   yarn publish:package <target>
 *   yarn publish:package <target> <token>   (discouraged, visible in shell history/process list)
 *   GH_TOKEN=... yarn publish:package <target>   (recommended for CI)
 *
 * Flow:
 * - Reads target project name from CLI arguments
 * - Resolves the GitHub token from GH_TOKEN env var, a CLI argument, or an
 *   interactive hidden prompt (input is not echoed to the terminal)
 * - Resolves the target's dev publish script path
 * - Delegates to that script, forwarding the token via an env var (never argv)
 */
import * as path from 'node:path';
import * as child_process from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONOREPO_ROOT = path.resolve(__dirname, '..');

const PUBLISHABLE_TARGETS: Record<string, string> = {
  common: path.join(MONOREPO_ROOT, 'libs/common/scripts/publishPackage.dev.ts'),
};

const KEY_CTRL_C = '\u0003';
const KEY_ENTER = ['\r', '\n'];
const KEY_BACKSPACE = ['\u0008', '\u007f'];

function promptForHiddenInput(promptText: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY) {
      reject(
        new Error(
          'Cannot prompt for a hidden token: stdin is not an interactive terminal. Set the GH_TOKEN env var instead.'
        )
      );
      return;
    }

    process.stdout.write(promptText);

    let input = '';

    const cleanup = () => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.removeListener('data', onData);
    };

    function onData(chunk: Buffer) {
      const character = chunk.toString('utf8');

      if (character === KEY_CTRL_C) {
        cleanup();
        process.stdout.write('\n');
        process.exit(130);
      }

      if (KEY_ENTER.includes(character)) {
        cleanup();
        process.stdout.write('\n');
        resolve(input.trim());
        return;
      }

      if (KEY_BACKSPACE.includes(character)) {
        input = input.slice(0, -1);
        return;
      }

      input += character;
    }

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', onData);
  });
}

async function resolveToken(tokenFromArgs: string | undefined): Promise<string> {
  if (process.env.GH_TOKEN) {
    return process.env.GH_TOKEN;
  }

  if (tokenFromArgs) {
    console.warn(
      'Warning: passing the token as a CLI argument exposes it in shell history and process list.'
    );
    console.warn('Prefer GH_TOKEN env var or omit the argument to be prompted securely.');

    return tokenFromArgs;
  }

  const token = await promptForHiddenInput('GitHub token (input hidden): ');

  if (!token) {
    console.error('No token provided.');
    process.exit(1);
  }

  return token;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('dry');
  const positionalArgs = args.filter((arg) => arg !== 'dry');

  const target = positionalArgs[0];
  const tokenFromArgs = positionalArgs[1];

  if (!target || !PUBLISHABLE_TARGETS[target]) {
    const availableTargets = Object.keys(PUBLISHABLE_TARGETS).join(', ');

    console.error(
      `Invalid or missing target "${target ?? '(none)'}". Available targets: ${availableTargets}`
    );
    console.error('Usage: yarn publish:package <target> [dry]');
    process.exit(1);
  }

  const token = await resolveToken(tokenFromArgs);

  const scriptPath = PUBLISHABLE_TARGETS[target];

  if (isDryRun) {
    console.log('\n[DRY RUN] Validating without publishing...');
  }

  console.log(`\n> npx tsx ${scriptPath}`);

  // Strip NODE_OPTIONS so a globally injected debugger bootloader (e.g. VS Code's
  // js-debug --require hook) doesn't attach to this child process and interfere
  // with its network calls (observed as fetch EPIPE failures).
  // Token is passed via env var, never as a CLI argument, so it doesn't appear
  // in the process list (e.g. `ps aux`) for the child process.
  const childEnv = { ...process.env, GH_TOKEN: token } as NodeJS.ProcessEnv;
  delete childEnv.NODE_OPTIONS;

  if (isDryRun) {
    childEnv.PUBLISH_DRY_RUN = '1';
  }

  child_process.execSync(`npx tsx "${scriptPath}"`, {
    cwd: MONOREPO_ROOT,
    env: childEnv,
    stdio: 'inherit',
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
