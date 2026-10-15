import assert from 'node:assert/strict';
import console from 'node:console';
import process from 'node:process';
import { execFileSync, spawnSync } from 'node:child_process';
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, URL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const core = pkg.name === 'shiki-highlight-api';
const expected = core
  ? [
      'codeToHighlightHtml',
      'codeToHtmlFallback',
      'createCustomHighlighter',
      'loadBundledLanguage',
      'loadBundledTheme',
      'loadCustomLanguage',
    ]
  : ['remarkHighlightApi'];
const paths = [pkg.main, pkg.module, pkg.types];
for (const path of paths) await access(join(root, path));
const temporary = await mkdtemp(join(tmpdir(), 'shiki-package-'));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const run = (command, args, cwd = root) =>
  execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
    timeout: 120_000,
  });

try {
  const [packed] = JSON.parse(run(npm, ['pack', '--json', '--pack-destination', temporary]));
  for (const path of paths) {
    assert.ok(
      packed.files.some((file) => file.path === path.replace(/^\.\//, '')),
      `Tarball lacks ${path}`
    );
  }
  await writeFile(
    join(temporary, 'package.json'),
    JSON.stringify({
      private: true,
      type: 'module',
      dependencies: { [pkg.name]: `file:${join(temporary, packed.filename)}` },
    })
  );
  run(
    npm,
    [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      '--cache',
      process.env.npm_config_cache || join(temporary, '.npm-cache'),
    ],
    temporary
  );
  const exercise = core
    ? `const outputs = [];
       for (const api of [esm, cjs]) {
         await api.loadBundledLanguage('python');
         const result = await api.codeToHighlightHtml('answer = 42', { lang: 'python', theme: 'github-dark', blockId: 'package-check', tokenizeTimeLimit: 0 });
         assert.ok(result.html.includes('answer'));
         assert.ok(result.stats.tokens > 0);
         assert.ok(result.script.includes('Highlight'));
         outputs.push(result);
       }
       assert.deepEqual(outputs[0], outputs[1]);`
    : `for (const api of [esm, cjs]) {
         const tree = { type: 'root', children: [{ type: 'code', lang: 'python', value: 'answer = 42' }] };
         await api.remarkHighlightApi()(tree);
         assert.ok(tree.children.some(node => node.type === 'html' && node.value.includes('data-highlight-block') && node.value.includes('answer')));
       }`;
  await writeFile(
    join(temporary, 'runtime.mjs'),
    `import assert from 'node:assert/strict';
import console from 'node:console';
import process from 'node:process';
    import { createRequire } from 'node:module';
    import * as esm from ${JSON.stringify(pkg.name)};
    const cjs = createRequire(import.meta.url)(${JSON.stringify(pkg.name)});
    const expected = ${JSON.stringify(expected)};
    assert.deepEqual(Object.keys(esm).sort(), expected);
    assert.deepEqual(Object.keys(cjs).filter(key => key !== '__esModule').sort(), expected);
    ${exercise}
    console.log('Installed ESM and CommonJS package checks passed.');`
  );
  process.stdout.write(run(process.execPath, ['runtime.mjs'], temporary));
  const source = core
    ? `import { codeToHighlightHtml, type HighlightOptions, type HighlightResult } from '${pkg.name}';
       const options: HighlightOptions = { lang: 'python' };
       const result: Promise<HighlightResult> = codeToHighlightHtml('answer = 42', options);
       void result;`
    : `import { remarkHighlightApi, type RemarkHighlightApiOptions } from '${pkg.name}';
       const options: RemarkHighlightApiOptions = { theme: 'dark-plus' };
       const transform = remarkHighlightApi(options);
       void transform;`;
  for (const extension of ['mts', 'cts'])
    await writeFile(join(temporary, `consumer.${extension}`), source);
  await writeFile(
    join(temporary, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        target: 'ES2020',
        lib: ['ES2020', 'DOM', 'ESNext.Disposable'],
        strict: true,
        noEmit: true,
        types: [],
      },
      include: ['consumer.mts', 'consumer.cts'],
    })
  );
  const compiler = join(root, 'node_modules/typescript/bin/tsc');
  run(process.execPath, [compiler, '--project', join(temporary, 'tsconfig.json')], temporary);
  await writeFile(
    join(temporary, 'consumer.mts'),
    `import { missingPackageExport } from '${pkg.name}'; void missingPackageExport;`
  );
  const control = spawnSync(
    process.execPath,
    [compiler, '--project', join(temporary, 'tsconfig.json')],
    { cwd: temporary, encoding: 'utf8', timeout: 120_000 }
  );
  assert.equal(control.status, 2, 'Invalid consumer must fail type checking');
  assert.match(control.stdout, /has no exported member/);
  console.log(
    'Installed ESM/CommonJS declarations passed; invalid-export control failed as expected.'
  );
} finally {
  await rm(temporary, { recursive: true, force: true });
}
