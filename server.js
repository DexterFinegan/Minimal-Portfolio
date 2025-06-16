const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./Chat Room/utils/messages");
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("./Chat Room/utils/users")

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

const botName = "Chat Bot";

// Run when a client connects
io.on("connection", socket => {
    console.log("Connected")
    socket.on("joinRoom", ({ username, room}) => {
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
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit("message", formatMessage(botName, `${user.username} has left the chat`));
        }

        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });
});

const PORT = 80;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));