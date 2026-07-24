import { APP_RELEASE_NAME, APP_VERSION, DEFAULT_TOPIC_ID, STORAGE_KEY } from './config.js';
import { PRACTICE_MODES } from './content/practice.js';
import { TOPICS } from './content/topics.js';
import { createTopicRegistry } from './core/topic-registry.js';
import { PRACTICE_RENDERERS } from './games/practice-games.js';
import { renderGlossaryArchive } from './learning/glossary-archive.js';
import { GLOSSARY } from './learning/glossary.js';
import { TUTORIALS } from './tutorials/content.js';
import { createTutorialRegistry } from './tutorials/tutorial-registry.js';
import { createTutorialRenderer } from './tutorials/tutorial-renderer.js';

export function createApp(document, window) {
  const $ = selector => document.querySelector(selector);
  const registry = createTopicRegistry(TOPICS);
  const tutorialRegistry = createTutorialRegistry(TUTORIALS);
  const defaultProgress = { visited: [], mastered: [], completedPractice: [], completedTutorials: [] };
  let currentTopicId = DEFAULT_TOPIC_ID;
  let currentPracticeId = null;
  let glossaryOpen = false;
  let progress = loadProgress();
  const tutorialRenderer = createTutorialRenderer({
    document,
    registry: tutorialRegistry,
    trigger: $('#tutorialBtn'),
    panel: $('#tutorialPanel'),
    backdrop: $('#tutorialBackdrop'),
    closeButton: $('#tutorialClose'),
    storage: window.localStorage,
    onComplete: completeTutorial,
    onPractice: selectRelatedPractice,
    onGlossary: selectGlossary
  });

  function loadProgress() {
    try {
      return { ...defaultProgress, ...JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}') };
    } catch (_) {
      return { ...defaultProgress };
    }
  }

  function saveProgress() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (_) {
      // Restricted previews may deny storage; the application remains usable.
    }
    renderStats();
  }

  function renderStats() {
    $('#visitedCount').textContent = progress.visited.length;
    $('#masteredCount').textContent = progress.mastered.length;
    $('#topicCount').textContent = registry.all().length;
  }

  function renderNavigation() {
    const practiceButtons = PRACTICE_MODES.map(mode => `
      <button class="algo-btn ${mode.id === currentPracticeId ? 'active' : ''}" data-practice="${mode.id}">
        <span>${mode.navTitle}</span><small>${progress.completedPractice.includes(mode.id) ? 'COMPLETE' : 'PLAY'}</small>
      </button>`).join('');
    const groups = registry.categories().map(category => {
      const buttons = registry.all()
        .filter(topic => topic.category === category)
        .map(topic => `
          <button class="algo-btn ${topic.id === currentTopicId ? 'active' : ''}" data-topic="${topic.id}">
            <span>${topic.navTitle}</span><small>${progress.completedTutorials.includes(topic.id) ? 'THEORY COMPLETE' : topic.category}</small>
          </button>`)
        .join('');
      return `<section class="nav-group"><div class="nav-title">${category}</div>${buttons}</section>`;
    }).join('');

    $('#topicNav').innerHTML = `
      <section class="nav-group knowledge-nav">
        <div class="nav-title">Knowledge tools</div>
        <button class="algo-btn ${glossaryOpen ? 'active' : ''}" data-glossary>
          <span>Glossary</span><small>${GLOSSARY.length} TERMS</small>
        </button>
      </section>
      <section class="nav-group practice-nav">
        <div class="nav-title">Interactive practice</div>
        ${practiceButtons}
      </section>
      ${groups}`;
    document.querySelectorAll('[data-topic]').forEach(button => {
      button.addEventListener('click', () => selectTopic(button.dataset.topic));
    });
    document.querySelectorAll('[data-practice]').forEach(button => {
      button.addEventListener('click', () => selectPractice(button.dataset.practice));
    });
    document.querySelector('[data-glossary]')?.addEventListener('click', () => selectGlossary());
  }

  function renderTopic(topic) {
    $('#topicTitle').textContent = topic.title;
    $('#topicSubtitle').textContent = topic.subtitle;
    $('#mobileTopicTitle').textContent = topic.navTitle;
    $('#missionTitle').textContent = topic.navTitle;
    $('#missionText').textContent = topic.summary;

    const mastered = progress.mastered.includes(topic.id);
    $('#board').innerHTML = `
      <div class="topic-overview">
        <div class="topic-card topic-card-wide">
          <span class="topic-kicker">${topic.category}</span>
          <h4>What you should be able to explain</h4>
          <ul>${topic.objectives.map(item => `<li>${item}</li>`).join('')}</ul>
        </div>
        <div class="topic-card">
          <span class="topic-kicker">Source map</span>
          <h4>Lecture material</h4>
          <ul class="source-list">${topic.sources.map(source => `<li>${source}</li>`).join('')}</ul>
        </div>
        <div class="topic-card">
          <span class="topic-kicker">Guided theory</span>
          <h4>${tutorialRegistry.get(topic.id).steps.length} tutorial steps</h4>
          <p>Work through the explanation, examples and understanding checks before applying the topic in interactive practice.</p>
        </div>
      </div>`;

    $('#controls').innerHTML = `
      <button class="btn primary" id="masteryBtn" type="button">
        ${mastered ? 'Marked as understood' : 'Mark as understood'}
      </button>`;
    $('#masteryBtn').addEventListener('click', () => toggleMastery(topic.id));
    $('#feedback').textContent = mastered
      ? 'This topic is currently marked as understood.'
      : 'Read the objectives and use the marker to track your preparation.';
    tutorialRenderer.syncTrigger(topic.id);
  }

  function selectTopic(id) {
    if (!registry.has(id)) return;
    currentTopicId = id;
    currentPracticeId = null;
    glossaryOpen = false;
    if (!progress.visited.includes(id)) {
      progress.visited = [...progress.visited, id];
      saveProgress();
    }
    renderNavigation();
    renderTopic(registry.get(id));
    closeMenu();
  }

  function selectPractice(id) {
    const mode = PRACTICE_MODES.find(entry => entry.id === id);
    if (!mode || !PRACTICE_RENDERERS[id]) return;
    currentPracticeId = id;
    currentTopicId = null;
    glossaryOpen = false;
    $('#topicTitle').textContent = mode.title;
    $('#topicSubtitle').textContent = mode.subtitle;
    $('#mobileTopicTitle').textContent = mode.navTitle;
    $('#missionTitle').textContent = mode.navTitle;
    $('#missionText').textContent = mode.summary;
    $('#tutorialBtn').hidden = true;
    renderNavigation();
    PRACTICE_RENDERERS[id]({
      board: $('#board'),
      controls: $('#controls'),
      feedback: $('#feedback'),
      onComplete: () => completePractice(id)
    });
    closeMenu();
  }

  function selectGlossary(entryId = null) {
    glossaryOpen = true;
    currentTopicId = null;
    currentPracticeId = null;
    $('#topicTitle').textContent = 'Distributed Systems Glossary';
    $('#topicSubtitle').textContent = 'Definitions, explanations and connections across the complete module.';
    $('#mobileTopicTitle').textContent = 'Glossary';
    $('#missionTitle').textContent = 'Concept archive';
    $('#missionText').textContent = 'Search the shared vocabulary behind every tutorial and follow its related concepts.';
    $('#tutorialBtn').hidden = true;
    renderNavigation();
    renderGlossaryArchive({
      document,
      board: $('#board'),
      controls: $('#controls'),
      feedback: $('#feedback'),
      topicLabels: new Map(registry.all().map(topic => [topic.id, topic.navTitle])),
      initialEntryId: entryId,
      onOpenTopic: selectTopic
    });
    closeMenu();
  }

  function completePractice(id) {
    if (!progress.completedPractice.includes(id)) {
      progress.completedPractice = [...progress.completedPractice, id];
      saveProgress();
      renderNavigation();
    }
  }

  function completeTutorial(topicId) {
    if (!progress.completedTutorials.includes(topicId)) {
      progress.completedTutorials = [...progress.completedTutorials, topicId];
      saveProgress();
      renderNavigation();
    }
  }

  function selectRelatedPractice(topicId) {
    const mapping = {
      time: 'clock-lab',
      sockets: 'message-flow',
      rmi: 'message-flow',
      rest: 'message-flow',
      jms: 'message-flow'
    };
    selectPractice(mapping[topicId] || 'concept-blitz');
  }

  function toggleMastery(id) {
    progress.mastered = progress.mastered.includes(id)
      ? progress.mastered.filter(topicId => topicId !== id)
      : [...progress.mastered, id];
    saveProgress();
    renderTopic(registry.get(id));
  }

  function openMenu() {
    $('#sidebar').classList.add('open');
    $('#navBackdrop').classList.add('show');
    $('#menuBtn').setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    $('#sidebar').classList.remove('open');
    $('#navBackdrop').classList.remove('show');
    $('#menuBtn').setAttribute('aria-expanded', 'false');
  }

  function start() {
    document.title = `Distributed Intelligence ${APP_VERSION} – ${APP_RELEASE_NAME}`;
    $('#appVersion').textContent = `${APP_VERSION} · ${APP_RELEASE_NAME}`;
    $('#menuBtn').addEventListener('click', openMenu);
    $('#closeMenuBtn').addEventListener('click', closeMenu);
    $('#navBackdrop').addEventListener('click', closeMenu);
    $('#tutorialBtn').addEventListener('click', () => {
      if (currentTopicId) tutorialRenderer.open(currentTopicId);
    });
    renderStats();
    selectTopic(DEFAULT_TOPIC_ID);
  }

  return Object.freeze({ start, selectTopic, selectPractice, selectGlossary, registry, tutorialRegistry, tutorialRenderer });
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  createApp(document, window).start();
}
