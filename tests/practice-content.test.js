import test from 'node:test';
import assert from 'node:assert/strict';
import { CLOCK_CHALLENGES, CONCEPT_QUESTIONS, FLASHCARDS, JAVA_LAB_SNIPPETS, MESSAGE_FLOWS, PRACTICE_MODES } from '../src/content/practice.js';

test('initial practice lineup has valid answer keys and flows', () => {
  assert.deepEqual(PRACTICE_MODES.map(mode => mode.id), ['concept-blitz', 'clock-lab', 'message-flow', 'java-lab', 'flashcards', 'exam-mode']);
  assert.ok(CONCEPT_QUESTIONS.length >= 10);
  assert.ok(CLOCK_CHALLENGES.some(challenge => challenge.type === 'Cristian'));
  assert.ok(CLOCK_CHALLENGES.some(challenge => challenge.type === 'Vector clock'));
  assert.ok(MESSAGE_FLOWS.some(flow => flow.title.includes('RMI')));

  for (const question of [...CONCEPT_QUESTIONS, ...CLOCK_CHALLENGES]) {
    assert.ok(question.answer >= 0 && question.answer < question.options.length);
    assert.ok(question.explanation.length > 20);
  }
  for (const flow of MESSAGE_FLOWS) {
    assert.ok(flow.steps.length >= 4);
    assert.equal(new Set(flow.steps).size, flow.steps.length);
  }
});

test('Java Lab snippets have resolvable, unique completion gaps', () => {
  assert.ok(JAVA_LAB_SNIPPETS.length >= 10);
  assert.ok(JAVA_LAB_SNIPPETS.some(snippet => snippet.topic === 'Sockets'));
  assert.ok(JAVA_LAB_SNIPPETS.some(snippet => snippet.topic === 'JDBC'));
  assert.ok(JAVA_LAB_SNIPPETS.some(snippet => snippet.topic === 'JMS'));

  for (const snippet of JAVA_LAB_SNIPPETS) {
    const ids = snippet.blanks.map(blank => blank.id);
    const placeholders = [...snippet.template.matchAll(/\{\{([a-zA-Z][\w-]*)\}\}/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length, `${snippet.id} has duplicate blank definitions`);
    assert.deepEqual(new Set(placeholders), new Set(ids), `${snippet.id} has unresolved placeholders`);
    assert.ok(snippet.explanation.length > 40);
    snippet.blanks.forEach(blank => {
      assert.ok(blank.answer.length > 0);
      assert.ok(blank.hint.length > 20);
    });
  }
});

test('flashcards cover the complete theory map with unique prompts', () => {
  assert.ok(FLASHCARDS.length >= 28);
  assert.ok(new Set(FLASHCARDS.map(card => card.topic)).size >= 12);
  assert.equal(new Set(FLASHCARDS.map(card => card.id)).size, FLASHCARDS.length);
  assert.equal(new Set(FLASHCARDS.map(card => card.front)).size, FLASHCARDS.length);
  FLASHCARDS.forEach(card => {
    assert.ok(card.front.length > 15);
    assert.ok(card.back.length > 40);
  });
});
