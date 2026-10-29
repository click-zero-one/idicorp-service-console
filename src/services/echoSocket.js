const ECHO_WS_URL = "wss://ts.idicorp.ir/ws/echo";

export function createEchoSocket({ onOpen, onMessage, onClose, onError }) {
  let socket = null;
  let intentionallyClosed = false;

  const connect = () => {
    intentionallyClosed = false;

    const currentSocket = new WebSocket(ECHO_WS_URL);
    socket = currentSocket;

    currentSocket.addEventListener("open", () => {
      if (socket !== currentSocket || intentionallyClosed) return;
      onOpen?.();
    });

    currentSocket.addEventListener("message", (event) => {
      if (socket !== currentSocket || intentionallyClosed) return;
      onMessage?.(event.data);
    });

    currentSocket.addEventListener("error", () => {
      // مرورگر جزئیات کامل خطای WebSocket را در اختیار JavaScript نمی‌گذارد.
      if (socket !== currentSocket || intentionallyClosed) return;
      onError?.("اتصال به سرویس Echo برقرار نشد.");
    });

    currentSocket.addEventListener("close", (event) => {
      if (socket !== currentSocket || intentionallyClosed) return;

      onClose?.({
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });
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

      if (
        socket &&
        (socket.readyState === WebSocket.CONNECTING ||
          socket.readyState === WebSocket.OPEN)
      ) {
        socket.close();
      }

      socket = null;
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
