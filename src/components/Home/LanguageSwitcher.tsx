import { useTranslation } from "react-i18next";
export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language.startsWith("kh") ? "kh" : "en";
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      {" "}
      <button
        type="button"
        onClick={() => void i18n.changeLanguage("en")}
        aria-label="English"
        className={`flex h-8 items-center gap-1 rounded-md px-1.5 text-[11px] font-semibold transition-colors ${currentLanguage === "en" ? "bg-blue-700 text-white" : "text-slate-600 hover:bg-slate-100"}`}
      >
        {" "}
        <span></span> <span>EN</span>{" "}
      </button>{" "}
      <button
        type="button"
        onClick={() => void i18n.changeLanguage("kh")}
        aria-label="Khmer"
        className={`flex h-8 items-center gap-1 rounded-md px-1.5 text-[11px] font-semibold transition-colors ${currentLanguage === "kh" ? "bg-blue-700 text-white" : "text-slate-600 hover:bg-slate-100"}`}
      >
        {" "}
        <span></span> <span>KH</span>{" "}
      </button>{" "}
    </div>
  );
}
