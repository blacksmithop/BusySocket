const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

users = [];

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log(`User connected [ ${socket.id} ]`);
    users.push(socket.id);

    // On disconnect
    socket.on("disconnect", () => {
        const index = users.indexOf(socket.id);
        if (index > -1) {
            users.splice(index, 1);
        }
        console.log(`User [ ${socket.id} ] has disconnected`);

    });

    // Join a default room
    //socket.join('general');
    //io.to("general").emit("Welcome to General");

    socket.on('list users', () => {
        socket.emit('users-list', users);
    })

    // return user id 
    socket.on('whoami', () => {
        socket.emit('socket-id', socket.id);
    })

    socket.on('send message', (msg) => {
        console.log(msg);
        socket.broadcast.emit("room message", msg);
    })

    socket.on("private message", (anotherSocketId, msg) => {
        socket.to(anotherSocketId).emit("private message", socket.id, msg);
    });
});

server.listen(3000, () => {
    console.log('Listening on *:3000');
});