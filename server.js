// server.js
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// __define-ocg__  AI-powered chat simulation
let varOcg = "AI Chat Bot";
let messageHistory = [
  { id: 1, user: "Alice", message: "Hey team, morning!", timestamp: "2025-07-29T08:01:00Z" },
  { id: 2, user: "Bob", message: "Morning Alice!", timestamp: "2025-07-29T08:01:15Z" }
];

// API route to return stored messages
app.get("/api/messages", (req, res) => {
  res.json(messageHistory);
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// AI reply function
function aiRespond(msg) {
  return `🤖 ${varOcg}: I received "${msg}" and I'm processing it.`;
}

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (data) => {
    let parsed = {};
    try {
      parsed = JSON.parse(data);
    } catch {
      return;
    }

    // If React sends { type: "message", data: { ... } }
    if (parsed.type === "message" && parsed.data) {
      const msg = parsed.data;
      messageHistory.push(msg);

      // Broadcast user message
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "message", data: msg }));
        }
      });

      // AI typing indicator
      setTimeout(() => {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "typing", data: { user: varOcg } }));
          }
        });
      }, 500);

      // AI reply after 2s
      setTimeout(() => {
        const aiMsg = {
          id: Date.now(),
          user: varOcg,
          message: aiRespond(msg.message),
          timestamp: new Date().toISOString(),
        };
        messageHistory.push(aiMsg);
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "message", data: aiMsg }));
          }
        });
      }, 2000);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(3001, () => {
  console.log("Server running at http://localhost:3001");
});
