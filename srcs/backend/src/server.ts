import http from "http";
import { Server } from "socket.io";
import app from "./app";

const PORT = process.env.PORT || 8080;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://localhost:8443"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("client connected:", socket.id);

  socket.on("frontend-message", (data) => {
    console.log("input received:", data);
  });

  const interval = setInterval(() => {
    socket.emit("backend-message", {
      message: "Backend is alive",
      time: new Date().toISOString(),
    });
  }, 5000);

  socket.on("disconnect", () => {
    clearInterval(interval);
    console.log("client disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
