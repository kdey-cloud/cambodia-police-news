
import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SearchPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [submittedQuery, setSubmittedQuery] = useState(
    searchParams.get("q")?.trim() ?? "",
  );

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const keyword = query.trim();

    if (!keyword) {
      setSubmittedQuery("");
      setSearchParams({});
      return;
    }

    setSubmittedQuery(keyword);
    setSearchParams({ q: keyword });
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-blue-950 px-4 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-blue-100 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            {t("backToHome", { defaultValue: "Back to Home" })}
          </Link>

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
            {t("searchLabel", { defaultValue: "Discover" })}
          </p>

          <h1 className="mb-4 text-3xl font-bold sm:text-5xl">
            {t("searchPageTitle", { defaultValue: "Search Our Website" })}
          </h1>

          <p className="mb-8 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
            {t("searchPageDescription", {
              defaultValue:
                "Find news, announcements, programs, and information from the Police Academy of Cambodia.",
            })}
          </p>

          <form
            onSubmit={handleSearch}
            className="flex max-w-3xl items-center gap-2 rounded-xl bg-white p-2 shadow-lg"
          >
            <Search className="ml-2 shrink-0 text-slate-400" size={22} />

            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("searchPlaceholder", {
                defaultValue: "Enter a keyword...",
              })}
              aria-label="Search website"
              className="min-w-0 flex-1 bg-transparent px-2 py-3 text-base text-slate-800 outline-none placeholder:text-slate-400"
            />

            <button
              type="submit"
              className="rounded-lg bg-blue-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              {t("searchButton", { defaultValue: "Search" })}
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        {submittedQuery ? (
          <div>
            <h2 className="mb-2 text-xl font-bold text-slate-900 sm:text-2xl">
              {t("searchResults", { defaultValue: "Search Results" })}
            </h2>

            <p className="mb-8 text-sm text-slate-500">
              {t("searchFor", { defaultValue: "Search keyword:" })}{" "}
              <span className="font-semibold text-blue-800">
                {submittedQuery}
              </span>
            </p>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <Search
                size={30}
                className="mb-4 text-slate-400"
              />

              <h3 className="mb-2 font-semibold text-slate-800">
                {t("connectSearchData", {
                  defaultValue: "Connect your news data",
                })}
              </h3>

              <p className="text-sm leading-6 text-slate-600">
                {t("connectSearchDataDescription", {
                  defaultValue:
                    "The search page is ready. To display matching news articles here, connect this page to the news data used by your website.",
                })}
              </p>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="mb-6 text-xl font-bold text-slate-900 sm:text-2xl">
              {t("exploreWebsite", { defaultValue: "Explore Our Website" })}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: t("institution", { defaultValue: "Institution" }),
                  description: "Learn about our academy.",
                  href: "/institution",
                },
                {
                  title: t("studyProgram", {
                    defaultValue: "Study Programs",
                  }),
                  description: "Explore educational programs.",
                  href: "/study-program",
                },
                {
                  title: t("information", {
                    defaultValue: "Information",
                  }),
                  description: "Explore information and announcements.",
                  href: "/information",
                },
                {
                  title: t("quality", { defaultValue: "Quality" }),
                  description: "Learn about education quality.",
                  href: "/quality",
                },
                {
                  title: t("cooperation", {
                    defaultValue: "Cooperation",
                  }),
                  description: "Discover cooperation activities.",
                  href: "/cooperation",
                },
                {
                  title: t("contact", { defaultValue: "Contact" }),
                  description: "Find contact information.",
                  href: "/contact",
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="group rounded-xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
                >
                  <h3 className="mb-2 font-bold text-slate-900 transition-colors group-hover:text-blue-700">
                    {item.title}
                  </h3>

                  <p className="text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>

                  <span className="mt-4 inline-block text-sm font-semibold text-blue-700">
                    Explore →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

