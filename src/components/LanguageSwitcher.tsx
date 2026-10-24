
import { useTranslation } from "react-i18next";
import "flag-icons/css/flag-icons.min.css";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.language.startsWith("kh")
    ? "kh"
    : "en";

  const changeLanguage = (language: "en" | "kh") => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
  };

  const nextLanguage = currentLanguage === "kh" ? "en" : "kh";

  return (
    <button
      type="button"
      onClick={() => changeLanguage(nextLanguage)}
      aria-label={
        currentLanguage === "kh"
          ? "Switch to English"
          : "ប្ដូរទៅភាសាខ្មែរ"
      }
      title={
        currentLanguage === "kh"
          ? "Switch to English"
          : "ប្ដូរទៅភាសាខ្មែរ"
      }
      className="flex h-10 w-10 items-center justify-center rounded-md bg-transparent p-0 transition-transform duration-200 hover:scale-105 active:scale-95"
    >
      {currentLanguage === "kh" ? (
        <span
          className="fi fi-kh text-2xl"
          role="img"
          aria-label="Cambodia flag"
        />
      ) : (
        <span
          className="fi fi-gb text-2xl"
          role="img"
          aria-label="United Kingdom flag"
        />
      )}
    </button>
  );
}

