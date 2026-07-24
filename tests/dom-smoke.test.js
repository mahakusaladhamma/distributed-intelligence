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
  assert.equal(dom.window.document.querySelectorAll('[data-practice]').length, 4);
  assert.equal(dom.window.document.querySelector('#topicTitle').textContent, 'Distributed Systems');
  assert.equal(dom.window.document.querySelector('#topicCount').textContent, '14');
  assert.equal(app.tutorialRegistry.all().length, 14);

  app.selectTopic('jms');
  assert.equal(dom.window.document.querySelector('#topicTitle').textContent, 'Java Message Service');
  assert.equal(dom.window.document.querySelector('#visitedCount').textContent, '2');
  dom.window.document.querySelector('#tutorialBtn').click();
  assert.equal(dom.window.document.querySelector('#tutorialPanel').classList.contains('open'), true);
  assert.match(dom.window.document.querySelector('#tutorialTitle').textContent, /JMS|messaging/i);
  assert.equal(dom.window.document.querySelectorAll('[data-tutorial-answer]').length, 3);
  dom.window.document.querySelector('[data-tutorial-answer="0"]').click();
  assert.equal(dom.window.document.querySelector('#tutorialNext').disabled, false);
});

test('exam mode starts, stores answers and navigates between tasks', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const dom = new JSDOM(html, { url: 'http://localhost/' });
  const app = createApp(dom.window.document, dom.window);

  app.start();
  app.selectPractice('exam-mode');
  assert.match(dom.window.document.querySelector('#board').textContent, /90 minutes/);

  dom.window.document.querySelector('#startExam').click();
  assert.match(dom.window.document.querySelector('#examTimer').textContent, /90:00/);
  assert.equal(dom.window.document.querySelectorAll('[data-exam-task]').length, 12);
  dom.window.document.querySelector('[data-exam-answer="0"]').click();
  assert.match(dom.window.document.querySelector('#feedback').textContent, /1 of 12/);
  dom.window.document.querySelector('#nextExamTask').click();
  assert.match(dom.window.document.querySelector('.exam-counter').textContent, /2 \/ 12/);
});

test('interactive practice modes render and accept input', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const dom = new JSDOM(html, { url: 'http://localhost/' });
  const app = createApp(dom.window.document, dom.window);

  app.start();
  app.selectPractice('clock-lab');

  assert.equal(dom.window.document.querySelector('#topicTitle').textContent, 'Clock Lab');
  assert.equal(dom.window.document.querySelectorAll('[data-answer]').length, 3);
  dom.window.document.querySelector('[data-answer="0"]').click();
  assert.match(dom.window.document.querySelector('#feedback').textContent, /30 ms/);

  app.selectPractice('message-flow');
  assert.equal(dom.window.document.querySelectorAll('[data-step]').length, 5);
  assert.match(dom.window.document.querySelector('#missionText').textContent, /control and data flow/);
});
