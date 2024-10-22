
const socket = io()

const frontEndPlayers = {}

socket.on("updatePlayers", (backEndPlayers) => {
  for (const id in backEndPlayers) {
    const backEndPlayer = backEndPlayers[id]

    if (!frontEndPlayers[id]) {
      frontEndPlayers[id] = new Player({})
      }
  }

  // this is where we delete frontend players
  for (const id in frontEndPlayers) {
    if (!backEndPlayers[id]) {
      delete frontEndPlayers[id]
    }
  }
})

// document.querySelector("#usernameForm").addEventListener("submit", (event) => {
//   event.preventDefault()
//   document.querySelector("#usernameForm").style.display = "none"
//   socket.emit("initGame", {username : document.querySelector("#usernameInput").value})
// })
