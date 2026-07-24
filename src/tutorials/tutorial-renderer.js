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
  trigger,
  panel,
  backdrop,
  closeButton,
  storage,
  onComplete,
  onPractice
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
    onLearnMore: entry => open(entry.topicId)
  });

  let activeTopicId = null;
  let index = 0;
  let returnFocus = null;
  let checkSolved = false;

  function readProgress() {
    return tracker.readAll();
  }

  function currentProgress() {
    return tracker.get(activeTopicId);
  }

  function setOpen(openState) {
    document.body.classList.toggle('tutorial-open', openState);
    panel.classList.toggle('open', openState);
    panel.setAttribute('aria-hidden', String(!openState));
    backdrop.classList.toggle('show', openState);
    trigger.setAttribute('aria-expanded', String(openState));
    document.querySelector('.app')?.toggleAttribute('inert', openState);
    document.querySelector('.mobile-header')?.toggleAttribute('inert', openState);
    if (openState) closeButton.focus({ preventScroll: true });
    else {
      popover.close();
      returnFocus?.focus?.({ preventScroll: true });
    }
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
    syncTrigger(activeTopicId);
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
    if (related.length) article.append(RelatedConcepts(document, related, entry => open(entry.topicId)));

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
    if (!panel.classList.contains('open')) returnFocus = document.activeElement;
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

  function syncTrigger(topicId) {
    const available = registry.has(topicId);
    trigger.hidden = !available;
    trigger.disabled = !available;
    if (!available) return;
    const tutorial = registry.get(topicId);
    const progress = tracker.get(topicId);
    if (progress.completed) {
      trigger.textContent = 'Tutorial complete';
    } else if (progress.started) {
      trigger.textContent = `Continue tutorial · ${Math.min((progress.step || 0) + 1, tutorial.steps.length)}/${tutorial.steps.length}`;
    } else {
      trigger.textContent = `Open tutorial · 1/${tutorial.steps.length}`;
    }
  }

  previousButton.addEventListener('click', () => {
    if (index === 0) return;
    index -= 1;
    render();
    body.scrollTop = 0;
  });
  nextButton.addEventListener('click', () => {
    if (!checkSolved) return;
    index += 1;
    render();
    body.scrollTop = 0;
  });
  practiceButton.addEventListener('click', () => {
    close();
    onPractice(activeTopicId);
  });
  closeButton.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...panel.querySelectorAll('button:not([disabled]):not([hidden]), summary')];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  return Object.freeze({ open, close, syncTrigger, readProgress, tracker });
}
