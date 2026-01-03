/* =========================
   READ URL PARAM
========================= */
const params = new URLSearchParams(window.location.search);
const type = params.get("type");

/* =========================
   MOCK TEST CONFIG
========================= */
let QUIZ_DATA_URL = null;

if (type === "maths") {
  QUIZ_DATA_URL = "/qmantra-site/maths/mock-test/data/maths.json";
}
else if (type === "gk") {
  QUIZ_DATA_URL = "/qmantra-site/maths/mock-test/data/gk.json";
}
else if (type === "ratio") {
  QUIZ_DATA_URL = "/qmantra-site/maths/mock-test/data/ratio.json";
}
else if (type === "simpleinterest") {
  QUIZ_DATA_URL = "/qmantra-site/maths/mock-test/data/simple-interest.json";
}

/* =========================
   SAFETY CHECK
========================= */
if (!QUIZ_DATA_URL) {
  document.getElementById("quiz-container").innerHTML =
    "<p>Quiz data not configured.</p>";
  throw new Error("Invalid mock test type");
}


/* =========================
   REQUIRED CONFIG CHECK
========================= */
if (typeof QUIZ_DATA_URL === "undefined") {
  document.getElementById("quiz-container").innerHTML =
    "<p>Quiz data not configured.</p>";
  throw new Error("QUIZ_DATA_URL missing");
}

/* =========================
   STATE
========================= */
const quizContainer = document.getElementById("quiz-container");
let quizData = [];
let index = 0;
let answers = [];

/* =========================
   LOAD DATA
========================= */
fetch(QUIZ_DATA_URL)
  .then(res => res.json())
  .then(data => {
    quizData = data;

    // MOCK TEST MODE
    if (typeof IS_MOCK_TEST !== "undefined" && IS_MOCK_TEST) {
      quizData = quizData.sort(() => 0.5 - Math.random()).slice(0, TOTAL_QUESTIONS);
      answers = new Array(quizData.length).fill(null);
      if (typeof startTimer === "function") startTimer();
    }

    // PRACTICE MODE
    if (typeof IS_PRACTICE_MODE !== "undefined") {
      answers = new Array(quizData.length).fill(null);
    }

    render();
  })
  .catch(() => {
    quizContainer.innerHTML = "<p>Failed to load questions.</p>";
  });

/* =========================
   RENDER QUESTION
========================= */
function render() {
  const q = quizData[index];

  quizContainer.innerHTML = `
    <div class="note-card">
      <h3>Q${index + 1}. ${q.question}</h3>

      ${q.options.map((o, i) => `
        <label>
          <input type="radio" name="opt" value="${i}" ${answers[index] === i ? "checked" : ""}>
          ${o}
        </label><br>
      `).join("")}

      <div id="exp" style="margin-top:10px; display:none;"></div>

      <div style="margin-top:18px; display:flex; justify-content:space-between;">
        <button onclick="prev()" ${index === 0 ? "disabled" : ""}>⬅ Prev</button>
        ${
          index === quizData.length - 1 && typeof IS_MOCK_TEST !== "undefined"
            ? `<button onclick="submitTest()">Submit</button>`
            : `<button onclick="next()">Next ➡</button>`
        }
      </div>
    </div>
  `;

  document.querySelectorAll("input[name=opt]").forEach(r => {
    r.onchange = e => {
      answers[index] = parseInt(e.target.value, 10);

      if (typeof IS_PRACTICE_MODE !== "undefined") {
        showExplanation();
        document.querySelectorAll("input[name=opt]").forEach(i => i.disabled = true);
      }
    };
  });
}

/* =========================
   EXPLANATION (PRACTICE)
========================= */
function showExplanation() {
  const q = quizData[index];
  const box = document.getElementById("exp");
  const u = answers[index];

  box.style.display = "block";
  box.style.color = u === q.correctAnswer ? "green" : "red";
  box.innerHTML = `
    ${u === q.correctAnswer ? "✅ Correct" : "❌ Wrong"}
    <br><b>Answer:</b> ${q.options[q.correctAnswer]}
    <br><b>Explanation:</b> ${q.explanation || "—"}
  `;
}

/* =========================
   NAVIGATION
========================= */
function next() {
  if (index < quizData.length - 1) {
    index++;
    render();
  }
}

function prev() {
  if (index > 0) {
    index--;
    render();
  }
}

/* =========================
   MOCK SUBMIT
========================= */
function submitTest() {
  let score = 0;
  quizData.forEach((q, i) => {
    if (answers[i] === q.correctAnswer) score++;
  });

  quizContainer.innerHTML = `
    <div class="note-card" style="text-align:center;">
      <h2>Test Submitted</h2>
      <p><b>Score:</b> ${score} / ${quizData.length}</p>
      <p><b>Accuracy:</b> ${Math.round(score / quizData.length * 100)}%</p>
    </div>
  `;
}
