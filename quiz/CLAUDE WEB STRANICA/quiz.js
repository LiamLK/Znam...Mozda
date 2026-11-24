// Zajednička logika kviza (koristi PITANJA iz svake stranice)
const TIME_LIMIT = 60; // sekundi po pitanju

const screens = {
    start: document.getElementById("start-screen"),
    level: document.getElementById("level-screen"),
    quiz: document.getElementById("quiz-screen"),
    result: document.getElementById("result-screen")
};
const progress = document.getElementById("progress");
const imageBox = document.getElementById("question-image");
const answerButtons = document.querySelectorAll(".answer");
const timerBar = document.getElementById("timer-bar");
const timerText = document.getElementById("timer-text");

const LEVEL_NAMES = { easy: "Easy", medium: "Medium", hard: "Hard" };

let questions = [];
let level = "easy";
let current = 0;
let score = 0;
let timeLeft = TIME_LIMIT;
let timerId = null;

function show(name) {
    Object.keys(screens).forEach(function (key) {
        screens[key].hidden = key !== name;
    });
}

function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
}

function updateTimer() {
    timerText.textContent = "Preostalo vrijeme: " + formatTime(timeLeft);
    timerBar.style.width = (timeLeft / TIME_LIMIT * 100) + "%";
    timerBar.classList.toggle("low", timeLeft <= 10);
}

function startTimer() {
    clearInterval(timerId);
    timeLeft = TIME_LIMIT;
    updateTimer();
    timerId = setInterval(function () {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) {
            // Vrijeme je isteklo: automatski netočan odgovor
            nextQuestion(false);
        }
    }, 1000);
}

function showQuestion() {
    const p = questions[current];
    progress.textContent = "Pitanje " + (current + 1) + " / " + questions.length + " (" + LEVEL_NAMES[level] + ")";

    if (p.slika) {
        imageBox.innerHTML = '<img src="' + p.slika + '" alt="Slika uz pitanje">';
    } else {
        imageBox.innerHTML = "<span>Ovdje ide slika</span>";
    }

    answerButtons.forEach(function (btn, i) {
        btn.querySelector("span").textContent = p.odgovori[i] || "";
    });

    startTimer();
}

function showResult() {
    clearInterval(timerId);
    show("result");
    document.getElementById("score").textContent = score + " / " + questions.length;
    document.getElementById("result-level").textContent = LEVEL_NAMES[level];
}

function nextQuestion(correct) {
    clearInterval(timerId);
    if (correct) score++;
    current++;
    if (current < questions.length) {
        showQuestion();
    } else {
        showResult();
    }
}

// Početni ekran -> izbor težine
document.getElementById("start-btn").addEventListener("click", function () {
    show("level");
});

// Izbor težine -> kviz
document.querySelectorAll(".level-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
        level = btn.dataset.level;
        // PITANJA može biti niz (ista pitanja za sve težine) ili objekt { easy, medium, hard }
        questions = Array.isArray(PITANJA) ? PITANJA : PITANJA[level];
        current = 0;
        score = 0;
        show("quiz");
        showQuestion();
    });
});

answerButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
        nextQuestion(Number(btn.dataset.index) === questions[current].tocan);
    });
});
