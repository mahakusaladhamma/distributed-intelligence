import { EXAM_DURATION_MINUTES, EXAM_TASKS, scoreExam } from '../content/exam.js';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export function mountExamMode({ board, controls, feedback, onComplete }) {
  let phase = 'intro';
  let index = 0;
  let answers = {};
  let remainingSeconds = EXAM_DURATION_MINUTES * 60;
  let timerId = null;

  function stopTimer() {
    if (timerId !== null) clearInterval(timerId);
    timerId = null;
  }

  function renderIntro() {
    phase = 'intro';
    stopTimer();
    board.innerHTML = `
      <div class="exam-intro">
        <span class="topic-kicker">v0.4 mixed exam</span>
        <h4>${EXAM_DURATION_MINUTES} minutes · ${EXAM_TASKS.length} tasks · ${EXAM_TASKS.reduce((sum, task) => sum + task.points, 0)} points</h4>
        <p>The exam combines theory, Java code completion, TCP/UDP and HTTP analysis, and XML validation against a supplied DTD.</p>
        <ul>
          <li>No correctness feedback is shown before submission.</li>
          <li>You can move between tasks and revise answers.</li>
          <li>The final review includes the expected answer and explanation.</li>
        </ul>
      </div>`;
    controls.innerHTML = '<button class="btn primary" id="startExam" type="button">Start exam</button>';
    controls.querySelector('#startExam').addEventListener('click', startExam);
    feedback.textContent = 'Start when you are ready. The timer begins with the first task.';
    feedback.className = 'feedback';
  }

  function renderTask() {
    const task = EXAM_TASKS[index];
    const saved = answers[task.id];
    const answerMarkup = task.type === 'choice'
      ? `<div class="answer-grid">${task.options.map((option, optionIndex) => `
          <button class="answer-option ${Number(saved) === optionIndex ? 'selected' : ''}" type="button" data-exam-answer="${optionIndex}">
            <span class="option-key">${String.fromCharCode(65 + optionIndex)}</span><span>${escapeHtml(option)}</span>
          </button>`).join('')}</div>`
      : `<label class="exam-input-label" for="examInput">Your completion</label>
         <input class="exam-input" id="examInput" type="text" autocomplete="off"
           placeholder="${escapeHtml(task.placeholder)}" value="${escapeHtml(saved ?? '')}">`;

    board.innerHTML = `
      <div class="exam-toolbar">
        <span class="exam-counter">Task ${index + 1} / ${EXAM_TASKS.length}</span>
        <strong class="exam-timer" id="examTimer">${formatTime(remainingSeconds)}</strong>
      </div>
      <div class="challenge-head">
        <span class="topic-kicker">${escapeHtml(task.section)}</span>
        <strong>${task.points} point${task.points === 1 ? '' : 's'}</strong>
      </div>
      <h4 class="challenge-prompt">${escapeHtml(task.prompt)}</h4>
      ${task.code ? `<pre class="exam-code"><code>${escapeHtml(task.code)}</code></pre>` : ''}
      ${answerMarkup}
      <div class="exam-map" aria-label="Exam task navigation">
        ${EXAM_TASKS.map((entry, taskIndex) => `<button type="button" data-exam-task="${taskIndex}"
          class="${taskIndex === index ? 'current' : ''} ${answers[entry.id] !== undefined && answers[entry.id] !== '' ? 'answered' : ''}"
          aria-label="Task ${taskIndex + 1}">${taskIndex + 1}</button>`).join('')}
      </div>`;

    controls.innerHTML = `
      <button class="btn" id="previousExamTask" type="button" ${index === 0 ? 'disabled' : ''}>Previous</button>
      ${index === EXAM_TASKS.length - 1
        ? '<button class="btn primary" id="submitExam" type="button">Submit exam</button>'
        : '<button class="btn primary" id="nextExamTask" type="button">Next task</button>'}`;
    feedback.textContent = `${Object.values(answers).filter(value => value !== '').length} of ${EXAM_TASKS.length} tasks answered.`;
    feedback.className = 'feedback';

    board.querySelectorAll('[data-exam-answer]').forEach(button => {
      button.addEventListener('click', () => {
        answers[task.id] = Number(button.dataset.examAnswer);
        renderTask();
      });
    });
    board.querySelector('#examInput')?.addEventListener('input', event => {
      answers[task.id] = event.target.value;
      feedback.textContent = `${Object.values(answers).filter(value => value !== '').length} of ${EXAM_TASKS.length} tasks answered.`;
    });
    board.querySelectorAll('[data-exam-task]').forEach(button => {
      button.addEventListener('click', () => {
        index = Number(button.dataset.examTask);
        renderTask();
      });
    });
    controls.querySelector('#previousExamTask')?.addEventListener('click', () => {
      index -= 1;
      renderTask();
    });
    controls.querySelector('#nextExamTask')?.addEventListener('click', () => {
      index += 1;
      renderTask();
    });
    controls.querySelector('#submitExam')?.addEventListener('click', finishExam);
  }

  function startExam() {
    phase = 'running';
    index = 0;
    answers = {};
    remainingSeconds = EXAM_DURATION_MINUTES * 60;
    timerId = setInterval(() => {
      remainingSeconds -= 1;
      const timer = board.querySelector('#examTimer');
      if (timer) timer.textContent = formatTime(Math.max(0, remainingSeconds));
      if (remainingSeconds <= 0) finishExam();
    }, 1000);
    timerId?.unref?.();
    renderTask();
  }

  function finishExam() {
    if (phase !== 'running') return;
    phase = 'review';
    stopTimer();
    const score = scoreExam(EXAM_TASKS, answers);
    const percentage = Math.round((score.earned / score.possible) * 100);
    board.innerHTML = `
      <div class="result-panel exam-result">
        <span class="result-score">${score.earned} / ${score.possible}</span>
        <h4>${percentage}% in the mixed exam</h4>
        <p>${EXAM_TASKS.filter(task => answers[task.id] === undefined || answers[task.id] === '').length} task(s) were left unanswered.</p>
      </div>
      <div class="exam-review">
        ${EXAM_TASKS.map((task, taskIndex) => {
          const result = score.results[taskIndex];
          const given = task.type === 'choice'
            ? (task.options[Number(answers[task.id])] ?? 'No answer')
            : (answers[task.id] || 'No answer');
          const expected = task.type === 'choice' ? task.options[task.answer] : task.answerLabel;
          return `<article class="review-card ${result.correct ? 'correct' : 'incorrect'}">
            <div><span>${taskIndex + 1}. ${escapeHtml(task.section)}</span><strong>${result.earned}/${result.possible}</strong></div>
            <h5>${escapeHtml(task.prompt)}</h5>
            <p><b>Your answer:</b> ${escapeHtml(given)}</p>
            <p><b>Expected:</b> ${escapeHtml(expected)}</p>
            <p>${escapeHtml(task.explanation)}</p>
          </article>`;
        }).join('')}
      </div>`;
    controls.innerHTML = '<button class="btn primary" id="restartExam" type="button">Start a new attempt</button>';
    controls.querySelector('#restartExam').addEventListener('click', renderIntro);
    feedback.textContent = 'Exam submitted. Review each task before starting another attempt.';
    feedback.className = `feedback ${percentage >= 50 ? 'good' : 'bad'}`;
    onComplete(score.earned, score.possible);
  }

  renderIntro();
}
