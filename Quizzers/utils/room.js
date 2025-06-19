const rooms = []

function newRoom(id, roomcode) {
    const room = {id, roomcode};
    rooms.push(room);

    return room;
}

function getRooms() {
    return rooms;
}

function roomLeave(id) {
    const index = rooms.findIndex(room => room.id == id);

    if (index !== -1 && index != undefined) {
        return rooms.splice(index, 1)[0];
    }
}

module.exports = {
    newRoom,
    getRooms,
    roomLeave
}