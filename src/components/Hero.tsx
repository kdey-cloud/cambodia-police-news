import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { newsArticles } from "../data/news";


export default function Hero() {
  const featuredNews = newsArticles.slice(0, 3);

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || featuredNews.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % featuredNews.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [paused, featuredNews.length]);

  if (featuredNews.length === 0) return null;

  const nextSlide = () => {
    setActiveIndex((current) => (current + 1) % featuredNews.length);
  };

  const previousSlide = () => {
    setActiveIndex(
      (current) =>
        (current - 1 + featuredNews.length) % featuredNews.length,
    );
  };

  return (
    <section className="bg-slate-50 py-5 sm:py-7 md:py-9">
      <div className="mx-auto max-w-7xl px-3 sm:px-5">
        {/* Featured news slider */}
        <div
          className="relative overflow-hidden rounded-xl bg-white shadow-md sm:rounded-2xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(event) => {
            if (
              !event.currentTarget.contains(
                event.relatedTarget as Node | null,
              )
            ) {
              setPaused(false);
            }
          }}
          aria-roledescription="carousel"
          aria-label="Featured news"
        >
          <div className="relative h-[300px] sm:h-[380px] md:h-[430px] lg:h-[460px]">
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
                <img
                  src={article.image}
                  alt={article.title}
                  loading={index === 0 ? "eager" : "lazy"}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                {/* Subtle image overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/35 to-transparent" />

                {/* News information */}
                <div className="absolute inset-x-0 bottom-0 p-4 pb-16 text-white sm:p-7 sm:pb-16 md:p-9 md:pb-16">
                  <div className="mb-3 flex items-center gap-2 text-xs text-white/85 sm:text-sm">
                    <CalendarDays size={15} />
                    <time>{article.date}</time>
                  </div>

                  <h2 className="line-clamp-3 max-w-4xl text-xl font-bold leading-snug sm:text-2xl md:text-4xl lg:text-5xl">
                    {article.title}
                  </h2>

                  <Link
                    to={`/news/${article.id}`}
                    tabIndex={index === activeIndex ? 0 : -1}
                    onClick={(event) => event.stopPropagation()}
                    className="mt-4 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#1D4ED8] transition hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    Read News
                    <ChevronRight size={17} />
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
                <img
                  src={article.image}
                  alt=""
                  loading="lazy"
                  className="h-16 w-24 shrink-0 rounded-lg object-cover"
                />

                <span className="line-clamp-2 text-sm font-semibold leading-5 text-slate-800">
                  {article.title}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}