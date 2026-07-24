export class TutorialRegistry {
  #byTopic;

  constructor(tutorials) {
    this.#byTopic = new Map();
    for (const tutorial of tutorials) {
      if (!tutorial.topicId || this.#byTopic.has(tutorial.topicId)) {
        throw new Error(`Tutorial topic IDs must be present and unique: ${tutorial.topicId || '<missing>'}`);
      }
      if (!tutorial.title || !tutorial.description || !tutorial.steps?.length) {
        throw new Error(`Tutorial "${tutorial.topicId}" is incomplete`);
      }
      for (const step of tutorial.steps) {
        if (!step.id || !step.title || !step.source || !step.paragraphs?.length || !step.check) {
          throw new Error(`Tutorial "${tutorial.topicId}" contains an incomplete step`);
        }
      }
      this.#byTopic.set(tutorial.topicId, tutorial);
    }
  }

  has(topicId) {
    return this.#byTopic.has(topicId);
  }

  get(topicId) {
    const tutorial = this.#byTopic.get(topicId);
    if (!tutorial) throw new Error(`Unknown tutorial topic ID: ${topicId}`);
    return tutorial;
  }

  all() {
    return [...this.#byTopic.values()];
  }
}

export function createTutorialRegistry(tutorials) {
  return new TutorialRegistry(tutorials);
}
