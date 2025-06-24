const playerUsername = document.getElementById("player-username");
const playerRoom = document.getElementById("player-room");
const playerList = document.getElementById("player-list");
const form = document.getElementById("joining-form");
const input = document.getElementById("roomcode");
const usernameElement = document.getElementById("username");
const playersDiv = document.getElementById("players-div");
const playerQuestion = document.getElementById("player-question");
const playerVotingOptions = document.getElementById("player-voting-options");
const playerAnswer = document.getElementById("player-answer");
const answerSubmit = document.getElementById("answer-submit");
const title = document.getElementById("title");
const warning = document.getElementById("warning");
const navbar = document.querySelector("nav");
const results = document.getElementById("client-results");
const jumpBtn = document.getElementById("jump-btn");

const socket = io();

console.log("Join JS Running");

// Joining the Room
form.addEventListener("submit", e => {
    e.preventDefault();

    const code = input.value.trim();
    const username = usernameElement.value.trim();
    const isNewRoom = false;
    socket.emit("checkRooms", { code, isNewRoom, username });
});

socket.on("roomCodeStatus", ({ code, isTaken, isReconnection }) => {
    const selected = document.querySelector('input[name="skull"]:checked');
    if (isTaken && selected) {
        const idleImage = `${selected.value.trim()}-idle.png`;
        const excitedImage = `${selected.value.trim()}-excited.png`;
        const username = usernameElement.value.trim();
        if (isReconnection != undefined) {
            player = isReconnection;
            player.idleImage = idleImage;
            player.excitedImage = excitedImage;
            player.id = socket.id;
            player.votedBy = [];
            console.log(`Reconnecting ${username}`);
            socket.emit("reconnection", player);
        } else {
            socket.emit("playerJoin", { code, username, idleImage, excitedImage });
            transitionToPlayerScreen(code);
        }
    } else {
        console.log("No Room of that code try again")
        warning.innerText = "There is no room with this code or someone already has your username, pick another"
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
            const div = document.createElement('div');
            div.innerHTML = `<img class="awaiting-icon player-skull" data-player="${player.username}" src="Assets/${player.icon}"/>
                            <p>${player.username}</p>`;
            div.classList.add("awaiting-player");
            playerList.appendChild(div);
        }
    });
}

function transitionToPlayerScreen(code) {
    playerUsername.textContent = usernameElement.value.trim();
    playerRoom.textContent = code;
    form.style.display = "none";
    playersDiv.style.display = "flex";
    title.innerText = "";
    navbar.style.display = "none";
    jumpBtn.style.display = "block";
}

function displayQuestion(question, players) {
    playersDiv.style.display = "none";
    form.style.display = "none";
    title.innerText = "";
    navbar.style.display = "none";
    jumpBtn.style.display = "block";
    playerQuestion.style.display = "block";
    playerQuestion.innerText = question;
    playerVotingOptions.style.display = "flex";
    playerVotingOptions.innerHTML = "";

    // Updating score
    console.log(players);
    console.log(usernameElement.value.trim());
    const self = players.filter(player => player.username == usernameElement.value.trim())[0];
    console.log(self);
    playerUsername.innerText = `${self.username} : ${self.score}`;

    players.forEach((player) => {
        const buttonElement = document.createElement("button");
        buttonElement.innerText = player.username;
        buttonElement.classList.add("voting-button");
        playerVotingOptions.appendChild(buttonElement);
    });
}

socket.on("updateDisconnect", (players) => {
    playerVotingOptions.innerHTML = "";
    players.forEach((player) => {
        const buttonElement = document.createElement("button");
        buttonElement.innerText = player.username;
        buttonElement.classList.add("voting-button");
        playerVotingOptions.appendChild(buttonElement);
    });
})

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
    playerVotingOptions.style.display = "none";
    results.style.display = "flex";
    // Sorting the players
    players.sort((a, b) => b.score - a.score);

    // Displaying the players
    players.forEach(player => {
        const newElement = document.createElement("p");
        newElement.innerHTML = `<img class="awaiting-icon player-skull" data-player="${player.username}" src="Assets/${player.icon}"/>
                        <p>${player.username} : ${player.score}</p>`;
        newElement.classList.add("result");
        results.appendChild(newElement);
    })
})

jumpBtn.addEventListener("click", e => {
    socket.emit("Jump");
})

socket.on("playerJumped", (player) => {
    document.querySelectorAll('.player-skull').forEach(img => {
    const playerData = img.dataset.player;
    if (playerData == player.username) {
        img.src = `Assets/${player.icon}`;
    };
    });
})