const roomCodeDisplay = document.getElementById("roomcode-display");
const playerList = document.getElementById("player-list")
const form = document.getElementById("hosting-form");
const input = document.getElementById("roomcode");
const playersDiv = document.getElementById("players");

let roomcode;

const socket = io();

console.log("Host JS Running");

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

socket.on("hostMessage", msg => {
    console.log(msg);
});

socket.on("roomPlayers", (players) => {
    updatePlayerList(players);
})

function updatePlayerList(players) {
    playerList.innerHTML = '';
    players.forEach((player) => {
        const li = document.createElement('li');
        li.innerText = player.username;
        playerList.appendChild(li);
    });
}

function transitionToHostedGame(roomcode) {
    roomCodeDisplay.innerHTML = `Room Code is "${roomcode}"`;
    form.style.display = "none";
    playersDiv.style.display = "block";
}