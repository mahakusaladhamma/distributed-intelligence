import { GLOSSARY_BY_ID, GLOSSARY_MATCHES } from './glossary.js';

let popoverSequence = 0;

export function element(document, tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function DefinitionPopover(document, { onLearnMore } = {}) {
  const popover = element(document, 'aside', 'definition-popover');
  const popoverId = `definition-popover-${++popoverSequence}`;
  popover.id = popoverId;
  popover.hidden = true;
  popover.setAttribute('role', 'dialog');
  popover.setAttribute('aria-label', 'Glossary definition');
  document.body.append(popover);
  let activeTrigger = null;
  let activeEntry = null;
  let pinned = false;
  let closeTimer = null;

  function cancelClose() {
    if (closeTimer !== null) {
      document.defaultView?.clearTimeout(closeTimer);
      closeTimer = null;
    }
  }

  function close({ restoreFocus = false } = {}) {
    cancelClose();
    popover.hidden = true;
    activeTrigger?.setAttribute('aria-expanded', 'false');
    if (restoreFocus) activeTrigger?.focus?.();
    activeTrigger = null;
    activeEntry = null;
    pinned = false;
    delete popover.dataset.mode;
  }

  function position() {
    if (!activeTrigger || popover.hidden) return;
    const view = document.defaultView;
    const viewportWidth = document.documentElement.clientWidth || view?.innerWidth || 800;
    const viewportHeight = document.documentElement.clientHeight || view?.innerHeight || 600;
    const triggerRect = activeTrigger.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();
    const width = popoverRect.width || Math.min(320, viewportWidth - 24);
    const height = popoverRect.height || 260;
    const below = viewportHeight - triggerRect.bottom - 12;
    const placeAbove = below < Math.min(height, 260) && triggerRect.top > below;
    const desiredTop = placeAbove ? triggerRect.top - height - 8 : triggerRect.bottom + 8;

    popover.style.left = `${Math.max(12, Math.min(triggerRect.left, viewportWidth - width - 12))}px`;
    popover.style.top = `${Math.max(12, Math.min(desiredTop, viewportHeight - height - 12))}px`;
    popover.dataset.placement = placeAbove ? 'top' : 'bottom';
  }

  function render(entry) {
    popover.replaceChildren();
    const heading = element(document, 'strong', 'definition-title', entry.term);
    const closeButton = element(document, 'button', 'definition-close', '×');
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Close definition');
    closeButton.addEventListener('click', () => close({ restoreFocus: true }));
    const head = element(document, 'div', 'definition-head');
    head.append(heading, closeButton);
    const list = element(document, 'ul', 'definition-points');
    entry.details.forEach(point => list.append(element(document, 'li', '', point)));
    const related = element(document, 'p', 'definition-related', `Related: ${entry.related.join(' · ')}`);
    const learnMore = element(document, 'button', 'definition-learn-more', 'Open glossary article');
    learnMore.type = 'button';
    learnMore.addEventListener('click', () => {
      close();
      onLearnMore?.(entry);
    });
    popover.append(head, element(document, 'p', '', entry.definition), list, related, learnMore);
  }

  function open(entry, trigger, { pin = false } = {}) {
    cancelClose();
    if (activeTrigger === trigger && activeEntry === entry && !popover.hidden) {
      pinned = pinned || pin;
      popover.dataset.mode = pinned ? 'pinned' : 'preview';
      return;
    }
    activeTrigger?.setAttribute('aria-expanded', 'false');
    activeTrigger = trigger;
    activeEntry = entry;
    pinned = pin;
    trigger.setAttribute('aria-expanded', 'true');
    trigger.setAttribute('aria-controls', popoverId);
    render(entry);
    popover.hidden = false;
    popover.dataset.mode = pinned ? 'pinned' : 'preview';
    position();
  }

  function scheduleClose() {
    cancelClose();
    if (pinned) return;
    closeTimer = document.defaultView?.setTimeout(() => close(), 120) ?? null;
  }

  function toggle(entry, trigger) {
    if (activeTrigger === trigger && !popover.hidden && pinned) {
      close();
      return;
    }
    open(entry, trigger, { pin: true });
  }

  document.addEventListener('pointerdown', event => {
    if (!popover.hidden && !popover.contains(event.target) && !activeTrigger?.contains(event.target)) close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !popover.hidden) close({ restoreFocus: true });
  });
  document.defaultView?.addEventListener('resize', position);
  document.addEventListener('scroll', position, true);
  popover.addEventListener('mouseenter', cancelClose);
  popover.addEventListener('mouseleave', scheduleClose);

  return Object.freeze({
    open,
    close,
    toggle,
    scheduleClose,
    cancelClose,
    position,
    isOpenFor: trigger => activeTrigger === trigger && !popover.hidden,
    isPinned: () => pinned,
    node: popover
  });
}

