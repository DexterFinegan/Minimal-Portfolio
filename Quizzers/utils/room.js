const rooms = [];
let answers = [];

function newRoom(id, roomcode, questions) {
    const room = {id, roomcode, questions, questionCount: 0, begun: false, hornyMode: true, maxQuestions: 10};
    rooms.push(room);

    return room;
}

function getRooms() {
    return rooms;
}

function toggleHornyMode(roomcode) {
    const room = rooms.find(room => room.roomcode == roomcode);
    if (room.hornyMode) {
        room.hornyMode = false
        room.questions.filter(question => question.deep == false);
    } else {
        room.hornyMode = true
        room.questions = generateQuestions();
    }
}

function roomLeave(id) {
    const index = rooms.findIndex(room => room.id == id);

    if (index !== -1 && index != undefined) {
        return rooms.splice(index, 1)[0];
    }
}

let quizData = [
    {
        question : "Who lost their virginity the earliest?",
        deep: true
    },
    {
        question : "Who cleaned their sheets the longest time ago?",
        deep: false
    },
    {
        question : "Who got a kiss the youngest?",
        deep: false
    },
    {
        question : "Who had sex in the weirdest location?",
        deep: true
    },
    {
        question : "Who has worn their underwear for the most consecutive days?",
        deep: false
    },
    {
        question : "Who had sex most recently?",
        deep: true
    },
    {
        question : "Who has travelled the farthest country?",
        deep: false
    },
    {
        question : "Who barfed most recently?",
        deep: false
    },
    {
        question : "Who has had sex involving the wildest kink?",
        deep: true
    },
    {
        question : "Who has gone the longest number of consecutive days without washing?",
        deep: false
    },
    {
        question : "Who has masturbated in the weirdest location?",
        deep: true
    },
    {
        question : "Who has gardened their pubes most recently?",
        deep: true
    },
    {
        question : "Who has peed in public most recently?",
        deep: false
    },
    {
        question : "Who has pooped in the weirdest location?",
        deep: false
    },
    {
        question : "Who has gone to the hosiptal most recently?",
        deep: false
    },
    {
        question : "Who has gone to the hospital for the worst reason?",
        deep: false
    },
    {
        question : "Who has smoked weed the most recently?",
        deep: false
    },
    {
        question : "Who has commited the most illegal crime?",
        deep: true
    },
    {
        question : "Who has had their partner do the worst thing to them?",
        deep: true
    },
    {
        question : "Who has been in a fight most recently?",
        deep: false
    },
    {
        question : "Who showered the longest time ago?",
        deep: false
    },
    {
        question : "Who has had something up their bum most recently?",
        deep: true
    },
    {
        question : "Who has the most expensive sex-related toy?",
        deep: true
    },
    {
        question : "Who fallen over in public most recently?",
        deep: false
    },
    {
        question : "Who hasn't been to the gym in the lonest time?",
        deep: false
    },
    {
        question : "Who did the nicest thing today?",
        deep: false
    },
    {
        question : "Who cried most recently?",
        deep: false
    },
    {
        question : "Who has the worst bad habit?",
        deep: false
    },
    {
        question : "Who has had diaghrea most recently?",
        deep: false
    },
    {
        question : "Who has the dumbest fear?",
        deep: false
    },
    {
        question : "Who has visited the coolest place?",
        deep: false
    },
    {
        question : "Who has the largest bodycount?",
        deep: true
    },
    {
        question : "Who has the most stuffed animals?",
        deep: false
    },
    {
        question : "Who has been wearing their underwear for the longest number of hours?",
        deep: false
    },
    {
        question : "Who has taken a nude the most recently?",
        deep: true
    },
    {
        question : "Who took part in the stupidest activity as a child?",
        deep: false
    },
    {
        question : "Who watched porn the most recently?",
        deep: true
    },
    {
        question : "Who enjoys the weirdest food?",
        deep: false
    },
    {
        question : "Who has pissed themselves most recently?",
        deep: true
    },
    {
        question : "Who has pulled an all-nighter most recently?",
        deep: false
    },
    {
        question : "Who has given head the most recently?",
        deep: true
    },
    {
        question : "Who hasn't contacted either parent in the longest amount of time?",
        deep: false
    },
    {
        question : "Who has the highest snapscore?",
        deep: false
    },
    {
        question : "Who believed in Santa til the oldest age?",
        deep: false
    },
    {
        question : "Who has thrown up in the worst location?",
        deep: false
    },
    {
        question : "Who has had the longest relationship?",
        deep: false
    },
    {
        question : "Who has the least sets on pyjamas?",
        deep: false
    },
    {
        question : "Who has asked mummy/daddy for a lift the most recently?",
        deep: false
    },
    {
        question : "Who has had the worst dating app experience?",
        deep: true
    },
    {
        question : "Who has hooked up with the most people in one night?",
        deep: true
    },
    {
        question : "Who has most recently been refused entry to a pub/club?",
        deep: false
    },
    {
        question : "Who has had the worst person walk in on them during sex?",
        deep: true
    },
    {
        question : "Who has had the worst person walk in on them during sex?",
        deep: true
    },
    {
        question : "Who shat most recently?",   
        deep: false
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
    resetAnswers,
    toggleHornyMode
}