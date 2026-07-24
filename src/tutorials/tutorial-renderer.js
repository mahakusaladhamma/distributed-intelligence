import {
  CodeTooltip,
  collectRelatedConcepts,
  DefinitionPopover,
  element,
  ExamTip,
  ExpandableSection,
  InteractiveDiagram,
  KnowledgeCheck,
  ProgressTracker,
  RelatedConcepts,
  appendGlossaryText
} from '../learning/components.js';

export function createTutorialRenderer({
  document,
  registry,
  panel,
  storage,
  onComplete,
  onPractice,
  onGlossary
}) {
  const title = panel.querySelector('#tutorialTitle');
  const description = panel.querySelector('#tutorialDescription');
  const progressText = panel.querySelector('#tutorialProgressText');
  const progressBar = panel.querySelector('#tutorialProgressBar');
  const body = panel.querySelector('#tutorialBody');
  const previousButton = panel.querySelector('#tutorialPrevious');
  const nextButton = panel.querySelector('#tutorialNext');
  const practiceButton = panel.querySelector('#tutorialPractice');
  const tracker = new ProgressTracker(storage);
  const popover = DefinitionPopover(document, {
    onLearnMore: entry => {
      close();
      onGlossary?.(entry.id);
    }
  });

  let activeTopicId = null;
  let index = 0;
  let checkSolved = false;

  function readProgress() {
    return tracker.readAll();
  }

  function currentProgress() {
    return tracker.get(activeTopicId);
  }

  function setOpen(openState) {
    panel.classList.toggle('open', openState);
    panel.hidden = !openState;
    panel.setAttribute('aria-hidden', String(!openState));
    if (!openState) popover.close();
  }

  function completeCheck(step) {
    if (checkSolved) return;
    checkSolved = true;
    const tutorial = registry.get(activeTopicId);
    const tutorialComplete = index === tutorial.steps.length - 1;
    tracker.complete(
      activeTopicId,
      step.id,
      tutorialComplete ? index : Math.max(currentProgress().step || 0, index + 1),
      tutorialComplete
    );
    nextButton.disabled = false;
    practiceButton.hidden = !tutorialComplete;
    renderStepMeta(step);
    if (tutorialComplete) onComplete(activeTopicId);
  }

  function renderStepMeta(step) {
    const oldMeta = body.querySelector('.tutorial-step-meta');
    const meta = element(document, 'div', 'tutorial-step-meta');
    const status = element(document, 'span', `step-status ${tracker.status(activeTopicId, step.id).toLowerCase().replace(' ', '-')}`, tracker.status(activeTopicId, step.id));
    const review = element(
      document,
      'button',
      'review-toggle',
      (currentProgress().reviewSteps || []).includes(step.id) ? 'Marked for review' : 'Review later'
    );
    review.type = 'button';
    review.dataset.reviewStep = step.id;
    review.setAttribute('aria-pressed', String((currentProgress().reviewSteps || []).includes(step.id)));
    review.addEventListener('click', () => {
      tracker.toggleReview(activeTopicId, step.id);
      renderStepMeta(step);
    });
    meta.append(status, review);
    if (oldMeta) oldMeta.replaceWith(meta);
    else body.querySelector('.tutorial-step')?.prepend(meta);
  }

  function render() {
    const tutorial = registry.get(activeTopicId);
    const step = tutorial.steps[index];
    const progress = tracker.start(activeTopicId, step.id);
    checkSolved = progress.completed || (progress.completedSteps || []).includes(step.id) || index < (progress.step || 0);

    title.textContent = tutorial.title;
    description.textContent = tutorial.description;
    progressText.textContent = `Step ${index + 1} of ${tutorial.steps.length} · ${tracker.status(activeTopicId, step.id)}`;
    progressBar.style.width = `${((index + 1) / tutorial.steps.length) * 100}%`;
    body.replaceChildren();

    const article = element(document, 'article', 'tutorial-step');
    article.append(
      element(document, 'span', 'tutorial-source', step.source),
      element(document, 'h3', '', step.title)
    );
    step.paragraphs.forEach(paragraph => {
      const node = element(document, 'p');
      appendGlossaryText(document, node, paragraph, popover);
      article.append(node);
    });
    if (step.formula) article.append(element(document, 'div', 'tutorial-formula', step.formula));
    if (step.example) {
      const example = element(document, 'div', 'tutorial-example');
      const text = element(document, 'p');
      appendGlossaryText(document, text, step.example, popover);
      example.append(element(document, 'strong', '', 'Practical example'), text);
      article.append(example);
    }
    if (step.diagram) article.append(InteractiveDiagram(document, step.diagram));
    if (step.code) article.append(CodeTooltip(document, step.code));
    (step.sections || []).forEach(section => article.append(ExpandableSection(document, section, popover)));
    (step.callouts || []).forEach(callout => article.append(ExamTip(document, callout)));

    const related = collectRelatedConcepts([
      step.title,
      ...step.paragraphs,
      step.example || ''
    ]);
    if (related.length) {
      article.append(RelatedConcepts(document, related, entry => {
        close();
        onGlossary?.(entry.id);
      }));
    }

    article.append(KnowledgeCheck(document, step.check, {
      solved: checkSolved,
      onSolved: () => completeCheck(step)
    }));
    body.append(article);
    renderStepMeta(step);

    previousButton.disabled = index === 0;
    nextButton.hidden = index === tutorial.steps.length - 1;
    nextButton.disabled = !checkSolved;
    practiceButton.hidden = !(progress.completed || (index === tutorial.steps.length - 1 && checkSolved));
  }

  function open(topicId) {
    if (!registry.has(topicId)) return;
    activeTopicId = topicId;
    const tutorial = registry.get(topicId);
    const progress = tracker.get(topicId);
    index = Math.min(progress.step || 0, tutorial.steps.length - 1);
    render();
    setOpen(true);
  }

  function close() {
    if (panel.classList.contains('open')) setOpen(false);
  }

  function resetReadingPosition() {
    body.scrollTop = 0;
    panel.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
  }

  previousButton.addEventListener('click', () => {
    if (index === 0) return;
    index -= 1;
    render();
    resetReadingPosition();
  });
  nextButton.addEventListener('click', () => {
    if (!checkSolved) return;
    index += 1;
    render();
    resetReadingPosition();
  });
  practiceButton.addEventListener('click', () => {
    close();
    onPractice(activeTopicId);
  });
  return Object.freeze({ open, close, readProgress, tracker });
}
