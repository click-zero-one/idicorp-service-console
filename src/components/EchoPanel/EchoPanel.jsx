
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../i18n/useLanguage";
import { createEchoSocket } from "../../services/echoSocket";
import "./EchoPanel.css";

const translations = {
  fa: {
    eyebrow: "Ø§Ø±ØªØ¨Ø§Ø· Ø²Ù†Ø¯Ù‡",
    title: "Ø¢Ø²Ù…Ø§ÛŒØ´ Echo",
    description: "Ù¾ÛŒØ§Ù…Øª Ø±Ø§ Ø§Ø±Ø³Ø§Ù„ Ú©Ù† Ùˆ Ù¾Ø§Ø³Ø® Ø³Ø±ÙˆÛŒØ³ Ø±Ø§ Ø¯Ø±ÛŒØ§ÙØª Ú©Ù†.",
    connect: "Ø§ØªØµØ§Ù„ Ù…Ø¬Ø¯Ø¯",
    connected: "Ù…ØªØµÙ„",
    connecting: "Ø¯Ø± Ø­Ø§Ù„ Ø§ØªØµØ§Ù„",
    disconnected: "Ù‚Ø·Ø¹ Ø§ØªØµØ§Ù„",
    closed: "Ø§ØªØµØ§Ù„ Ø¨Ø³ØªÙ‡ Ø´Ø¯",
    message: "Ù¾ÛŒØ§Ù…",
    placeholder: "ÛŒÚ© Ù¾ÛŒØ§Ù… Ø¨Ù†ÙˆÛŒØ³...",
    send: "Ø§Ø±Ø³Ø§Ù„ Ù¾ÛŒØ§Ù…",
    sent: "Ø§Ø±Ø³Ø§Ù„ Ø´Ø¯",
    received: "Ø¯Ø±ÛŒØ§ÙØª Ø´Ø¯",
    empty: "Ù‡Ù†ÙˆØ² Ù¾ÛŒØ§Ù…ÛŒ Ø±Ø¯ÙˆØ¨Ø¯Ù„ Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.",
    connectionError: "Ø§ØªØµØ§Ù„ Ø¨Ù‡ Ø³Ø±ÙˆÛŒØ³ Echo Ù†Ø§Ù…ÙˆÙÙ‚ Ø¨ÙˆØ¯.",
  },
  en: {
    eyebrow: "LIVE CONNECTION",
    title: "Echo playground",
    description: "Send a message and receive the server response.",
    connect: "Reconnect",
    connected: "Connected",
    connecting: "Connecting",
    disconnected: "Disconnected",
    closed: "Connection closed",
    message: "Message",
    placeholder: "Write a message...",
    send: "Send message",
    sent: "Sent",
    received: "Received",
    empty: "No messages exchanged yet.",
    connectionError: "Could not connect to Echo.",
  },
};

export default function EchoPanel() {
  const { language } = useLanguage();
  const t = translations[language] || translations.fa;

  const socketRef = useRef(null);
  const [status, setStatus] = useState("connecting");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");


function connect() {
  // Ø§Ú¯Ø± Ø§ØªØµØ§Ù„ Ù‚Ø¨Ù„ÛŒ Ù‡Ù†ÙˆØ² Ø¨Ø±Ù‚Ø±Ø§Ø± Ø§Ø³ØªØŒ Ø¯ÙˆØ¨Ø§Ø±Ù‡ Ø¢Ù† Ø±Ø§ Ù†Ù…ÛŒâ€ŒØ¨Ù†Ø¯ÛŒÙ….
  if (
    socketRef.current &&
    (socketRef.current.readyState === WebSocket.CONNECTING ||
      socketRef.current.readyState === WebSocket.OPEN)
  ) {
    return;
  }

  setError("");
  setStatus("connecting");

  socketRef.current = createEchoSocket({
    onStatus: setStatus,
    onError: setError,
    onMessage: (text) => {
      setHistory((previous) => [
        ...previous,
        {
          id: `${Date.now()}-${Math.random()}`,
          direction: "received",
          text,
        },
      ]);
    },
  });
}


useEffect(() => {
  let active = true;

  const socket = createEchoSocket({
    onOpen: () => {
      if (!active) return;

      setStatus("connected");
      setError("");
    },

    onMessage: (message) => {
      if (!active) return;

      try {
        const data = JSON.parse(message);

        if (data.type === "ready") {
          setStatus("connected");
          return;
        }

        setMessages((prev) => [...prev, data]);
      } catch {
        setMessages((prev) => [...prev, message]);
      }
    },

    onError: (message) => {
      if (!active) return;

      setStatus("error");
      setError(message);
    },

    onClose: (info) => {
      if (!active) return;

      setStatus("disconnected");

      console.info("Echo socket closed:", info);
    },
  });

  return () => {
    active = false;
    socket.close();
  };
}, []);

  function handleSend(event) {
    event.preventDefault();

    if (!message.trim()) return;

    const sentMessage = message;
    const sent = socketRef.current?.send(sentMessage);

    if (!sent) return;

    setHistory((previous) => [
      ...previous,
      {
        id: `${Date.now()}-${Math.random()}`,
        direction: "sent",
        text: sentMessage,
      },
    ]);

    setMessage("");
    setError("");
  }

  const statusLabel = {
    connected: t.connected,
    connecting: t.connecting,
    disconnected: t.disconnected,
    closed: t.closed,
  }[status] || t.connecting;

  return (
    <section
      className="echo-panel"
      dir={language === "fa" ? "rtl" : "ltr"}
    >
      <div className="echo-panel__header">
        <div>
          <p className="echo-panel__eyebrow">{t.eyebrow}</p>
          <h2>{t.title}</h2>
          <p className="echo-panel__description">{t.description}</p>
        </div>

        <span
          className={`echo-panel__status echo-panel__status--${status}`}
          role="status"
        >
          {statusLabel}
        </span>
      </div>

      <div className="echo-panel__history" aria-live="polite">
        {history.length === 0 ? (
          <p className="echo-panel__empty">{t.empty}</p>
        ) : (
          history.map((item) => (
            <article
              key={item.id}
              className={`echo-panel__message echo-panel__message--${item.direction}`}
            >
              <span>
                {item.direction === "sent" ? t.sent : t.received}
              </span>
              <p>{item.text}</p>
            </article>
          ))
        )}
      </div>

      {error && (
        <p className="echo-panel__error" role="alert">
          {error}
        </p>
      )}

      <form className="echo-panel__form" onSubmit={handleSend}>
        <label className="echo-panel__field">
          <span>{t.message}</span>
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={t.placeholder}
            autoComplete="off"
          />
        </label>

        <button
          type="submit"
          disabled={status !== "connected" || !message.trim()}
        >
          {t.send}
        </button>

        <button
          type="button"
          className="echo-panel__reconnect"
          onClick={connect}
        >
          {t.connect}
        </button>
      </form>
    </section>
  );
}

