import { createServer } from 'http';
import { WebSocketServer } from 'ws';

/**
 * Simple WS server. En producción:
 * - Autenticación JWT
 * - Ping/Pong heartbeat
 * - Escalabilidad (Redis pub/sub)
 */

const httpServer = createServer();
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

interface ClientContext {
  role?: string;
  branchId?: string;
}

wss.on('connection', (socket, req) => {
  const ctx: ClientContext = {};
  socket.send(JSON.stringify({ type:'WELCOME', message:'Connected' }));

  socket.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === 'AUTH') {
        // Dummy auth
        ctx.role = msg.role;
        ctx.branchId = msg.branchId;
        socket.send(JSON.stringify({ type:'AUTH_OK' }));
      }
      if (msg.type === 'SUBSCRIBE_KPI') {
        socket.send(JSON.stringify({ type:'KPI_SNAPSHOT', data: currentKPI() }));
      }
    } catch (e) {
      socket.send(JSON.stringify({ type:'ERROR', error:String(e) }));
    }
  });
});

function currentKPI() {
  // Simulación. Luego integrar con cálculo real.
  return {
    salesLast5Min: Math.round(Math.random()*5),
    avgTicket: +(Math.random()*1000).toFixed(2),
    marginPct: +(10 + Math.random()*30).toFixed(2)
  };
}

setInterval(() => {
  const payload = JSON.stringify({ type:'KPI_UPDATE', data: currentKPI() });
  wss.clients.forEach(c => {
    if (c.readyState === 1) c.send(payload);
  });
}, 10000);

httpServer.listen(8082, () => {
  console.log('WS realtime server on :8082');
});