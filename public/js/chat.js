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

// Recieving message from server
socket.on('message', ({text, createdAt})=>{
    console.log(text)
    const html = Mustache.render(messageTemplate, {
        message: text,
        createdAt: moment(createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

// Recieving location from server
socket.on('locationMessage', ({url, createdAt}) => {
    console.log(url);
    const html2 = Mustache.render(locationMessageTemplate, {
        link: url,
        createdAt: moment(createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html2)
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