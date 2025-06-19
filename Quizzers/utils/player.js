let players = [];

function newPlayer (id, roomcode, username) {
    const player = {id, roomcode, username};
    players.push(player);
    return player;
}

function getPlayers () {
    return players;
}

function playerLeave(id) {
    const index = players.findIndex(player => player.id == id);

    if (index !== -1 && index != undefined) {
        return players.splice(index, 1)[0];
    }
}

function removeAllPlayers(roomcode) {
    players = players.filter(player => player.roomcode != roomcode);
}


module.exports = {
    newPlayer,
    getPlayers,
    playerLeave,
    removeAllPlayers
}