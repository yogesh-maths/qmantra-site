/* =========================
   SAFETY CHECK
========================= */
if (typeof QUIZ_DATA_URL === "undefined") {
  throw new Error("QUIZ_DATA_URL missing");
}

/* =========================
   GLOBAL STATE
========================= */
const quizContainer = document.getElementById("quiz-container");
let quizData = [];
let currentQuestionIndex = 0;
let userAnswers = [];

/* =========================
   LOAD QUIZ DATA
========================= */
fetch(QUIZ_DATA_URL)
  .then(res => res.json())
  .then(data => {
    quizData = data;

    // MOCK TEST MODE
    if (typeof IS_MOCK_TEST !== "undefined" && IS_MOCK_TEST) {
      quizData = quizData
        .sort(() => 0.5 - Math.random())
        .slice(0, TOTAL_QUESTIONS);

      userAnswers = new Array(quizData.length).fill(null);

      if (typeof startTimer === "function") {
        startTimer();
      }
    } else {
      // PRACTICE MODE
      userAnswers = new Array(quizData.length).fill(null);
    }

    renderQuestion(currentQuestionIndex);
  })
  .catch(err => {
    quizContainer.innerHTML = "<p>Failed to load quiz.</p>";
    console.error(err);
  });

/* =========================
   RENDER QUESTION
========================= */
function renderQuestion(index) {
  const q = quizData[index];
  quizContainer.innerHTML = "";

  const card = document.createElement("div");
  card.className = "note-card";

  card.innerHTML = `
    <h3>Q${index + 1}. ${q.question}</h3>

    ${q.options.map(
      (opt, i) => `
        <label>
          <input type="radio" name="q${index}" value="${i}"
            ${userAnswers[index] === i ? "checked" : ""}>
          ${opt}
        </label><br>
      `
    ).join("")}

    <p id="exp-${index}" style="display:none;margin-top:10px;"></p>

    <div style="margin-top:18px; display:flex; justify-content:space-between;">
      <button onclick="prevQuestion()" ${index === 0 ? "disabled" : ""}>⬅ Prev</button>
      ${
        index === quizData.length - 1
          ? `<button onclick="submitTest()">Submit</button>`
          : `<button onclick="nextQuestion()">Next ➡</button>`
      }
    </div>
  `;

  quizContainer.appendChild(card);

  document
    .querySelectorAll(`input[name="q${index}"]`)
    .forEach(input => {
      input.addEventListener("change", e => {
        userAnswers[index] = parseInt(e.target.value, 10);
        if (typeof IS_PRACTICE_MODE !== "undefined") {
          showExplanation(index);
        }
      });
    });
}

/* =========================
   PRACTICE EXPLANATION
========================= */
function showExplanation(index) {
  const q = quizData[index];
  const exp = document.getElementById(`exp-${index}`);
  const user = userAnswers[index];

  if (user === null) return;

  if (user === q.correctAnswer) {
    exp.style.color = "green";
    exp.innerHTML = "✅ Correct";
  } else {
    exp.style.color = "red";
    exp.innerHTML = `❌ Wrong<br><b>Correct:</b> ${q.options[q.correctAnswer]}`;
  }

  if (q.explanation) {
    exp.innerHTML += `<div style="margin-top:6px;"><b>Explanation:</b><br>${q.explanation}</div>`;
  }

  exp.style.display = "block";
}

/* =========================
   NAVIGATION
========================= */
function nextQuestion() {
  if (currentQuestionIndex < quizData.length - 1) {
    currentQuestionIndex++;
    renderQuestion(currentQuestionIndex);
  }
}

function prevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion(currentQuestionIndex);
  }
}

/* =========================
   SUBMIT TEST
========================= */
function submitTest() {
  if (typeof timerInterval !== "undefined") {
    clearInterval(timerInterval);
  }

  let correct = 0;
  let wrong = 0;

  quizData.forEach((q, i) => {
    if (userAnswers[i] === q.correctAnswer) correct++;
    else if (userAnswers[i] !== null) wrong++;
  });

  const result = {
    total: quizData.length,
    correct,
    wrong,
    questions: quizData.map((q, i) => ({
      question: q.question,
      options: q.options,
      correct: q.correctAnswer,
      user: userAnswers[i],
      explanation: q.explanation || ""
    }))
  };

  sessionStorage.setItem("mockResult", JSON.stringify(result));
  window.location.href = "result.html";
}
