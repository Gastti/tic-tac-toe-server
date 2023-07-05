import express from "express";
import http from "http";
import { Server as SocketServer } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { create, join, leave } from "./controllers/lobby_controllers.js";
import { start, move, restart } from "./controllers/match_controllers.js";
const CLIENT_URL = process.env.CLIENT_URL;

dotenv.config();

const app = express();

app.use(cors({
  origin: CLIENT_URL,
  methods: "GET, POST, PUT, DELETE",
  allowedHeaders: "Content-Type, Authorization"
}));

const server = http.createServer(app);
const PORT = process.env.PORT | 4000;

const corsOptions = {
  origin: CLIENT_URL,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export const io = new SocketServer(server, {
  cors: corsOptions,
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