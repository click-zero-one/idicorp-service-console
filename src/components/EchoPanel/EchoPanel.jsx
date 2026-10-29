
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../i18n/useLanguage";
import { createEchoSocket } from "../../services/echoSocket";
import "./EchoPanel.css";

const translations = {
  fa: {
    eyebrow: "ارتباط زنده",
    title: "آزمایش Echo",
    description: "پیامت را ارسال کن و پاسخ سرویس را دریافت کن.",
    connect: "اتصال مجدد",
    connected: "متصل",
    connecting: "در حال اتصال",
    disconnected: "قطع اتصال",
    closed: "اتصال بسته شد",
    message: "پیام",
    placeholder: "یک پیام بنویس...",
    send: "ارسال پیام",
    sent: "ارسال شد",
    received: "دریافت شد",
    empty: "هنوز پیامی ردوبدل نشده است.",
    connectionError: "اتصال به سرویس Echo ناموفق بود.",
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
  setError("");
  setStatus("connecting");

  if (socketRef.current) {
    socketRef.current.reconnect();
  }
}


useEffect(() => {
  let active = true;

  const socket = createEchoSocket({
    onOpen: () => {
      if (!active) return;

      setStatus("connected");
      setError("");
    },

    onMessage: (rawMessage) => {
      if (!active) return;

      let displayText = rawMessage;

      try {
        const data = JSON.parse(rawMessage);

        if (data?.type === "ready") {
          setStatus("connected");
          return;
        }

        if (typeof data?.text === "string") {
          displayText = data.text;
        }
      } catch {
        // پیام متنی معمولی است.
      }

      setHistory((previous) => [
        ...previous,
        {
          id: `${Date.now()}-${Math.random()}`,
          direction: "received",
          text: displayText,
        },
      ]);
    },

    onError: (errorMessage) => {
      if (!active) return;

      setStatus("error");
      setError(errorMessage || t.connectionError);
    },

    onClose: (info) => {
      if (!active) return;

      setStatus("disconnected");
      console.info("Echo socket closed:", info);
    },
  });

  socketRef.current = socket;

  return () => {
    active = false;
    socket.close();
    socketRef.current = null;
  };
}, [t.connectionError]);

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
    error: t.connectionError,
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

