/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

test('manual runs publish beta versions only when the beta tag is selected', (context) => {
  for (const { channel, artifactVersion } of [
    { channel: 'beta', artifactVersion: '1.2.3-beta.123456' },
    { channel: 'latest', artifactVersion: '1.2.3' },
  ]) {
    const { result, commands } = runPublisher({
      context,
      channel,
      artifactVersion,
      isManual: true,
    });
    assert.equal(result.status, 0, result.stderr);
    const publish = commands.find((command) => command[0] === 'publish');
    assert.ok(publish);
    assert.deepEqual(publish.slice(2, 5), ['--tag', channel, '--ignore-scripts']);
    assert.ok(
      result.stdout.includes(`Published @vonage/video-reference-apps-common@${artifactVersion}.`)
    );
    assert.deepEqual(publish.slice(-2), ['--registry', 'https://npm.pkg.github.com']);
  }
});

test('develop runs publish the committed version under its manifest channel', (context) => {
  for (const { manifestVersion, manifestChannel } of [
    { manifestVersion: '1.2.3-beta.0', manifestChannel: 'beta' },
    { manifestVersion: '1.2.3', manifestChannel: 'latest' },
  ]) {
    const { result, commands } = runPublisher({ context, manifestVersion, manifestChannel });
    assert.equal(result.status, 0, result.stderr);
    const publish = commands.find((command) => command[0] === 'publish');
    assert.ok(publish);
    assert.deepEqual(publish.slice(2, 5), ['--tag', manifestChannel, '--ignore-scripts']);
    assert.ok(
      result.stdout.includes(`Published @vonage/video-reference-apps-common@${manifestVersion}.`)
    );
  }
});

test('matching published versions are skipped without changing registry tags', (context) => {
  for (const options of [
    {},
    { manifestVersion: '1.2.3-beta.0', manifestChannel: 'beta' },
    { isManual: true },
    { isManual: true, channel: 'beta', artifactVersion: '1.2.3-beta.123456' },
  ]) {
    const { result, commands } = runPublisher({
      context,
      ...options,
      publishedHash: 'source-hash',
    });
    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.stdout.includes('Skipping publish.'));
    assert.equal(
      commands.some((command) => ['publish', 'dist-tag'].includes(command[0])),
      false
    );
  }
});

test('collisions and artifacts from a different manual run cannot change registry tags', (context) => {
  for (const options of [
    { publishedHash: 'different-source' },
    { isManual: true, publishedHash: 'different-source' },
    { isManual: true, channel: 'beta', artifactVersion: '1.2.3-beta.123455' },
    { isManual: true, channel: 'latest', artifactVersion: '1.2.3-beta.123456' },
  ]) {
    const { result, commands } = runPublisher({ context, ...options });
    assert.notEqual(result.status, 0);
    assert.match(
      result.stderr,
      options.publishedHash ? /already published with different source/ : /does not match/
    );
    assert.equal(
      commands.some((command) => ['publish', 'dist-tag'].includes(command[0])),
      false
    );
  }
});

function runPublisher({
  context,
  manifestVersion = '1.2.3',
  manifestChannel = 'latest',
  channel = manifestChannel,
  isManual = false,
  publishedHash = '',
  artifactVersion = manifestVersion,
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
    JSON.stringify({ version: manifestVersion, channel: manifestChannel, hash: 'source-hash' })
  );
  const metadata = {
    packageName: '@vonage/video-reference-apps-common',
    version: artifactVersion,
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
    PUBLISH_CHANNEL: isManual ? channel : '',
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
