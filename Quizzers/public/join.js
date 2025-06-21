const playerDescription = document.getElementById("player-description");
const playerList = document.getElementById("player-list");
const form = document.getElementById("joining-form");
const input = document.getElementById("roomcode");
const usernameElement = document.getElementById("username");
const playersDiv = document.getElementById("players-div");
const playerQuestion = document.getElementById("player-question");
const playerVotingOptions = document.getElementById("player-voting-options");
const playerAnswer = document.getElementById("player-answer");
const answerSubmit = document.getElementById("answer-submit");

const socket = io();

console.log("Join JS Running");

// Joining the Room
form.addEventListener("submit", e => {
    e.preventDefault();

    const code = input.value.trim();
    const isNewRoom = false;
    socket.emit("checkRooms", { code, isNewRoom });
});

socket.on("roomCodeStatus", ({ code, isTaken }) => {
    if (isTaken) {
        const username = usernameElement.value.trim();
        socket.emit("playerJoin", { code, username });
        transitionToPlayerScreen(code);
    } else {
        console.log("No Room of that code try again")
    }
})

socket.on("playerMessage", (msg) => {
    console.log(msg);
})

socket.on("roomPlayers", players => {
    outputOtherPlayers(players);
})

socket.on("returnToHome", () => {
    window.location.href = "http://dexterfinegan.com"
})


function outputOtherPlayers(players) {
    playerList.innerHTML = '';
    players.forEach((player) => {
        if (player.id != socket.id) {
            const li = document.createElement('li');
            li.innerText = player.username;
            playerList.appendChild(li);
        }
    });
}

function transitionToPlayerScreen(code) {
    playerDescription.innerHTML = `Username : ${usernameElement.value.trim()}  -  Room Code : "${code}"`
    form.style.display = "none";
    playersDiv.style.display = "block";
}

function displayQuestion(question, players) {
    playersDiv.style.display = "none";
    playerQuestion.style.display = "block";
    playerQuestion.innerText = question;
    playerVotingOptions.style.display = "block";

    players.forEach((player) => {
        if (player.id != socket.id) {
            const buttonElement = document.createElement("button");
            buttonElement.innerText = player.username;
            buttonElement.classList.add("voting-button");
            playerVotingOptions.appendChild(buttonElement);
        }
    });
}

function hideButtons() {
    playerVotingOptions.style.display = "none";
    playerVotingOptions.innerHTML = "";
    playerAnswer.style.display = "block";
    answerSubmit.style.display = "block";
}

// Playing the Game
socket.on("nextQuestion", ({ question, players }) => {
    displayQuestion(question, players);
})

playerVotingOptions.addEventListener("click", e => {
    if (e.target.matches(".voting-button")) {
        hideButtons();
        const votedPlayer = e.target.innerText;
        console.log(`Voted for ${votedPlayer}`);
        socket.emit("Voted", (votedPlayer));
    }
});

answerSubmit.addEventListener("click", e => {
    if (playerAnswer.value != "") {
        answerSubmit.style.display = "none";
        playerAnswer.style.display = "none";
        const answer = playerAnswer.value;
        socket.emit("Answered", (answer));
    }
})

socket.on("displayResults", (players) => {
    playerQuestion.style.display = "none";
    playerVotingOptions.style.display = "block";
    players.forEach(player => {
        const newElement = document.createElement("p");
        newElement.innerText = `${player.username} scored ${player.score}`
    })
})