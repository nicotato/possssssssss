"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var ws_1 = require("ws");
/**
 * Simple WS server. En producción:
 * - Autenticación JWT
 * - Ping/Pong heartbeat
 * - Escalabilidad (Redis pub/sub)
 */
var httpServer = (0, http_1.createServer)();
var wss = new ws_1.WebSocketServer({ server: httpServer, path: '/ws' });
wss.on('connection', function (socket, req) {
    var ctx = {};
    socket.send(JSON.stringify({ type: 'WELCOME', message: 'Connected' }));
    socket.on('message', function (raw) {
        try {
            var msg = JSON.parse(raw.toString());
            if (msg.type === 'AUTH') {
                // Dummy auth
                ctx.role = msg.role;
                ctx.branchId = msg.branchId;
                socket.send(JSON.stringify({ type: 'AUTH_OK' }));
            }
            if (msg.type === 'SUBSCRIBE_KPI') {
                socket.send(JSON.stringify({ type: 'KPI_SNAPSHOT', data: currentKPI() }));
            }
        }
        catch (e) {
            socket.send(JSON.stringify({ type: 'ERROR', error: String(e) }));
        }
    });
});
function currentKPI() {
    // Simulación. Luego integrar con cálculo real.
    return {
        salesLast5Min: Math.round(Math.random() * 5),
        avgTicket: +(Math.random() * 1000).toFixed(2),
        marginPct: +(10 + Math.random() * 30).toFixed(2)
    };
}
setInterval(function () {
    var payload = JSON.stringify({ type: 'KPI_UPDATE', data: currentKPI() });
    wss.clients.forEach(function (c) {
        if (c.readyState === 1)
            c.send(payload);
    });
}, 10000);
httpServer.listen(8082, function () {
    console.log('WS realtime server on :8082');
});
