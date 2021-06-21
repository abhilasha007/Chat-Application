const socket = io()

// Elements
const $messageForm = document.querySelector('#m-form')
const $messageInput = $messageForm.querySelector('input')
const $messageButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector("#display-messages")

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationMessageTemplate = document.querySelector("#location-template").innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix : true })

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

// Recieving message from server
socket.on('message', ({username, text, createdAt})=>{
    console.log(username, text)
    const html = Mustache.render(messageTemplate, {
        username: username,
        message: text,
        createdAt: moment(createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

// Recieving location from server
socket.on('locationMessage', ({username, url, createdAt}) => {
    console.log(username, url);
    const html2 = Mustache.render(locationMessageTemplate, {
        username: username,
        link: url,
        createdAt: moment(createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html2)
    autoscroll()
})

// Recieving side bar data from server
socket.on('roomData', ({room, users}) => {
    console.log(room, users);
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

// Send button
$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault() 
    $messageButton.disabled = true;
    const message = e.target.elements.messageInput.value
    // sending message to server
    socket.emit('sendMessage', message, (error) => {
        $messageButton.disabled = false
        $messageInput.value = ''
        $messageInput.focus()
        if(error) {
            return console.log(error);
        }
        console.log('Message delievered');
    })
})

// Location button
$locationButton.addEventListener('click', ()=>{
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by by your browser');
    }
    $locationButton.disabled = true
    navigator.geolocation.getCurrentPosition((position)=>{
        // sending location to client
        socket.emit("sendLocation", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $locationButton.disabled = false
            console.log('Location shared!');
        })
    })
})

socket.emit('join', { username, room }, (error)=>{
    if(error) {
        alert(error)
        location.href = '/'
    }
})