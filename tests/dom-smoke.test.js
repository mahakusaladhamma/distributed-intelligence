import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { createApp } from '../src/app.js';

test('application renders navigation, topic detail and progress', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const dom = new JSDOM(html, { url: 'http://localhost/' });
  const app = createApp(dom.window.document, dom.window);

  app.start();

  assert.equal(dom.window.document.querySelectorAll('[data-topic]').length, 14);
  assert.equal(dom.window.document.querySelector('#topicTitle').textContent, 'Distributed Systems');
  assert.equal(dom.window.document.querySelector('#topicCount').textContent, '14');

  app.selectTopic('jms');
  assert.equal(dom.window.document.querySelector('#topicTitle').textContent, 'Java Message Service');
  assert.equal(dom.window.document.querySelector('#visitedCount').textContent, '2');
});
