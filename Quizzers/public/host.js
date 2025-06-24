const roomCodeDisplay = document.getElementById("roomcode-display");
const playerList = document.getElementById("player-list")
const form = document.getElementById("hosting-form");
const input = document.getElementById("roomcode");
const playersDiv = document.getElementById("players");
const startBtn = document.getElementById("start-game-btn");
const questionCard = document.getElementById("question-card");
const playerCourt = document.getElementById("player-court");
const exitBtn = document.getElementById("exit-btn");
const warning = document.querySelector(".warning");
const title = document.getElementById("title");
const results = document.getElementById("player-results");
const navbar = document.querySelector("nav");
const body = document.querySelector("body");
const safeBtn = document.getElementById("safe-btn");

let roomcode;

const socket = io();

console.log("Host JS Running");

// Creating a Suitable Room
form.addEventListener("submit", e => {
    e.preventDefault();

    const code = input.value.trim();
    const isNewRoom = true
    const username = undefined
    socket.emit("checkRooms", { code, isNewRoom, username });
});

socket.on("roomCodeStatus", ({ code, isTaken, isReconnection }) => {
    if (isTaken) {
        console.log("Room code is taken pick another");
        warning.innerText = "Room code is taken please select another"
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
            const voteElement = document.createElement("img");
            voteElement.src = `Assets/${voter.icon}`;
            voteElement.classList.add("vote");
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
    // Clearing created elements
    document.querySelectorAll(".user-answer").forEach(el => {
        el.remove();
    });

    playerCourt.innerHTML = "";
})

socket.on("resultsTable", (players) => {
    results.innerHTML = ""
    players.sort((a, b) => b.score - a.score);
    players.forEach(player => {
        const resultDiv = document.createElement("div");
        resultDiv.innerHTML = `<img class="result-img player-skull" data-player="${player.username}" src="Assets/${player.icon}"/>
                                <p>${player.username} : ${player.score}</p>`
        resultDiv.classList.add("result-div");
        results.appendChild(resultDiv);
    })
    results.style.display = "block";
    questionCard.style.display = "none";
    playerCourt.style.display = "none";
})



socket.on("hostMessage", msg => {
    console.log(msg);
});

socket.on("roomPlayers", (players) => {
    updatePlayerList(players);
})

safeBtn.addEventListener("click", e => {
    console.log("Button Clicked")
    if (safeBtn.innerText == "Enter Safe Mode") {
        safeBtn.innerText = "Exit Safe Mode";
    } else {
        safeBtn.innerText = "Enter Safe Mode"
    }
    socket.emit("toggleSafeMode");
})

function updatePlayerList(players) {
    // Showing online players
    safeBtn.style.display = "block"
    console.log("updated")
    playerList.innerHTML = '';
    players.forEach((player) => {
        const div = document.createElement('div');
        div.innerHTML = `<img class="awaiting-icon player-skull" data-player="${player.username}" src="Assets/${player.icon}"/>
                        <p>${player.username}</p>`;
        div.classList.add("awaiting-player");
        playerList.appendChild(div);
    });

    // Displaying start button
    if (players.length > 0) {
        startBtn.style.display = "block";
    } else {
        startBtn.style.display = "none";
    }
}

function transitionToHostedGame(roomcode) {
    roomCodeDisplay.innerHTML = `Room Code: ${roomcode}`;
    roomCodeDisplay.style.display = "block";
    form.style.display = "none";
    playersDiv.style.display = "block";
    title.innerText = "";
}

function displayQuestion(question, players) {
    // Question Display
    playersDiv.style.display = "none";
    startBtn.style.display = "none";
    questionCard.style.display = "block";
    questionCard.innerText = question;
    safeBtn.style.display = "none"
    navbar.style.display = "none";
    results.style.display = "none";
    results.innerHTML = "";
    body.style.backgroundImage = "url(Assets/skull-bg2.png";
    playerCourt.innerHTML = "";

    // Players
    playerCourt.style.display = "flex";
    players.forEach((player) => {
        const divElement = document.createElement("div")
        divElement.innerHTML = `<img class="voting-icon player-skull" data-player="${player.username}" src="Assets/${player.icon}"/>
                                <p class="player-name">${player.username}</p>
                                <div class="votes">
                                </div>`;
        divElement.classList.add("player-icon");
        playerCourt.appendChild(divElement);
    })
}

socket.on("updateDisconnect", (players) => {
    playerCourt.innerHTML = "";
    players.forEach((player) => {
        const divElement = document.createElement("div")
        divElement.innerHTML = `<img class="voting-icon player-skull" data-player="${player.username}" src="Assets/${player.icon}"/>
                                <p class="player-name">${player.username}</p>
                                <div class="votes">
                                </div>`;
        divElement.classList.add("player-icon");
        playerCourt.appendChild(divElement);
    })
})

socket.on("displayResults", (players) => {
    questionCard.style.display = "none";
    playerCourt.style.display = "none";
    navbar.style.display = "block";
    results.style.display = "flex";
    // sorting the players
    players.sort((a, b) => b.score - a.score);

    // Displaying the players
    players.forEach((player) => {
        const divElement = document.createElement("div")
        divElement.innerHTML = `<img class="awaiting-icon player-skull" data-player="${player.username}" src="Assets/${player.icon}"/>
                                <p class="player-name">${player.username}</p>
                                <p>Score: ${player.score}</p>`;
        divElement.classList.add("score-show");
        results.appendChild(divElement);
    })
    exitBtn.style.display = "block";
})

socket.on("playerJumped", (player) => {
    document.querySelectorAll('.player-skull').forEach(img => {
        const playerData = img.dataset.player;
        if (playerData == player.username) {
            img.src = `Assets/${player.icon}`;
            
        };
    });
})