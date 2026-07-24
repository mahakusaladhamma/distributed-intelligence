import { CLOCK_CHALLENGES, CONCEPT_QUESTIONS, MESSAGE_FLOWS } from '../content/practice.js';
import { mountExamMode } from './exam-mode.js';

function setFeedback(element, message, state = '') {
  element.className = `feedback ${state}`.trim();
  element.textContent = message;
}

function optionButtons(options) {
  return options.map((option, index) => `
    <button class="answer-option" type="button" data-answer="${index}">
      <span class="option-key">${String.fromCharCode(65 + index)}</span>
      <span>${option}</span>
    </button>`).join('');
}

function createChoiceGame({ questions, board, controls, feedback, progressLabel, onComplete }) {
  let index = 0;
  let correct = 0;
  let answered = false;

  function render() {
    const question = questions[index];
    board.innerHTML = `
      <div class="challenge-head">
        <span class="topic-kicker">${question.topic || question.type}</span>
        <strong>${progressLabel} ${index + 1} / ${questions.length}</strong>
      </div>
      <h4 class="challenge-prompt">${question.prompt}</h4>
      <div class="answer-grid">${optionButtons(question.options)}</div>`;
    controls.innerHTML = '';
    setFeedback(feedback, 'Choose the best answer. You receive the explanation immediately.');
    answered = false;

    board.querySelectorAll('[data-answer]').forEach(button => {
      button.addEventListener('click', () => answer(Number(button.dataset.answer)));
    });
  }

  function answer(selected) {
    if (answered) return;
    answered = true;
    const question = questions[index];
    const isCorrect = selected === question.answer;
    if (isCorrect) correct += 1;

    board.querySelectorAll('[data-answer]').forEach((button, buttonIndex) => {
      button.disabled = true;
      if (buttonIndex === question.answer) button.classList.add('correct');
      if (buttonIndex === selected && !isCorrect) button.classList.add('incorrect');
    });
    setFeedback(
      feedback,
      `${isCorrect ? 'Correct.' : 'That distinction needs another pass.'} ${question.explanation}`,
      isCorrect ? 'good' : 'bad'
    );

    const finished = index === questions.length - 1;
    controls.innerHTML = `<button class="btn primary" id="nextChallenge" type="button">${finished ? 'Show result' : 'Next challenge'}</button>`;
    controls.querySelector('#nextChallenge').addEventListener('click', () => {
      if (finished) {
        board.innerHTML = `
          <div class="result-panel">
            <span class="result-score">${correct} / ${questions.length}</span>
            <h4>Round complete</h4>
            <p>${correct === questions.length ? 'Every distinction was correct.' : 'Repeat the round to strengthen the explanations you missed.'}</p>
          </div>`;
        controls.innerHTML = '<button class="btn primary" id="restartGame" type="button">Play again</button>';
        controls.querySelector('#restartGame').addEventListener('click', () => {
          index = 0;
          correct = 0;
          render();
        });
        onComplete(correct, questions.length);
        return;
      }
      index += 1;
      render();
    });
  }

  render();
}

export function mountConceptBlitz(context) {
  createChoiceGame({
    ...context,
    questions: CONCEPT_QUESTIONS,
    progressLabel: 'Question'
  });
}

export function mountClockLab(context) {
  createChoiceGame({
    ...context,
    questions: CLOCK_CHALLENGES,
    progressLabel: 'Scenario'
  });
}

export function mountMessageFlow({ board, controls, feedback, onComplete }) {
  let flowIndex = 0;
  let remaining = [];
  let chosen = [];
  let mistakes = 0;

  function shuffled(values) {
    return [...values].sort((left, right) => {
      const leftScore = (left.length * 17 + left.charCodeAt(0)) % 23;
      const rightScore = (right.length * 17 + right.charCodeAt(0)) % 23;
      return leftScore - rightScore;
    });
  }

  function render() {
    const flow = MESSAGE_FLOWS[flowIndex];
    if (remaining.length === 0 && chosen.length === 0) remaining = shuffled(flow.steps);
    board.innerHTML = `
      <div class="challenge-head">
        <span class="topic-kicker">Flow ${flowIndex + 1} / ${MESSAGE_FLOWS.length}</span>
        <strong>${flow.title}</strong>
      </div>
      <p class="flow-description">${flow.description}</p>
      <div class="flow-layout">
        <div>
          <span class="flow-label">Available steps</span>
          <div class="step-pool">
            ${remaining.map((step, index) => `<button type="button" class="flow-step" data-step="${index}">${step}</button>`).join('')}
          </div>
        </div>
        <div>
          <span class="flow-label">Your sequence</span>
          <ol class="chosen-flow">
            ${chosen.map(step => `<li>${step}</li>`).join('') || '<li class="placeholder">Choose the first step</li>'}
          </ol>
        </div>
      </div>`;
    controls.innerHTML = chosen.length
      ? '<button class="btn" id="undoStep" type="button">Undo last step</button>'
      : '';
    board.querySelectorAll('[data-step]').forEach(button => {
      button.addEventListener('click', () => chooseStep(Number(button.dataset.step)));
    });
    controls.querySelector('#undoStep')?.addEventListener('click', undoStep);
  }

  function chooseStep(index) {
    const flow = MESSAGE_FLOWS[flowIndex];
    const step = remaining[index];
    if (step !== flow.steps[chosen.length]) {
      mistakes += 1;
      setFeedback(feedback, `That step occurs later. First determine what must happen before “${step}”.`, 'bad');
      return;
    }
    chosen.push(step);
    remaining.splice(index, 1);
    setFeedback(feedback, `Correct. ${flow.steps.length - chosen.length} step${flow.steps.length - chosen.length === 1 ? '' : 's'} remaining.`, 'good');

    if (chosen.length === flow.steps.length) {
      const finished = flowIndex === MESSAGE_FLOWS.length - 1;
      render();
      controls.innerHTML = `<button class="btn primary" id="nextFlow" type="button">${finished ? 'Show result' : 'Next flow'}</button>`;
      controls.querySelector('#nextFlow').addEventListener('click', () => {
        if (finished) {
          board.innerHTML = `
            <div class="result-panel">
              <span class="result-score">${MESSAGE_FLOWS.length} flows</span>
              <h4>All message paths reconstructed</h4>
              <p>${mistakes === 0 ? 'You completed every sequence without a misplaced step.' : `${mistakes} misplaced step${mistakes === 1 ? '' : 's'} occurred across the round.`}</p>
            </div>`;
          controls.innerHTML = '<button class="btn primary" id="restartGame" type="button">Play again</button>';
          controls.querySelector('#restartGame').addEventListener('click', restart);
          onComplete(Math.max(0, MESSAGE_FLOWS.length - mistakes), MESSAGE_FLOWS.length);
          return;
        }
        flowIndex += 1;
        remaining = [];
        chosen = [];
        setFeedback(feedback, 'Choose the first required step.');
        render();
      });
      return;
    }
    render();
  }

  function undoStep() {
    remaining.push(chosen.pop());
    setFeedback(feedback, 'Last step returned to the pool.', 'warn');
    render();
  }

  function restart() {
    flowIndex = 0;
    remaining = [];
    chosen = [];
    mistakes = 0;
    setFeedback(feedback, 'Choose the first required step.');
    render();
  }

  setFeedback(feedback, 'Choose the steps in the order in which they occur.');
  render();
}

export const PRACTICE_RENDERERS = Object.freeze({
  'concept-blitz': mountConceptBlitz,
  'clock-lab': mountClockLab,
  'message-flow': mountMessageFlow,
  'exam-mode': mountExamMode
});
