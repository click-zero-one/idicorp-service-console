
const CALCULATOR_WS_URL =
  "wss://ts.idicorp.ir/ws/calculator";

export function calculate(accessToken, operation, numbers) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(CALCULATOR_WS_URL);
    let ready = false;
    let settled = false;

    const timeout = setTimeout(() => {
      finish(new Error("Connection timed out."));
    }, 8000);

    function finish(error, result) {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);

      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close();
      }

      if (error) reject(error);
      else resolve(result);
    }

    socket.addEventListener("open", () => {
      socket.send(JSON.stringify({ token: accessToken }));
    });

    socket.addEventListener("message", (event) => {
      let data;

      try {
        data = JSON.parse(event.data);
      } catch {
        finish(new Error("Invalid server response."));
        return;
      }

      if (!ready && data.type === "ready") {
        ready = true;
        socket.send(JSON.stringify({ operation, numbers }));
        return;
      }

      if (typeof data.result === "number") {
        finish(null, data.result);
      } else if (data.error) {
        finish(new Error(data.error));
      }
    });

    socket.addEventListener("error", () => {
      finish(new Error("Could not connect to calculator."));
    });

    socket.addEventListener("close", () => {
      if (!settled) {
        finish(new Error("Calculator connection closed unexpectedly."));
      }
    });
  });
}
