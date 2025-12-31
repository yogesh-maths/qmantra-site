if (typeof QUIZ_DATA_URL === "undefined") {
  document.body.innerHTML = "<h2>Quiz data URL not defined</h2>";
  throw new Error("QUIZ_DATA_URL missing");
}

let questions = [];
let currentIndex = 0;
let score = 0;

fetch(QUIZ_DATA_URL)
  .then(response => {
    if (!response.ok) throw new Error("JSON not found");
    return response.json();
  })
  .then(data => {
    questions = data;
    loadQuestion();
  })
  .catch(error => {
    document.body.innerHTML = `<h2>Error loading quiz</h2><p>${error.message}</p>`;
  });

function loadQuestion() {
  const q = questions[currentIndex];

  let html = `<h3>${q.question}</h3>`;
  q.options.forEach((opt, i) => {
    html += `
      <label>
        <input type="radio" name="option" value="${i}">
        ${opt}
      </label><br>
    `;
  });

  html += `<br><button onclick="submitAnswer()">Submit</button>`;
  document.getElementById("quiz-container").innerHTML = html;
}

function submitAnswer() {
  const selected = document.querySelector('input[name="option"]:checked');
  if (!selected) return alert("Please select an option");

  const correct = questions[currentIndex].correctIndex;
  const explanation = questions[currentIndex].explanation;

  let resultHtml = "";
  if (parseInt(selected.value) === correct) {
    score++;
    resultHtml = "<p style='color:green;'>Correct ✅</p>";
  } else {
    resultHtml = "<p style='color:red;'>Wrong ❌</p>";
  }

  resultHtml += `<p><strong>Explanation:</strong> ${explanation}</p>`;
  resultHtml += `<button onclick="nextQuestion()">Next</button>`;

  document.getElementById("quiz-container").innerHTML = resultHtml;
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex < questions.length) {
    loadQuestion();
  } else {
    document.getElementById("quiz-container").innerHTML =
      `<h2>Quiz Completed 🎉</h2>
       <p>Score: ${score} / ${questions.length}</p>`;
  }
}
