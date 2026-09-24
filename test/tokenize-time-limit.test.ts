import { afterEach, describe, expect, it, vi } from 'vitest';
import { codeToHighlightHtml } from '../src/index';

/**
 * Shiki stops tokenising a line once it has spent `tokenizeTimeLimit`
 * milliseconds on it (500 by default) and leaves the rest of the line as one
 * uncoloured token. The limit is wall-clock time, so a starved process can hit
 * it on a short line. These tests stand in for starvation by making the clock
 * jump on every reading.
 */
const code = 'const greeting = "hello"; const answer = 42; function f(x) { return x * 2; }';

function starveTheClock() {
  const realNow = Date.now.bind(Date);
  let skew = 0;
  vi.spyOn(Date, 'now').mockImplementation(() => realNow() + (skew += 1000));
}

describe('tokenizeTimeLimit', () => {
  afterEach(() => vi.restoreAllMocks());

  it('leaves a line partly uncoloured under the default limit when the clock runs out', async () => {
    starveTheClock();
    const result = await codeToHighlightHtml(code, { lang: 'javascript', blockId: 'limited' });
    vi.restoreAllMocks();
    const full = await codeToHighlightHtml(code, { lang: 'javascript', blockId: 'limited' });

    expect(result.stats.tokens).toBeLessThan(full.stats.tokens);
  });

  it('colours every token when the limit is switched off', async () => {
    const full = await codeToHighlightHtml(code, { lang: 'javascript', blockId: 'unlimited' });
    starveTheClock();
    const result = await codeToHighlightHtml(code, {
      lang: 'javascript',
      blockId: 'unlimited',
      tokenizeTimeLimit: 0,
    });

    expect(result.stats.tokens).toBe(full.stats.tokens);
    expect(result.script).toBe(full.script);
  });
});
