const { Server } = require("socket.io");
let io;
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || "http://localhost:3000", methods: ["GET","POST"] }
  });
  io.on("connection", (socket) => {
    socket.on("disconnect", () => {});
  });
  console.log("🔌 Socket.io initialized");
  return io;
};
const getIO = () => io;
module.exports = { initializeSocket, getIO };