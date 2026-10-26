import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  CalendarDays,
  ArrowRight,
  Newspaper,
  RefreshCw,
} from "lucide-react";
import { supabase } from "../lib/supabase";

interface NewsArticle {
  id: string | number;
  title_km: string | null;
  title_en: string | null;
  image_url: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
}

export default function News() {
  const { i18n } = useTranslation();

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const isKhmer = i18n.language.toLowerCase().startsWith("kh");

  // Fetch published news from Supabase
  useEffect(() => {
    let mounted = true;

    async function fetchNews() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("news")
        .select(
          "id, title_km, title_en, image_url, status, published_at, created_at",
        )
        .eq("status", "published")
        .order("published_at", {
          ascending: false,
          nullsFirst: false,
        })
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (error) {
        console.error("Failed to load news:", error.message);
        setError(
          isKhmer
            ? "មិនអាចទាញយកព័ត៌មានបានទេ។ សូមព្យាយាមម្ដងទៀត។"
            : "Unable to load news. Please try again.",
        );
        setArticles([]);
      } else {
        setArticles((data ?? []) as NewsArticle[]);
      }

      setLoading(false);
    }

    fetchNews();

    return () => {
      mounted = false;
    };
  }, [isKhmer]);

  // Get the article title in the selected language
  function getTitle(article: NewsArticle) {
    if (isKhmer) {
      return article.title_km || article.title_en || "ព័ត៌មាន";
    }

    return article.title_en || article.title_km || "News";
  }

  // Format the publication date
  function formatDate(article: NewsArticle) {
    const date = article.published_at || article.created_at;

    if (!date) return "";

    return new Intl.DateTimeFormat(isKhmer ? "km-KH" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  }

  // Search articles by Khmer or English title
  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return articles;

    return articles.filter((article) => {
      const khmerTitle = article.title_km || "";
      const englishTitle = article.title_en || "";

      return (
        khmerTitle.toLowerCase().includes(query) ||
        englishTitle.toLowerCase().includes(query)
      );
    });
  }, [articles, search]);

  const featuredArticle = filteredArticles[0];
  const remainingArticles = filteredArticles.slice(1);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <section className="relative overflow-hidden bg-blue-950 text-white">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-800/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-blue-100">
              <Newspaper size={16} />
              <span>
                {isKhmer
                  ? "បណ្ឌិត្យសភានគរបាលកម្ពុជា"
                  : "Police Academy of Cambodia"}
              </span>
            </div>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {isKhmer ? "ព័ត៌មាន និងព្រឹត្តិការណ៍" : "News & Events"}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-blue-100 sm:text-lg">
              {isKhmer
                ? "តាមដានព័ត៌មានថ្មីៗ សកម្មភាព និងព្រឹត្តិការណ៍នានារបស់បណ្ឌិត្យសភានគរបាលកម្ពុជា។"
                : "Stay informed about the latest news, activities, announcements, and events from the Police Academy of Cambodia."}
            </p>

            <div className="mt-8 flex items-center gap-3 text-sm text-blue-200">
              <span className="h-1 w-10 rounded-full bg-amber-400" />
              <span>
                {isKhmer
                  ? `${articles.length} ព័ត៌មានដែលបានផ្សព្វផ្សាយ`
                  : `${articles.length} published articles`}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* News Content */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:py-16">
        {/* Section Heading and Search */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
              {isKhmer ? "ព័ត៌មានថ្មីៗ" : "Stay Informed"}
            </p>

            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              {isKhmer ? "ព័ត៌មានថ្មីៗបំផុត" : "Latest News"}
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
              {isKhmer
                ? "ស្វែងរកព័ត៌មាន និងសកម្មភាពដែលអ្នកចង់ដឹង។"
                : "Discover the latest announcements, activities, and institutional updates."}
            </p>
          </div>

          <form
            className="w-full lg:max-w-sm"
            onSubmit={(event: FormEvent<HTMLFormElement>) =>
              event.preventDefault()
            }
          >
            <label htmlFor="news-search" className="sr-only">
              {isKhmer ? "ស្វែងរកព័ត៌មាន" : "Search news"}
            </label>

            <div className="flex items-center rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
              <Search size={20} className="shrink-0 text-slate-400" />

              <input
                id="news-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={
                  isKhmer
                    ? "ស្វែងរកព័ត៌មាន..."
                    : "Search news articles..."
                }
                className="h-12 w-full bg-transparent px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="shrink-0 text-sm font-semibold text-blue-700 hover:text-blue-900"
                >
                  {isKhmer ? "លុប" : "Clear"}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="h-52 animate-pulse bg-slate-200" />

                <div className="space-y-4 p-5">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
                  <div className="h-5 w-full animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-white px-6 py-12 text-center">
            <p className="font-semibold text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              <RefreshCw size={16} />
              {isKhmer ? "ព្យាយាមម្ដងទៀត" : "Try Again"}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredArticles.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <Newspaper size={30} />
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-900">
              {search
                ? isKhmer
                  ? "រកមិនឃើញព័ត៌មានទេ"
                  : "No matching news found"
                : isKhmer
                  ? "មិនទាន់មានព័ត៌មានទេ"
                  : "No news available yet"}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {search
                ? isKhmer
                  ? "សូមសាកល្បងពាក្យស្វែងរកផ្សេងទៀត។"
                  : "Try searching with different keywords."
                : isKhmer
                  ? "ព័ត៌មានថ្មីៗនឹងបង្ហាញនៅទីនេះ។"
                  : "Published news articles will appear here."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-5 font-semibold text-blue-700 hover:text-blue-900"
              >
                {isKhmer ? "បង្ហាញព័ត៌មានទាំងអស់" : "Show all news"}
              </button>
            )}
          </div>
        )}

        {/* Featured Article */}
        {!loading && !error && featuredArticle && (
          <>
            {!search && (
              <div className="mb-6 flex items-center gap-3">
                <span className="h-6 w-1 rounded-full bg-amber-400" />

                <h3 className="text-lg font-bold text-slate-900">
                  {isKhmer ? "ព័ត៌មានពិសេស" : "Featured Story"}
                </h3>
              </div>
            )}

            <Link
              to={`/news/${featuredArticle.id}`}
              className="group mb-12 grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl md:grid-cols-2"
            >
              <div className="relative min-h-64 overflow-hidden bg-slate-200 sm:min-h-80">
                {featuredArticle.image_url ? (
                  <img
                    src={featuredArticle.image_url}
                    alt={getTitle(featuredArticle)}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-950 to-blue-700">
                    <Newspaper
                      size={64}
                      strokeWidth={1}
                      className="text-white/50"
                    />
                  </div>
                )}

                <div className="absolute left-5 top-5 rounded-md bg-amber-400 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-blue-950">
                  {isKhmer ? "ព័ត៌មានថ្មី" : "Latest News"}
                </div>
              </div>

              <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">
                <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
                  <CalendarDays size={16} className="text-blue-700" />
                  <time dateTime={featuredArticle.published_at || featuredArticle.created_at}>
                    {formatDate(featuredArticle)}
                  </time>
                </div>

                <h3 className="text-2xl font-extrabold leading-snug text-slate-900 transition group-hover:text-blue-700 sm:text-3xl">
                  {getTitle(featuredArticle)}
                </h3>

                <p className="mt-4 text-sm leading-7 text-slate-500">
                  {isKhmer
                    ? "សូមចុចដើម្បីអានព័ត៌មានលម្អិត និងស្វែងយល់បន្ថែមអំពីសកម្មភាពរបស់បណ្ឌិត្យសភា។"
                    : "Read the full story to learn more about the latest activities and developments at the Academy."}
                </p>

                <span className="mt-7 inline-flex items-center gap-2 font-bold text-blue-700 transition group-hover:gap-4">
                  {isKhmer ? "អានបន្ថែម" : "Read Full Story"}
                  <ArrowRight size={18} />
                </span>
              </div>
            </Link>

            {/* Remaining Articles */}
            {remainingArticles.length > 0 && (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {isKhmer ? "ព័ត៌មានផ្សេងៗទៀត" : "More News"}
                  </h3>

                  <span className="text-sm text-slate-500">
                    {remainingArticles.length}{" "}
                    {isKhmer ? "ព័ត៌មាន" : "articles"}
                  </span>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {remainingArticles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/news/${article.id}`}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                    >
                      <div className="relative h-52 overflow-hidden bg-slate-200">
                        {article.image_url ? (
                          <img
                            src={article.image_url}
                            alt={getTitle(article)}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-950 to-blue-700">
                            <Newspaper
                              size={48}
                              strokeWidth={1}
                              className="text-white/50"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
                          <CalendarDays
                            size={15}
                            className="shrink-0 text-blue-700"
                          />
                          <time dateTime={article.published_at || article.created_at}>
                            {formatDate(article)}
                          </time>
                        </div>

                        <h4 className="line-clamp-3 text-lg font-bold leading-7 text-slate-900 transition group-hover:text-blue-700">
                          {getTitle(article)}
                        </h4>

                        <div className="mt-auto flex items-center justify-between pt-6">
                          <span className="text-sm font-bold text-blue-700">
                            {isKhmer ? "អានបន្ថែម" : "Read More"}
                          </span>

                          <ArrowRight
                            size={18}
                            className="text-blue-700 transition group-hover:translate-x-1"
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}