const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

const clients = new Map();
let hostSocket = null;

function broadcastClientList() {
  const clientList = Array.from(clients.entries()).map(([id, data]) => ({
    id,
    part: data.part,
    state: data.state || "waiting",
    eventIndex: data.eventIndex || 0,
    elapsed: data.elapsed || 0,
  }));
  if (hostSocket) {
    hostSocket.emit("client-list", clientList);
  }
}

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  socket.on("register-client", (part) => {
    clients.set(socket.id, { part, socket });
    console.log(`Client registered as Player ${part}:`, socket.id);
    broadcastClientList();
  });

  socket.on("register-host", () => {
    hostSocket = socket;
    console.log("Host registered:", socket.id);
    broadcastClientList();
  });

  socket.on("clock-sync", (clientTime) => {
    socket.emit("clock-sync-response", {
      clientTime,
      serverTime: Date.now(),
    });
  });

  socket.on("state-update", (data) => {
    if (clients.has(socket.id)) {
      const clientData = clients.get(socket.id);
      clientData.state = data.state;
      clientData.eventIndex = data.eventIndex;
      clientData.elapsed = data.elapsed;
      broadcastClientList();
    }
  });

  socket.on("start", (data) => {
    if (socket === hostSocket) {
      const startTimestamp = Date.now() + 500;
      const startMeasure = (data && data.startMeasure) || 1;
      console.log("Host triggered start at server time:", startTimestamp, "measure:", startMeasure);

      clients.forEach((clientData) => {
        clientData.socket.emit("start", { startTime: startTimestamp, startMeasure });
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);

    if (clients.has(socket.id)) {
      clients.delete(socket.id);
      broadcastClientList();
    }

    if (socket === hostSocket) {
      hostSocket = null;
      console.log("Host disconnected");
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`For other devices, use http://<your-ip>:${PORT}`);
});
