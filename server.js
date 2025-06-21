const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

// Chat Room Imports
const formatMessage = require("./Chat Room/utils/messages");
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("./Chat Room/utils/users");

// Quiz Game Imports
const { newRoom, getRooms, roomLeave, generateQuestions, addAnswer, resetAnswers } = require("./Quizzers/utils/room");
const { newPlayer, getRoomPlayers, playerLeave, removeAllPlayers, votedByPlayer, getPlayerByUsername, getPlayerbyId } = require("./Quizzers/utils/player");

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
            const roomcode = player.roomcode;
            const remainingPlayers = getRoomPlayers(roomcode);
            io.to(roomcode).emit("roomPlayers", remainingPlayers);
            io.to(roomcode).emit("playerMessage", `${player.username} disconnected`);
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
    // When a player joins
    socket.on("playerJoin", ({ code, username }) => {
        // Player Part
        console.log("Player Joining");
        const player = newPlayer(socket.id, code, username);
        socket.emit("playerMessage", player)
        socket.join(player.roomcode)

        // Host Part
        const players = getRoomPlayers(code);
        io.to(code).emit("hostMessage", players);
        io.to(code).emit("roomPlayers", players);
    });

    // For Checking availability of rooms
    socket.on("checkRooms", ({ code, isNewRoom }) => {
        rooms = getRooms();
        const isTaken = rooms.some(room => room.roomcode == code);
        if (!isTaken && isNewRoom) {
            const questions = generateQuestions();
            const room = newRoom(socket.id, code, questions);
            socket.join(room.roomcode);

            socket.emit("hostMessage", (room));
        }
        socket.emit("roomCodeStatus", { code, isTaken });
    })

    // Starting the game
    socket.on("startGame", (roomcode) => {
        console.log("Server Starting Game")
        const players = getRoomPlayers(roomcode);
        const room = getRooms().find(room => room.roomcode == roomcode)
        const question = room.questions[0].question;
        room.questionCount += 1;
        io.to(roomcode).emit("nextQuestion", { question, players });
    })

    socket.on("Voted", (player) => {
        const voted = getPlayerByUsername(player);
        const voter = getPlayerbyId(socket.id);
        console.log(`${voted.username} was voted by ${voter.username}`);
        votedByPlayer(voted, voter);
        io.to(voter.roomcode).emit("updateVotes", {voted, voter});
    })

    socket.on("Answered", (answer) => {
        const player = getPlayerbyId(socket.id);
        const roomcode = player.roomcode;
        const totalPlayers = getRoomPlayers(roomcode);
        console.log(`${player.username} answered with "${answer}"`);
        const answerObject = { answer, player };
        const allAnswers = addAnswer({ answerObject, totalPlayers});

        if (allAnswers != undefined) {
            io.to(roomcode).emit("answerReveal", allAnswers);
            resetAnswers();
        }
    })

    socket.on("questionAnswer", (selectedPlayer) => {
        const playerWin = getPlayerByUsername(selectedPlayer);
        const players = getRoomPlayers(playerWin.roomcode);
        // Awarding points
        players.forEach(player => {
            if (playerWin.votedBy.includes(player.username)) {
                player.score += 100;
            } else {
                playerWin.score += 100;
            };
        });
        io.to(playerWin.roomcode).emit("updateScores", players);

        // Clearing the Votedby list
        players.forEach(player => {
            player.votedBy = [];
        });

        // Setting Up Next Question
        const room = getRooms().find(room => room.roomcode == playerWin.roomcode);
        if (room.questionCount != room.questions.length){
            const question = room.questions[room.questionCount].question;
            room.questionCount += 1;
            io.to(playerWin.roomcode).emit("nextQuestion", {question, players})
        } else {
            console.log("Game is over")
            io.to(playerWin.roomcode).emit("displayResults", players);
        };
    })
});

const PORT = 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));