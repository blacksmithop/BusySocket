const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

options = {
    cors: true,
    origins: ["http://localhost:4200"],
}

const io = new Server(server, options);

// Serve Static files
const path = require('path')
app.use('/static', express.static(path.join(__dirname, 'uploads')))

// CORS
const cors = require('cors');
app.use(cors());

// Import routes
const login = require('./routes/login');
app.use('/', login);
const save = require('./routes/save');
app.use('/', save);

// Message schema
const Message = require('./routes/schema/message');

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

    socket.on('find user', (id) => {
        socket.to(id).emit("request identity", socket.id);
    })

    socket.on('identify as', (data) => {
        socket.to(data.id).emit("give identity", data);
    })

    socket.on('send message', (msg) => {

        io.to(socket.room).emit("room message", { msg: msg, author: socket.id, user: socket.user, type: 'msg' });
    })

    socket.on('send image', (url) => {

        io.to(socket.room).emit("room message", {
            msg: url, author: socket.id, user: socket.user, type: 'image'
        });
    })

    socket.on("load chat history", (data) => {
        const receiver = io.sockets.sockets.get(data);

        Message.find({ from: socket.user.username, to: receiver.username }, function (err, chat) {
            if (err) {
                console.log("No previous chat history");
            }
            console.log(chat);

        });
    });
    socket.on("send private message", (data) => {
        console.log("Private chat ", socket.user.username);
        socket.to(data.receiver).emit("private message",
            {
                msg: data.message, author: socket.id, user: socket.user, type: 'msg'
            });
        //const receiver = io.sockets.sockets.get(data.receiver);
        // Fetch to username

        msg = {
            body: data.message,
            from: socket.user.username,
            to: data.username,
            time: Date(),
            type: 'msg',
            user: socket.user
        }
        saveMessage = new Message(msg);
        saveMessage.save().then(function (resp) {
            console.log("???? Message saved");
        });
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