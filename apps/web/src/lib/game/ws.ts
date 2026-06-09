import type { ServerOutMessage, ClientInMessage } from '@canterball/shared';

type MessageHandler = (msg: ServerOutMessage) => void;

export class GameConnection {
  private ws: WebSocket | null = null;
  private handlers = new Set<MessageHandler>();

  connect(roomId: string, playerName: string): void {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_SERVER_URL || location.host;
    const url = `${protocol}//${host}/ws?room=${encodeURIComponent(roomId)}&name=${encodeURIComponent(playerName)}`;

    this.ws = new WebSocket(url);

    this.ws.addEventListener('message', (event) => {
      try {
        const msg: ServerOutMessage = JSON.parse(event.data);
        for (const handler of this.handlers) {
          handler(msg);
        }
      } catch {
        console.error('Invalid message from server:', event.data);
      }
    });

    this.ws.addEventListener('close', () => {
      console.log('Connection closed');
      for (const handler of this.handlers) {
        handler({ type: 'OPPONENT_DISCONNECTED' });
      }
    });

    this.ws.addEventListener('error', (err) => {
      console.error('WebSocket error:', err);
      for (const handler of this.handlers) {
        handler({ type: 'ERROR', message: 'Connection error' });
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(msg: ClientInMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  onMessage(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  get connected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
