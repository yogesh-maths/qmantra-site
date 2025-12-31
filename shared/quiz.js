if (typeof QUIZ_DATA_URL === "undefined") {
  throw new Error("QUIZ_DATA_URL missing");
}
const quizContainer = document.getElementById("quiz-container");

fetch(QUIZ_DATA_URL)
  .then(res => res.json())
  .then(data => renderQuiz(data))
  .catch(err => {
    document.getElementById("quiz-container").innerHTML =
      "<p>Failed to load quiz.</p>";
    console.error(err);
  });


function renderQuiz(questions) {
  questions.forEach((q, index) => {
    const card = document.createElement("div");
    card.className = "note-card";

    card.innerHTML = `
      <h3>Q${index + 1}. ${q.question}</h3>
      ${q.options.map((opt, i) => `
        <label>
          <input type="radio" name="q${index}" value="${i}">
          ${opt}
        </label><br>
      `).join("")}
      <button onclick="checkAnswer(${index}, ${q.answer}, '${q.explanation}')">
        Check Answer
      </button>
      <p id="exp-${index}" style="display:none;"></p>
    `;

    quizContainer.appendChild(card);
  });
}

function checkAnswer(qIndex, correct, explanation) {
  const selected = document.querySelector(`input[name="q${qIndex}"]:checked`);
  const exp = document.getElementById(`exp-${qIndex}`);

  if (!selected) {
    alert("Please select an option");
    return;
  }

  if (parseInt(selected.value) === correct) {
    exp.innerHTML = "✅ Correct!<br>" + explanation;
    exp.style.color = "green";
  } else {
    exp.innerHTML = "❌ Wrong.<br>" + explanation;
    exp.style.color = "red";
  }

  exp.style.display = "block";
}
