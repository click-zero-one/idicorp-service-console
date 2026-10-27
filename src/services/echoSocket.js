const ECHO_WS_URL = "wss://ts.idicorp.ir/ws/echo";

export function createEchoSocket({ onOpen, onMessage, onClose, onError }) {
  let socket = null;
  let intentionallyClosed = false;

  const connect = () => {
    intentionallyClosed = false;

    socket = new WebSocket(ECHO_WS_URL);

    socket.addEventListener("open", () => {
      onOpen?.();
    });

    socket.addEventListener("message", (event) => {
      onMessage?.(event.data);
    });

    socket.addEventListener("error", () => {
      // مرورگر جزئیات WebSocket error را در اختیار JS نمی‌گذارد.
      // جزئیات واقعی معمولاً در Network/Console قابل مشاهده است.
      if (!intentionallyClosed) {
        onError?.("اتصال Echo برقرار نشد.");
      }
    });

    socket.addEventListener("close", (event) => {
      if (!intentionallyClosed) {
        onClose?.({
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });
      }
    });
  };

  connect();

  return {
    send(message) {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        return false;
      }

      socket.send(message);
      return true;
    },

close() {
  intentionallyClosed = true;

  if (!socket) return;

  if (socket.readyState === WebSocket.OPEN) {
    socket.close(1000, "Component unmounted");
  }
},

    reconnect() {
      if (socket) {
        intentionallyClosed = true;

        if (
          socket.readyState === WebSocket.CONNECTING ||
          socket.readyState === WebSocket.OPEN
        ) {
          socket.close();
        }
      }

      connect();
    },

    get readyState() {
      return socket?.readyState ?? WebSocket.CLOSED;
    },
  };
}