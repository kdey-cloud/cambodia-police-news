import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import kh from "./locales/kh.json";
i18n.on("languageChanged", (language) => {
  document.documentElement.lang = language === "kh" ? "km" : "en";
});
i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
    },
    kh: {
      translation: kh,
    },
  },
  lng: localStorage.getItem("language") || "kh",
  fallbackLng: "kh",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;