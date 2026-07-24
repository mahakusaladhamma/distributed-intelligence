import test from 'node:test';
import assert from 'node:assert/strict';
import { GLOSSARY, GLOSSARY_BY_ID } from '../src/learning/glossary.js';

const normalize = value => value.toLocaleLowerCase('en').replace(/[^a-z0-9]+/g, ' ').trim();

test('glossary definitions and explanation points are unique and non-repeating', () => {
  const definitions = GLOSSARY.map(entry => normalize(entry.definition));
  assert.equal(new Set(definitions).size, definitions.length);

  GLOSSARY.forEach(entry => {
    const points = entry.details.map(normalize);
    assert.ok(entry.definition.length >= 20, `${entry.term} needs a substantive definition`);
    assert.ok(points.length > 0, `${entry.term} needs at least one explanation point`);
    assert.equal(new Set(points).size, points.length, `${entry.term} repeats an explanation point`);
    assert.ok(!points.includes(normalize(entry.definition)), `${entry.term} repeats its definition`);
    assert.equal('explanation' in entry, false, `${entry.term} must not duplicate its details as explanation text`);
  });
});

test('every related concept resolves to another glossary entry', () => {
  const labels = new Set(GLOSSARY.flatMap(entry => [entry.term, ...entry.aliases].map(normalize)));
  GLOSSARY.forEach(entry => entry.related.forEach(label => {
    assert.ok(labels.has(normalize(label)), `${entry.term} refers to missing glossary term ${label}`);
  }));
});

test('IP address explanation distinguishes network addressing from application ports', () => {
  const ipAddress = GLOSSARY_BY_ID.get('ip-address');
  assert.match(ipAddress.definition, /network-layer address/i);
  assert.match(ipAddress.details.join(' '), /routers/i);
  assert.match(ipAddress.details.join(' '), /rather than an application endpoint/i);
});
