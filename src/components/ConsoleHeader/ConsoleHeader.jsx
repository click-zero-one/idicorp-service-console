
import "./ConsoleHeader.css";
import { useLanguage } from "../../i18n/useLanguage";

function ConsoleHeader() {
  const { language, t, toggleLanguage } = useLanguage();

  return (
    <header className="console-header">
      <div className="console-header__brand">
        <div className="console-header__mark" aria-hidden="true">
          ID
        </div>

        <div className="console-header__identity">
          <p className="console-header__eyebrow">
            {t.brandEyebrow}
          </p>

          <h1 className="console-header__title">
            {t.appTitle}
          </h1>
        </div>
      </div>

      <div className="console-header__meta">
        <span className="console-header__status">
          <span
            className="console-header__status-dot"
            aria-hidden="true"
          />
          {t.workspaceStatus}
        </span>

        <span className="console-header__sticker">
          {t.issue}
        </span>

        <button
          className="console-header__language"
          type="button"
          onClick={toggleLanguage}
          aria-label={
            language === "fa"
              ? "Switch language to English"
              : "ØªØºÛŒÛŒØ± Ø²Ø¨Ø§Ù† Ø¨Ù‡ ÙØ§Ø±Ø³ÛŒ"
          }
        >
          {language === "fa" ? "English" : "ÙØ§Ø±Ø³ÛŒ"}
        </button>
      </div>
    </header>
  );
}

export default ConsoleHeader;

