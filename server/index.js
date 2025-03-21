const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 5000 });
let clients = new Map();

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const msg = JSON.parse(message);

        if (msg.event === 'connection') {
            clients.set(msg.id, ws);
            console.log(`User ${msg.username} connected.`);
            return;
        }

        if (msg.event === 'message') {
            console.log(`Message from ${msg.username} to ${msg.recipientId}: ${msg.message}`);

            const recipientSocket = clients.get(msg.recipientId);
            if (recipientSocket) {
                recipientSocket.send(JSON.stringify(msg));
            }

            const senderSocket = clients.get(msg.id);
            if (senderSocket) {
                senderSocket.send(JSON.stringify(msg));
            }
        }
    });

    ws.on('close', () => {
        clients.forEach((socket, userId) => {
            if (socket === ws) {
                clients.delete(userId);
                console.log(`User ${userId} disconnected.`);
            }
        });
    });
});
