import { CLOCK_CHALLENGES, CONCEPT_QUESTIONS, JAVA_LAB_SNIPPETS, MESSAGE_FLOWS } from '../content/practice.js';
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

function normalizeJavaAnswer(value) {
  return value.trim().replace(/\s+/g, '');
}

export function mountJavaLab({ board, controls, feedback, onComplete }) {
  const document = board.ownerDocument;
  let index = 0;
  let solved = 0;
  let attempts = 0;
  let hintsUsed = 0;

  function acceptedAnswers(blank) {
    return [blank.answer, ...blank.alternatives].map(normalizeJavaAnswer);
  }

  function renderCode(snippet, code) {
    const blanks = new Map(snippet.blanks.map(blank => [blank.id, blank]));
    const parts = snippet.template.split(/\{\{([a-zA-Z][\w-]*)\}\}/g);
    parts.forEach((part, partIndex) => {
      if (partIndex % 2 === 0) {
        code.append(document.createTextNode(part));
        return;
      }
      const blank = blanks.get(part);
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'java-blank';
      input.dataset.javaBlank = part;
      input.autocomplete = 'off';
      input.spellcheck = false;
      input.setAttribute('aria-label', `${snippet.title}: ${blank.hint}`);
      input.style.setProperty('--answer-length', String(Math.max(4, blank.answer.length)));
      input.addEventListener('input', () => {
        code.querySelectorAll(`[data-java-blank="${part}"]`).forEach(peer => {
          if (peer !== input) peer.value = input.value;
          peer.classList.remove('correct', 'incorrect');
        });
      });
      code.append(input);
    });
  }

  function render() {
    const snippet = JAVA_LAB_SNIPPETS[index];
    const shell = document.createElement('section');
    shell.className = 'java-lab';
    const heading = document.createElement('div');
    heading.className = 'challenge-head';
    heading.innerHTML = `<span class="topic-kicker">${snippet.topic}</span><strong>Snippet ${index + 1} / ${JAVA_LAB_SNIPPETS.length}</strong>`;
    const title = document.createElement('h4');
    title.className = 'java-lab-title';
    title.textContent = snippet.title;
    const instruction = document.createElement('p');
    instruction.className = 'java-lab-instruction';
    instruction.textContent = snippet.instruction;
    const code = document.createElement('code');
    code.className = 'java-lab-code';
    renderCode(snippet, code);
    shell.append(heading, title, instruction, code);
    board.replaceChildren(shell);
    controls.innerHTML = '<button class="btn" id="javaHint" type="button">Show hint</button><button class="btn primary" id="checkJava" type="button">Check code</button>';
    setFeedback(feedback, 'Complete every highlighted gap, then check the snippet.');
    controls.querySelector('#checkJava').addEventListener('click', check);
    controls.querySelector('#javaHint').addEventListener('click', showHint);
    code.querySelector('.java-blank')?.focus();
  }

  function uniqueInputs() {
    const seen = new Set();
    return [...board.querySelectorAll('[data-java-blank]')].filter(input => {
      if (seen.has(input.dataset.javaBlank)) return false;
      seen.add(input.dataset.javaBlank);
      return true;
    });
  }

  function check() {
    attempts += 1;
    const snippet = JAVA_LAB_SNIPPETS[index];
    const blanks = new Map(snippet.blanks.map(blank => [blank.id, blank]));
    const inputs = uniqueInputs();
    const incorrect = [];
    inputs.forEach(input => {
      const blank = blanks.get(input.dataset.javaBlank);
      const correct = acceptedAnswers(blank).includes(normalizeJavaAnswer(input.value));
      board.querySelectorAll(`[data-java-blank="${blank.id}"]`).forEach(peer => {
        peer.classList.toggle('correct', correct);
        peer.classList.toggle('incorrect', !correct);
      });
      if (!correct) incorrect.push(blank);
    });

    if (incorrect.length) {
      setFeedback(feedback, `${incorrect.length} gap${incorrect.length === 1 ? '' : 's'} still need attention. Check the highlighted API names or use a hint.`, 'bad');
      board.querySelector('.java-blank.incorrect')?.focus();
      return;
    }

    solved += 1;
    board.querySelectorAll('.java-blank').forEach(input => { input.disabled = true; });
    setFeedback(feedback, `Correct. ${snippet.explanation}`, 'good');
    const finished = index === JAVA_LAB_SNIPPETS.length - 1;
    controls.innerHTML = `<button class="btn primary" id="nextJavaSnippet" type="button">${finished ? 'Show result' : 'Next snippet'}</button>`;
    controls.querySelector('#nextJavaSnippet').addEventListener('click', () => {
      if (!finished) {
        index += 1;
        render();
        return;
      }
      showResult();
    });
  }

  function showHint() {
    const snippet = JAVA_LAB_SNIPPETS[index];
    const target = uniqueInputs().find(input => !input.value.trim() || input.classList.contains('incorrect')) || uniqueInputs()[0];
    const blank = snippet.blanks.find(candidate => candidate.id === target.dataset.javaBlank);
    hintsUsed += 1;
    target.focus();
    setFeedback(feedback, `Hint for this gap: ${blank.hint}`, 'warn');
  }

  function showResult() {
    board.innerHTML = `
      <div class="result-panel">
        <span class="result-score">${solved} / ${JAVA_LAB_SNIPPETS.length}</span>
        <h4>Java Lab complete</h4>
        <p>You completed the essential API patterns in ${attempts} check${attempts === 1 ? '' : 's'} and used ${hintsUsed} hint${hintsUsed === 1 ? '' : 's'}.</p>
      </div>`;
    controls.innerHTML = '<button class="btn primary" id="restartJavaLab" type="button">Practice again</button>';
    controls.querySelector('#restartJavaLab').addEventListener('click', () => {
      index = 0;
      solved = 0;
      attempts = 0;
      hintsUsed = 0;
      render();
    });
    setFeedback(feedback, 'Round complete. Repeat the lab until the API patterns become automatic.', 'good');
    onComplete(solved, JAVA_LAB_SNIPPETS.length);
  }

  render();
}

export const PRACTICE_RENDERERS = Object.freeze({
  'concept-blitz': mountConceptBlitz,
  'clock-lab': mountClockLab,
  'message-flow': mountMessageFlow,
  'java-lab': mountJavaLab,
  'exam-mode': mountExamMode
});
