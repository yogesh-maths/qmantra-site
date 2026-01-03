let questions = [];
let index = 0;
let score = 0;
let timeLeft = QUIZ_CONFIG.TIME_LIMIT;
let timer;
let userAnswers = [];

const container = document.getElementById("quiz-container");

fetch(QUIZ_CONFIG.DATA_URL)
  .then(res => res.json())
  .then(data => {
    questions = data.slice(0, QUIZ_CONFIG.TOTAL_QUESTIONS);
    if (QUIZ_CONFIG.MODE === "mock") startTimer();
    showQuestion();
  });

function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    const m = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const s = String(timeLeft % 60).padStart(2, "0");
    document.getElementById("time").innerText = `${m}:${s}`;
    if (timeLeft <= 0) finishMock();
  }, 1000);
}

function showQuestion() {
  const q = questions[index];
  container.innerHTML = `
    <h3>Q${index + 1}. ${q.question}</h3>
    ${q.options.map((o, i) =>
      `<button onclick="answer(${i})">${o}</button>`
    ).join("")}
    <div id="explain"></div>
  `;
}

function answer(i) {
  const q = questions[index];
  userAnswers.push(i);

  if (i === q.correctAnswer) score++;

  if (QUIZ_CONFIG.MODE === "practice") {
    document.getElementById("explain").innerHTML = `
      <p><b>Correct:</b> ${q.options[q.correctAnswer]}</p>
      <p>${q.explanation || ""}</p>
    `;
  }

  index++;
  if (index < questions.length) {
    setTimeout(showQuestion, QUIZ_CONFIG.MODE === "practice" ? 1000 : 0);
  } else {
    finishMock();
  }
}

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
