const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "frontend")));

let latestData = null;
let clients = [];

// Server-Sent Events (SSE) endpoint
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Add to client list
  clients.push(res);

  // Remove on client disconnect
  req.on("close", () => {
    clients = clients.filter((c) => c !== res);
  });
});

// Broadcast new data to all connected clients
function broadcast(data) {
  const json = JSON.stringify(data);
  clients.forEach((res) => res.write(`data: ${json}\n\n`));
}

// Make.com or Python POSTs here
app.post("/alpr-hook", (req, res) => {
  latestData = req.body;
  broadcast(latestData);
  res.json({ status: "ok", received: latestData });
});

// Optional: For manual fetches
app.get("/latest", (req, res) => {
  res.json(latestData || { message: "No data yet." });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
