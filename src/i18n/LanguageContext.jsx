import { useEffect, useState } from "react";
import { LanguageContext } from "./LanguageContext";

import { translations } from "./translations";


function getInitialLanguage() {
  try {
    const savedLanguage = localStorage.getItem("idicorp-language");

    if (savedLanguage === "fa" || savedLanguage === "en") {
      return savedLanguage;
    }
  } catch {
    // Ø§Ú¯Ø± Ø°Ø®ÛŒØ±Ù‡â€ŒØ³Ø§Ø²ÛŒ Ù…Ø±ÙˆØ±Ú¯Ø± Ø¯Ø± Ø¯Ø³ØªØ±Ø³ Ù†Ø¨Ø§Ø´Ø¯ØŒ Ø§Ø² Ø²Ø¨Ø§Ù† Ù¾ÛŒØ´â€ŒÙØ±Ø¶ Ø§Ø³ØªÙØ§Ø¯Ù‡ Ù…ÛŒâ€ŒÚ©Ù†ÛŒÙ….
  }

  return "fa";
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);

  const direction = language === "fa" ? "rtl" : "ltr";
  const t = translations[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;

    try {
      localStorage.setItem("idicorp-language", language);
    } catch {
      // ØªØºÛŒÛŒØ± Ø²Ø¨Ø§Ù† Ø­ØªÛŒ Ø¨Ø¯ÙˆÙ† Ø§Ù…Ú©Ø§Ù† Ø°Ø®ÛŒØ±Ù‡â€ŒØ³Ø§Ø²ÛŒ Ù‡Ù… Ø¨Ø§ÛŒØ¯ Ú©Ø§Ø± Ú©Ù†Ø¯.
    }
  }, [language, direction]);

  function toggleLanguage() {
    setLanguage((currentLanguage) =>
      currentLanguage === "fa" ? "en" : "fa"
    );
  }

  return (
    <LanguageContext.Provider
      value={{ language, direction, t, toggleLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
}


