
const questionTemplate = document.querySelector("[data-question-template]")
const questionContainer = document.querySelector("[data-question-card-container]")
const searchInput = document.querySelector("[data-search]")

let questions = []

searchInput.addEventListener("input", (e) => {
    const value = e.target.value
    questions.forEach(question => {
        const isVisible = toString(question.Question).includes(value)
        if (isVisible) {
            console.log(question.Question)
        }
        question.element.classList.toggle("hide", !isVisible)
    })
})

fetch("questions.json")
    .then(res => res.json())
    .then(data => {
        questions = data.map(question => {
            const questionCard = questionTemplate.content.cloneNode(true).children[0]
            const image = questionCard.querySelector("[question-image]")
            image.src = `Question Images/000${question.id}.png`
            questionContainer.append(questionCard)
            return {Paper : question.Paper, Question : question.Question, Topic : question.Topic, element: questionCard}
        })
    })