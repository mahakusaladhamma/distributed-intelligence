export function defineTutorials(tutorials) {
  return Object.freeze(tutorials.map(tutorial => Object.freeze({
    ...tutorial,
    steps: Object.freeze(tutorial.steps.map(step => Object.freeze({
      ...step,
      paragraphs: Object.freeze([...step.paragraphs]),
      sections: Object.freeze([...(step.sections || [])].map(section => Object.freeze({ ...section }))),
      callouts: Object.freeze([...(step.callouts || [])].map(callout => Object.freeze({ ...callout }))),
      check: Object.freeze({
        ...step.check,
        options: step.check.options ? Object.freeze([...step.check.options]) : undefined,
        items: step.check.items ? Object.freeze([...step.check.items]) : undefined,
        answer: Array.isArray(step.check.answer) ? Object.freeze([...step.check.answer]) : step.check.answer
      }),
      diagram: step.diagram ? Object.freeze({
        ...step.diagram,
        nodes: Object.freeze(step.diagram.nodes.map(node => Object.freeze({ ...node }))),
        edges: Object.freeze(step.diagram.edges.map(edge => Object.freeze([...edge])))
      }) : undefined,
      code: step.code ? Object.freeze({
        ...step.code,
        annotations: Object.freeze({ ...step.code.annotations })
      }) : undefined
    })))
  })));
}
