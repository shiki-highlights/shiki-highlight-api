# Migrate the bundler and publish the Node 24 release

Steve approved replacing tsup, testing the published interfaces and releasing on 15 October 2026. Preserve current ESM/CJS/declaration entry paths and Shiki runtime loading. Known old failure modes: tsup injects baseUrl (TypeScript 6 fails); bundling Shiki breaks dynamic languages; packaging can omit declarations or alter CJS exports.

1. Build the old system and save its export names and public package contract.
2. Replace tsup with current stable tsdown, using explicit ESM/CJS names, ES2020 target and dependency externalization. Upgrade to supported TypeScript 6 with explicit Node types. Remove the esbuild override if no longer needed.
3. Run existing tests, types, lint, format, build and audit. Pack/install into fresh consumers; compare runtime exports and exercise highlighting or remark rendering through both entry points. Compile ESM and CommonJS consumers against the package declarations. Add a durable package verification command so CI/release exercises the installed artifact too.
4. Merge protected PR after full Node 24/26/browser CI and core peer-floor checks. Publish core 2.0.0 first through the existing release workflow, then update remark to released core 2.0.0 and publish 0.5.0. Verify real registry metadata/artifacts. The only intended consumer break is the approved Node 24 baseline.
5. Preserve remote commits and clean every task checkout, consumer and generated archive.

## Implemented checks

Native tsdown 0.23.1 configuration uses normalized format `es` to retain index.mjs/index.js and declaration paths. A .mts config avoids changing package module identity. Dependencies stay external and the ES2020 target is preserved. TypeScript 6.0.3 builds without deprecated-option suppressions; explicit Node types supply the intended build environment.

The package check installs the actual tarball in a clean directory, checks the original public export names, exercises both module systems (including bundled-language loading), and compiles .mts/.cts consumers without skipLibCheck. It includes ESNext.Disposable because Shiki 4 declarations use Symbol.dispose, and proves the compiler goes red for an invalid export. CI and the release workflow run it after building; prepublishOnly retains its existing build/tests and also runs it. Every temporary consumer is removed in finally.

## Verification result

All eight local checks returned zero independently: clean npm ci, 154 unit tests, build, TypeScript 6 type check, ESLint, Prettier, installed tarball verification and npm audit. Audit remains zero without overrides. The installed ESM/CJS exports match the six baseline public functions, results agree for a dynamically loaded Python grammar and theme, and both declaration consumers compile. The invalid-import control exits 2 as expected. Runtime source and existing tests are unchanged.
