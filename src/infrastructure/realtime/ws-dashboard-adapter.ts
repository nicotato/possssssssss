export class RealtimeDashboardAdapter {
  private ws?: WebSocket;
  private listeners: ((data:any)=>void)[] = [];

  connect(url = 'ws://localhost:8082/ws') {
    this.ws = new WebSocket(url);
    this.ws.onopen = () => {
      this.ws?.send(JSON.stringify({ type:'AUTH', role:'ADMIN', branchId:'b_centro' }));
      this.ws?.send(JSON.stringify({ type:'SUBSCRIBE_KPI' }));
    };
    this.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'KPI_UPDATE' || msg.type === 'KPI_SNAPSHOT') {
          this.listeners.forEach(l => l(msg.data));
        }
      } catch {}
    };
  }

  onMetrics(cb:(data:any)=>void) {
    this.listeners.push(cb);
  }
}