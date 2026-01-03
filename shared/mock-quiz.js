/* ===============================
   STATE
================================ */
let questions = [];
let index = 0;
let score = 0;
let timeLeft = QUIZ_CONFIG.TIME_LIMIT || 0;
let timer;
let userAnswers = [];

/* ===============================
   ELEMENTS
================================ */
const container = document.getElementById("quiz-container");
const navContainer = document.getElementById("questionNav");

/* ===============================
   LOAD QUESTIONS
================================ */
fetch(QUIZ_CONFIG.DATA_URL)
  .then(res => res.json())
  .then(data => {
    questions = data.slice(0, QUIZ_CONFIG.TOTAL_QUESTIONS);
    userAnswers = new Array(questions.length);

    if (QUIZ_CONFIG.MODE === "mock") startTimer();

    index = 0;
    renderQuestionNav();
    showQuestion();
  })
  .catch(err => {
    container.innerHTML = "<p>Failed to load questions</p>";
    console.error(err);
  });

/* ===============================
   TIMER (MOCK ONLY)
================================ */
function startTimer() {
  timer = setInterval(() => {
    timeLeft--;

    const m = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const s = String(timeLeft % 60).padStart(2, "0");
    document.getElementById("time").innerText = `${m}:${s}`;

    if (timeLeft <= 0) finishMock();
  }, 1000);
}

/* ===============================
   QUESTION NAV GRID
================================ */
function renderQuestionNav() {
  if (!navContainer) return;

  navContainer.innerHTML = "";

  questions.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.innerText = i + 1;
    btn.className = "q-num";

    if (i === index) btn.classList.add("q-current");
    else if (userAnswers[i] !== undefined) btn.classList.add("q-answered");
    else btn.classList.add("q-not-visited");

    btn.onclick = () => {
      index = i;
      showQuestion();
    };

    navContainer.appendChild(btn);
  });
}

/* ===============================
   SHOW QUESTION
================================ */
function showQuestion() {
  const q = questions[index];
  const letters = ["A", "B", "C", "D"];

  let html = `<h3>Q${index + 1}. ${q.question}</h3>`;

  q.options.forEach((opt, i) => {
    let cls = "option";

    /* ✅ SHOW ANSWER ONLY IN PRACTICE MODE */
    if (
      QUIZ_CONFIG.MODE === "practice" &&
      userAnswers[index] !== undefined
    ) {
      if (i === q.correctAnswer) cls += " correct";
      else if (i === userAnswers[index]) cls += " wrong";
    }

    html += `
      <div class="${cls}" onclick="answer(${i})">
        <div class="option-label">${letters[i]}</div>
        <div>${opt}</div>
      </div>
    `;
  });

  /* ✅ EXPLANATION ONLY IN PRACTICE */
  if (
    QUIZ_CONFIG.MODE === "practice" &&
    userAnswers[index] !== undefined
  ) {
    html += `<p class="explanation"><b>Explanation:</b> ${q.explanation || ""}</p>`;
  }

  container.innerHTML = html;
  renderQuestionNav();
}

/* ===============================
   ANSWER
================================ */
function answer(i) {
  if (userAnswers[index] !== undefined) return;

  userAnswers[index] = i;

  if (QUIZ_CONFIG.MODE === "mock" && i === questions[index].correctAnswer) {
    score++;
  }

  showQuestion(); // ❌ no result shown here
}

/* ===============================
   NAV BUTTONS
================================ */
function prevQuestion() {
  if (index > 0) {
    index--;
    showQuestion();
  }
}

function nextQuestion() {
  if (index < questions.length - 1) {
    index++;
    showQuestion();
  } else {
    finishMock();
  }
}

/* ===============================
   QUIT / FINISH
================================ */
function quitTest() {
  if (confirm("Are you sure you want to quit the test?")) {
    finishMock();
  }
}

function finishMock() {
  clearInterval(timer);

  const attempted = userAnswers.filter(a => a !== undefined).length;

  localStorage.setItem("mockResult", JSON.stringify({
    score,
    total: questions.length,
    attempted,
    percent: Math.round((score / questions.length) * 100),
    questions,
    userAnswers
  }));

  window.location.href = "./result.html";
}

/* ===============================
   EXPOSE FUNCTIONS
================================ */
window.answer = answer;
window.nextQuestion = nextQuestion;
window.prevQuestion = prevQuestion;
window.quitTest = quitTest;