export function GlossaryTerm(document, entry, label, popover) {
  const term = element(document, 'button', 'glossary-term', label);
  term.type = 'button';
  term.dataset.glossaryId = entry.id;
  term.setAttribute('aria-label', `${label}: open definition`);
  term.setAttribute('aria-expanded', 'false');
  term.addEventListener('click', event => {
    event.preventDefault();
    popover.toggle(entry, term);
  });
  term.addEventListener('mouseenter', () => popover.open(entry, term));
  term.addEventListener('mouseleave', popover.scheduleClose);
  term.addEventListener('focus', () => popover.open(entry, term));
  term.addEventListener('blur', popover.scheduleClose);
  return term;
}

export function appendGlossaryText(document, parent, text, popover) {
  const escaped = GLOSSARY_MATCHES.map(match => match.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const matcher = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
  let cursor = 0;
  for (const match of text.matchAll(matcher)) {
    const start = match.index;
    if (start > cursor) parent.append(document.createTextNode(text.slice(cursor, start)));
    const found = GLOSSARY_MATCHES.find(candidate => candidate.label.toLowerCase() === match[0].toLowerCase());
    parent.append(GlossaryTerm(document, found.entry, match[0], popover));
    cursor = start + match[0].length;
  }
  if (cursor < text.length) parent.append(document.createTextNode(text.slice(cursor)));
}

export function ExpandableSection(document, section, popover) {
  const details = element(document, 'details', 'expandable-section');
  const summary = element(document, 'summary', '', section.title);
  const content = element(document, 'p');
  appendGlossaryText(document, content, section.content, popover);
  details.append(summary, content);
  return details;
}

export function ExamTip(document, callout) {
  const labels = { exam: 'Exam tip', mistake: 'Common mistake', remember: 'Remember' };
  const box = element(document, 'aside', `learning-callout ${callout.type || 'remember'}`);
  box.append(
    element(document, 'strong', '', labels[callout.type] || labels.remember),
    element(document, 'p', '', callout.text)
  );
  return box;
}

export function RelatedConcepts(document, entries, onSelect) {
  const section = element(document, 'section', 'related-concepts');
  section.append(element(document, 'strong', '', 'Related concepts'));
  const links = element(document, 'div', 'related-concept-list');
  entries.forEach(entry => {
    const button = element(document, 'button', '', entry.term);
    button.type = 'button';
    button.dataset.relatedConcept = entry.id;
    button.addEventListener('click', () => onSelect?.(entry));
    links.append(button);
  });
  section.append(links);
  return section;
}

export function InteractiveDiagram(document, diagram) {
  const section = element(document, 'section', 'interactive-diagram');
  section.append(element(document, 'strong', 'diagram-title', diagram.title));
  const canvas = element(document, 'div', 'diagram-canvas');
  const explanation = element(document, 'p', 'diagram-explanation', 'Select a component to inspect its role.');
  diagram.nodes.forEach((node, index) => {
    const button = element(document, 'button', 'diagram-node', node.label);
    button.type = 'button';
    button.dataset.diagramNode = node.id;
    button.style.setProperty('--node-index', String(index));
    const explain = () => {
      canvas.querySelectorAll('.diagram-node').forEach(item => item.classList.remove('selected'));
      canvas.querySelectorAll('.diagram-edge').forEach(item => {
        const relationship = item.dataset.edge.split('-');
        item.classList.toggle('selected', relationship.includes(node.id));
      });
      button.classList.add('selected');
      explanation.textContent = node.explanation;
    };
    button.addEventListener('click', explain);
    button.addEventListener('mouseenter', explain);
    canvas.append(button);
    if (index < diagram.nodes.length - 1) {
      const edge = element(document, 'span', 'diagram-edge', '→');
      edge.dataset.edge = `${diagram.edges[index]?.[0] || ''}-${diagram.edges[index]?.[1] || ''}`;
      canvas.append(edge);
    }
  });
  const animate = element(document, 'button', 'diagram-play', diagram.flowLabel || 'Animate flow');
  animate.type = 'button';
  animate.addEventListener('click', () => {
    section.classList.remove('flowing');
    void section.offsetWidth;
    section.classList.add('flowing');
  });
  section.append(canvas, explanation, animate);
  return section;
}

function tokenizeCode(source, annotations) {
  const keys = Object.keys(annotations).sort((a, b) => b.length - a.length);
  if (!keys.length) return [{ text: source }];
  const escaped = keys.map(key => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const matcher = new RegExp(`(${escaped.join('|')})`, 'g');
  return source.split(matcher).filter(Boolean).map(text => ({ text, annotation: annotations[text] }));
}

export function CodeTooltip(document, code) {
  const section = element(document, 'section', 'code-explanation');
  const pre = element(document, 'pre', 'interactive-code');
  const codeNode = element(document, 'code');
  const explanation = element(document, 'div', 'code-annotation', 'Select a highlighted token to inspect it.');
  tokenizeCode(code.source, code.annotations || {}).forEach(token => {
    if (!token.annotation) {
      codeNode.append(document.createTextNode(token.text));
      return;
    }
    const button = element(document, 'button', 'code-token', token.text);
    button.type = 'button';
    button.dataset.codeToken = token.text;
    const explain = () => {
      explanation.replaceChildren(
        element(document, 'strong', '', token.text),
        element(document, 'span', '', token.annotation.definition),
        element(document, 'span', '', `Purpose: ${token.annotation.purpose}`),
        element(document, 'span', '', `Related API: ${token.annotation.related}`)
      );
    };
    button.addEventListener('click', explain);
    button.addEventListener('mouseenter', explain);
    codeNode.append(button);
  });
  pre.append(codeNode);
  section.append(pre, explanation);
  return section;
}

function renderChoiceCheck(document, check, onSolved) {
  const options = element(document, 'div', 'tutorial-check-options');
  const result = element(document, 'div', 'tutorial-check-result', 'Choose an answer.');
  check.options.forEach((option, index) => {
    const button = element(document, 'button', 'tutorial-check-option', option);
    button.type = 'button';
    button.dataset.tutorialAnswer = String(index);
    button.addEventListener('click', () => {
      if (options.dataset.solved) return;
      if (index !== check.answer) {
        button.classList.add('incorrect');
        result.className = 'tutorial-check-result bad';
        result.textContent = check.incorrectExplanation || 'Not yet. Re-read the explanation and try another answer.';
        return;
      }
      options.dataset.solved = 'true';
      options.querySelectorAll('button').forEach((candidate, candidateIndex) => {
        candidate.disabled = true;
        if (candidateIndex === check.answer) candidate.classList.add('correct');
      });
      result.className = 'tutorial-check-result good';
      result.textContent = check.explanation;
      onSolved();
    });
    options.append(button);
  });
  return { options, result };
}

function renderOrderCheck(document, check, onSolved) {
  const state = [...check.items];
  const options = element(document, 'ol', 'order-check');
  const result = element(document, 'div', 'tutorial-check-result', 'Use the arrows, then check the order.');
  let draggedIndex = null;

  function renderItems() {
    options.replaceChildren();
    state.forEach((item, index) => {
      const row = element(document, 'li', 'order-check-item');
      row.draggable = true;
      row.dataset.orderIndex = String(index);
      row.setAttribute('aria-label', `${item}. Drag to reorder or use the arrow buttons.`);
      row.addEventListener('dragstart', event => {
        draggedIndex = index;
        row.classList.add('dragging');
        event.dataTransfer?.setData('text/plain', String(index));
        if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
      });
      row.addEventListener('dragend', () => {
        draggedIndex = null;
        row.classList.remove('dragging');
      });
      row.addEventListener('dragover', event => {
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
      });
      row.addEventListener('drop', event => {
        event.preventDefault();
        const sourceIndex = draggedIndex ?? Number(event.dataTransfer?.getData('text/plain'));
        if (!Number.isInteger(sourceIndex) || sourceIndex === index) return;
        const [moved] = state.splice(sourceIndex, 1);
        state.splice(index, 0, moved);
        draggedIndex = null;
        renderItems();
      });
      row.append(element(document, 'span', '', item));
      for (const [label, movement] of [['Move up', -1], ['Move down', 1]]) {
        const button = element(document, 'button', '', movement < 0 ? '↑' : '↓');
        button.type = 'button';
        button.setAttribute('aria-label', `${label}: ${item}`);
        button.disabled = index + movement < 0 || index + movement >= state.length;
        button.addEventListener('click', () => {
          [state[index], state[index + movement]] = [state[index + movement], state[index]];
          renderItems();
        });
        row.append(button);
      }
      options.append(row);
    });
  }
  renderItems();
  const verify = element(document, 'button', 'btn order-check-submit', 'Check order');
  verify.type = 'button';
  verify.addEventListener('click', () => {
    if (state.every((item, index) => item === check.answer[index])) {
      options.querySelectorAll('button').forEach(button => { button.disabled = true; });
      verify.disabled = true;
      result.className = 'tutorial-check-result good';
      result.textContent = check.explanation;
      onSolved();
    } else {
      result.className = 'tutorial-check-result bad';
      result.textContent = 'The sequence is not correct yet. Trace which operation creates the resource needed by the next step.';
    }
  });
  return { options, result, verify };
}

export function KnowledgeCheck(document, check, { solved = false, onSolved } = {}) {
  const section = element(document, 'section', 'tutorial-check');
  const labels = {
    boolean: 'True or false',
    order: 'Order the steps'
  };
  section.append(
    element(document, 'strong', '', labels[check.type] || 'Understanding check'),
    element(document, 'p', '', check.prompt)
  );
  const rendered = check.type === 'order'
    ? renderOrderCheck(document, check, onSolved)
    : renderChoiceCheck(document, check, onSolved);
  section.append(rendered.options);
  if (rendered.verify) section.append(rendered.verify);
  section.append(rendered.result);
  if (solved) {
    rendered.options.querySelectorAll('button').forEach(button => { button.disabled = true; });
    if (rendered.verify) rendered.verify.disabled = true;
    rendered.result.className = 'tutorial-check-result good';
    rendered.result.textContent = check.explanation;
    if (check.type !== 'order') {
      const answer = rendered.options.querySelector(`[data-tutorial-answer="${check.answer}"]`);
      answer?.classList.add('correct');
    }
  }
  return section;
}

export class ProgressTracker {
  constructor(storage, key = 'distributedIntelligenceTutorialProgress') {
    this.storage = storage;
    this.key = key;
  }

  readAll() {
    try {
      return JSON.parse(this.storage.getItem(this.key) || '{}');
    } catch (_) {
      return {};
    }
  }

  write(topicId, patch) {
    const all = this.readAll();
    all[topicId] = { ...(all[topicId] || {}), ...patch };
    try {
      this.storage.setItem(this.key, JSON.stringify(all));
    } catch (_) {
      // Restricted previews may deny storage.
    }
    return all[topicId];
  }

  get(topicId) {
    return this.readAll()[topicId] || { step: 0, completed: false, completedSteps: [], reviewSteps: [] };
  }

  start(topicId, stepId) {
    const progress = this.get(topicId);
    return this.write(topicId, {
      started: true,
      activeStepId: stepId,
      completedSteps: progress.completedSteps || [],
      reviewSteps: progress.reviewSteps || []
    });
  }

  complete(topicId, stepId, nextStep, tutorialComplete) {
    const progress = this.get(topicId);
    return this.write(topicId, {
      step: nextStep,
      completed: tutorialComplete,
      completedSteps: [...new Set([...(progress.completedSteps || []), stepId])],
      reviewSteps: progress.reviewSteps || []
    });
  }

  toggleReview(topicId, stepId) {
    const progress = this.get(topicId);
    const reviewSteps = progress.reviewSteps || [];
    return this.write(topicId, {
      reviewSteps: reviewSteps.includes(stepId)
        ? reviewSteps.filter(id => id !== stepId)
        : [...reviewSteps, stepId]
    });
  }

  status(topicId, stepId) {
    const progress = this.get(topicId);
    if ((progress.completedSteps || []).includes(stepId) || progress.completed) return 'Completed';
    if (progress.activeStepId === stepId) return 'Reading';
    return 'Not Started';
  }
}

export function collectRelatedConcepts(texts, limit = 6) {
  const haystack = texts.join(' ').toLowerCase();
  const matches = [];
  for (const entry of GLOSSARY_BY_ID.values()) {
    if ([entry.term, ...entry.aliases].some(label => haystack.includes(label.toLowerCase()))) matches.push(entry);
  }
  return matches.slice(0, limit);
}
