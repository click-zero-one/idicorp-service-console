import { useState } from "react";
import { useLanguage } from "../../i18n/useLanguage";
import { calculate } from "../../services/calculatorSocket";
import "./CalculatorPanel.css";

const translations = {
  fa: {
    eyebrow: "ابزار محاسبات",
    title: "ماشین‌حساب آنلاین",
    description: "عملیات ریاضی را از طریق اتصال به سرویس محاسبات انجام دهید.",
    operation: "عملیات ریاضی",
    add: "جمع",
    subtract: "تفریق",
    multiply: "ضرب",
    divide: "تقسیم",
    first: "عدد اول",
    second: "عدد دوم",
    calculate: "محاسبه",
    result: "نتیجه",
    invalid: "لطفاً دو عدد معتبر وارد کنید.",
    divisionByZero: "تقسیم بر صفر امکان‌پذیر نیست.",
    error: "محاسبه انجام نشد. اتصال به سرویس را بررسی کنید.",
    loading: "در حال محاسبه...",
  },
  en: {
    eyebrow: "CALCULATION TOOL",
    title: "Calculator",
    description: "Perform arithmetic operations through the calculation service.",
    operation: "Operation",
    add: "Add",
    subtract: "Subtract",
    multiply: "Multiply",
    divide: "Divide",
    first: "First number",
    second: "Second number",
    calculate: "Calculate",
    result: "Result",
    invalid: "Please enter two valid numbers.",
    divisionByZero: "Division by zero is not allowed.",
    error: "Calculation failed. Check the service connection.",
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
    <section
      className="calculator-panel"
      dir={language === "fa" ? "rtl" : "ltr"}
    >
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
