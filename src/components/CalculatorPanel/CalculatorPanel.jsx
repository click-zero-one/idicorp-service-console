
import { useState } from "react";
import { useLanguage } from "../../i18n/useLanguage";
import { calculate } from "../../services/calculatorSocket";
import "./CalculatorPanel.css";

const translations = {
  fa: {
    eyebrow: "Ø§Ø¨Ø²Ø§Ø± Ù…Ø­Ø§Ø³Ø¨Ø§ØªÛŒ",
    title: "Ù…Ø§Ø´ÛŒÙ†â€ŒØ­Ø³Ø§Ø¨ Ø²Ù†Ø¯Ù‡",
    description: "Ù…Ø­Ø§Ø³Ø¨Ø§Øª Ø±Ø§ Ø§Ø² Ø·Ø±ÛŒÙ‚ Ø§ØªØµØ§Ù„ WebSocket Ø§Ù†Ø¬Ø§Ù… Ø¨Ø¯Ù‡.",
    operation: "Ø¹Ù…Ù„ÛŒØ§Øª",
    add: "Ø¬Ù…Ø¹",
    subtract: "ØªÙØ±ÛŒÙ‚",
    multiply: "Ø¶Ø±Ø¨",
    divide: "ØªÙ‚Ø³ÛŒÙ…",
    first: "Ø¹Ø¯Ø¯ Ø§ÙˆÙ„",
    second: "Ø¹Ø¯Ø¯ Ø¯ÙˆÙ…",
    calculate: "Ù…Ø­Ø§Ø³Ø¨Ù‡ Ú©Ù†",
    result: "Ù†ØªÛŒØ¬Ù‡",
    invalid: "Ù„Ø·ÙØ§Ù‹ Ø¯Ùˆ Ø¹Ø¯Ø¯ Ù…Ø¹ØªØ¨Ø± ÙˆØ§Ø±Ø¯ Ú©Ù†.",
    divisionByZero: "ØªÙ‚Ø³ÛŒÙ… Ø¨Ø± ØµÙØ± Ù…Ø¬Ø§Ø² Ù†ÛŒØ³Øª.",
    error: "Ù…Ø­Ø§Ø³Ø¨Ù‡ Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯. Ø§ØªØµØ§Ù„ ÛŒØ§ Ù†Ø´Ø³Øª ÙˆØ±ÙˆØ¯ Ø±Ø§ Ø¨Ø±Ø±Ø³ÛŒ Ú©Ù†.",
    loading: "Ø¯Ø± Ø­Ø§Ù„ Ù…Ø­Ø§Ø³Ø¨Ù‡...",
  },
  en: {
    eyebrow: "CALCULATION TOOL",
    title: "Live calculator",
    description: "Calculate values over a WebSocket connection.",
    operation: "Operation",
    add: "Add",
    subtract: "Subtract",
    multiply: "Multiply",
    divide: "Divide",
    first: "First number",
    second: "Second number",
    calculate: "Calculate",
    result: "Result",
    invalid: "Enter two valid numbers.",
    divisionByZero: "Division by zero is not allowed.",
    error: "Calculation failed. Check the connection or session.",
    loading: "Calculating...",
  },
};

export default function CalculatorPanel({ accessToken }) {
  const { language } = useLanguage();
  const t = translations[language] || translations.fa;

  const [operation, setOperation] = useState("add");
  const [first, setFirst] = useState("10");
  const [second, setSecond] = useState("20");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCalculate(event) {
    event.preventDefault();
    setError("");
    setResult(null);

    const a = Number(first);
    const b = Number(second);

    if (
      first.trim() === "" ||
      second.trim() === "" ||
      !Number.isFinite(a) ||
      !Number.isFinite(b) ||
      Math.abs(a) > 1e12 ||
      Math.abs(b) > 1e12
    ) {
      setError(t.invalid);
      return;
    }

    if (operation === "divide" && b === 0) {
      setError(t.divisionByZero);
      return;
    }

    setLoading(true);

    try {
      const value = await calculate(accessToken, operation, [a, b]);
      setResult(value);
    } catch (err) {
      setError(err.message || t.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="calculator-panel" dir={language === "fa" ? "rtl" : "ltr"}>
      <p className="calculator-panel__eyebrow">{t.eyebrow}</p>
      <h2>{t.title}</h2>
      <p className="calculator-panel__description">{t.description}</p>

      <form className="calculator-panel__form" onSubmit={handleCalculate}>
        <label>
          {t.operation}
          <select
            value={operation}
            onChange={(event) => setOperation(event.target.value)}
          >
            <option value="add">{t.add}</option>
            <option value="subtract">{t.subtract}</option>
            <option value="multiply">{t.multiply}</option>
            <option value="divide">{t.divide}</option>
          </select>
        </label>

        <div className="calculator-panel__numbers">
          <label>
            {t.first}
            <input
              type="number"
              step="any"
              value={first}
              onChange={(event) => setFirst(event.target.value)}
              required
            />
          </label>

          <label>
            {t.second}
            <input
              type="number"
              step="any"
              value={second}
              onChange={(event) => setSecond(event.target.value)}
              required
            />
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? t.loading : t.calculate}
        </button>
      </form>

      {error && (
        <p className="calculator-panel__error" role="alert">
          {error}
        </p>
      )}

      {result !== null && (
        <div className="calculator-panel__result" role="status">
          <span>{t.result}</span>
          <strong>{result}</strong>
        </div>
      )}
    </section>
  );
}

