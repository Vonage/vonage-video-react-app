/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

test('manual runs publish prerelease artifacts under the selected beta or latest tag', (context) => {
  for (const channel of ['beta', 'latest']) {
    const { result, commands } = runPublisher({ context, channel, isManual: true });
    assert.equal(result.status, 0, result.stderr);
    const publish = commands.find((command) => command[0] === 'publish');
    assert.ok(publish);
    assert.deepEqual(publish.slice(2, 5), ['--tag', channel, '--ignore-scripts']);
    assert.ok(result.stdout.includes('1.2.3-beta.123456'));
    assert.deepEqual(publish.slice(-2), ['--registry', 'https://npm.pkg.github.com']);
  }
});

test('develop restores latest to an existing matching release without republishing', (context) => {
  const { result, commands } = runPublisher({ context, publishedHash: 'source-hash' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    commands.some((command) => command[0] === 'publish'),
    false
  );
  assert.deepEqual(commands.at(-1), [
    'dist-tag',
    'add',
    '@vonage/video-reference-apps-common@1.2.3',
    'latest',
    '--registry',
    'https://npm.pkg.github.com',
  ]);
});

test('collisions and artifacts from a different manual run cannot change registry tags', (context) => {
  for (const options of [
    { publishedHash: 'different-source' },
    { isManual: true, artifactVersion: '1.2.3-beta.123455' },
  ]) {
    const { result, commands } = runPublisher({ context, ...options });
    assert.notEqual(result.status, 0);
    assert.equal(
      commands.some((command) => ['publish', 'dist-tag'].includes(command[0])),
      false
    );
  }
});

function runPublisher({
  context,
  channel = 'latest',
  isManual = false,
  publishedHash = '',
  artifactVersion,
}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'common-publish-'));
  context.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  for (const subdirectory of [
    'scripts/commonPackage',
    'libs/common',
    'artifact',
    'package',
    'bin',
  ]) {
    fs.mkdirSync(path.join(directory, subdirectory), { recursive: true });
  }
  fs.copyFileSync(
    path.join(__dirname, 'publishTarball.cjs'),
    directory + '/scripts/commonPackage/publishTarball.cjs'
  );
  fs.writeFileSync(
    directory + '/libs/common/manifest.json',
    JSON.stringify({ version: '1.2.3', channel: 'latest', hash: 'source-hash' })
  );
  const metadata = {
    packageName: '@vonage/video-reference-apps-common',
    version: artifactVersion ?? (isManual ? '1.2.3-beta.123456' : '1.2.3'),
    channel,
    sourceHash: 'source-hash',
    tarball: 'package.tgz',
  };
  fs.writeFileSync(directory + '/artifact/metadata.json', JSON.stringify(metadata));
  fs.writeFileSync(
    directory + '/package/package.json',
    JSON.stringify({
      name: metadata.packageName,
      version: metadata.version,
      sourceHash: metadata.sourceHash,
    })
  );
  const archive = spawnSync('tar', ['-czf', 'artifact/package.tgz', 'package'], { cwd: directory });
  assert.equal(archive.status, 0);
  fs.writeFileSync(
    directory + '/bin/npm',
    `#!/usr/bin/env node
const fs = require('node:fs');
const arguments = process.argv.slice(2);
fs.appendFileSync(process.env.TEST_COMMANDS, JSON.stringify(arguments) + '\\n');
if (arguments[0] === 'whoami') console.log('publisher');
if (arguments[0] === 'view') {
  if (process.env.TEST_PUBLISHED_HASH) console.log(JSON.stringify(process.env.TEST_PUBLISHED_HASH));
  else { console.log(JSON.stringify({ error: { code: 'E404' } })); process.exit(1); }
}
`,
    { mode: 0o755 }
  );
  const environment = {
    ...process.env,
    PATH: directory + '/bin:' + process.env.PATH,
    NODE_AUTH_TOKEN: 'test-token',
    GITHUB_EVENT_NAME: isManual ? 'workflow_dispatch' : 'push',
    GITHUB_RUN_ID: '123456',
    GITHUB_RUN_ATTEMPT: '2',
    PUBLISH_CHANNEL: channel,
    TEST_PUBLISHED_HASH: publishedHash,
    TEST_COMMANDS: directory + '/commands.jsonl',
  };
  const result = spawnSync(
    process.execPath,
    ['scripts/commonPackage/publishTarball.cjs', 'artifact'],
    {
      cwd: directory,
      env: environment,
      encoding: 'utf-8',
    }
  );
  const commands = fs.existsSync(environment.TEST_COMMANDS)
    ? fs
        .readFileSync(environment.TEST_COMMANDS, 'utf-8')
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line))
    : [];
  return { result, commands };
}
