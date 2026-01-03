let questions = [];
let index = 0;
let score = 0;
let timeLeft = QUIZ_CONFIG.TIME_LIMIT;
let timer;
let userAnswers = [];

const container = document.getElementById("quiz-container");
const navContainer = document.getElementById("questionNav");

/* ---------------- QUIT / NAV ---------------- */
function quitTest() {
  if (confirm("Are you sure you want to quit the test?")) {
    window.location.href = "./index.html";
  }
}

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
  }
}

/* ---------------- LOAD QUESTIONS ---------------- */
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

/* ---------------- TIMER ---------------- */
function startTimer() {
  timer = setInterval(() => {
    timeLeft--;

    document.getElementById("time").innerText =
      `${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`;

    if (timeLeft <= 0) finishMock();
  }, 1000);
}

/* ---------------- QUESTION NAV GRID ---------------- */
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

/* ---------------- SHOW QUESTION ---------------- */
function showQuestion() {
  const q = questions[index];
  const letters = ["A", "B", "C", "D"];

  let html = `<h3>Q${index + 1}. ${q.question}</h3>`;

  q.options.forEach((opt, i) => {
    let cls = "option";

    if (userAnswers[index] !== undefined) {
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

  if (QUIZ_CONFIG.MODE === "practice" && userAnswers[index] !== undefined) {
    html += `<p><b>Explanation:</b> ${q.explanation || ""}</p>`;
  }

  container.innerHTML = html;
  renderQuestionNav();
}

/* ---------------- ANSWER ---------------- */
function answer(i) {
  if (userAnswers[index] !== undefined) return; // prevent re-answer

  userAnswers[index] = i;

  if (QUIZ_CONFIG.MODE === "mock" && i === questions[index].correctAnswer) {
    score++;
  }

  showQuestion();
}

/* ---------------- FINISH MOCK ---------------- */
function finishMock() {
  clearInterval(timer);

  localStorage.setItem("mockResult", JSON.stringify({
    score,
    total: questions.length,
    percent: Math.round((score / questions.length) * 100),
    questions,
    userAnswers
  }));

  window.location.href = "./result.html";
}
// 👇 expose functions to HTML buttons
window.nextQuestion = nextQuestion;
window.prevQuestion = prevQuestion;
window.quitTest = quitTest;
window.answer = answer;
