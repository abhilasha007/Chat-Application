const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users');

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicPath = path.join(__dirname, '../public')

app.use(express.static(publicPath))

// when a client connects
io.on('connection', (socket) => {
    console.log('New Websocket connection')
    
    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({ id:socket.id, username, room })
        if(error) {
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateMessage('Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${username} has joined!`)) 
        callback()
    })

    // Recieving message from client
    socket.on('sendMessage', (msg, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(msg)) {
            return callback('Dont use bad words!')
        }
        //sending message to all clients
        io.to(user.room).emit('message', generateMessage(msg))
        callback()
    })
    
    // Recieving location from client
    socket.on('sendLocation', ({latitude, longitude}, callback)=>{
        //sending location message to every client
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(`https://www.google.co.in/maps?q=${latitude},${longitude}`))
        callback()
    })

    // When a client disconnects
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left the chat.`))
        }
    })
})

server.listen(port, () => {
    console.log(`Server started at port ${port}!`);
})