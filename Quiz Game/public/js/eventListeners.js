addEventListener('click', (event) => {

  console.log(`Clicked at (${event.clientX}, ${event.clientY})`)
  
  // socket.emit("shoot", {
  //   x : playerPosition.x,
  //   y : playerPosition.y,
  //   angle
  // })
})

// Host Room Button
document.querySelector("#hostBtn").addEventListener("click", (event) => {
  event.preventDefault()
  console.log("This is the host button")
  document.querySelector("#roomSelectionForm").style.display = "none"
  document.querySelector("#hostRoomForm").style.display = "block"
})

// Join Room Button
document.querySelector("#joinBtn").addEventListener("click", (event) => {
  event.preventDefault()
  console.log("This is the join button")
  document.querySelector("#roomSelectionForm").style.display = "none"
  document.querySelector("#joinRoomForm").style.display = "block"
})

// Host Room Form
document.querySelector("#hostRoomForm").addEventListener("submit", (event) => {
  event.preventDefault()
  console.log("Room is being Hosted")
  document.querySelector("#hostRoomForm").style.display = "none"
})

// Join Room Form
document.querySelector("#joinRoomForm").addEventListener("submit", (event) => {
  event.preventDefault()
  console.log("Room is being Joined")
  document.querySelector("#joinRoomForm").style.display = "none"
})