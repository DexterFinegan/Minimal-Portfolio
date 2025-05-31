let quizData = [
    {
        question : "Who sent this message to the poop chat?",
        image: "Assets/q1.png",
        options : ["Harry", "Stephen", "Shrek", "Clay"],
        correct : "Harry",
        answerImage : "Assets/a1.png"
    },
    {
        question : "Who sent this message to the poop chat?",
        image: "Assets/q2.png",
        options : ["Ruby", "Suzanne", "Emma Sherlock", "Emma Smyth"],
        correct : "Ruby",
        answerImage : "Assets/a2.png"
    },
    {
        question : "Who sent this message to the poop chat?",
        image: "Assets/q3.png",
        options : ["Suzanne", "Conor", "Georgia", "Soumia"],
        correct : "Conor",
        answerImage : "Assets/a3.png"
    },
    {
        question : "Who sent this message to the poop chat?",
        image: "Assets/q4.png",
        options : ["Soumia", "Georgia", "Stephen", "Katie"],
        correct : "Soumia",
        answerImage : "Assets/a4.png"
    },
    {
        question : "Who sent this message to the poop chat?",
        image: "Assets/q5.png",
        options : ["Dan", "Dexter", "Shane", "Clay"],
        correct : "Dan",
        answerImage : "Assets/a5.png"
    },
    {
        question : "Who sent this message to the poop chat?",
        image: "Assets/q6.png",
        options : ["Niamh", "Harry", "Conor", "Suzanne"],
        correct : "Niamh",
        answerImage : "Assets/a6.png"
    },
    {
        question : "Who sent this message to the poop chat?",
        image: "Assets/q7.png",
        options : ["Shane", "Seán", "Emma Sherlock", "Suzanne"],
        correct : "Shane",
        answerImage : "Assets/a7.png"
    },
    {
        question : "Who sent this message to the poop chat?",
        image: "Assets/q8.png",
        options : ["Soumia", "Georgia", "Puss in Boots", "Conor"],
        correct : "Soumia",
        answerImage : "Assets/a8.png"
    },
    {
        question : "Who sent this message to the poop chat?",
        image: "Assets/q9.png",
        options : ["Emma Sherlock", "Emma Watson", "Emma Connell", "Emma Smyth"],
        correct : "Emma Sherlock",
        answerImage : "Assets/a9.png"
    },
    {
        question : "Who sent this message to the poop chat?",
        image: "Assets/q10.png",
        options : ["Conan", "Shane", "Stephen", "Eoin"],
        correct : "Conan",
        answerImage : "Assets/a10.png"
    }
];

const quizContainer = document.querySelector(".quiz-container");
const question = document.querySelector(".quiz-container .question");
const image = document.querySelector(".quiz-container .image");
const options = document.querySelector(".quiz-container .options");
const nextBtn = document.querySelector(".quiz-container .next-btn");
const quizResult = document.querySelector(".quiz-result");

let questionNumber = 0
const maxQuestions = 10
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
    image.src = quizData[questionNumber].answerImage

    let allOptions = document.querySelectorAll(".quiz-container .option");
    allOptions.forEach(o => {
        o.classList.add("disabled");
    });
};


const createQuestion = () => {
    clearInterval(timerInterval);

    let secondsLeft = 29;
    const timerDisplay = document.querySelector(".quiz-container .timer");
    timerDisplay.classList.remove("danger");
    timerDisplay.textContent = `Time Left: 30 seconds`;
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
    image.src = quizData[questionNumber].image

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