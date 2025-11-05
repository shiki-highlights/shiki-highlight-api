# Next Steps: Publishing shiki-highlight-api

## ✅ Completed

- [x] Core package created
- [x] TypeScript configured
- [x] Build working (CJS + ESM + types)
- [x] README written
- [x] MIT License added
- [x] Git repository initialized
- [x] Initial commit created

## 🔄 Next: Push to GitHub

**Location:** `/Users/stevehill/Projects/shiki-highlight-api`

### Steps:

1. **Create GitHub repository:**
   - Go to https://github.com/new
   - Repository name: `shiki-highlight-api`
   - Description: "High-performance syntax highlighting using CSS Custom Highlight API (87% fewer DOM nodes)"
   - Public repository
   - Do NOT initialize with README (we already have one)

2. **Push to GitHub:**
   ```bash
   cd /Users/stevehill/Projects/shiki-highlight-api
   git remote add origin https://github.com/stevehill1981/shiki-highlight-api.git
   git branch -M main
   git push -u origin main
   ```

## 📦 Publish to npm

### Prerequisites

1. **npm account:** https://www.npmjs.com/signup
2. **Login locally:**
   ```bash
   npm login
   ```

### Dry Run (Check Package)

```bash
cd /Users/stevehill/Projects/shiki-highlight-api
npm pack --dry-run
```

This shows what will be included in the package.

### Publish v0.1.0

```bash
npm publish
```

**Note:** First publish can't be undone for 24 hours. The package name `shiki-highlight-api` will be claimed permanently.

### Verify Publication

```bash
npm view shiki-highlight-api
```

Visit: https://www.npmjs.com/package/shiki-highlight-api

## 🔄 Update Code198x

Once published, update Code198x to use the published package:

### 1. Install Package

```bash
cd /Users/stevehill/Projects/Code198x/website
npm install shiki-highlight-api
```

### 2. Update Imports

**In `/website/astro.config.mjs`:**
```diff
- import { remarkHighlightApi } from './src/lib/remark-highlight-api.ts';
+ import { remarkHighlightApi } from 'remark-shiki-highlight-api';
```

Wait - we haven't extracted the remark plugin yet! Keep using local version for now.

### 3. Test Pages

```bash
npm run dev
```

Visit:
- http://localhost:4321/test-highlight-api-all-languages
- http://localhost:4321/commodore-64/phase-0/tier-1/lesson-007

Verify everything still works.

### 4. Optional: Delete Local Implementation

**After confirming everything works:**
```bash
rm /Users/stevehill/Projects/Code198x/website/src/lib/highlight-api.ts
```

The remark plugin still needs the local version until we extract that too.

## 📝 Create Release Notes

After publishing, create GitHub release:

1. Go to https://github.com/stevehill1981/shiki-highlight-api/releases/new
2. Tag: `v0.1.0`
3. Title: `v0.1.0 - Initial Release`
4. Body:
   ```markdown
   # shiki-highlight-api v0.1.0

   First public release! 🎉

   ## Features

   - 87% fewer DOM nodes compared to traditional span-based highlighting
   - Visual parity with Shiki (identical output)
   - Support for all Shiki languages and themes
   - Custom language loading
   - Fallback for unsupported browsers
   - Full TypeScript support

   ## Browser Support

   - Chrome 105+ (September 2022)
   - Safari 17.2+ (January 2024)
   - Firefox 140+ (2024)
   - Edge 105+

   ## Installation

   \`\`\`bash
   npm install shiki-highlight-api
   \`\`\`

   ## Quick Start

   \`\`\`typescript
   import { codeToHighlightHtml } from 'shiki-highlight-api';

   const result = await codeToHighlightHtml('const x = 42;', {
     lang: 'javascript'
   });
   \`\`\`

   See [README](https://github.com/stevehill1981/shiki-highlight-api#readme) for full documentation.
   ```

## 🚀 Future Work

### Phase 2: Remark Plugin

Extract remark plugin to separate package:

```
remark-shiki-highlight-api/
├── src/
│   └── index.ts  (from /website/src/lib/remark-highlight-api.ts)
├── package.json
└── README.md
```

**Package name:** `remark-shiki-highlight-api`
**Dependency:** `shiki-highlight-api`

### Phase 3: Documentation Site

Build Astro site at https://shiki-highlight-api.dev with:
- Live demos
- Performance comparisons
- API reference
- Migration guide

### Phase 4: Marketing

- Blog post on Dev.to
- Submit to Hacker News
- Share on Reddit r/webdev
- Tweet about it

## 📊 Success Metrics

### Week 1 Target
- [ ] npm downloads: 100+
- [ ] GitHub stars: 50+
- [ ] Issues opened: 5+

### Track Progress
- npm: https://www.npmjs.com/package/shiki-highlight-api
- GitHub: https://github.com/stevehill1981/shiki-highlight-api/stargazers

## ⚠️ Important Notes

1. **Version 0.1.0 is beta** - API may change based on feedback
2. **Breaking changes expected** before 1.0.0
3. **Test thoroughly** before using in production
4. **Code198x is the test bed** - use in production there first
5. **Semantic versioning** - document all breaking changes

## 🆘 If Something Goes Wrong

### Package Name Taken
If `shiki-highlight-api` is taken, alternatives:
- `shiki-highlight-css`
- `shiki-highlights`
- `@stevehill/shiki-highlight-api` (scoped)

### Build Fails
```bash
npm run build
```
Check TypeScript errors, fix, then rebuild.

### Publish Fails
Common issues:
- Not logged in: `npm login`
- Name taken: Choose different name
- Version exists: Bump version in package.json

## 📞 Need Help?

Check:
- https://docs.npmjs.com/cli/v10/commands/npm-publish
- https://docs.github.com/en/get-started/quickstart/create-a-repo
