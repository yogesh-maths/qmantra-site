let questions = [];
let currentIndex = 0;
let score = 0;
let timer;
let timeLeft = QUIZ_CONFIG.TIME_LIMIT;

const quizContainer = document.getElementById("quiz-container");
const timeEl = document.getElementById("time");

/* ---------- TIMER ---------- */
function startTimer() {
  timer = setInterval(() => {
    timeLeft--;

    const min = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const sec = String(timeLeft % 60).padStart(2, "0");
    timeEl.textContent = `${min}:${sec}`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      showResult();
    }
  }, 1000);
}

/* ---------- LOAD DATA ---------- */
fetch(QUIZ_CONFIG.DATA_URL)
  .then(res => res.json())
  .then(data => {
    questions = data.slice(0, QUIZ_CONFIG.TOTAL_QUESTIONS);
    startTimer();
    showQuestion();
  })
  .catch(() => {
    quizContainer.innerHTML = "<p>Failed to load quiz</p>";
  });

/* ---------- SHOW QUESTION ---------- */
function showQuestion() {
  const q = questions[currentIndex];

  quizContainer.innerHTML = `
    <div class="question-box">
      <h3>Q${currentIndex + 1}. ${q.question}</h3>
      <div class="options">
        ${q.options.map((opt, i) =>
          `<button onclick="selectOption(${i})">${opt}</button>`
        ).join("")}
      </div>
    </div>
  `;
}

/* ---------- ANSWER ---------- */
function selectOption(index) {
  const q = questions[currentIndex];
  if (index === q.correctAnswer) score++;

  currentIndex++;
  if (currentIndex < questions.length) {
    showQuestion();
  } else {
    clearInterval(timer);
    showResult();
  }
}

/* ---------- RESULT ---------- */
function showResult() {
  quizContainer.innerHTML = `
    <div class="result-box">
      <h2>Mock Test Completed</h2>
      <p>Score: <strong>${score} / ${questions.length}</strong></p>
      <p>Percentage: <strong>${Math.round((score / questions.length) * 100)}%</strong></p>
      <a href="/qmantra-site/maths/" class="btn">Back to Maths</a>
    </div>
  `;
}
