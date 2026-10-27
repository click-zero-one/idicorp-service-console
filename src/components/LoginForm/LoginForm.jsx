
import { useCallback, useEffect, useState } from "react";

import { useLanguage } from "../../i18n/useLanguage";
import { getLoginChallenge, login } from "../../services/api";

import "./LoginForm.css";

function LoginForm({ onLoginSuccess }) {
  const { t } = useLanguage();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  const [challenge, setChallenge] = useState(null);
  const [captchaLoading, setCaptchaLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [captchaError, setCaptchaError] = useState(false);


  const loadCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    setCaptchaError(false);
    setErrorMessage("");
    setCaptchaAnswer("");

    try {
      const data = await getLoginChallenge();

      if (!data.captcha || !data.salt) {
        throw new Error("Invalid login challenge");
      }

      setChallenge({
        captcha: data.captcha,
        salt: data.salt,
      });
    } catch {
      setChallenge(null);
      setCaptchaError(true);
    } finally {
      setCaptchaLoading(false);
    }
  }, []);


  useEffect(() => {
    loadCaptcha();
  }, [loadCaptcha]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!challenge || submitting) {
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const result = await login({
        username: username.trim(),
        password,
        salt: challenge.salt,
        captcha_answer: captchaAnswer.trim(),
      });

      if (!result.access_token) {
        throw new Error("Missing access token");
      }

      onLoginSuccess(result.access_token);
    } catch (error) {
      if (error instanceof TypeError) {
        setErrorMessage(t.networkError);
      } else {
        setErrorMessage(t.loginError);
      }

      await loadCaptcha();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="login-panel" aria-labelledby="login-title">
      <div className="login-panel__heading">
        <span className="login-panel__eyebrow">
          {t.loginEyebrow}
        </span>

        <h2 id="login-title" className="login-panel__title">
          {t.loginTitle}
        </h2>

        <p className="login-panel__description">
          {t.loginDescription}
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

        <div className="login-form__field">
          <label htmlFor="login-captcha">
            {t.captchaLabel}
          </label>

          <div className="login-form__captcha">
            <div className="login-form__captcha-image">
              {captchaLoading ? (
                <span className="login-form__captcha-message">
                  {t.loadingCaptcha}
                </span>
              ) : challenge ? (
                <img
                  src={challenge.captcha}
                  alt={t.captchaLabel}
                />
              ) : (
                <span className="login-form__captcha-message">
                  {t.captchaUnavailable}
                </span>
              )}
            </div>

            <button
              className="login-form__refresh"
              type="button"
              onClick={loadCaptcha}
              disabled={captchaLoading || submitting}
            >
              {t.refreshCaptcha}
            </button>
          </div>

          <input
            id="login-captcha"
            name="captcha"
            type="text"
            autoComplete="off"
            placeholder={t.captchaPlaceholder}
            value={captchaAnswer}
            onChange={(event) =>
              setCaptchaAnswer(event.target.value)
            }
            required
            disabled={submitting || !challenge}
          />
        </div>

        {errorMessage && (
          <p className="login-form__error" role="alert">
            {errorMessage}
          </p>
        )}

        {captchaError && (
          <p className="login-form__error" role="alert">
            {t.captchaUnavailable}
          </p>
        )}

        <button
          className="login-form__submit"
          type="submit"
          disabled={
            submitting ||
            captchaLoading ||
            captchaError ||
            !challenge
          }
        >
          {submitting ? t.submittingLogin : t.submitLogin}
        </button>
      </form>
    </section>
  );
}

export default LoginForm;

