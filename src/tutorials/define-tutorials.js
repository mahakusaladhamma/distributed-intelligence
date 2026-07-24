export function defineTutorials(tutorials) {
  return Object.freeze(tutorials.map(tutorial => Object.freeze({
    ...tutorial,
    steps: Object.freeze(tutorial.steps.map(step => Object.freeze({
      ...step,
      paragraphs: Object.freeze([...step.paragraphs]),
      check: Object.freeze({
        ...step.check,
        options: Object.freeze([...step.check.options])
      })
    })))
  })));
}
