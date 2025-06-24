let players = [];
let disconnected_players = [];

function newPlayer (id, roomcode, username, idleImage, excitedImage) {
    const player = {id, roomcode, username, idleImage, excitedImage, icon: idleImage, score: 0, votedBy: []};
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
    const index = players.findIndex(player => player.id === id);

    if (index !== -1) {
        const disconnectedPlayer = players.splice(index, 1)[0]; // only splice once
        disconnected_players.push(disconnectedPlayer);
        return disconnectedPlayer;
    }

    return null;
}

function searchDisconnectedPlayers(username) {
    if (disconnected_players.length > 0){
        return disconnected_players.find(player => player.username == username);
    }
}

function reconnectPlayer(player) {
    // removing from disconnected players
    const index = disconnected_players.findIndex(user => user.username = player.username);
    if (index !== -1 && index != undefined) {
        disconnected_players = disconnected_players.splice(index, 1);
    }

    // Adding player back to game
    players.push(player);
    return players;
}

function removeAllPlayers(roomcode) {
    players.filter(player => player.roomcode != roomcode);
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
    votedByPlayer,
    searchDisconnectedPlayers,
    reconnectPlayer
}