
import "./WelcomePanel.css";
import { useLanguage } from "../../i18n/useLanguage";

function WelcomePanel() {
  const { t } = useLanguage();

  return (
    <section
      className="welcome-panel"
      aria-labelledby="welcome-title"
    >
      <div className="welcome-panel__content">
        <span className="welcome-panel__eyebrow">
          {t.heroEyebrow}
        </span>

        <h2
          id="welcome-title"
          className="welcome-panel__title"
        >
          {t.heroTitleFirst}
          <br />
          <span>{t.heroTitleSecond}</span>
        </h2>

        <p className="welcome-panel__description">
          {t.heroDescription}
        </p>

        <div className="welcome-panel__note">
          <span aria-hidden="true">âœ³</span>
          {t.heroNote}
        </div>
      </div>

      <div
        className="welcome-panel__art"
        aria-hidden="true"
      >
        <div className="welcome-panel__paper">
          <span className="welcome-panel__paper-label">
            {t.paperLabel}
          </span>

          <span className="welcome-panel__paper-symbol">
            â†—
          </span>

          <span className="welcome-panel__paper-caption">
            {t.paperCaption.split("\n").map((line, index) => (
              <span key={`${line}-${index}`}>
                {line}
                {index < t.paperCaption.split("\n").length - 1 && (
                  <br />
                )}
              </span>
            ))}
          </span>
        </div>

        <div className="welcome-panel__sun" />

        <div className="welcome-panel__sticker">
          {t.sticker.split("\n").map((line, index) => (
            <span key={`${line}-${index}`}>{line}</span>
          ))}
        </div>

        <span className="welcome-panel__spark welcome-panel__spark--one">
          âœ³
        </span>

        <span className="welcome-panel__spark welcome-panel__spark--two">
          +
        </span>
      </div>

      <span className="welcome-panel__serial" aria-hidden="true">
        IDI / 001
      </span>
    </section>
  );
}

export default WelcomePanel;

