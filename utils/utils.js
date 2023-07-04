import { lobbies } from "../index.js";

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

// Revisar resultado de la partida
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

export { generateLobbyId, getLobbyIdByPlayer, checkWinner };