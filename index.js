import express from "express";
import http from "http";
import { Server as SocketServer } from "socket.io";
import dotenv from "dotenv";
import { create, join, leave } from "./controllers/lobby_controllers.js";
import { start, move, restart } from "./controllers/match_controllers.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT | 4000;
const CLIENT_URL = process.env.CLIENT_URL;
export const io = new SocketServer(server, {
  cors: {
    origin: CLIENT_URL,
  },
});

export const lobbies = [];

io.on("connection", async (socket) => {
  // Evento cuando un jugador crea un lobby
  socket.on("createLobby", (data) => create(socket, data));

  // Evento cuando un jugador se une a un lobby existente
  socket.on("joinLobby", (data) => join(socket, data));

  //Evento al iniciar partida
  socket.on("startMatch", () => start(socket));

  //Evento cuando un jugador realiza un movimiento
  socket.on("makeMovement", (data) => move(socket, data));

  //Evento para volver a jugar
  socket.on("restartMatch", () => restart(socket));

  // Evento cuando un jugador se desconecta
  socket.on("disconnect", () => leave(socket));
});

server.listen(PORT, () => {
  console.log("Server Online");
});