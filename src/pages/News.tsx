import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  CalendarDays,
  ArrowRight,
  Newspaper,
  RefreshCw,
  Filter,
} from "lucide-react";
import { supabase } from "../lib/supabase";

type NewsCategory = "all" | "activities" | "announcement" | "meeting";

interface NewsArticle {
  id: string | number;
  title_kh: string | null;
  title_en: string | null;
  image_url: string | null;
  category: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
}

const CATEGORIES: {
  value: NewsCategory;
  labelKh: string;
  labelEn: string;
}[] = [
  {
    value: "all",
    labelKh: "ព័ត៌មានទាំងអស់",
    labelEn: "All News",
  },
  {
    value: "activities",
    labelKh: "សកម្មភាព",
    labelEn: "Activities",
  },
  {
    value: "announcement",
    labelKh: "សេចក្តីជូនដំណឹង",
    labelEn: "Announcements",
  },
  {
    value: "meeting",
    labelKh: "កិច្ចប្រជុំ",
    labelEn: "Meetings",
  },
];

export default function News() {
  const { i18n } = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory =
    (searchParams.get("category") as NewsCategory | null) || "all";

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const isKhmer = i18n.language.toLowerCase().startsWith("kh");

  // Fetch published news from Supabase.
  useEffect(() => {
    let mounted = true;

    async function fetchNews() {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("news")
        .select(
          "id, title_kh, title_en, image_url, category, status, published_at, created_at",
        )
        .eq("status", "published")
        .order("published_at", {
          ascending: false,
          nullsFirst: false,
        })
        .order("created_at", {
          ascending: false,
        });

      if (!mounted) return;

      if (fetchError) {
        console.error("Failed to load news:", fetchError.message);

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

    void fetchNews();

    return () => {
      mounted = false;
    };
  }, [isKhmer, retryCount]);

  // Get the article title in the selected language.
  function getTitle(article: NewsArticle) {
    if (isKhmer) {
      return article.title_kh || article.title_en || "ព័ត៌មាន";
    }

    return article.title_en || article.title_kh || "News";
  }

  // Format the publication date.
  function formatDate(article: NewsArticle) {
    const date = article.published_at || article.created_at;

    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "";

    return new Intl.DateTimeFormat(isKhmer ? "kh-KH" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(parsedDate);
  }

  // Get the translated category name.
  function getCategoryLabel(category: string | null) {
    const normalizedCategory = category?.toLowerCase();

    const matchedCategory = CATEGORIES.find(
      (item) => item.value === normalizedCategory,
    );

    if (matchedCategory) {
      return isKhmer ? matchedCategory.labelKh : matchedCategory.labelEn;
    }

    return category || (isKhmer ? "ព័ត៌មាន" : "News");
  }

  // Filter by category and search both Khmer and English titles.
  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesCategory =
        selectedCategory === "all" ||
        article.category?.toLowerCase() === selectedCategory;

      const khmerTitle = article.title_kh || "";
      const englishTitle = article.title_en || "";

      const matchesSearch =
        !query ||
        khmerTitle.toLowerCase().includes(query) ||
        englishTitle.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [articles, search, selectedCategory]);

  const featuredArticle = filteredArticles[0];
  const remainingArticles = filteredArticles.slice(1);

  const pageTitle =
    selectedCategory === "all"
      ? isKhmer
        ? "ព័ត៌មាន និងព្រឹត្តិការណ៍"
        : "News & Events"
      : getCategoryLabel(selectedCategory);

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
              {pageTitle}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-blue-100 sm:text-lg">
              {isKhmer
                ? "តាមដានព័ត៌មានថ្មីៗ សកម្មភាព សេចក្តីជូនដំណឹង និងកិច្ចប្រជុំរបស់បណ្ឌិត្យសភានគរបាលកម្ពុជា។"
                : "Stay informed about the latest news, activities, announcements, and meetings from the Police Academy of Cambodia."}
            </p>

            <div className="mt-8 flex items-center gap-3 text-sm text-blue-200">
              <span className="h-1 w-10 rounded-full bg-amber-400" />

              <span>
                {isKhmer
                  ? `${filteredArticles.length} ព័ត៌មាន`
                  : `${filteredArticles.length} articles`}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* News Content */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:py-16">
        {/* Section Heading */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
            {isKhmer ? "ស្វែងយល់អំពីព័ត៌មាន" : "Stay Informed"}
          </p>

          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            {isKhmer ? "ព័ត៌មានទាំងអស់" : "Explore News"}
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
            {isKhmer
              ? "ជ្រើសរើសប្រភេទព័ត៌មាន ឬស្វែងរកចំណងជើងដែលអ្នកចង់អាន។"
              : "Choose a news category or search for an article you want to read."}
          </p>
        </div>

        {/* Category Filters */}
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-600">
            <Filter size={17} className="text-blue-700" />
            <span>{isKhmer ? "ប្រភេទព័ត៌មាន" : "Categories"}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category.value;

              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => {
                    if (category.value === "all") {
                      setSearchParams({});
                    } else {
                      setSearchParams({ category: category.value });
                    }
                  }}
                  aria-pressed={isActive}
                  className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "border-blue-800 bg-blue-800 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-800"
                  }`}
                >
                  {isKhmer ? category.labelKh : category.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <form
          className="mb-10 w-full"
          onSubmit={(event: FormEvent<HTMLFormElement>) =>
            event.preventDefault()
          }
        >
          <label htmlFor="news-search" className="sr-only">
            {isKhmer ? "ស្វែងរកព័ត៌មាន" : "Search news"}
          </label>

          <div className="flex items-center rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 sm:max-w-xl">
            <Search size={20} className="shrink-0 text-slate-400" />

            <input
              id="news-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                isKhmer ? "ស្វែងរកព័ត៌មាន..." : "Search news articles..."
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
              onClick={() => setRetryCount((count) => count + 1)}
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
                  ? "មិនទាន់មានព័ត៌មានក្នុងប្រភេទនេះទេ"
                  : "No news available in this category"}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {isKhmer
                ? "សូមសាកល្បងជ្រើសរើសប្រភេទផ្សេង ឬប្រើពាក្យស្វែងរកផ្សេងទៀត។"
                : "Try another category or use different search keywords."}
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSearchParams({});
              }}
              className="mt-5 font-semibold text-blue-700 hover:text-blue-900"
            >
              {isKhmer ? "បង្ហាញព័ត៌មានទាំងអស់" : "Show all news"}
            </button>
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
                  {getCategoryLabel(featuredArticle.category)}
                </div>
              </div>

              <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">
                <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
                  <CalendarDays size={16} className="text-blue-700" />

                  <time
                    dateTime={
                      featuredArticle.published_at || featuredArticle.created_at
                    }
                  >
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
                  {isKhmer ? "អានព័ត៌មានលម្អិត" : "Read Full Story"}
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

                          <time
                            dateTime={
                              article.published_at || article.created_at
                            }
                          >
                            {formatDate(article)}
                          </time>
                        </div>

                        <div className="mb-3">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                            {getCategoryLabel(article.category)}
                          </span>
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
