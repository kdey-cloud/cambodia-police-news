import { useEffect, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";

interface NewsArticle {
  id: string;
  title_km: string | null;
  title_en: string | null;
  image_url: string | null;
  published_at: string | null;
  created_at: string;
}

export default function Hero() {
  const { i18n } = useTranslation();

  const isKhmer = i18n.language.startsWith("kh");

  const [featuredNews, setFeaturedNews] = useState<NewsArticle[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load up to 3 pinned and published news articles from Supabase.
  useEffect(() => {
    let isMounted = true;

    async function loadFeaturedNews() {
      setLoading(true);

      const { data, error } = await supabase
        .from("news")
        .select("id, title_km, title_en, image_url, published_at, created_at")
        .eq("status", "published")
        .eq("is_pinned", true)
        .order("published_at", {
          ascending: false,
          nullsFirst: false,
        })
        .order("created_at", { ascending: false })
        .limit(3);

      if (!isMounted) return;

      if (error) {
        console.error("Failed to load featured news:", error);
        setFeaturedNews([]);
      } else {
        setFeaturedNews(data ?? []);
      }

      setActiveIndex(0);
      setLoading(false);
    }

    loadFeaturedNews();

    return () => {
      isMounted = false;
    };
  }, []);

  // Automatically change slides.
  useEffect(() => {
    if (paused || featuredNews.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % featuredNews.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [paused, featuredNews.length]);

  const nextSlide = () => {
    setActiveIndex((current) => (current + 1) % featuredNews.length);
  };

  const previousSlide = () => {
    setActiveIndex(
      (current) => (current - 1 + featuredNews.length) % featuredNews.length,
    );
  };

  function getTitle(article: NewsArticle) {
    if (isKhmer) {
      return article.title_km?.trim() || article.title_en?.trim() || "ព័ត៌មាន";
    }

    return article.title_en?.trim() || article.title_km?.trim() || "News";
  }

  function formatDate(article: NewsArticle) {
    const date = article.published_at || article.created_at;

    if (!date) return "";

    return new Intl.DateTimeFormat(isKhmer ? "km-KH" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  }

  if (loading) {
    return (
      <section className="bg-slate-50 py-5 sm:py-7 md:py-9">
        <div className="mx-auto max-w-7xl px-3 sm:px-5">
          <div className="flex h-[300px] items-center justify-center rounded-xl bg-white shadow-sm sm:h-[380px] md:h-[430px]">
            <p className="text-sm text-slate-500">
              {isKhmer ? "កំពុងផ្ទុកព័ត៌មាន..." : "Loading news..."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (featuredNews.length === 0) {
    return (
      <section className="bg-slate-50 py-5 sm:py-7 md:py-9">
        <div className="mx-auto max-w-7xl px-3 sm:px-5">
          <div className="flex h-[200px] items-center justify-center rounded-xl bg-white shadow-sm">
            <p className="text-sm text-slate-500">
              {isKhmer
                ? "មិនទាន់មានព័ត៌មានដែលបានផ្សព្វផ្សាយទេ។"
                : "No published news available yet."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-50 py-5 sm:py-7 md:py-9">
      <div className="mx-auto max-w-7xl px-3 sm:px-5">
        {/* Announcement Heading */}{" "}
        <div className="mb-5 flex items-center gap-3">
          {" "}
          <div className="h-8 w-1 rounded-full bg-blue-900" />{" "}
          <div>
            {" "}
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              {" "}
              {isKhmer ? "សេចក្តីប្រកាស" : "Announcement"}{" "}
            </h2>{" "}
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              {" "}
              {isKhmer
                ? "ព័ត៌មាន និងសេចក្តីជូនដំណឹងសំខាន់ៗ"
                : "Important news and updates from the academy"}{" "}
            </p>{" "}
          </div>{" "}
        </div>
        {/* Featured news slider */}
        <div
          className="relative overflow-hidden rounded-xl bg-white shadow-md sm:rounded-2xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            ) {
              setPaused(false);
            }
          }}
          aria-roledescription="carousel"
          aria-label="Featured news"
        >
          <div className="relative h-[320px] sm:h-[400px] md:h-[480px] lg:h-[560px] xl:h-[620px] 2xl:h-[680px]">
            {featuredNews.map((article, index) => (
              <div
                key={article.id}
                aria-hidden={index !== activeIndex}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  index === activeIndex
                    ? "translate-x-0 opacity-100"
                    : index < activeIndex
                      ? "-translate-x-full opacity-0"
                      : "translate-x-full opacity-0"
                }`}
              >
                {/* News image */}
                {article.image_url ? (
                  <img
                    src={article.image_url}
                    alt={getTitle(article)}
                    loading={index === 0 ? "eager" : "lazy"}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-slate-900" />
                )}

                {/* Image overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/35 to-transparent" />

                {/* News information */}
                <div className="absolute inset-x-0 bottom-0 p-4 pb-8 text-white sm:p-7 sm:pb-8 md:p-10 md:pb-8 lg:p-12 lg:pb-8">
                  <div className="mb-3 flex items-center gap-2 text-xs text-white/85 sm:text-sm">
                    <CalendarDays size={15} />
                    <time>{formatDate(article)}</time>
                  </div>

                  <Link
                    to={`/news/${article.id}`}
                    tabIndex={index === activeIndex ? 0 : -1}
                    className="line-clamp-2 text-xl font-bold leading-snug sm:text-2xl md:line-clamp-3 md:text-3xl lg:text-4xl"
                  >
                    {getTitle(article)}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Previous and next buttons */}
          {featuredNews.length > 1 && (
            <>
              <button
                type="button"
                onClick={previousSlide}
                aria-label="Previous news"
                className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-md transition hover:bg-white hover:text-[#1D4ED8] sm:left-5 sm:h-11 sm:w-11"
              >
                <ChevronLeft size={21} />
              </button>

              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next news"
                className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-md transition hover:bg-white hover:text-[#1D4ED8] sm:right-5 sm:h-11 sm:w-11"
              >
                <ChevronRight size={21} />
              </button>

              {/* Navigation dots */}
              <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
                {featuredNews.map((article, index) => (
                  <button
                    key={article.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Show news ${index + 1}`}
                    aria-current={index === activeIndex ? "true" : undefined}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === activeIndex
                        ? "w-7 bg-white"
                        : "w-2 bg-white/60 hover:bg-white/90"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        {/* News preview cards */}
        {featuredNews.length > 1 && (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {featuredNews.map((article, index) => (
              <button
                key={article.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-pressed={index === activeIndex}
                className={`flex min-w-0 items-center gap-3 overflow-hidden rounded-xl border bg-white p-3 text-left transition duration-200 hover:shadow-sm ${
                  index === activeIndex
                    ? "border-[#1D4ED8] shadow-sm"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {article.image_url ? (
                  <img
                    src={article.image_url}
                    alt=""
                    loading="lazy"
                    className="h-16 w-24 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-16 w-24 shrink-0 rounded-lg bg-slate-200" />
                )}

                <span className="line-clamp-2 text-sm font-semibold leading-5 text-slate-800">
                  {getTitle(article)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
