import { Link } from "react-router-dom";
import { CalendarDays, Eye, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const MAIN_COLOR = "#1D4ED8";

export default function Background() {
  const { t, i18n } = useTranslation();

  const isKhmer = i18n.language.startsWith("kh");

  const latestNews = [
    {
      title: t("background.news1Title"),
      category: t("background.news1Category"),
      link: "/",
    },
    {
      title: t("background.news2Title"),
      category: t("background.news2Category"),
      link: "/",
    },
    {
      title: t("background.news3Title"),
      category: t("background.news3Category"),
      link: "/",
    },
  ];

  const regionalSchools = [
    {
      region: t("background.region1"),
      province: t("background.province1"),
    },
    {
      region: t("background.region2"),
      province: t("background.province2"),
    },
    {
      region: t("background.region3"),
      province: t("background.province3"),
    },
    {
      region: t("background.region4"),
      province: t("background.province4"),
    },
    {
      region: t("background.region5"),
      province: t("background.province5"),
    },
    {
      region: t("background.region6"),
      province: t("background.province6"),
    },
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
            {t("background.home")}
          </Link>

          <p
            className="mb-2 text-sm font-semibold uppercase tracking-wider"
            style={{ color: MAIN_COLOR }}
          >
            {t("background.institution")}
          </p>

          <h1 className="text-3xl font-bold leading-tight text-black sm:text-4xl">
            {t("background.title")}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={16} style={{ color: MAIN_COLOR }} />
              {t("background.date")}
            </span>

            <span className="inline-flex items-center gap-2">
              <Eye size={16} style={{ color: MAIN_COLOR }} />
              {t("background.views")}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Background Article */}
          <article className="order-1 min-w-0 rounded-lg border border-gray-200 bg-white p-5 sm:p-8">
            <h2
              className="mb-6 border-l-4 pl-4 text-2xl font-bold leading-snug text-black sm:text-3xl"
              style={{ borderColor: MAIN_COLOR }}
            >
              {t("background.historyTitle")}
            </h2>

            <p className="mb-6 text-base leading-8 text-black">
              {t("background.introduction")}
            </p>

            {/* Period I */}
            <section className="mb-8">
              <h3
                className="mb-4 text-xl font-bold"
                style={{ color: MAIN_COLOR }}
              >
                {t("background.period1")}
              </h3>

              <ol className="list-decimal space-y-2 pl-6 text-base leading-7 text-black">
                <li>{t("background.school1947")}</li>
                <li>{t("background.school1952")}</li>
                <li>{t("background.school1954")}</li>
                <li>{t("background.school1959")}</li>
                <li>{t("background.school1960")}</li>
              </ol>
            </section>

            {/* Period II */}
            <section className="mb-8">
              <h3
                className="mb-4 text-xl font-bold"
                style={{ color: MAIN_COLOR }}
              >
                {t("background.period2")}
              </h3>

              <p className="text-base leading-8 text-black">
                {t("background.period2Description")}
              </p>
            </section>

            {/* Period III */}
            <section className="mb-8">
              <h3
                className="mb-4 text-xl font-bold"
                style={{ color: MAIN_COLOR }}
              >
                {t("background.period3")}
              </h3>

              <p className="mb-4 text-base leading-8 text-black">
                {t("background.period3Description")}
              </p>

              <p className="mb-3 font-semibold text-black">
                {t("background.fourBranches")}
              </p>

              <ol className="mb-5 list-decimal space-y-2 pl-6 text-base leading-7 text-black">
                <li>{t("background.branch1")}</li>
                <li>{t("background.branch2")}</li>
                <li>{t("background.branch3")}</li>
                <li>{t("background.branch4")}</li>
              </ol>

              <p className="text-base leading-8 text-black">
                {t("background.toulKorkDescription")}
              </p>
            </section>

            {/* Period IV */}
            <section className="mb-8">
              <h3
                className="mb-4 text-xl font-bold"
                style={{ color: MAIN_COLOR }}
              >
                {t("background.period4")}
              </h3>

              <div className="space-y-5 text-base leading-8 text-black">
                <p>
                  <strong>{t("background.deyEthTitle")}</strong>{" "}
                  {t("background.deyEthDescription")}
                </p>

                <p>
                  <strong>{t("background.royalSchoolTitle")}</strong>{" "}
                  {t("background.royalSchoolDescription")}
                </p>

                <p>
                  <strong>{t("background.academyTitle")}</strong>{" "}
                  {t("background.academyDescription")}
                </p>

                <p>{t("background.currentLocation")}</p>
              </div>
            </section>

            {/* Regional Schools */}
            <section>
              <h3
                className="mb-4 text-xl font-bold"
                style={{ color: MAIN_COLOR }}
              >
                {t("background.regionalSchools")}
              </h3>

              <div className="overflow-hidden rounded-lg border border-gray-200">
                {regionalSchools.map((school, index) => (
                  <div
                    key={school.region}
                    className={`flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${
                      index !== regionalSchools.length - 1
                        ? "border-b border-gray-200"
                        : ""
                    }`}
                  >
                    <span
                      className="font-semibold"
                      style={{ color: MAIN_COLOR }}
                    >
                      {school.region}
                    </span>

                    <span className="text-black">{school.province}</span>
                  </div>
                ))}
              </div>
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
                  {t("background.lastNews")}
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                  {t("background.latestUpdates")}
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
                      {t("background.readMore")}

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
                {t("background.aboutAcademy")}
              </h3>

              <p className="mb-4 text-sm leading-6 text-gray-700">
                {t("background.aboutDescription")}
              </p>

              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                style={{ color: MAIN_COLOR }}
              >
                {t("background.returnHome")}
                <ArrowRight size={16} />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
