import { GLOSSARY, GLOSSARY_BY_ID } from './glossary.js';
import { element } from './components.js';

function normalize(value) {
  return value.toLocaleLowerCase('en').normalize('NFKD');
}

function searchableText(entry) {
  return normalize([
    entry.term,
    entry.definition,
    ...entry.details,
    ...entry.related,
    ...entry.aliases
  ].join(' '));
}

function relatedEntry(label) {
  const normalized = normalize(label);
  return GLOSSARY.find(entry =>
    normalize(entry.term) === normalized ||
    entry.aliases.some(alias => normalize(alias) === normalized)
  );
}

function createEntryCard(document, entry, topicLabels, onOpenTopic) {
  const card = element(document, 'article', 'glossary-card');
  card.dataset.glossaryEntry = entry.id;
  card.tabIndex = -1;

  const heading = element(document, 'div', 'glossary-card-head');
  const titleGroup = element(document, 'div');
  titleGroup.append(
    element(document, 'span', 'glossary-letter', entry.term.slice(0, 1).toUpperCase()),
    element(document, 'h4', '', entry.term)
  );
  const topic = element(document, 'button', 'glossary-topic-link', topicLabels.get(entry.topicId) || entry.topicId);
  topic.type = 'button';
  topic.dataset.glossaryTopic = entry.topicId;
  topic.addEventListener('click', () => onOpenTopic?.(entry.topicId));
  heading.append(titleGroup, topic);

  const definitionLabel = element(document, 'strong', 'glossary-field-label', 'Definition');
  const definition = element(document, 'p', 'glossary-definition', entry.definition);
  const details = element(document, 'details', 'glossary-explanation');
  const summary = element(document, 'summary', '', 'Explanation');
  const points = element(document, 'ul');
  entry.details.forEach(point => points.append(element(document, 'li', '', point)));
  details.append(summary, points);

  const related = element(document, 'div', 'glossary-card-related');
  related.append(element(document, 'strong', 'glossary-field-label', 'Related concepts'));
  const links = element(document, 'div', 'glossary-related-links');
  entry.related.forEach(label => {
    const target = relatedEntry(label);
    if (!target) {
      links.append(element(document, 'span', '', label));
      return;
    }
    const button = element(document, 'button', '', target.term);
    button.type = 'button';
    button.dataset.glossaryRelated = target.id;
    links.append(button);
  });
  related.append(links);
  card.append(heading, definitionLabel, definition, details, related);
  return card;
}

export function renderGlossaryArchive({
  document,
  board,
  controls,
  feedback,
  topicLabels = new Map(),
  initialEntryId = null,
  onOpenTopic
}) {
  const shell = element(document, 'section', 'glossary-archive');
  const intro = element(document, 'div', 'glossary-archive-intro');
  intro.append(
    element(document, 'span', 'topic-kicker', 'Central knowledge archive'),
    element(document, 'h4', '', 'Glossary'),
    element(document, 'p', '', 'Search every technical term used by the course. Each article combines a compact definition, a fuller explanation, related concepts and its source topic.')
  );

  const tools = element(document, 'div', 'glossary-tools');
  const searchLabel = element(document, 'label', 'glossary-search');
  searchLabel.append(element(document, 'span', '', 'Search terms'));
  const search = element(document, 'input');
  search.type = 'search';
  search.placeholder = 'e.g. Socket, Lamport, DTD…';
  search.autocomplete = 'off';
  search.dataset.glossarySearch = '';
  searchLabel.append(search);

  const topicLabel = element(document, 'label', 'glossary-filter');
  topicLabel.append(element(document, 'span', '', 'Topic'));
  const topicSelect = element(document, 'select');
  topicSelect.dataset.glossaryFilter = '';
  const allOption = element(document, 'option', '', 'All topics');
  allOption.value = '';
  topicSelect.append(allOption);
  const topicIds = [...new Set(GLOSSARY.map(entry => entry.topicId))]
    .sort((a, b) => (topicLabels.get(a) || a).localeCompare(topicLabels.get(b) || b));
  topicIds.forEach(topicId => {
    const option = element(document, 'option', '', topicLabels.get(topicId) || topicId);
    option.value = topicId;
    topicSelect.append(option);
  });
  topicLabel.append(topicSelect);
  tools.append(searchLabel, topicLabel);

  const summary = element(document, 'p', 'glossary-result-summary');
  summary.setAttribute('aria-live', 'polite');
  const list = element(document, 'div', 'glossary-list');
  const empty = element(document, 'div', 'glossary-empty', 'No glossary entries match this search.');
  empty.hidden = true;

  const cards = [...GLOSSARY]
    .sort((a, b) => a.term.localeCompare(b.term))
    .map(entry => {
      const card = createEntryCard(document, entry, topicLabels, onOpenTopic);
      card.dataset.searchText = searchableText(entry);
      list.append(card);
      return card;
    });

  function applyFilters({ focusEntryId = null } = {}) {
    const query = normalize(search.value.trim());
    const topicId = topicSelect.value;
    let visible = 0;
    cards.forEach(card => {
      const entry = GLOSSARY_BY_ID.get(card.dataset.glossaryEntry);
      const matches = (!query || card.dataset.searchText.includes(query)) && (!topicId || entry.topicId === topicId);
      card.hidden = !matches;
      if (matches) visible += 1;
    });
    summary.textContent = `${visible} of ${GLOSSARY.length} terms`;
    empty.hidden = visible !== 0;

    if (focusEntryId) {
      const target = list.querySelector(`[data-glossary-entry="${focusEntryId}"]`);
      if (target && !target.hidden) {
        target.classList.add('targeted');
        target.querySelector('details')?.setAttribute('open', '');
        target.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
        target.focus({ preventScroll: true });
      }
    }
  }

  list.addEventListener('click', event => {
    const relatedButton = event.target.closest?.('[data-glossary-related]');
    if (!relatedButton) return;
    cards.forEach(card => card.classList.remove('targeted'));
    search.value = '';
    topicSelect.value = '';
    applyFilters({ focusEntryId: relatedButton.dataset.glossaryRelated });
  });
  search.addEventListener('input', () => {
    cards.forEach(card => card.classList.remove('targeted'));
    applyFilters();
  });
  topicSelect.addEventListener('change', () => {
    cards.forEach(card => card.classList.remove('targeted'));
    applyFilters();
  });

  shell.append(intro, tools, summary, list, empty);
  board.replaceChildren(shell);
  controls.replaceChildren();
  feedback.textContent = 'Definitions and explanations come from the same glossary registry used by every tutorial popover.';
  applyFilters({ focusEntryId: initialEntryId });
  return Object.freeze({ search, topicSelect, applyFilters, cards });
}
