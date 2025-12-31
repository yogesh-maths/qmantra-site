if (typeof QUIZ_DATA_URL === "undefined") {
  throw new Error("QUIZ_DATA_URL missing");
}

const quizContainer = document.getElementById("quiz-container");
let quizData = [];

fetch(QUIZ_DATA_URL)
  .then(res => res.json())
  .then(data => {
    quizData = data;
    renderQuiz(data);
  })
  .catch(err => {
    quizContainer.innerHTML = "<p>Failed to load quiz.</p>";
    console.error(err);
  });

function renderQuiz(questions) {
  quizContainer.innerHTML = "";

  questions.forEach((q, index) => {
    const card = document.createElement("div");
    card.className = "note-card";

    card.innerHTML = `
      <h3>Q${index + 1}. ${q.question}</h3>
      ${q.options.map(opt => `
        <label>
          <input type="radio" name="q${index}" value="${opt}">
          ${opt}
        </label><br>
      `).join("")}
      <button onclick="checkAnswer(${index})">Check Answer</button>
      <p id="exp-${index}" style="display:none;margin-top:8px;"></p>
    `;

    quizContainer.appendChild(card);
  });
}


function checkAnswer(qIndex) {
  const q = quizData[qIndex];
  const selected = document.querySelector(`input[name="q${qIndex}"]:checked`);
  const exp = document.getElementById(`exp-${qIndex}`);

  if (!selected) {
    alert("Please select an option");
    return;
  }

  const selectedValue = selected.value.trim();
  const correctAnswer = q.answer.trim();

  if (selectedValue === correctAnswer) {
    exp.innerHTML = "✅ <b>Correct!</b><br>" + q.explanation;
    exp.style.color = "green";
  } else {
    exp.innerHTML =
      `❌ <b>Wrong.</b><br>
       <b>Correct Answer:</b> ${q.answer}<br>
       ${q.explanation}`;
    exp.style.color = "red";
  }

  exp.style.display = "block";

  // Disable options after attempt
  document
    .querySelectorAll(`input[name="q${qIndex}"]`)
    .forEach(i => i.disabled = true);
}


