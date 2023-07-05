import { io, lobbies } from "../index.js";
import { getLobbyIdByPlayer, checkWinner } from "../utils/utils.js";
import { checkMove } from "../utils/validations.js";

const start = (socket) => {
    try {
        const lobbyId = getLobbyIdByPlayer(socket.id);
        const lobby = lobbies.find(l => l.id === lobbyId);
        lobby.status = "playing"
        io.to(lobbyId).emit("matchStarted", lobby);
    } catch (error) {
        socket.emit("error");
        console.log("Error en match_controllers.js - start", error);
    }
}

const move = (socket, data) => {
    try {
        const { marker, index } = data;
        const sanitizedData = checkMove(data);

        if (sanitizedData) {
            const lobbyId = getLobbyIdByPlayer(socket.id);
            const lobby = lobbies.find(l => l.id === lobbyId);

            if (lobby) {
                lobby.gameboard[index] = marker;
                lobby.lastMarker = marker;
                lobby.turn = lobby.turn === 0 ? 1 : 0;
            }

            const winnerMarker = checkWinner(lobby?.gameboard);
            if (winnerMarker) {
                const winner = lobby.players.find((player => player.marker === winnerMarker));
                winner.score++;
                lobby.status = 'finished';
                lobby.winner = winner;
            } else if (lobby.gameboard.every((cell) => cell !== "")) {
                lobby.draw = true;
            }

            io.to(lobbyId).emit("movement", lobby);
            socket.broadcast.to(lobbyId).emit("oponentMovement", socket.id);
        } else {
            socket.emit("error");
            console.log("Datos ingresados no validos en match_controllers.js - move");
        }
    } catch (error) {
        socket.emit("error");
        console.log("Error en match_controllers.js - move", error);
    }
}

const restart = (socket) => {
    try {
        const lobbyId = getLobbyIdByPlayer(socket.id);
        const lobby = lobbies.find(l => l.id === lobbyId);
        lobby.gameboard = Array(9).fill("");
        lobby.status = 'playing';
        lobby.winner = "";
        lobby.draw = false;
        io.to(lobbyId).emit("matchRestarted", lobby);
    } catch (error) {
        socket.emit("error");
        console.log("Error en match_controllers.js - restart", error);
    }
}

export { start, move, restart };