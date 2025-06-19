const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

// Chat Room Imports
const formatMessage = require("./Chat Room/utils/messages");
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("./Chat Room/utils/users");

// Quiz Game Imports
const { newRoom, getRooms, roomLeave } = require("./Quizzers/utils/room");
const { newPlayer, getPlayers, playerLeave, removeAllPlayers } = require("./Quizzers/utils/player");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

app.use("/chat", express.static(path.join(__dirname, "Chat Room/public")));
app.use("/poop", express.static(path.join(__dirname, "Poopathon/public")));
app.use("/slots", express.static(path.join(__dirname, "SlotMachine/public")));
app.use("/shooter", express.static(path.join(__dirname, "Shooter/public")));
app.use("/snake", express.static(path.join(__dirname, "Snake/public")));
app.use("/quiz", express.static(path.join(__dirname, "Quizzers/public")));

const botName = "Chat Bot";

// Run when a client connects
io.on("connection", socket => {
    console.log("Connected")

    // FOR THE CHAT BOT
    socket.on("joinRoom", ({ username, room }) => {
        console.log("Why is this running")
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        // Welcome current user
        socket.emit("message", formatMessage(botName, "Welcome to the Chat Room"));

        // Broadcast when a user connects
        socket.broadcast.to(user.room).emit("message", formatMessage(botName, `${user.username} has joined the chat`));

        // Send users and room info
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    });

    // Listen for chatMessage
    socket.on("chatMessage", (msg) => {
        const user = getCurrentUser(socket.id);


        io.to(user.room).emit("message", formatMessage(user.username, msg));
    });

    // Runs when client disconnects
    socket.on("disconnect", () => {
        // Checking Chat App
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit("message", formatMessage(botName, `${user.username} has left the chat`));

            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }

        // Checking Quiz App Players
        const player = playerLeave(socket.id);
        if (player) {
            const remainingPlayers = getPlayers();
            io.to(player.roomcode).emit("roomPlayers", remainingPlayers);
            io.to(player.roomcode).emit("playerMessage", `${player.username} disconnected`);
            console.log("A Player Disconnected");
        }

        // Checking Quiz App host
        const room = roomLeave(socket.id);
        if (room) {
            removeAllPlayers(room.roomcode);
            io.to(room.roomcode).emit("returnToHome")
        }

        
    });

    // FOR THE QUIZ

    socket.on("playerJoin", ({ code, username }) => {
        // Player Part
        console.log("Player Joining");
        const player = newPlayer(socket.id, code, username);
        socket.emit("playerMessage", player)
        socket.join(player.roomcode)

        // Host Part
        const players = getPlayers();
        io.emit("hostMessage", players);
        io.to(code).emit("roomPlayers", players);
    });

    socket.on("checkRooms", ({ code, isNewRoom }) => {
        rooms = getRooms();
        const isTaken = rooms.some(room => room.roomcode == code);
        if (!isTaken && isNewRoom) {
            const room = newRoom(socket.id, code);
            socket.join(room.roomcode);

            socket.emit("hostMessage", (room));
        }
        socket.emit("roomCodeStatus", { code, isTaken });
    })
});

const PORT = 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));