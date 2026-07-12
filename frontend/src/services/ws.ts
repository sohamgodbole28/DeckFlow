import { useStore } from '../store/useStore';

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimer: any = null;
  private pingTimer: any = null;

  connect() {
    let deviceId = useStore.getState().deviceId;
    if (!deviceId) {
      deviceId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      useStore.getState().setDeviceId(deviceId);
    }
    console.log("[WS] Connecting with deviceId:", deviceId);
    this.ws = new WebSocket(`ws://${window.location.hostname}:8000/ws/${deviceId}`);

    this.ws.onopen = () => {
      useStore.getState().setServerConnected(true);
      if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
      
      this.pingTimer = setInterval(() => {
        this.send("ping", {});
      }, 5000);
    };

    this.ws.onclose = () => {
      useStore.getState().setServerConnected(false);
      useStore.getState().setAgentConnected(false);
      if (this.pingTimer) clearInterval(this.pingTimer);
      
      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, 3000);
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const { event: ev, data } = message;

        if (ev === "pong") {
          // heartbeat
        } else if (ev === "status.update") {
          if (data.device_id === "desktop_agent") {
            // we could infer agent connection status based on heartbeat updates later
            // but for now, we just know something happened
          }
        } else if (ev === "error") {
          console.error("[WS ERROR]", data);
          alert(`WebSocket Error: ${data.message}`);
        } else {
          console.log("[WS] Unhandled event:", ev, data);
        }
      } catch (e) {
        console.error("Invalid WS message");
      }
    };
  }

  send(event: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
    }
  }
}

export const wsService = new WebSocketService();
