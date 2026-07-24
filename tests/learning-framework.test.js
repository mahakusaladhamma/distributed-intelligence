import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import {
  CodeTooltip,
  DefinitionPopover,
  InteractiveDiagram,
  KnowledgeCheck,
  ProgressTracker,
  appendGlossaryText
} from '../src/learning/components.js';
import { GLOSSARY, GLOSSARY_BY_ID } from '../src/learning/glossary.js';
import { renderGlossaryArchive } from '../src/learning/glossary-archive.js';
import { TUTORIALS } from '../src/tutorials/content.js';

test('glossary entries are interconnected and technical terms are highlighted', () => {
  const dom = new JSDOM('<main></main>', { url: 'http://localhost/' });
  const { document } = dom.window;
  const popover = DefinitionPopover(document);
  const paragraph = document.createElement('p');

  appendGlossaryText(document, paragraph, 'TCP establishes a Socket connection through a port.', popover);

  assert.ok(GLOSSARY.length >= 30);
  assert.equal(paragraph.querySelectorAll('[data-glossary-id]').length, 3);
  paragraph.querySelector('[data-glossary-id="socket"]').click();
  assert.match(document.querySelector('.definition-popover').textContent, /communication endpoint/i);
  assert.ok(GLOSSARY_BY_ID.get('socket').related.includes('TCP'));
});

test('popover supports hover preview, click pinning, toggling and glossary navigation', async () => {
  const dom = new JSDOM('<main></main>', { url: 'http://localhost/' });
  const { document } = dom.window;
  let selected = null;
  const popover = DefinitionPopover(document, { onLearnMore: entry => { selected = entry.id; } });
  const paragraph = document.createElement('p');
  appendGlossaryText(document, paragraph, 'TCP uses a Socket.', popover);
  document.body.append(paragraph);
  const socket = paragraph.querySelector('[data-glossary-id="socket"]');

  socket.dispatchEvent(new dom.window.MouseEvent('mouseenter'));
  assert.equal(popover.node.hidden, false);
  assert.equal(popover.node.dataset.mode, 'preview');

  socket.click();
  assert.equal(popover.node.dataset.mode, 'pinned');
  popover.node.querySelector('.definition-learn-more').click();
  assert.equal(selected, 'socket');
  assert.equal(popover.node.hidden, true);

  socket.click();
  assert.equal(popover.node.hidden, false);
  socket.click();
  assert.equal(popover.node.hidden, true);
});

test('central glossary archive searches, filters and opens related articles', () => {
  const dom = new JSDOM('<main><div id="board"></div><div id="controls"></div><div id="feedback"></div></main>');
  const { document } = dom.window;
  const archive = renderGlossaryArchive({
    document,
    board: document.querySelector('#board'),
    controls: document.querySelector('#controls'),
    feedback: document.querySelector('#feedback'),
    topicLabels: new Map([['sockets', 'Sockets']]),
    initialEntryId: 'socket'
  });

  assert.equal(archive.cards.length, GLOSSARY.length);
  assert.equal(document.querySelector('[data-glossary-entry="socket"]').classList.contains('targeted'), true);
  assert.match(document.querySelector('[data-glossary-entry="socket"]').textContent, /Definition/i);
  assert.match(document.querySelector('[data-glossary-entry="socket"]').textContent, /Explanation/i);
  assert.equal(document.querySelector('[data-glossary-entry="socket"] .glossary-explanation p'), null);
  assert.equal(document.querySelectorAll('[data-glossary-entry="socket"] .glossary-explanation li').length, 2);

  archive.search.value = 'DatagramSocket';
  archive.search.dispatchEvent(new dom.window.Event('input'));
  assert.equal(archive.cards.filter(card => !card.hidden).some(card => card.dataset.glossaryEntry === 'datagram-socket'), true);

  archive.search.value = '';
  archive.search.dispatchEvent(new dom.window.Event('input'));
  document.querySelector('[data-glossary-entry="socket"] [data-glossary-related="tcp"]').click();
  assert.equal(document.querySelector('[data-glossary-entry="tcp"]').classList.contains('targeted'), true);
});

