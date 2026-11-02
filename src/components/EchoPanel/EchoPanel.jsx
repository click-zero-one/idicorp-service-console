import { useState } from "react";
import { useLanguage } from "../../i18n/useLanguage";
import "./EchoPanel.css";

const translations = {
  fa: {
    eyebrow: "حالت نمایشی",
    title: "آزمایش Echo",
    description: "پیامت را ارسال کن و پاسخ شبیه‌سازی‌شده را در همین مرورگر ببین.",
    connect: "شروع مجدد",
    connected: "آماده",
    connecting: "در حال آماده‌سازی",
    disconnected: "غیرفعال",
    closed: "بسته شد",
    message: "پیام",
    placeholder: "یک پیام بنویس...",
    send: "ارسال پیام",
    sent: "ارسال‌شده",
    received: "پاسخ نمایشی",
    empty: "هنوز پیامی ردوبدل نشده است.",
    connectionError: "امکان پردازش پیام وجود ندارد.",
  },
  en: {
    eyebrow: "DEMO MODE",
    title: "Echo playground",
    description: "Send a message and see a simulated response in your browser.",
    connect: "Reset demo",
    connected: "Ready",
    connecting: "Preparing",
    disconnected: "Inactive",
    closed: "Closed",
    message: "Message",
    placeholder: "Write a message...",
    send: "Send message",
    sent: "Sent",
    received: "Demo response",
    empty: "No messages exchanged yet.",
    connectionError: "The message could not be processed.",
  },
};

export default function EchoPanel() {
  const { language } = useLanguage();
  const t = translations[language] || translations.fa;

  const [status, setStatus] = useState("connected");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  function connect() {
    setError("");
    setStatus("connected");
  }

  function handleSend(event) {
    event.preventDefault();

    const sentMessage = message.trim();

    if (!sentMessage || status !== "connected") return;

    const timestamp = Date.now();

    setHistory((previous) => [
      ...previous,
      {
        id: `${timestamp}-sent`,
        direction: "sent",
        text: sentMessage,
      },
      {
        id: `${timestamp}-received`,
        direction: "received",
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
  }[status] || t.connected;

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