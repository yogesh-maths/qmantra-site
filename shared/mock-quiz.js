let questions = [];
let index = 0;
let score = 0;
let timeLeft = QUIZ_CONFIG.TIME_LIMIT;
let timer;
let userAnswers = [];

const container = document.getElementById("quiz-container");
const navContainer = document.getElementById("questionNav");

/* ---------------- LOAD QUESTIONS ---------------- */
fetch(QUIZ_CONFIG.DATA_URL)
  .then(res => res.json())
  .then(data => {
    questions = data.slice(0, QUIZ_CONFIG.TOTAL_QUESTIONS);
    userAnswers = new Array(questions.length);
    if (QUIZ_CONFIG.MODE === "mock") startTimer();
    renderQuestionNav();
    showQuestion();
  });

/* ---------------- TIMER ---------------- */
function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    const m = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const s = String(timeLeft % 60).padStart(2, "0");
    document.getElementById("time").innerText = `${m}:${s}`;

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
      renderQuestionNav();
    };

    navContainer.appendChild(btn);
  });
}

/* ---------------- SHOW QUESTION ---------------- */
function showQuestion() {
  const q = questions[index];

  renderQuestionNav();

  container.innerHTML = `
    <h3>Q${index + 1}. ${q.question}</h3>
    ${q.options
      .map(
        (o, i) =>
          `<button onclick="answer(${i})">${o}</button>`
      )
      .join("")}
    <div id="explain"></div>
  `;
}

/* ---------------- ANSWER ---------------- */
function answer(i) {
  const q = questions[index];

  userAnswers[index] = i;

  if (i === q.correctAnswer) score++;

  if (QUIZ_CONFIG.MODE === "practice") {
    document.getElementById("explain").innerHTML = `
      <p><b>Correct:</b> ${q.options[q.correctAnswer]}</p>
      <p>${q.explanation || ""}</p>
    `;
  }

  if (QUIZ_CONFIG.MODE === "practice") {
    setTimeout(() => {
      if (index < questions.length - 1) {
        index++;
        showQuestion();
      }
    }, 1000);
  } else {
    // mock mode: stay on same question until user navigates
    renderQuestionNav();
  }
}

/* ---------------- FINISH MOCK ---------------- */
function finishMock() {
  clearInterval(timer);

  const result = {
    score,
    total: questions.length,
    percent: Math.round((score / questions.length) * 100),
    questions,
    userAnswers
  };

  localStorage.setItem("mockResult", JSON.stringify(result));

  if (QUIZ_CONFIG.MODE === "mock") {
    window.location.href = "./result.html";
  }
}
