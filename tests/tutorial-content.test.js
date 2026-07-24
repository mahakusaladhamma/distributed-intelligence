import test from 'node:test';
import assert from 'node:assert/strict';
import { TOPICS } from '../src/content/topics.js';
import { TUTORIALS } from '../src/tutorials/content.js';
import { createTutorialRegistry } from '../src/tutorials/tutorial-registry.js';

test('every course topic has a complete guided tutorial', () => {
  const registry = createTutorialRegistry(TUTORIALS);

  assert.equal(TUTORIALS.length, TOPICS.length);
  assert.deepEqual(
    TUTORIALS.map(tutorial => tutorial.topicId).sort(),
    TOPICS.map(topic => topic.id).sort()
  );

  for (const topic of TOPICS) {
    const tutorial = registry.get(topic.id);
    assert.ok(tutorial.steps.length >= 4, `${topic.id} needs at least four theory steps`);
    for (const step of tutorial.steps) {
      assert.ok(step.source.includes('.pdf'));
      assert.ok(step.paragraphs.length >= 2);
      assert.ok(step.check.options.length >= 3);
      assert.ok(step.check.answer >= 0 && step.check.answer < step.check.options.length);
      assert.ok(step.check.explanation.length >= 20);
    }
  }
});

test('tutorial registry rejects duplicate topic mappings', () => {
  assert.throws(
    () => createTutorialRegistry([TUTORIALS[0], TUTORIALS[0]]),
    /unique/
  );
});
