import { useState } from "react";

import { useLanguage } from "../../i18n/useLanguage";

import "./LoginForm.css";

function LoginForm({ onLoginSuccess }) {
  const { t, language } = useLanguage();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    if (!username.trim() || !password) {
      setErrorMessage(
        language === "fa"
          ? "لطفاً نام کاربری و رمز عبور را وارد کنید."
          : "Please enter both username and password."
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    // Demo-only token. This does not authenticate with a real server.
    onLoginSuccess(`demo-token-${Date.now()}`);
  }

  return (
    <section className="login-panel" aria-labelledby="login-title">
      <div className="login-panel__heading">
        <span className="login-panel__eyebrow">
          {language === "fa" ? "حالت نمایشی" : "DEMO MODE"}
        </span>

        <h2 id="login-title" className="login-panel__title">
          {t.loginTitle}
        </h2>

        <p className="login-panel__description">
          {language === "fa"
            ? "برای ورود آزمایشی، یک نام کاربری و رمز عبور دلخواه وارد کنید. این ورود واقعی نیست."
            : "Enter any username and password to explore the demo. No real authentication is performed."}
        </p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-form__field">
          <label htmlFor="login-username">
            {t.usernameLabel}
          </label>

          <input
            id="login-username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder={t.usernamePlaceholder}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            disabled={submitting}
          />
        </div>

        <div className="login-form__field">
          <label htmlFor="login-password">
            {t.passwordLabel}
          </label>

          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder={t.passwordPlaceholder}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            disabled={submitting}
          />
        </div>

        {errorMessage && (
          <p className="login-form__error" role="alert">
            {errorMessage}
          </p>
        )}

        <button
          className="login-form__submit"
          type="submit"
          disabled={submitting}
        >
          {t.submitLogin}
        </button>
      </form>
    </section>
  );
}

export default LoginForm;