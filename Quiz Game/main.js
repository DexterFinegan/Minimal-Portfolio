let quizData = [
    {
        question : "Who was the first man to walk on the moon?",
        options : ["Neil Armstrong", "Buzz Aldrin", "Lil Peep", "KSI"],
        correct : "Neil Armstrong"
    },
    {
        question : "Who discovered general relativity?",
        options : ["Isaac Newton", "Albert Einstein", "Galileo Galilei", "Stephen Hawking"],
        correct : "Albert Einstein"
    },
    {
        question : "Who won the 2024 mens 100m sprint?",
        options : ["Noah Lyles", "Usain Bolt", "Big Chungus", "Oprah Winfrey"],
        correct : "Noah Lyles"
    },
    {
        question : "What is the smallest country in the world?",
        options : ["Vatican city", "Lesotho", "Loas", "Russia"],
        correct : "Vatican city"
    },
    {
        question : "Who painted the Mona Lisa?",
        options : ["Leonardo DaVinci", "Michaelangeo", "Donatello", "Raphael"],
        correct : "Leonardo DaVinci"
    }
];

const quizContainer = document.querySelector(".quiz-container");
const question = document.querySelector(".quiz-container .question");
const options = document.querySelector(".quiz-container .options");
const nextBtn = document.querySelector(".quiz-container .next-btn");
const quizResult = document.querySelector(".quiz-result");

let questionNumber = 0
const maxQuestions = 5
let score = 0
let timerInterval;

const shuffleArray = array => {
    return array.slice().sort(() => Math.random() - 0.5);
};

quizData = shuffleArray(quizData);

const resetLocalStorage = () => {
    for(i = 0; i < maxQuestions; i++) {
        localStorage.removeItem(`userAnswer_${i}`)
    }
};

resetLocalStorage()

const checkAnswer = (e) => {
    let userAnswer = e.target.textContent;
    if (userAnswer === quizData[questionNumber].correct) {
        score++;
        e.target.classList.add("correct");
    } else {
        e.target.classList.add("incorrect");
    }

    localStorage.setItem(`userAnswer_${questionNumber}`, userAnswer)

    let allOptions = document.querySelectorAll(".quiz-container .option");
    allOptions.forEach(o => {
        o.classList.add("disabled");
    });
};


const createQuestion = () => {
    clearInterval(timerInterval);

    let secondsLeft = 9;
    const timerDisplay = document.querySelector(".quiz-container .timer");
    timerDisplay.classList.remove("danger");
    timerDisplay.textContent = `Time Left: 10 seconds`;
    timerInterval = setInterval(() => {
        timerDisplay.textContent = `Time Left: ${secondsLeft.toString().padStart(2, 0)} seconds`;
        secondsLeft--;

        if (secondsLeft < 3) {
            timerDisplay.classList.add("danger");
        }

        if (secondsLeft < 0) {
            clearInterval(timerInterval);
            displayNextQuestion();
        }
    }, 1000);

    options.innerHTML = "";
    question.innerHTML = `<span class="question-number">${questionNumber + 1}/${maxQuestions}</span>${quizData[questionNumber].question}`;

    const shuffledOptions = shuffleArray(quizData[questionNumber].options);

    shuffledOptions.forEach(o => {
        const option = document.createElement("button");
        option.classList.add("option");
        option.innerHTML = o;
        option.addEventListener("click", (e) => {
            checkAnswer(e);
        })
        options.appendChild(option);
    });
};

const retakeQuiz = () => {
    questionNumber = 0;
    score = 0;
    quizData = shuffleArray(quizData);
    resetLocalStorage();

    createQuestion();
    quizResult.style.display = "none";
    quizContainer.style.display = "block";
};

const displayQuizResult = () => {
    quizResult.style.display = "flex";
    quizContainer.style.display = "none";
    quizResult.innerHTML = "";

    const resultHeading = document.createElement("h2")
    resultHeading.innerHTML = `You have scored ${score} out of ${maxQuestions}.`
    quizResult.appendChild(resultHeading);

    for (let i = 0; i < maxQuestions; i++) {
        const resultItem = document.createElement("div");
        resultItem.classList.add("question-container");

        const userAnswer = localStorage.getItem(`userAnswer_${i}`);
        const correctAnswer = quizData[i].correct;

        let answeredCorrectly = userAnswer === correctAnswer;

        if (!answeredCorrectly) {
            resultItem.classList.add("incorrect");
        }

        resultItem.innerHTML = `<div class="question"> Question ${i + 1}: ${quizData[i].question}</div>
            <div class="user-answer">Your Answer: ${userAnswer || "Not Answered"}</div>
            <div class="correct-answer">Correct Answer: ${correctAnswer}</div>`

        quizResult.appendChild(resultItem);
    }

    const retakeBtn = document.createElement("button");
    retakeBtn.classList.add("retake-btn");
    retakeBtn.innerHTML = "Retake Quiz";
    retakeBtn.addEventListener("click", retakeQuiz);
    quizResult.appendChild(retakeBtn);
};

createQuestion();

const displayNextQuestion = () => {
    if (questionNumber >= maxQuestions - 1) {
        displayQuizResult();
        return;
    }

    questionNumber++;
    createQuestion();
}

nextBtn.addEventListener("click", displayNextQuestion)