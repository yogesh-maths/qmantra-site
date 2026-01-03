const params = new URLSearchParams(window.location.search);
const type = params.get("type");

let IS_MOCK_TEST = true;
let QUIZ_DATA_URL = "";
const TOTAL_QUESTIONS = 20;

/* =========================
   MOCK TEST DATA MAPPING
========================= */

if (type === "maths") {
  QUIZ_DATA_URL = "/qmantra-site/maths/mock-test/data/maths.json";

} else if (type === "ratio") {
  QUIZ_DATA_URL = "/qmantra-site/maths/mock-test/data/ratio.json";

} else if (type === "simpleinterest") {
  QUIZ_DATA_URL = "/qmantra-site/maths/mock-test/data/simple-interest.json";

} else if (type === "gk") {
  QUIZ_DATA_URL = "/qmantra-site/maths/mock-test/data/gk.json";

} else {
  document.getElementById("quiz-container").innerHTML =
    "<p>Invalid mock test type.</p>";
  throw new Error("Invalid mock test type");
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

    if (IS_MOCK_TEST) {
      quizData = quizData
        .sort(() => 0.5 - Math.random())
        .slice(0, TOTAL_QUESTIONS);
    }

    userAnswers = new Array(quizData.length).fill(null);

    if (IS_MOCK_TEST && typeof startTimer === "function") {
      startTimer();
    }

    renderQuestion(currentQuestionIndex);
  })
  .catch(err => {
    quizContainer.innerHTML = "<p>❌ Failed to load quiz.</p>";
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

    ${q.options.map((opt, i) => `
      <label>
        <input type="radio" name="q${index}" value="${i}"
          ${userAnswers[index] === i ? "checked" : ""}>
        ${opt}
      </label><br>
    `).join("")}

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

  document.querySelectorAll(`input[name="q${index}"]`).forEach(input => {
    input.addEventListener("change", e => {
      userAnswers[index] = parseInt(e.target.value, 10);

      // PRACTICE MODE → SHOW EXPLANATION
      if (!IS_MOCK_TEST) {
        showExplanation(index);
        document
          .querySelectorAll(`input[name="q${index}"]`)
          .forEach(i => (i.disabled = true));
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

  if (user === q.correctAnswer) {
    exp.style.color = "green";
    exp.innerHTML = "✅ <b>Correct</b>";
  } else {
    exp.style.color = "red";
    exp.innerHTML = `❌ <b>Wrong</b><br><b>Correct:</b> ${q.options[q.correctAnswer]}`;
  }

  if (q.explanation) {
    exp.innerHTML += `<div><b>Explanation:</b><br>${q.explanation}</div>`;
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
   SUBMIT MOCK TEST
========================= */
function submitTest() {
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
