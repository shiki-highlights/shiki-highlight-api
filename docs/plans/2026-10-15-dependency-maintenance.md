# Refresh dependencies and actions

User requested maintenance of the self-authored highlighting packages as part of the personal-site dependency update. Initial npm audit: 2 high advisories. Refresh compatible dependencies and current Actions; no new features or unrelated refactoring. Preserve runtime/API compatibility unless Steve explicitly approves a support change.

1. Inspect package.json, package-lock.json, all workflow action references and repository guidance.
2. Refresh dependency minimums and lockfile; remove confirmed obsolete development packages, use the established core-package esbuild security override where necessary.
3. Update checkout/setup-node/release-drafter to current stable supported versions. Keep existing CI checks, tests, peer-floor checks and publish triggers intact. Node support changes remain pending explicit approval.
4. Verify clean install, npm audit, unit tests, types, lint, format and build. Let the existing CI browser suite verify browser behavior; do not skip tests.
5. Commit and push separately, inspect CI results, record limits, and retain commits remotely before removing temporary checkouts and caches. No npm release is performed by this task; the approved Node support change must be included in the next breaking release.

TypeScript 7 is newer but typescript-eslint 8.71.2 declares TypeScript <6.1. Use supported stable TypeScript 6.0.3 while that constraint remains. Vitest 5 requires Node 22.12+; the existing package floor is Node 20, so its adoption is pending Steve's answer.

## Approved support change

Steve chose Node 24 rather than the proposed Node 22.12 floor. Require Node >=24.0.0, test on Node 24 and 26, and adopt Vitest 5.0.4. This is a breaking support change and must be called out in the next package release. Preserve all existing test jobs, including the core package's Shiki peer-floor job. The current publish workflow owns version stamping from release tags; do not publish an unreviewed release as part of maintenance.

TypeScript 6.0.3 is the latest stable version supported by current typescript-eslint (<6.1); TypeScript 7 remains deferred until that peer constraint changes. The remark plugin's unused deprecated mdast development package was removed; its import is type-only and resolves through the retained @types/mdast. The esbuild override follows the existing core repository control and fixes the tsup development-server advisory.

## Compiler compatibility finding

Vitest 5 passes all existing unit tests (154 core / 54 remark). The attempted TypeScript 6.0.3 declaration build failed with `error TS5101: Option 'baseUrl' is deprecated and will stop functioning in TypeScript 7.0.` The source tsconfig does not set baseUrl: tsup 8.5.1 injects `baseUrl: compilerOptions.baseUrl || "."` in its bundled declaration plugin. The remark package also reported `error TS2584: Cannot find name 'console'.` under TypeScript 6's changed type inclusion.

Retain TypeScript 5.9.3 rather than suppressing compiler diagnostics or broadening maintenance into a bundler replacement. TypeScript 6 needs tsup compatibility work; TypeScript 7 additionally conflicts with typescript-eslint's declared <6.1 range. These are explicit remaining outdated compiler constraints, not security-audit findings.

## Local verification

Clean npm ci, all 154 unit tests, ESM/CJS/declaration build, tsc --noEmit, ESLint, Prettier and npm audit each exited zero, recorded independently. Final audit: zero known vulnerabilities. No runtime source or existing test assertions were modified. CI retains the browser suite on both Node 24 and 26; core also retains its declared Shiki 1.9.0 peer-floor tests.
