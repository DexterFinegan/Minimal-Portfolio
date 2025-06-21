const roomCodeDisplay = document.getElementById("roomcode-display");
const playerList = document.getElementById("player-list")
const form = document.getElementById("hosting-form");
const input = document.getElementById("roomcode");
const playersDiv = document.getElementById("players");
const startBtn = document.getElementById("start-game-btn");
const questionCard = document.getElementById("question-card");
const playerCourt = document.getElementById("player-court");
const exitBtn = document.getElementById("exit-btn");

let roomcode;

const socket = io();

console.log("Host JS Running");

// Creating a Suitable Room
form.addEventListener("submit", e => {
    e.preventDefault();

    const code = input.value.trim();
    const isNewRoom = true
    socket.emit("checkRooms", { code, isNewRoom });
});

socket.on("roomCodeStatus", ({ code, isTaken }) => {
    if (isTaken) {
        console.log("Room code is taken pick another")
    } else {
        roomcode = code;
        transitionToHostedGame(code);
    }
});

// Starting the game
startBtn.addEventListener("click", e => {
    console.log("Starting Game")
    socket.emit("startGame", roomcode);
})

socket.on("nextQuestion", ({ question, players }) => {
    displayQuestion(question, players);
})

// Voting System

socket.on("updateVotes", ({ voted, voter }) => {
    const playerIcons = document.querySelectorAll(".player-icon");
    playerIcons.forEach(icon => {
        const nameText = icon.querySelector(".player-name").textContent;
        if (nameText == voted.username) {
            const votes = icon.querySelector(".votes");
            const voteElement = document.createElement("p");
            voteElement.innerText = voter.username;
            votes.appendChild(voteElement);
        }
    })
})

socket.on("answerReveal", (allAnswers) => {
    const playerIcons = document.querySelectorAll(".player-icon");
    playerIcons.forEach(icon => {
        const nameText = icon.querySelector(".player-name").textContent;
        const userIndex = allAnswers.findIndex(answer => answer.player.username == nameText);
        const userAnswer = document.createElement("button");
        userAnswer.textContent = allAnswers[userIndex].answer;
        userAnswer.classList.add("user-answer");
        icon.prepend(userAnswer);
    })  

    // Answer Selection
    const answerBtns = document.querySelectorAll(".user-answer");
    answerBtns.forEach(btn => {
        btn.addEventListener("click", e => {
            const parentDiv = btn.parentElement;
            const username = parentDiv.querySelector("p").textContent;
            console.log(`${username} was the correct answer!`)
            socket.emit("questionAnswer", username);
        })
    })
})

socket.on("updateScores", (players) => {
    console.log(players);
    // Clearing created elements
    document.querySelectorAll(".user-answer").forEach(el => {
        el.remove();
    });

    playerCourt.innerHTML = "";
})



socket.on("hostMessage", msg => {
    console.log(msg);
});

socket.on("roomPlayers", (players) => {
    updatePlayerList(players);
})

function updatePlayerList(players) {
    // Showing online players
    playerList.innerHTML = '';
    players.forEach((player) => {
        const li = document.createElement('li');
        li.innerText = player.username;
        playerList.appendChild(li);
    });

    // Displaying start button
    if (players.length > 0) {
        startBtn.style.display = "block";
    } else {
        startBtn.style.display = "none";
    }
}

function transitionToHostedGame(roomcode) {
    roomCodeDisplay.innerHTML = `Room Code is "${roomcode}"`;
    form.style.display = "none";
    playersDiv.style.display = "block";
}

function displayQuestion(question, players) {
    // Question Display
    playersDiv.style.display = "none";
    startBtn.style.display = "none";
    questionCard.style.display = "block";
    questionCard.innerText = question;

    // Players
    playerCourt.style.display = "block";
    players.forEach((player) => {
        const divElement = document.createElement("div")
        divElement.innerHTML = `<p class="player-name">${player.username}</p>
                <div class="votes">
                </div>`;
        divElement.classList.add("player-icon");
        playerCourt.appendChild(divElement);
    })
}

socket.on("displayResults", (players) => {
    questionCard.style.display = "none";
    playerCourt.style.display = "block";
    players.forEach((player) => {
        const divElement = document.createElement("div")
        divElement.innerHTML = `<p class="player-name">${player.username}</p>
                <p>Score: ${player.score}</p>`;
        divElement.classList.add("player-icon");
        playerCourt.appendChild(divElement);
    })
    exitBtn.style.display = "block";
})