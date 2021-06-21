const users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({id, username, room}) => {
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate the data
    if(!username || !room) {
        return {
            error : 'Username and room are required!'
        }
    }

    // Check for exisiting user
    const exisitingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if(exisitingUser) {
        return {
            error: 'Username is already in use! Try another one.'
        }
    }

    // Store user
    const user = {id, username, room}
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    
    if(index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    const user = users.find((user) => user.id === id)
    return user
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    const arr = []
    users.find((user) => {
        if(user.room === room) {
            arr.push(user)
        }
    })
    return arr;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}