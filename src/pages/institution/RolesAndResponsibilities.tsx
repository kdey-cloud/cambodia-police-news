import { Link } from "react-router-dom";
import { CalendarDays, Eye, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const MAIN_COLOR = "#1D4ED8";

export default function RolesAndResponsibilities() {
  const { t, i18n } = useTranslation();

  const language = (
    i18n.resolvedLanguage ||
    i18n.language ||
    "en"
  ).toLowerCase();

  const isKhmer = language.startsWith("kh") || language.startsWith("kh");

  const latestNews = [
    {
      title: t("roles.news1Title"),
      category: t("roles.news1Category"),
      link: "/",
    },
    {
      title: t("roles.news2Title"),
      category: t("roles.news2Category"),
      link: "/",
    },
    {
      title: t("roles.news3Title"),
      category: t("roles.news3Category"),
      link: "/",
    },
  ];

  const responsibilities = [
    {
      title: t("roles.responsibility1Title"),
      description: t("roles.responsibility1Description"),
    },
    {
      title: t("roles.responsibility2Title"),
      description: t("roles.responsibility2Description"),
    },
    {
      title: t("roles.responsibility3Title"),
      description: t("roles.responsibility3Description"),
    },
    {
      title: t("roles.responsibility4Title"),
      description: t("roles.responsibility4Description"),
    },
  ];

  const regionalSchools = [
    t("roles.province1"),
    t("roles.province2"),
    t("roles.province3"),
    t("roles.province4"),
    t("roles.province5"),
  ];

  return (
    <main
      lang={isKhmer ? "kh" : "en"}
      className={`min-h-screen bg-gray-50 text-black ${
        isKhmer ? "font-battambang" : "font-inter"
      }`}
    >
      {/* Page Header */}
      <section
        className="border-b border-gray-200 bg-white"
        style={{ borderTop: `4px solid ${MAIN_COLOR}` }}
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium hover:underline"
            style={{ color: MAIN_COLOR }}
          >
            <ArrowRight size={16} className="rotate-180" />
            {t("roles.home")}
          </Link>

          <p
            className="mb-2 text-sm font-semibold uppercase tracking-wider"
            style={{ color: MAIN_COLOR }}
          >
            {t("roles.institution")}
          </p>

          <h1 className="text-3xl font-bold leading-tight text-black sm:text-4xl">
            {t("roles.title")}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={16} style={{ color: MAIN_COLOR }} />
              <time dateTime="2019-09-18">{t("roles.date")}</time>
            </span>

            <span className="inline-flex items-center gap-2">
              <Eye size={16} style={{ color: MAIN_COLOR }} />
              {t("roles.views")}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Article */}
          <article className="order-1 min-w-0 rounded-lg border border-gray-200 bg-white p-5 sm:p-8">
            <h2
              className="mb-6 border-l-4 pl-4 text-2xl font-bold leading-snug text-black sm:text-3xl"
              style={{ borderColor: MAIN_COLOR }}
            >
              {t("roles.overviewTitle")}
            </h2>

            <p className="mb-8 text-base leading-8 text-black">
              {t("roles.introduction")}
            </p>

            {/* Responsibilities */}
            <section className="mb-8">
              <h3
                className="mb-4 text-xl font-bold"
                style={{ color: MAIN_COLOR }}
              >
                {t("roles.responsibilitiesTitle")}
              </h3>

              <div className="space-y-5">
                {responsibilities.map((item, index) => (
                  <div
                    key={item.title}
                    className="border-b border-gray-200 pb-5 last:border-b-0"
                  >
                    <h4 className="mb-2 font-bold leading-7 text-black">
                      <span className="mr-2" style={{ color: MAIN_COLOR }}>
                        {index + 1}.
                      </span>
                      {item.title}
                    </h4>

                    <p className="text-base leading-8 text-black">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Regional Schools */}
            <section className="mb-8">
              <h3
                className="mb-4 text-xl font-bold"
                style={{ color: MAIN_COLOR }}
              >
                {t("roles.regionalSchoolsTitle")}
              </h3>

              <p className="mb-5 text-base leading-8 text-black">
                {t("roles.regionalSchoolsDescription")}
              </p>

              <div className="overflow-hidden rounded-lg border border-gray-200">
                {regionalSchools.map((province, index) => (
                  <div
                    key={province}
                    className={`flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 ${
                      index !== regionalSchools.length - 1
                        ? "border-b border-gray-200"
                        : ""
                    }`}
                  >
                    <span
                      className="font-semibold"
                      style={{ color: MAIN_COLOR }}
                    >
                      {t("roles.school")} {index + 1}
                    </span>

                    <span className="text-black">{province}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Final Statement */}
            <section>
              <h3
                className="mb-4 text-xl font-bold"
                style={{ color: MAIN_COLOR }}
              >
                {t("roles.commitmentTitle")}
              </h3>

              <p className="text-base leading-8 text-black">
                {t("roles.commitmentDescription")}
              </p>
            </section>
          </article>

          {/* Latest News Sidebar */}
          <aside className="order-2 min-w-0">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div
                className="border-b-2 px-5 py-4"
                style={{ borderBottomColor: MAIN_COLOR }}
              >
                <h2 className="text-xl font-bold text-black">
                  {t("roles.lastNews")}
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                  {t("roles.latestUpdates")}
                </p>
              </div>

              <div className="divide-y divide-gray-200">
                {latestNews.map((news, index) => (
                  <Link
                    key={index}
                    to={news.link}
                    className="group block p-5 transition-colors hover:bg-gray-50"
                  >
                    <p
                      className="mb-2 text-xs font-semibold uppercase tracking-wide"
                      style={{ color: MAIN_COLOR }}
                    >
                      {news.category}
                    </p>

                    <h3 className="font-semibold leading-6 text-black group-hover:underline">
                      {news.title}
                    </h3>

                    <span
                      className="mt-3 inline-flex items-center gap-2 text-sm font-medium"
                      style={{ color: MAIN_COLOR }}
                    >
                      {t("roles.readMore")}

                      <ArrowRight
                        size={15}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Academy Information */}
            <div className="mt-5 rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-2 font-bold text-black">
                {t("roles.aboutAcademy")}
              </h3>

              <p className="mb-4 text-sm leading-6 text-gray-700">
                {t("roles.aboutDescription")}
              </p>

              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                style={{ color: MAIN_COLOR }}
              >
                {t("roles.returnHome")}
                <ArrowRight size={16} />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
