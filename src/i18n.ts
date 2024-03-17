import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";

export const resources = {
  en,
} as const;

export const availableLanguages = Object.keys(resources);

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    defaultNS: "common",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
