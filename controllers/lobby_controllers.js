import { io, lobbies } from "../index.js";
import { generateLobbyId, getLobbyIdByPlayer } from "../utils/utils.js";
import { checkLobbyId, checkPlayer } from "../utils/validations.js";

const create = (socket, player) => {
    try {
        const sanitizedPlayer = checkPlayer(player);

        if (sanitizedPlayer.ok) {
            const { playerName, playerAvatar } = sanitizedPlayer.data;
            const id = generateLobbyId();
            const name = `Lobby ${lobbies.length + 1}`;
            const gameboard = Array(9).fill("");
            const score = [0, 0];
            const lobby = {
                id,
                name,
                players: [{ id: socket.id, name: playerName, avatar: playerAvatar, marker: "O", score: 0 }],
                gameboard,
                score,
                turn: Math.floor(Math.random() * 2),
                status: "waiting",
                draw: false,
                winner: "",
                owner: socket.id
            };
            lobbies.push(lobby);
            socket.join(id);
            socket.emit("userReady", player);
            socket.emit("lobbyCreated", lobby);
        } else {
            socket.emit("error");
            console.log("Datos ingresados no validos en lobby_controllers.js - create");
        }
    } catch (error) {
        console.log("Error en lobby_controllers.js - create", error);
    }
}

const join = (socket, data) => {
    try {
        const { lobbyId, player } = data;
        const sanitizedLobbyId = checkLobbyId(lobbyId)
        const sanitizedPlayer = checkPlayer(player)

        if (sanitizedLobbyId.ok && sanitizedPlayer.ok) {
            const { id } = sanitizedLobbyId.data;
            const { playerName, playerAvatar } = sanitizedPlayer.data;
            const lobby = lobbies.find((l) => l.id === lobbyId);

            if (lobby && lobby.status === "waiting") {
                socket.join(id);
                lobby.players.push({
                    id: socket.id,
                    name: playerName,
                    avatar: playerAvatar,
                    marker: lobby.players[0].marker === "X" ? "O" : "X",
                    score: 0
                });
                socket.emit("userReady", player);
                io.to(lobbyId).emit("lobbyJoined", lobby);
            } else {
                socket.emit("lobbyNotFound");
            }
        } else {
            socket.emit("error");
            console.log("Datos ingresados no validos en lobby_controllers.js - join");
        }
    } catch (error) {
        socket.emit("error");
        console.log("Error en lobby_controllers.js - join", error);
    }
}

const leave = (socket) => {
    try {
        const lobbyId = getLobbyIdByPlayer(socket.id);
        if (lobbyId) {
            const lobby = lobbies.find((l) => l.id === lobbyId);
            if (lobby) {
                const playerIndex = lobby.players.findIndex(
                    (player) => player.id === socket.id
                );
                if (playerIndex !== -1) {
                    lobby.players.splice(playerIndex, 1);
                    lobby.gameboard = Array(9).fill("");
                    lobby.status = "waiting";
                    lobby.owner = lobby.players[0]?.id;
                    io.to(lobbyId).emit("playerLeave", lobby);
                }

                if (lobby.players.length === 0) {
                    const lobbyIndex = lobbies.findIndex((l) => l.id === lobbyId);
                    lobbies.splice(lobbyIndex, 1);
                }
            }
        }
    } catch (error) {
        socket.emit("error");
        console.log("Error en lobby_controllers.js - leave", error);
    }
}

export { create, join, leave };