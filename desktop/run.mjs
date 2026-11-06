import { spawn } from 'node:child_process';
import { existsSync, createReadStream } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const desktop = dirname(fileURLToPath(import.meta.url));
const react = resolve(desktop, '../react');
const mode = process.argv[2] || 'start';
if (!['start', 'test', 'package'].includes(mode)) {
  console.error('Usage: node desktop/run.mjs start|test|package');
  process.exit(2);
}
const environment = { ...process.env };
delete environment.ELECTRON_RUN_AS_NODE;
function run(executable, args, cwd = desktop, env = environment) {
  console.log(`\n> ${executable === process.execPath ? 'node' : executable} ${args.join(' ')}`);
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, { cwd, env, stdio: 'inherit', windowsHide: true });
    child.on('error', reject);
    child.on('exit', (code, signal) =>
      code === 0 ? resolve() : reject(new Error(`${executable} failed (${code ?? signal}). No later checks were run.`)),
    );
  });
}
function npm(args, cwd) {
  // All npm arguments here are fixed application commands, never user-provided shell text.
  return process.platform === 'win32'
    ? run('cmd.exe', ['/d', '/s', '/c', `npm ${args.join(' ')}`], cwd)
    : run('npm', args, cwd);
}
async function maestro() {
  await run('java', ['-version']);
  const cache = join(desktop, '.cache', 'maestro-2.11.0');
  const home = process.env.MAESTRO_HOME || join(cache, 'maestro');
  if (!existsSync(join(home, 'lib', 'maestro-cli-2.11.0.jar'))) {
    if (process.env.MAESTRO_HOME)
      throw new Error('MAESTRO_HOME must point to the Maestro 2.11.0 directory containing lib/.');
    await mkdir(cache, { recursive: true });
    const zip = join(cache, 'maestro.zip');
    if (!existsSync(zip)) {
      console.log('Downloading the pinned Maestro CLI (first test run only)...');
      const response = await fetch(
        'https://github.com/mobile-dev-inc/Maestro/releases/download/cli-2.11.0/maestro.zip',
      );
      if (!response.ok) throw new Error(`Maestro download failed: ${response.status}`);
      await writeFile(zip, new Uint8Array(await response.arrayBuffer()));
    }
    const hash = createHash('sha256');
    for await (const bytes of createReadStream(zip)) hash.update(bytes);
    if (hash.digest('hex') !== '5384593cb4e7a106489e75a821d157dd43f4e438df6bc308b72e82c685e1283a')
      throw new Error('Maestro archive checksum does not match the pinned release.');
    if (process.platform === 'win32') await run('tar.exe', ['-xf', zip, '-C', cache]);
    else await run('unzip', ['-o', zip, '-d', cache]);
  }
  const { preview } = await import('../react/node_modules/vite/dist/node/index.js');
  const server = await preview({
    configFile: join(desktop, 'vite.config.mjs'),
    configLoader: 'native',
    preview: { host: '127.0.0.1', port: 4175, strictPort: true },
  });
  try {
    await run(
      'java',
      [
        '-Djava.net.preferIPv4Stack=true',
        '-cp',
        join(home, 'lib', '*'),
        'maestro.cli.AppKt',
        'test',
        '--headless',
        '--screen-size',
        '1440x1100',
        '-e',
        'BASE_URL=http://127.0.0.1:4175',
        '--format',
        'HTML-DETAILED',
        '--output',
        'reports/maestro.html',
        '--test-output-dir',
        'reports/maestro',
        '.maestro',
      ],
      desktop,
      { ...environment, MAESTRO_CLI_NO_ANALYTICS: '1', MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED: 'true' },
    );
  } finally {
    await new Promise((resolve) => server.httpServer.close(resolve));
  }
}
try {
  for (const dir of [react, desktop]) {
    if (mode === 'test' || !existsSync(join(dir, 'node_modules', '.package-lock.json')))
      await npm(['ci', '--engine-strict', '--no-audit', '--no-fund'], dir);
  }
  if (mode === 'test') {
    await run(process.execPath, [join(react, 'node_modules', 'playwright', 'cli.js'), 'install', 'chromium']);
    await npm(['run', 'verify'], react);
    await npm(['run', 'format:check'], desktop);
    await npm(['run', 'lint'], desktop);
    await npm(['test'], desktop);
    await maestro();
    console.log(
      '\nPASS: shared React checks, desktop unit tests, native Electron E2E, and all five Maestro Chromium flows.',
    );
  } else await npm(['run', mode === 'package' ? 'package' : 'start'], desktop);
} catch (error) {
  console.error(`\n${error.message}`);
  if (error.code === 'ENOENT')
    console.error('Install Node.js 22.22.2+ and Java 17+ (Java is required for Maestro tests), then retry.');
  process.exitCode = 1;
}
