let questions = [];
let index = 0;
let score = 0;
let timeLeft = QUIZ_CONFIG.TIME_LIMIT;
let timer;
let userAnswers = [];

const container = document.getElementById("quiz-container");
const navContainer = document.getElementById("questionNav");

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

function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("time").innerText =
      `${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`;

    if (timeLeft <= 0) finishMock();
  }, 1000);
}

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

function showQuestion() {
  const q = questions[index];

  container.innerHTML = `
    <h3>Q${index + 1}. ${q.question}</h3>
    ${q.options.map((o, i) =>
      `<button onclick="answer(${i})">${o}</button>`
    ).join("")}
  `;

  renderQuestionNav();
}

function answer(i) {
  userAnswers[index] = i;
  if (i === questions[index].correctAnswer) score++;
  renderQuestionNav();
}

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
