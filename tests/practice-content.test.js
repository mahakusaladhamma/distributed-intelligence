import test from 'node:test';
import assert from 'node:assert/strict';
import { CLOCK_CHALLENGES, CONCEPT_QUESTIONS, MESSAGE_FLOWS, PRACTICE_MODES } from '../src/content/practice.js';

test('initial practice lineup has valid answer keys and flows', () => {
  assert.deepEqual(PRACTICE_MODES.map(mode => mode.id), ['concept-blitz', 'clock-lab', 'message-flow']);
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
