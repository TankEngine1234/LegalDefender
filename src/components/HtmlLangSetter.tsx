"use client";

import { useEffect } from "react";
import { useLanguage } from "./LanguageProvider";

export function HtmlLangSetter() {
  const { language } = useLanguage();

  useEffect(() => {
    document.documentElement.lang = language === "es" ? "es" : "en";
  }, [language]);

  return null;
}
