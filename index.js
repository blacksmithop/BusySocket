const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// CORS
const cors = require('cors');
app.use(cors());

// Import routes
const login = require('./routes/login');
app.use('/', login);


app.get('/', (req, res) => {
    res.status(200).send({
        message: 'OK'
    });
});


// Socket operations
io.on('connection', (socket) => {
    console.log(`User connected as ${socket.id}`);
    // Join default room
    socket.join('general');

    socket.emit('list rooms', getActiveRooms(io));

    socket.room = 'general'

    // On disconnect (from general)
    socket.on("disconnect", () => {
        io.to(socket.room).emit('user leave', socket.id);
        if (socket.user) {
            io.to(socket.room).emit("room message", {
                msg: `User ${socket.user.username} has left the chat`, author: 'socket_id', user: {
                    username: "System"
                }
            });
        }

        console.log(`User ${socket.id} has disconnected`);
    });

    // Get socket io
    socket.on('whoami', () => {
        socket.emit('socket-id', socket.id);
    })
    socket.on('join room', (room_name) => {
        socket.room = room_name;
        socket.join(room_name);
        //System message
        io.to(socket.room).emit("room message", {
            msg: `User ${socket.user.username} has joined ${room_name}`, author: 'socket_id', user: {
                username: "System"
            }
        });
        socket.emit('socket-id', socket.id);

        socket.emit('list rooms', getActiveRooms(io));
    });


    socket.on('set-identity', (user) => {
        data = {}
        data.identity = user;
        data.id = socket.id;

        socket.user = data.identity;

        io.to(socket.room).emit("room message", {
            msg: `User ${socket.user.username} has joined the chat`, author: 'socket_id', user: {
                username: "System"
            }
        });
        io.to(socket.room).emit('user join', data);

    })

    socket.on('send message', (msg) => {

        io.to(socket.room).emit("room message", { msg: msg, author: socket.id, user: socket.user });
    })

    socket.on("private message", (anotherSocketId, msg) => {
        socket.to(anotherSocketId).emit("private message", socket.id, msg);
    });
});

// Get active rooms
function getActiveRooms(io) {
    const arr = Array.from(io.sockets.adapter.rooms);
    const filtered = arr.filter(room => !room[1].has(room[0]))
    const res = filtered.map(i => i[0]);
    return res;
}


// Run server
server.listen(3000, () => {
    console.log('Listening on *:3000');
});