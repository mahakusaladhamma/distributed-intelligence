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

test('glossary popovers render above the tutorial dialog and its backdrop', () => {
  const popover = lastZIndex('.definition-popover');
  assert.ok(popover > lastZIndex('.tutorial-panel'));
  assert.ok(popover > lastZIndex('.tutorial-backdrop'));
});

test('viewport-height sidebar styles are scoped away from tutorial callouts', () => {
  assert.doesNotMatch(css, /(?:^|\n)aside\s*\{[^}]*height:\s*100(?:d)?vh/gs);
  assert.match(css, /#sidebar\s*\{[^}]*height:\s*100vh[^}]*height:\s*100dvh/gs);
});
