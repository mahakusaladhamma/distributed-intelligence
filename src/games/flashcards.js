import { FLASHCARDS } from '../content/practice.js';

const STORAGE_KEY = 'distributedIntelligenceFlashcardProgress';
const LEVELS = Object.freeze({
  again: Object.freeze({ value: 0, label: 'Again', delay: 0 }),
  learning: Object.freeze({ value: 1, label: 'Learning', delay: 10 * 60 * 1000 }),
  mastered: Object.freeze({ value: 2, label: 'Mastered', delay: 3 * 24 * 60 * 60 * 1000 })
});

function defaultCardState() {
  return { level: 0, reviews: 0, dueAt: 0, updatedAt: 0 };
}

function readProgress(storage) {
  try {
    const value = JSON.parse(storage.getItem(STORAGE_KEY) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch (_) {
    return {};
  }
}

function writeProgress(storage, progress) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (_) {
    // The deck remains usable when storage is unavailable.
  }
}

export function mountFlashcards({ board, controls, feedback, storage, onComplete }) {
  const document = board.ownerDocument;
  const remaining = new Set(FLASHCARDS.map(card => card.id));
  let progress = readProgress(storage);
  let activeCard = null;
  let revealed = false;
  let reviewedThisRound = 0;

  function stateFor(cardId) {
    const saved = progress[cardId];
    if (!saved || !Number.isInteger(saved.level) || saved.level < 0 || saved.level > 2) return defaultCardState();
    return { ...defaultCardState(), ...saved };
  }

  function chooseNextCard() {
    const now = Date.now();
    return FLASHCARDS
      .filter(card => remaining.has(card.id))
      .sort((left, right) => {
        const a = stateFor(left.id);
        const b = stateFor(right.id);
        const aDue = a.dueAt <= now ? 0 : 1;
        const bDue = b.dueAt <= now ? 0 : 1;
        return aDue - bDue || a.level - b.level || a.reviews - b.reviews || a.updatedAt - b.updatedAt;
      })[0];
  }

  function levelCounts() {
    const counts = [0, 0, 0];
    FLASHCARDS.forEach(card => { counts[stateFor(card.id).level] += 1; });
    return counts;
  }

  function renderStats(shell) {
    const [again, learning, mastered] = levelCounts();
    const stats = document.createElement('div');
    stats.className = 'flashcard-stats';
    stats.innerHTML = `
      <span class="again"><strong>${again}</strong> Again</span>
      <span class="learning"><strong>${learning}</strong> Learning</span>
      <span class="mastered"><strong>${mastered}</strong> Mastered</span>`;
    shell.append(stats);
  }

  function render() {
    activeCard = chooseNextCard();
    revealed = false;
    if (!activeCard) {
      renderResult();
      return;
    }
    const state = stateFor(activeCard.id);
    const shell = document.createElement('section');
    shell.className = 'flashcard-lab';
    renderStats(shell);

    const meta = document.createElement('div');
    meta.className = 'challenge-head';
    meta.innerHTML = `<span class="topic-kicker">${activeCard.topic}</span><strong>${reviewedThisRound + 1} / ${FLASHCARDS.length}</strong>`;
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'flashcard';
    card.dataset.flashcard = activeCard.id;
    card.setAttribute('aria-label', 'Reveal flashcard answer');
    card.innerHTML = `
      <span class="flashcard-stage">Current stage: ${['Again', 'Learning', 'Mastered'][state.level]}</span>
      <span class="flashcard-side">Question</span>
      <strong>${activeCard.front}</strong>
      <span class="flashcard-prompt">Recall the answer, then reveal the card.</span>`;
    card.addEventListener('click', reveal);
    shell.append(meta, card);
    board.replaceChildren(shell);
    controls.innerHTML = '<button class="btn primary" id="revealFlashcard" type="button">Reveal answer</button>';
    controls.querySelector('#revealFlashcard').addEventListener('click', reveal);
    feedback.className = 'feedback';
    feedback.textContent = 'Lower stages and due cards are shown first. Rate your recall honestly after revealing the answer.';
  }

  function reveal() {
    if (revealed) return;
    revealed = true;
    const card = board.querySelector('.flashcard');
    card.classList.add('revealed');
    card.setAttribute('aria-label', 'Flashcard answer');
    card.innerHTML = `
      <span class="flashcard-stage">${activeCard.topic}</span>
      <span class="flashcard-side">Answer</span>
      <strong>${activeCard.back}</strong>
      <span class="flashcard-prompt">Choose the stage that matches your recall.</span>`;
    controls.innerHTML = `
      <button class="btn bad flashcard-rating" data-flashcard-rating="again" type="button">Again <small>highest priority</small></button>
      <button class="btn flashcard-rating" data-flashcard-rating="learning" type="button">Learning <small>review soon</small></button>
      <button class="btn good flashcard-rating" data-flashcard-rating="mastered" type="button">Mastered <small>low priority</small></button>`;
    controls.querySelectorAll('[data-flashcard-rating]').forEach(button => {
      button.addEventListener('click', () => rate(button.dataset.flashcardRating));
    });
    feedback.className = 'feedback warn';
    feedback.textContent = 'Again resets the card, Learning schedules a short review, and Mastered moves it to long-term review.';
  }

  function rate(rating) {
    const choice = LEVELS[rating];
    if (!choice || !activeCard) return;
    const previous = stateFor(activeCard.id);
    const now = Date.now();
    progress = {
      ...progress,
      [activeCard.id]: {
        level: choice.value,
        reviews: previous.reviews + 1,
        dueAt: now + choice.delay,
        updatedAt: now
      }
    };
    writeProgress(storage, progress);
    remaining.delete(activeCard.id);
    reviewedThisRound += 1;
    render();
  }

  function renderResult() {
    const [again, learning, mastered] = levelCounts();
    board.innerHTML = `
      <div class="result-panel">
        <span class="result-score">${mastered} mastered</span>
        <h4>Flashcard round complete</h4>
        <p>${again} cards need repetition, ${learning} are being learned and ${mastered} are currently mastered.</p>
      </div>`;
    controls.innerHTML = '<button class="btn primary" id="restartFlashcards" type="button">Review another round</button>';
    controls.querySelector('#restartFlashcards').addEventListener('click', () => {
      FLASHCARDS.forEach(card => remaining.add(card.id));
      reviewedThisRound = 0;
      render();
    });
    feedback.className = 'feedback good';
    feedback.textContent = 'Your three-stage deck has been saved locally. The next round will prioritize weak and due cards.';
    onComplete(mastered, FLASHCARDS.length);
  }

  render();
}

export { LEVELS as FLASHCARD_LEVELS, STORAGE_KEY as FLASHCARD_STORAGE_KEY };
