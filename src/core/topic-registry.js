export function createTopicRegistry(topics) {
  const entries = new Map();

  for (const topic of topics) {
    if (!topic.id || entries.has(topic.id)) {
      throw new Error(`Invalid or duplicate topic id: ${topic.id}`);
    }
    entries.set(topic.id, topic);
  }

  return Object.freeze({
    get: id => entries.get(id),
    has: id => entries.has(id),
    all: () => [...entries.values()],
    categories: () => [...new Set([...entries.values()].map(topic => topic.category))]
  });
}
