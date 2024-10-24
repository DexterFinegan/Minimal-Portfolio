const express = require('express')
const app = express()

// socket.io setup
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io")
const io = new Server(server, {pingInterval: 2000, pingTimeout: 5000});

const port = 3000

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

const backEndPlayers = {}

io.on('connection', (socket) => {
  console.log('a user connected');

  io.emit("updatePlayers", backEndPlayers)

  socket.on("initGame", ({username}) => {
    // adding a player to players list
    backEndPlayers[socket.id] = {
    username
    }
  })

  // removing players
  socket.on("disconnect", (reason) => {
    console.log(reason)
    delete backEndPlayers[socket.id]
    io.emit("updatePlayers", backEndPlayers)
  })

  console.log(backEndPlayers)
});


server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
