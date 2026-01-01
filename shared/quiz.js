if (typeof QUIZ_DATA_URL === "undefined") {
  throw new Error("QUIZ_DATA_URL missing");
}

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
      startTimer(); // ✅ START TIMER
    }

    renderQuestion(currentQuestionIndex);
  })
  .catch(err => {
    quizContainer.innerHTML = "<p>Failed to load quiz.</p>";
    console.error(err);
  });

/* =========================
   RENDER SINGLE QUESTION
========================= */
function renderQuestion(index) {
  const q = quizData[index];
  quizContainer.innerHTML = "";

  const card = document.createElement("div");
  card.className = "note-card";

  card.innerHTML = `
    <h3>Q${index + 1}. ${q.question}</h3>

    ${q.options
      .map(
        (opt, i) => `
          <label>
            <input type="radio" name="q${index}" value="${i}"
              ${userAnswers[index] === i ? "checked" : ""}
            >
            ${opt}
          </label><br>
        `
      )
      .join("")}

    <div style="margin-top:18px; display:flex; justify-content:space-between;">
      <button onclick="prevQuestion()" ${index === 0 ? "disabled" : ""}>
        ⬅ Prev
      </button>

      ${
        index === quizData.length - 1
          ? `<button onclick="submitTest()">Submit</button>`
          : `<button onclick="nextQuestion()">Next ➡</button>`
      }
    </div>
  `;

  quizContainer.appendChild(card);

  // Save answer
  document
    .querySelectorAll(`input[name="q${index}"]`)
    .forEach(input => {
      input.addEventListener("change", e => {
        userAnswers[index] = parseInt(e.target.value, 10);
      });
    });
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

  let score = 0;
  quizData.forEach((q, i) => {
    if (userAnswers[i] === q.correctAnswer) score++;
  });

  quizContainer.innerHTML = `
    <div class="note-card" style="text-align:center;">
      <h2>Mock Test Submitted</h2>
      <p><strong>Score:</strong> ${score} / ${quizData.length}</p>
      <p><strong>Accuracy:</strong> ${Math.round(
        (score / quizData.length) * 100
      )}%</p>
    </div>
  `;
}
