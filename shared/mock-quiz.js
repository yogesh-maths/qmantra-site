if (typeof QUIZ_DATA_URL === "undefined") {
  throw new Error("QUIZ_DATA_URL missing");
}

const quizContainer = document.getElementById("quiz-container");
let quizData = [];
let current = 0;
let answers = [];

fetch(QUIZ_DATA_URL)
  .then(res => res.json())
  .then(data => {
    quizData = data
      .sort(()=>0.5-Math.random())
      .slice(0, 20);

    answers = new Array(quizData.length).fill(null);
    startTimer();
    renderQuestion();
  });

function renderQuestion() {
  const q = quizData[current];
  quizContainer.innerHTML = `
    <div class="note-card">
      <h3>Q${current+1}. ${q.question}</h3>

      ${q.options.map((o,i)=>`
        <label>
          <input type="radio" name="opt" value="${i}"
            ${answers[current]===i?"checked":""}>
          ${o}
        </label><br>
      `).join("")}

      <div style="margin-top:16px;display:flex;justify-content:space-between;">
        <button ${current===0?"disabled":""} onclick="prev()">⬅ Prev</button>
        ${
          current===quizData.length-1
          ? `<button onclick="submit()">Submit</button>`
          : `<button onclick="next()">Next ➡</button>`
        }
      </div>
    </div>
  `;

  document.querySelectorAll("input[name=opt]").forEach(input=>{
    input.onchange = () => {
      answers[current] = parseInt(input.value);
    };
  });
}

/* TIMER */
let time = 20*60;
let timerInterval;

function startTimer(){
  const t = document.getElementById("time");
  timerInterval = setInterval(()=>{
    time--;
    t.textContent = `${Math.floor(time/60)}:${String(time%60).padStart(2,"0")}`;
    if(time<=0) submit();
  },1000);
}

function next(){ current++; renderQuestion(); }
function prev(){ current--; renderQuestion(); }

function submit(){
  clearInterval(timerInterval);

  let correct=0, wrong=0;
  quizData.forEach((q,i)=>{
    if(answers[i]===q.correctAnswer) correct++;
    else if(answers[i]!=null) wrong++;
  });

  sessionStorage.setItem("mockResult", JSON.stringify({
    total: quizData.length,
    correct,
    wrong,
    questions: quizData.map((q,i)=>({
      question:q.question,
      options:q.options,
      correct:q.correctAnswer,
      user:answers[i],
      explanation:q.explanation
    }))
  }));

  location.href="result.html";
}
