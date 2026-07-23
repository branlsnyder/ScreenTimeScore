const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path");
const os = require("os");
const qrcode = require("qrcode-terminal");

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

const clients = new Map();
let hostSocket = null;
const HEARTBEAT_INTERVAL = 2000;
const STALE_THRESHOLD = 6000;

setInterval(() => {
  let changed = false;
  const now = Date.now();
  for (const [id, data] of clients.entries()) {
    const wasStale = data.stale;
    data.stale = !data.lastHeartbeat || (now - data.lastHeartbeat) > STALE_THRESHOLD;
    if (data.stale !== wasStale) changed = true;
  }
  if (changed) broadcastClientList();
}, HEARTBEAT_INTERVAL);

function broadcastClientList() {
  const clientList = Array.from(clients.entries()).map(([id, data]) => ({
    id,
    part: data.part,
    state: data.state || "waiting",
    eventIndex: data.eventIndex || 0,
    elapsed: data.elapsed || 0,
    stale: !!data.stale,
  }));
  if (hostSocket) {
    hostSocket.emit("client-list", clientList);
  }
}

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  socket.on("register-client", (part) => {
    clients.set(socket.id, { part, socket, lastHeartbeat: Date.now(), stale: false });
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

  socket.on("heartbeat", (data) => {
    if (clients.has(socket.id)) {
      const clientData = clients.get(socket.id);
      clientData.lastHeartbeat = Date.now();
      if (clientData.stale) {
        clientData.stale = false;
        broadcastClientList();
      }
    }
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
  const localIP = getLocalIP();
  const url = `http://${localIP}:${PORT}`;
  const link = `\x1B]8;;${url}\x07${url}\x1B]8;;\x07`;

  console.log(`\nServer running on http://localhost:${PORT}`);
  console.log(`\n\x1b[1;103;30mOpen on this computer: http://localhost:${PORT}\x1b[0m`);
  console.log(`\n`);
  console.log(`\x1b[1;103;30mOpen on smartphones: ${link}\x1b[0m\n`);
  qrcode.generate(url, { small: true }, (qr) => console.log(qr));
  console.log("\nScan the QR code with your phone camera to open.\n");
});