test('interactive diagram and annotated code expose component explanations', () => {
  const dom = new JSDOM('<main></main>');
  const { document } = dom.window;
  const diagram = InteractiveDiagram(document, {
    title: 'Flow',
    nodes: [
      { id: 'a', label: 'Client', explanation: 'Starts the call.' },
      { id: 'b', label: 'Server', explanation: 'Handles the call.' }
    ],
    edges: [['a', 'b']]
  });
  document.body.append(diagram);
  diagram.querySelector('[data-diagram-node="b"]').click();
  assert.match(diagram.querySelector('.diagram-explanation').textContent, /Handles/);
  assert.ok(diagram.querySelector('.diagram-edge').classList.contains('selected'));

  const code = CodeTooltip(document, {
    source: 'Socket socket',
    annotations: {
      Socket: { definition: 'TCP endpoint', purpose: 'Connect', related: 'java.net.Socket' }
    }
  });
  document.body.append(code);
  code.querySelector('[data-code-token="Socket"]').click();
  assert.match(code.querySelector('.code-annotation').textContent, /TCP endpoint/);
});

test('knowledge checks support ordering and persist section progress', () => {
  const dom = new JSDOM('<main></main>', { url: 'http://localhost/' });
  const { document, localStorage } = dom.window;
  let solved = false;
  const check = KnowledgeCheck(document, {
    type: 'order',
    prompt: 'Order',
    items: ['second', 'first', 'third'],
    answer: ['first', 'second', 'third'],
    explanation: 'The sequence is correct.'
  }, { onSolved: () => { solved = true; } });
  document.body.append(check);
  const [dragged, target] = check.querySelectorAll('.order-check-item');
  const transfer = {
    value: '',
    setData(_type, value) { this.value = value; },
    getData() { return this.value; }
  };
  const dragStart = new dom.window.Event('dragstart', { bubbles: true });
  Object.defineProperty(dragStart, 'dataTransfer', { value: transfer });
  dragged.dispatchEvent(dragStart);
  const drop = new dom.window.Event('drop', { bubbles: true, cancelable: true });
  Object.defineProperty(drop, 'dataTransfer', { value: transfer });
  target.dispatchEvent(drop);
  check.querySelector('.order-check-submit').click();
  assert.equal(solved, true);

  const tracker = new ProgressTracker(localStorage, 'test-progress');
  tracker.start('sockets', 'endpoint');
  assert.equal(tracker.status('sockets', 'endpoint'), 'Reading');
  assert.equal(tracker.status('sockets', 'lifecycle'), 'Not Started');
  tracker.complete('sockets', 'endpoint', 1, false);
  assert.equal(tracker.status('sockets', 'endpoint'), 'Completed');
  tracker.toggleReview('sockets', 'endpoint');
  assert.deepEqual(tracker.get('sockets').reviewSteps, ['endpoint']);
});

test('knowledge checks expose an explicit true-or-false variant', () => {
  const dom = new JSDOM('<main></main>');
  const { document } = dom.window;
  const check = KnowledgeCheck(document, {
    type: 'boolean',
    prompt: 'TCP preserves message boundaries.',
    options: ['True', 'False'],
    answer: 1,
    explanation: 'TCP exposes an ordered byte stream.'
  });

  assert.equal(check.querySelector('strong').textContent, 'True or false');
  assert.equal(check.querySelectorAll('[data-tutorial-answer]').length, 2);
});

test('tutorial enhancements remain declarative and reusable', () => {
  const sockets = TUTORIALS.find(tutorial => tutorial.topicId === 'sockets');
  const lifecycle = sockets.steps.find(step => step.id === 'lifecycle');
  const rmi = TUTORIALS.find(tutorial => tutorial.topicId === 'rmi');

  assert.equal(lifecycle.check.type, 'order');
  assert.ok(lifecycle.code.annotations.ServerSocket);
  assert.ok(lifecycle.sections.length >= 2);
  assert.ok(rmi.steps.find(step => step.id === 'roles').diagram.nodes.length >= 4);
});
