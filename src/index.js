const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicPath = path.join(__dirname, '../public')

app.use(express.static(publicPath))

// when a client connects
io.on('connection', (socket) => {
    console.log('New Websocket connection')

    // Sending message to connected client
    socket.emit('message', generateMessage('Welcome!'))
    socket.broadcast.emit('message', generateMessage('A new user has joined!')) 

    // Recieving message from client
    socket.on('sendMessage', (msg, callback) => {
        const filter = new Filter()

        if(filter.isProfane(msg)) {
            return callback('Dont use bad words!')
        }

        //sending message to every client
        io.emit('message', generateMessage(msg))
        callback()
    })
    
    // Recieving location from client
    socket.on('sendLocation', ({latitude, longitude}, callback)=>{
        //sending location message to every client
        io.emit('locationMessage', generateLocationMessage(`https://www.google.co.in/maps?q=${latitude},${longitude}`))
        callback()
    })

    // When a client disconnects
    socket.on('disconnect', ()=>{
        io.emit('message', generateMessage('A user has left!'))
    })
})

server.listen(port, () => {
    console.log(`Server started at port ${port}!`);
})