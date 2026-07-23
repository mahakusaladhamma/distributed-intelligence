import test from 'node:test';
import assert from 'node:assert/strict';
import { TOPICS } from '../src/content/topics.js';
import { createTopicRegistry } from '../src/core/topic-registry.js';

test('all lecture topics have unique ids and required metadata', () => {
  const registry = createTopicRegistry(TOPICS);
  assert.equal(registry.all().length, 14);
  for (const topic of registry.all()) {
    assert.ok(topic.id);
    assert.ok(topic.title);
    assert.ok(topic.summary);
    assert.ok(topic.objectives.length >= 3);
    assert.ok(topic.sources.length >= 1);
  }
});

test('registry rejects duplicate ids', () => {
  assert.throws(
    () => createTopicRegistry([{ id: 'same' }, { id: 'same' }]),
    /duplicate topic id/
  );
});
