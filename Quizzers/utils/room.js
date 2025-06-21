const rooms = [];
let answers = [];

function newRoom(id, roomcode, questions) {
    const room = {id, roomcode, questions, questionCount: 0, players: [], maxQuestions: 5};
    rooms.push(room);

    return room;
}

function getRooms() {
    return rooms;
}

function roomLeave(id) {
    const index = rooms.findIndex(room => room.id == id);

    if (index !== -1 && index != undefined) {
        return rooms.splice(index, 1)[0];
    }
}

let quizData = [
    {
        question : "Who lost their virginity the earliest?"
    },
    {
        question : "Who cleaned their sheets the longest time ago?"
    },
    {
        question : "Who weighs the most?"
    },
    {
        question : "Who is tallest?"
    },
    {
        question : "Who went on a run the longest time ago?"
    }
]

function shuffleArray(array) {
    return array.slice().sort(() => Math.random() - 0.5);
};

function generateQuestions() {
    quizData = shuffleArray(quizData);
    return quizData;
}

function addAnswer({ answerObject, totalPlayers }) {
    answers.push(answerObject);
    if (answers.length == totalPlayers.length) {
        return answers;
    } 
}

function resetAnswers() {
    answers = [];
}

module.exports = {
    newRoom,
    getRooms,
    roomLeave,
    generateQuestions,
    addAnswer,
    resetAnswers
}