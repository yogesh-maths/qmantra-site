if (typeof QUIZ_DATA_URL === "undefined") {
  throw new Error("QUIZ_DATA_URL missing");
}

const quizContainer = document.getElementById("quiz-container");
let quizData = [];
let current = 0;

fetch(QUIZ_DATA_URL)
  .then(res => res.json())
  .then(data => {
    quizData = data;
    renderQuestion();
  });

function renderQuestion() {
  const q = quizData[current];
  quizContainer.innerHTML = `
    <div class="note-card">
      <h3>Q${current + 1}. ${q.question}</h3>

      ${q.options.map((o,i)=>`
        <label>
          <input type="radio" name="opt" value="${i}">
          ${o}
        </label><br>
      `).join("")}

      <div id="exp" style="margin-top:10px;display:none;"></div>

      <div style="margin-top:16px;display:flex;justify-content:space-between;">
        <button ${current===0?"disabled":""} onclick="prev()">⬅ Prev</button>
        <button ${current===quizData.length-1?"disabled":""} onclick="next()">Next ➡</button>
      </div>
    </div>
  `;

  document.querySelectorAll("input[name=opt]").forEach(input=>{
    input.onchange = () => showExplanation(parseInt(input.value));
  });
}

function showExplanation(i) {
  const q = quizData[current];
  const exp = document.getElementById("exp");

  if (i === q.correctAnswer) {
    exp.innerHTML = `<p style="color:green;">✅ Correct</p>`;
  } else {
    exp.innerHTML = `
      <p style="color:red;">❌ Wrong</p>
      <p><b>Correct:</b> ${q.options[q.correctAnswer]}</p>
    `;
  }

  if (q.explanation) {
    exp.innerHTML += `<p><b>Explanation:</b><br>${q.explanation}</p>`;
  }

  exp.style.display = "block";
}

function next(){ current++; renderQuestion(); }
function prev(){ current--; renderQuestion(); }

<script>
  const links = document.querySelectorAll(".nav-link");
  const currentPath = window.location.pathname;

  links.forEach(link => {
    if (currentPath.includes(link.getAttribute("href"))) {
      link.classList.add("active");
    }
  });
</script>
