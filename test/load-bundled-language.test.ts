import { describe, it, expect } from 'vitest';
import { loadBundledLanguage, codeToHighlightHtml } from '../src/index';

describe('loadBundledLanguage', () => {
  it('loads a bundled language successfully', async () => {
    // Load Python language
    await loadBundledLanguage('python');

    // Verify it can now highlight Python code
    const result = await codeToHighlightHtml('print("Hello, World!")', {
      lang: 'python',
      theme: 'dark-plus',
      blockId: 'python-test',
    });

    expect(result.html).toContain('print');
    expect(result.html).toContain('Hello, World!');
    expect(result.stats.tokens).toBeGreaterThan(0);
  });

  it('loads multiple bundled languages', async () => {
    // Load multiple languages
    await loadBundledLanguage('rust');
    await loadBundledLanguage('go');

    // Test Rust
    const rustResult = await codeToHighlightHtml('fn main() {}', {
      lang: 'rust',
      theme: 'dark-plus',
      blockId: 'rust-test',
    });

    expect(rustResult.html).toContain('fn main');
    expect(rustResult.stats.tokens).toBeGreaterThan(0);

    // Test Go
    const goResult = await codeToHighlightHtml('func main() {}', {
      lang: 'go',
      theme: 'dark-plus',
      blockId: 'go-test',
    });

    expect(goResult.html).toContain('func main');
    expect(goResult.stats.tokens).toBeGreaterThan(0);
  });

  it('can be called multiple times for the same language', async () => {
    // Loading the same language multiple times should not error
    await loadBundledLanguage('ruby');
    await loadBundledLanguage('ruby');

    const result = await codeToHighlightHtml('puts "Hello"', {
      lang: 'ruby',
      theme: 'dark-plus',
      blockId: 'ruby-test',
    });

    expect(result.html).toContain('puts');
    expect(result.stats.tokens).toBeGreaterThan(0);
  });

  it('works in parallel with other language loads', async () => {
    // Load multiple languages in parallel
    await Promise.all([
      loadBundledLanguage('php'),
      loadBundledLanguage('java'),
      loadBundledLanguage('csharp'),
    ]);

    // All should work
    const phpResult = await codeToHighlightHtml('<?php echo "test"; ?>', {
      lang: 'php',
      theme: 'dark-plus',
      blockId: 'php-test',
    });

    expect(phpResult.html).toContain('echo');
    expect(phpResult.stats.tokens).toBeGreaterThan(0);
  });
});
