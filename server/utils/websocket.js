const WebSocket = require("ws");
const { WS_PORT } = process.env;

let clients = new Map();
let rooms = new Map();

exports.setupWebSocket = () => {
  const wss = new WebSocket.Server({ port: WS_PORT });

  wss.on("connection", (ws) => {
    ws.on("message", (message) => {
      const msg = JSON.parse(message);
      const { event, id, username, avatar, recipientId, groupId, text } = msg;

      if (event === "connection") {
        clients.set(id, ws);
        return;
      }

      if (event === "join_room") {
        if (!rooms.has(groupId)) rooms.set(groupId, new Set());
        rooms.get(groupId).add(id);
        ws.groupId = groupId;
        return;
      }

      if (event === "message") {
        const recipientSocket = clients.get(recipientId);
        if (recipientSocket) recipientSocket.send(JSON.stringify(msg));
        const senderSocket = clients.get(id);
        if (senderSocket) senderSocket.send(JSON.stringify(msg));
      } else if (groupId) {
        if (rooms.has(groupId)) {
          rooms.get(groupId).forEach((userId) => {
            const client = clients.get(userId);
            if (client?.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(msg));
            }
          });
        }
      }
    });

    ws.on("close", () => {
      clients.forEach((socket, userId) => {
        if (socket === ws) {
          clients.delete(userId);
        }
      });
    });
  });

  console.log(`WebSocket server is running on port ${WS_PORT}`);
};
