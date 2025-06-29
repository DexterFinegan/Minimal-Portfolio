const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

// Chat Room Imports
const formatMessage = require("./Chat Room/utils/messages");
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("./Chat Room/utils/users");

// Quiz Game Imports
const { newRoom, getRooms, roomLeave, generateQuestions, addAnswer, resetAnswers, toggleHornyMode, addPlayer, findPlayer } = require("./Quizzers/utils/roomv2");
const { newPlayer, getRoomPlayers, playerLeave, removeAllPlayers, votedByPlayer, getPlayerByUsername, getPlayerbyId } = require("./Quizzers/utils/playerv2");

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
            const username = player.username;
            const begun = getRooms().find(room => room.roomcode == roomcode).begun;
            const type = "disconnect";
            const room = getRooms().find(room => room.roomcode == roomcode);
            const question = room.questions[room.questionCount].question;
            io.to(roomcode).emit("updateDisconnect", ({ remainingPlayers, username, begun, type, question }));
            io.to(roomcode).emit("playerMessage", `${player.username} disconnected`);
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
    socket.on("playerJoin", ({ code, username, idleImage, excitedImage, playerId }) => {
        const reconnectionId = findPlayer({code, playerId});
        if (!reconnectionId){
            // Player Part
            console.log(`${username} is joining`);
            const player = newPlayer(socket.id, code, username, idleImage, excitedImage, playerId);
            addPlayer({code, playerId});
            socket.emit("playerMessage", player);
            socket.join(player.roomcode);

            // Host Part
            const players = getRoomPlayers(code);
            io.to(code).emit("roomPlayers", players);
        } else {
            console.log(`${username} is reconnecting`);
            const player = newPlayer(socket.id, code, username, idleImage, excitedImage, playerId);
            socket.emit("playerMessage", player);
            socket.join(player.roomcode);

            // Host Part
            const players = getRoomPlayers(code);
            const type = "reconnect";
            const begun = getRooms().find(room => room.roomcode == code).begun;
            const room = getRooms().find(room => room.roomcode == code);
            const question = room.questions[room.questionCount].question;
            io.to(code).emit("updateDisconnect", ({players, username, begun, type, question }));
        }
    });


    // For Checking availability of rooms
    socket.on("checkRooms", ({ code, isNewRoom, username }) => {
        const rooms = getRooms();
        let isTaken = rooms.some(room => room.roomcode == code);
        if (!isTaken && isNewRoom) {
            const questions = generateQuestions();
            const room = newRoom(socket.id, code, questions);
            socket.join(room.roomcode);
        } else {
            if (isTaken) {
                const players = getRoomPlayers(code);
                const usernameTaken = players.some(player => player.username == username);
                if (!usernameTaken) {
                    const room = getRooms().find(room => room.roomcode == code);
                } else {
                    console.log(`"${username}" is already in use`);
                    isTaken = false;
                }
                
            };
        };
        
        socket.emit("roomCodeStatus", { code, isTaken });
    })

    // Starting the game
    socket.on("startGame", (roomcode) => {
        console.log("Server Starting Game");
        const players = getRoomPlayers(roomcode);
        const room = getRooms().find(room => room.roomcode == roomcode);
        room.begun = true;
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
            const room = getRooms().find(room => room.roomcode == roomcode);
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
        if (room.questionCount != room.maxQuestions){
            const question = room.questions[room.questionCount].question;
            room.questionCount += 1;
            io.to(playerWin.roomcode).emit("resultsTable", (players));
            setTimeout(() => {
                io.to(playerWin.roomcode).emit("nextQuestion", {question, players});
            }, (3500))
        } else {
            console.log("Game is over")
            io.to(playerWin.roomcode).emit("displayResults", players);
        };
    })

    socket.on("Jump", () => {
        const player = getPlayerbyId(socket.id);
        player.icon = player.excitedImage;
        io.emit("playerJumped", (player));
        setTimeout(() => {
            player.icon = player.idleImage;
            io.emit("playerJumped", (player));
        }, (300));
    })

    socket.on("toggleSafeMode", () => {
        const room = getRooms().find(room => room.id == socket.id);
        toggleHornyMode(room.roomcode);
        console.log(`Toggled safe mode in room with code ${room.roomcode}`)
    });
});

const PORT = 80;      // 80 for server launch, 3000 for local host

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));