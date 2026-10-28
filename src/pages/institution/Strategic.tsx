import { Link } from "react-router-dom";
import { CalendarDays, Eye, ArrowRight, Target } from "lucide-react";
import { useTranslation } from "react-i18next";

const MAIN_COLOR = "#1D4ED8";

export default function Strategic() {
  const { t, i18n } = useTranslation();

  const language = (
    i18n.resolvedLanguage ||
    i18n.language ||
    "en"
  ).toLowerCase();

  const isKhmer = language.startsWith("kh") || language.startsWith("kh");

  const strategyCount = isKhmer ? 5 : 11;
  const strategies = Array.from({ length: strategyCount }, (_, index) =>
    t(`strategic.strategy${index + 1}`),
  );

  const latestNews = [
    {
      title: t("strategic.news1Title"),
      category: t("strategic.news1Category"),
      link: "/",
    },
    {
      title: t("strategic.news2Title"),
      category: t("strategic.news2Category"),
      link: "/",
    },
    {
      title: t("strategic.news3Title"),
      category: t("strategic.news3Category"),
      link: "/",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <section
        className="border-t-4 bg-white border-b border-gray-200"
        style={{ borderTopColor: MAIN_COLOR }}
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-5">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-blue-700"
            >
              <ArrowRight size={16} className="rotate-180" />
              {t("strategic.home")}
            </Link>
          </div>

          <p
            className={`mb-2 text-sm font-semibold uppercase tracking-wider text-blue-700 ${
              isKhmer ? "font-battambang" : "font-inter"
            }`}
          >
            {t("strategic.institution")}
          </p>

          <h1
            className={`text-3xl font-bold leading-tight text-gray-900 sm:text-4xl ${
              isKhmer ? "font-battambang" : "font-inter"
            }`}
          >
            {t("strategic.title")}
          </h1>

          <div
            className={`mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-500 ${
              isKhmer ? "font-battambang" : "font-inter"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={17} />
              {t("strategic.date")}
            </span>

            <span className="inline-flex items-center gap-2">
              <Eye size={17} />
              {t("strategic.views")}
            </span>
          </div>
        </div>
      </section>

      {/* Page Content */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Main Article */}
          <article
            className={`min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8 ${
              isKhmer ? "font-battambang" : "font-inter"
            }`}
          >
            {/* Introduction */}
            <div className="mb-8">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-3 text-blue-700">
                  <Target size={25} />
                </div>

                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  {t("strategic.sectionTitle")}
                </h2>
              </div>

              <p className="text-base leading-8 text-gray-700">
                {t("strategic.introduction")}
              </p>
            </div>

            {/* Strategies */}
            <div>
              <h2 className="mb-5 border-l-4 border-blue-700 pl-4 text-xl font-bold text-gray-900 sm:text-2xl">
                {t("strategic.strategiesTitle")}
              </h2>

              <ol className="space-y-4">
                {strategies.map((strategy, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/50"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
                      {index + 1}
                    </span>

                    <p className="flex-1 text-base leading-8 text-gray-700">
                      {strategy}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Bottom Message */}
            <div className="mt-8 rounded-lg border border-blue-100 bg-blue-50 p-5">
              <p className="text-base leading-8 text-blue-900">
                {t("strategic.conclusion")}
              </p>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Latest News */}
            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2
                  className={`text-lg font-bold text-gray-900 ${
                    isKhmer ? "font-battambang" : "font-inter"
                  }`}
                >
                  {t("strategic.latestNews")}
                </h2>

                <p
                  className={`mt-1 text-sm text-gray-500 ${
                    isKhmer ? "font-battambang" : "font-inter"
                  }`}
                >
                  {t("strategic.latestUpdates")}
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {latestNews.map((news, index) => (
                  <Link
                    key={index}
                    to={news.link}
                    className={`block p-5 transition hover:bg-gray-50 ${
                      isKhmer ? "font-battambang" : "font-inter"
                    }`}
                  >
                    <span className="mb-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {news.category}
                    </span>

                    <h3 className="text-sm font-semibold leading-6 text-gray-800 transition hover:text-blue-700">
                      {news.title}
                    </h3>

                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-700">
                      {t("strategic.readMore")}
                      <ArrowRight size={14} />
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Academy Information */}
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2
                className={`mb-3 text-lg font-bold text-gray-900 ${
                  isKhmer ? "font-battambang" : "font-inter"
                }`}
              >
                {t("strategic.aboutAcademy")}
              </h2>

              <p
                className={`text-sm leading-7 text-gray-600 ${
                  isKhmer ? "font-battambang" : "font-inter"
                }`}
              >
                {t("strategic.aboutDescription")}
              </p>

              <Link
                to="/"
                className={`mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-900 ${
                  isKhmer ? "font-battambang" : "font-inter"
                }`}
              >
                {t("strategic.returnHome")}
                <ArrowRight size={16} />
              </Link>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
