import { describe, it, expect } from 'vitest';
import {
  loadBundledTheme,
  loadBundledLanguage,
  codeToHighlightHtml,
  codeToHtmlFallback,
} from '../src/index';

/**
 * The shared highlighter starts with `dark-plus` alone. Before themes were
 * loaded on demand, every other name threw "Theme `x` not found", so the
 * `theme` option could only ever be given its own default.
 */
describe('bundled themes', () => {
  it('highlights with a theme the highlighter did not start with', async () => {
    const result = await codeToHighlightHtml('const x = 42;', {
      lang: 'javascript',
      theme: 'light-plus',
      blockId: 'light-theme-test',
    });

    expect(result.css).toContain('::highlight(');
    expect(result.stats.tokens).toBeGreaterThan(0);
  });

  it('gives a light theme different colours from a dark one', async () => {
    const code = 'const greeting = "hello";';
    const dark = await codeToHighlightHtml(code, {
      lang: 'javascript',
      theme: 'dark-plus',
      blockId: 'contrast-dark',
    });
    const light = await codeToHighlightHtml(code, {
      lang: 'javascript',
      theme: 'light-plus',
      blockId: 'contrast-light',
    });

    const colours = (css: string) => [...css.matchAll(/color:\s*([^;]+)/g)].map((m) => m[1].trim());
    expect(colours(dark.css).length).toBeGreaterThan(0);
    expect(colours(light.css)).not.toEqual(colours(dark.css));

    // light-plus is a dark-on-light palette, so it must not be reusing the
    // greys and pale blues that only work on a dark ground.
    expect(colours(light.css)).toContain('#000000');
  });

  it('preloads a theme before anything asks for it', async () => {
    await loadBundledTheme('github-light');

    const result = await codeToHighlightHtml('const x = 1;', {
      lang: 'javascript',
      theme: 'github-light',
      blockId: 'preloaded-theme-test',
    });

    expect(result.stats.tokens).toBeGreaterThan(0);
  });

  it('is safe to call twice for the same theme', async () => {
    await loadBundledTheme('one-light');
    await expect(loadBundledTheme('one-light')).resolves.toBeUndefined();
  });

  it('serves the fallback renderer too', async () => {
    const html = await codeToHtmlFallback('const x = 1;', {
      lang: 'javascript',
      theme: 'vitesse-light',
    });

    expect(html).toContain('<pre');
    expect(html).toContain('const');
  });

  it('still defaults to dark-plus when no theme is given', async () => {
    const result = await codeToHighlightHtml('const x = 1;', {
      lang: 'javascript',
      blockId: 'default-theme-test',
    });

    expect(result.stats.tokens).toBeGreaterThan(0);
  });

  it('leaves an unbundled name for Shiki to reject', async () => {
    await loadBundledLanguage('python');
    await expect(
      codeToHighlightHtml('print(1)', {
        lang: 'python',
        theme: 'no-such-theme',
        blockId: 'unknown-theme-test',
      })
    ).rejects.toThrow(/not found/i);
  });
});
