let players = [];

function newPlayer (id, roomcode, username) {
    const player = {id, roomcode, username, score: 0, votedBy: []};
    players.push(player);
    return player;
}

function getRoomPlayers (roomcode) {
    return players.filter(player => player.roomcode == roomcode);
}

function getPlayerByUsername(username) {
    return players.find(player => player.username == username);
}

function getPlayerbyId(id) {
    return players.find(player => player.id == id);
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

function votedByPlayer(votedPlayer, voter) {
    votedPlayer.votedBy.push(voter.username);
}


module.exports = {
    newPlayer,
    getRoomPlayers,
    getPlayerByUsername,
    getPlayerbyId,
    playerLeave,
    removeAllPlayers,
    votedByPlayer
}