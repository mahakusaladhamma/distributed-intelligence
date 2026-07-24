import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../styles/app.css', import.meta.url), 'utf8');

function lastZIndex(selector) {
  const pattern = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{[^}]*?z-index:\\s*(\\d+)`, 'gs');
  const matches = [...css.matchAll(pattern)];
  assert.ok(matches.length > 0, `${selector} must declare a z-index`);
  return Number(matches.at(-1)[1]);
}

test('glossary popovers remain above embedded tutorial content', () => {
  assert.ok(lastZIndex('.definition-popover') > 0);
});

test('viewport-height sidebar styles are scoped away from tutorial callouts', () => {
  assert.doesNotMatch(css, /(?:^|\n)aside\s*\{[^}]*height:\s*100(?:d)?vh/gs);
  assert.match(css, /#sidebar\s*\{[^}]*height:\s*100vh[^}]*height:\s*100dvh/gs);
});

test('embedded tutorials participate in page layout instead of fixed overlay layout', () => {
  assert.match(css, /\.tutorial-panel\.tutorial-embedded\s*\{[^}]*position:\s*relative/gs);
  assert.match(css, /\.tutorial-embedded \.tutorial-body\s*\{[^}]*overflow:\s*visible/gs);
});
