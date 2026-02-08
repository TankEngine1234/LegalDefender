"use client";

import { useLanguage } from "./LanguageProvider";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-lg bg-white/10 p-1">
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-label="English"
        className={`rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
          language === "en"
            ? "bg-white/20 text-white"
            : "text-white/70 hover:text-white"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("es")}
        aria-label="Español"
        className={`rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
          language === "es"
            ? "bg-white/20 text-white"
            : "text-white/70 hover:text-white"
        }`}
      >
        ES
      </button>
    </div>
  );
}
