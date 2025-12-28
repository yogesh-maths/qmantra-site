let questions = [];
let current = 0;
let score = 0;

// Load Maths quiz by default
fetch("maths.json")
  .then(res => res.json())
  .then(data => {
    questions = data;
    loadQuestion();
  });

function loadQuestion() {
  document.getElementById("question").innerText =
    questions[current].question;

  let optionsBox = document.getElementById("options");
  optionsBox.innerHTML = "";

  questions[current].options.forEach(opt => {
    let btn = document.createElement("button");
    btn.innerText = opt;
    btn.onclick = () => selectAnswer(opt);
    optionsBox.appendChild(btn);
  });
}

function selectAnswer(selected) {
  if (selected === questions[current].answer) {
    score++;
  }
  nextQuestion();
}

function nextQuestion() {
  current++;
  if (current < questions.length) {
    loadQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  document.getElementById("quizBox").style.display = "none";
  document.getElementById("resultBox").style.display = "block";
  document.getElementById("scoreText").innerText =
    `You scored ${score} out of ${questions.length}`;
}
