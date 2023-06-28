import express from "express";
import http from "http";
import { Server as SocketServer } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const lobbies = [];

io.on("connection", async (socket) => {
  console.log("Player Connected", socket.id);

  // Evento cuando un jugador crea un lobby
  socket.on("createLobby", (player) => {
    if (player) {
      const id = generateLobbyId();
      const name = `Lobby ${lobbies.length + 1}`;
      const gameboard = Array(9).fill("");
      const score = [0, 0];
      const lobby = {
        id,
        name,
        players: [{ id: socket.id, name: player.name, avatar: player.avatar, marker: "X", score: 0 }],
        gameboard,
        score,
        turn: Math.floor(Math.random() * 2),
        status: "waiting",
        draw: false,
        winner: ""
      };
      lobbies.push(lobby);
      socket.join(id);
      socket.emit("lobbyCreated", lobby);
    }
  });

  // Evento cuando un jugador se une a un lobby existente
  socket.on("joinLobby", (data) => {
    const { lobbyId, player } = data;
    const lobby = lobbies.find((l) => l.id === lobbyId);
    if (lobby && lobby.status === "waiting") {
      socket.join(lobbyId);
      lobby.players.push({
        id: socket.id,
        name: player.name,
        avatar: player.avatar,
        marker: "O",
        score: 0
      });
      io.to(lobbyId).emit("lobbyJoined", lobby);
    } else {
      socket.emit("lobbyNotFound");
    }
  });

  //Evento al iniciar partida
  socket.on("startMatch", () => {
    const lobbyId = getLobbyIdByPlayer(socket.id);
    const lobby = lobbies.find(l => l.id === lobbyId);
    lobby.status = "started"
    io.to(lobbyId).emit("matchStarted", lobby);
  })

  //Evento cuando un jugador realiza un movimiento
  socket.on("makeMovement", (data) => {
    console.log("MOVE", data);
    const { marker, index } = data;
    const lobbyId = getLobbyIdByPlayer(socket.id);
    const lobby = lobbies.find(l => l.id === lobbyId);
    lobby.gameboard[index] = marker;
    lobby.lastMarker = marker;
    lobby.turn = lobby.turn === 0 ? 1 : 0;

    const winnerMarker = checkWinner(lobby?.gameboard);
    if (winnerMarker) {
      const winner = lobby.players.find((player => player.marker === winnerMarker));
      winner.score++;
      lobby.status = 'finished';
      lobby.winner = winner;
    } else if (lobby.gameboard.every((cell) => cell !== "")) {
      lobby.draw = true;
    }
    console.log("SCORE DEL GANADOR", lobby.players);
    io.to(lobbyId).emit("opponentMove", lobby);
  });

  //Evento para volver a jugar
  socket.on("restartMatch", () => {
    const lobbyId = getLobbyIdByPlayer(socket.id);
    const lobby = lobbies.find(l => l.id === lobbyId);
    lobby.gameboard = Array(9).fill("");
    lobby.status = 'playing';
    lobby.winner = "";
    io.to(lobbyId).emit("matchRestarted", lobby);
    console.log("RESTART MATCH");
  })

  // Evento cuando un jugador se desconecta
  socket.on("disconnect", () => {
    const lobbyId = getLobbyIdByPlayer(socket.id);
    if (lobbyId) {
      const lobby = lobbies.find((l) => l.id === lobbyId);
      if (lobby) {
        const playerIndex = lobby.players.findIndex(
          (player) => player.id === socket.id
        );
        if (playerIndex !== -1) {
          lobby.players.splice(playerIndex, 1);
          io.to(lobbyId).emit("playerList", lobby.players);
        }
      }
    }
  });
});

// Generar identificador unico para el lobby
function generateLobbyId() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let lobbyId = "";
  for (let i = 0; i < 6; i++) {
    lobbyId += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return lobbyId;
}

// Obtener el identificador del lobby por el jugador
function getLobbyIdByPlayer(playerId) {
  const lobby = lobbies.find((lobby) => {
    return lobby.players.find((player) => player.id === playerId);
  });
  if (lobby) return lobby.id;
  return null;
}

function checkWinner(gameboard) {
  const winningCombinations = [
    [0, 1, 2], // Fila superior
    [3, 4, 5], // Fila del medio
    [6, 7, 8], // Fila inferior
    [0, 3, 6], // Columna izquierda
    [1, 4, 7], // Columna del medio
    [2, 5, 8], // Columna derecha
    [0, 4, 8], // Diagonal principal
    [2, 4, 6], // Diagonal secundaria
  ];

  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (
      gameboard[a] &&
      gameboard[a] === gameboard[b] &&
      gameboard[a] === gameboard[c]
    ) {
      return gameboard[a];
    }
  }

  return null;
}

server.listen(4000, () => {
  console.log("Server Online");
});