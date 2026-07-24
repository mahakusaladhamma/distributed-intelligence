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
  assert.equal(dom.window.document.querySelectorAll('[data-practice]').length, 5);
  assert.equal(dom.window.document.querySelectorAll('[data-glossary]').length, 1);
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
  assert.ok(dom.window.document.querySelectorAll('[data-glossary-id]').length >= 1);
  assert.equal(dom.window.document.querySelector('.step-status').textContent, 'Reading');
  dom.window.document.querySelector('[data-tutorial-answer="0"]').click();
  assert.equal(dom.window.document.querySelector('#tutorialNext').disabled, false);
  assert.equal(dom.window.document.querySelector('.step-status').textContent, 'Completed');
});

test('course overview tutorial reaches every step and unlocks practice', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const dom = new JSDOM(html, { url: 'http://localhost/' });
  const app = createApp(dom.window.document, dom.window);
  const { document } = dom.window;

  app.start();
  document.querySelector('#tutorialBtn').click();
  const tutorial = app.tutorialRegistry.get('overview');

  tutorial.steps.forEach((step, index) => {
    assert.equal(document.querySelector('.tutorial-step h3').textContent, step.title);
    document.querySelector(`[data-tutorial-answer="${step.check.answer}"]`).click();
    if (index < tutorial.steps.length - 1) {
      assert.equal(document.querySelector('#tutorialNext').disabled, false);
      document.querySelector('#tutorialNext').click();
    }
  });

  assert.equal(document.querySelector('#tutorialPractice').hidden, false);
  assert.equal(app.tutorialRenderer.readProgress().overview.completed, true);
});

test('glossary is available from navigation and opens full articles', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const dom = new JSDOM(html, { url: 'http://localhost/' });
  const app = createApp(dom.window.document, dom.window);

  app.start();
  dom.window.document.querySelector('[data-glossary]').click();
  assert.equal(dom.window.document.querySelector('#topicTitle').textContent, 'Distributed Systems Glossary');
  assert.ok(dom.window.document.querySelectorAll('[data-glossary-entry]').length >= 50);
  assert.ok(dom.window.document.querySelector('[data-glossary-entry="socket"]'));
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

test('Java Lab validates gaps, synchronizes repeated tokens and advances', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const dom = new JSDOM(html, { url: 'http://localhost/' });
  const app = createApp(dom.window.document, dom.window);
  const { document, Event } = dom.window;

  app.start();
  app.selectPractice('java-lab');
  assert.equal(document.querySelector('#topicTitle').textContent, 'Java Lab');
  assert.match(document.querySelector('.java-lab-title').textContent, /TCP client/i);

  const socketInputs = document.querySelectorAll('[data-java-blank="socketType"]');
  assert.equal(socketInputs.length, 2);
  socketInputs[0].value = 'Socket';
  socketInputs[0].dispatchEvent(new Event('input'));
  assert.equal(socketInputs[1].value, 'Socket');

  document.querySelector('[data-java-blank="inputMethod"]').value = 'getInputStream';
  document.querySelector('[data-java-blank="outputMethod"]').value = 'getOutputStream';
  document.querySelector('#checkJava').click();
  assert.match(document.querySelector('#feedback').textContent, /^Correct\./);
  assert.ok(document.querySelector('#nextJavaSnippet'));
  document.querySelector('#nextJavaSnippet').click();
  assert.match(document.querySelector('.java-lab-title').textContent, /Accept a TCP connection/i);
});
