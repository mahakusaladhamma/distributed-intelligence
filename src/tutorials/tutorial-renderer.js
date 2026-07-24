const STORAGE_KEY = 'distributedIntelligenceTutorialProgress';

function element(document, tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

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

  let activeTopicId = null;
  let index = 0;
  let returnFocus = null;
  let checkSolved = false;

  function readProgress() {
    try {
      return JSON.parse(storage.getItem(STORAGE_KEY) || '{}');
    } catch (_) {
      return {};
    }
  }

  function writeProgress(topicId, value) {
    const progress = readProgress();
    progress[topicId] = value;
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (_) {
      // Restricted previews may deny storage; the tutorial remains usable.
    }
  }

  function currentProgress() {
    return readProgress()[activeTopicId] || { step: 0, completed: false };
  }

  function setOpen(open) {
    document.body.classList.toggle('tutorial-open', open);
    panel.classList.toggle('open', open);
    panel.setAttribute('aria-hidden', String(!open));
    backdrop.classList.toggle('show', open);
    trigger.setAttribute('aria-expanded', String(open));
    document.querySelector('.app')?.toggleAttribute('inert', open);
    document.querySelector('.mobile-header')?.toggleAttribute('inert', open);
    if (open) closeButton.focus({ preventScroll: true });
    else returnFocus?.focus?.({ preventScroll: true });
  }

  function answerCheck(step, optionIndex, optionButton, options, result) {
    if (checkSolved) return;
    if (optionIndex !== step.check.answer) {
      optionButton.classList.add('incorrect');
      result.className = 'tutorial-check-result bad';
      result.textContent = 'Not yet. Re-read the explanation and try another answer.';
      return;
    }

    checkSolved = true;
    options.querySelectorAll('button').forEach(button => {
      button.disabled = true;
      if (Number(button.dataset.tutorialAnswer) === step.check.answer) button.classList.add('correct');
    });
    result.className = 'tutorial-check-result good';
    result.textContent = step.check.explanation;

    const tutorial = registry.get(activeTopicId);
    const previous = currentProgress();
    const completed = index === tutorial.steps.length - 1;
    const nextStep = Math.min(tutorial.steps.length - 1, index + 1);
    writeProgress(activeTopicId, {
      step: completed ? index : Math.max(previous.step || 0, nextStep),
      completed
    });
    nextButton.disabled = false;
    practiceButton.hidden = !completed;
    syncTrigger(activeTopicId);
    if (completed) onComplete(activeTopicId);
  }

  function render() {
    const tutorial = registry.get(activeTopicId);
    const step = tutorial.steps[index];
    const progress = currentProgress();
    checkSolved = progress.completed || index < (progress.step || 0);

    title.textContent = tutorial.title;
    description.textContent = tutorial.description;
    progressText.textContent = `Step ${index + 1} of ${tutorial.steps.length}`;
    progressBar.style.width = `${((index + 1) / tutorial.steps.length) * 100}%`;
    body.replaceChildren();

    const article = element(document, 'article', 'tutorial-step');
    article.append(
      element(document, 'span', 'tutorial-source', step.source),
      element(document, 'h3', '', step.title)
    );
    step.paragraphs.forEach(paragraph => article.append(element(document, 'p', '', paragraph)));
    if (step.formula) article.append(element(document, 'div', 'tutorial-formula', step.formula));
    if (step.example) {
      const example = element(document, 'div', 'tutorial-example');
      example.append(element(document, 'strong', '', 'Example'), element(document, 'p', '', step.example));
      article.append(example);
    }

    const checkSection = element(document, 'section', 'tutorial-check');
    checkSection.append(
      element(document, 'strong', '', 'Understanding check'),
      element(document, 'p', '', step.check.prompt)
    );
    const options = element(document, 'div', 'tutorial-check-options');
    const result = element(
      document,
      'div',
      `tutorial-check-result${checkSolved ? ' good' : ''}`,
      checkSolved ? step.check.explanation : 'Choose an answer.'
    );

    step.check.options.forEach((option, optionIndex) => {
      const button = element(document, 'button', 'tutorial-check-option', option);
      button.type = 'button';
      button.dataset.tutorialAnswer = String(optionIndex);
      if (checkSolved) {
        button.disabled = true;
        if (optionIndex === step.check.answer) button.classList.add('correct');
      }
      button.addEventListener('click', () => answerCheck(step, optionIndex, button, options, result));
      options.append(button);
    });
    checkSection.append(options, result);
    article.append(checkSection);
    body.append(article);

    previousButton.disabled = index === 0;
    nextButton.hidden = index === tutorial.steps.length - 1;
    nextButton.disabled = !checkSolved;
    practiceButton.hidden = !(progress.completed || (index === tutorial.steps.length - 1 && checkSolved));
  }

  function open(topicId) {
    if (!registry.has(topicId)) return;
    activeTopicId = topicId;
    const tutorial = registry.get(topicId);
    const progress = readProgress()[topicId] || { step: 0, completed: false };
    index = Math.min(progress.step || 0, tutorial.steps.length - 1);
    returnFocus = document.activeElement;
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
    const progress = readProgress()[topicId] || { step: 0, completed: false };
    trigger.textContent = progress.completed
      ? 'Tutorial complete'
      : `Open tutorial · ${Math.min((progress.step || 0) + 1, tutorial.steps.length)}/${tutorial.steps.length}`;
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
    const focusable = [...panel.querySelectorAll('button:not([disabled]):not([hidden])')];
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

  return Object.freeze({ open, close, syncTrigger, readProgress });
}
