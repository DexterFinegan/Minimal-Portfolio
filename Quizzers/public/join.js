const playerDescription = document.getElementById("player-description");
const playerList = document.getElementById("player-list");
const form = document.getElementById("joining-form");
const input = document.getElementById("roomcode");
const usernameElement = document.getElementById("username");
const playersDiv = document.getElementById("players-div");

const socket = io();

console.log("Join JS Running");

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