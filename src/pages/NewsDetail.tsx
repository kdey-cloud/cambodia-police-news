
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Eye,
  MessageCircle,
  Newspaper,
  Share2,
} from "lucide-react";

import { newsArticles } from "../data/news";
import type { NewsArticle } from "../data/news";

type NewsTab = "popular" | "recent" | "more";

/* Share an article */
async function shareArticle(article: NewsArticle): Promise<void> {
  const url = window.location.href;

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: article.title,
        text: article.description,
        url,
      });
    } catch {
      // The user cancelled sharing or sharing failed.
    }

    return;
  }

  try {
    await navigator.clipboard.writeText(url);
    window.alert("Article link copied!");
  } catch {
    window.prompt("Copy this article link:", url);
  }
}

/* News detail page */
export default function NewsDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<NewsTab>("recent");

  const article = newsArticles.find((item) => String(item.id) === id);

  /* Handle missing articles */
  if (!article) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4 py-20">
        <div className="max-w-md text-center">
          <Newspaper
            size={48}
            className="mx-auto mb-5 text-blue-900"
          />

          <h1 className="mb-3 text-2xl font-bold text-blue-950">
            News Not Found
          </h1>

          <p className="mb-6 leading-7 text-slate-600">
            Sorry, this news article could not be found. Please return to the
            homepage to explore our news.
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            <ArrowLeft size={17} />
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  /* Get other articles */
  const otherNews = newsArticles.filter((item) => item.id !== article.id);

  const sidebarNews =
    activeTab === "popular" ? [...otherNews].reverse() : otherNews;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Page container: matches the navbar width and spacing */}
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex flex-wrap items-center gap-2 text-xs text-slate-500 sm:text-sm"
        >
          <Link to="/" className="transition hover:text-blue-800">
            Home
          </Link>

          <span>/</span>

          <span>News</span>

          <span>/</span>

          <span className="line-clamp-1 text-slate-700">
            {article.title}
          </span>
        </nav>

        {/* Main layout */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_370px] xl:gap-8">
          {/* LEFT: Article */}
          <article className="min-w-0 overflow-hidden border border-slate-200 bg-white shadow-sm">
            <div className="p-4 sm:p-6 lg:p-8">
              {/* Categories */}
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="bg-blue-800 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  {article.category}
                </span>

                <span className="bg-amber-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-950">
                  Police Academy
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-extrabold leading-tight text-blue-950 sm:text-3xl lg:text-4xl xl:text-[42px]">
                {article.title}
              </h1>

              {/* Article metadata */}
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-slate-200 pb-5 text-xs text-slate-500 sm:text-sm">
                <span className="inline-flex items-center gap-2">
                  <Newspaper size={16} />
                  Police Academy of Cambodia
                </span>

                {article.date && (
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays size={16} />
                    <time>{article.date}</time>
                  </span>
                )}

                <span className="inline-flex items-center gap-2">
                  <Eye size={16} />
                  News &amp; Updates
                </span>
              </div>

              {/* Share button */}
              <div className="flex flex-wrap items-center justify-between gap-3 py-4">
                <span className="text-sm font-semibold text-slate-700">
                  Share this article
                </span>

                <button
                  type="button"
                  onClick={() => shareArticle(article)}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
                >
                  <Share2 size={16} />
                  Share
                </button>
              </div>
            </div>

            {/* Featured image */}
            {article.image && (
              <div className="bg-slate-100">
                <img
                  src={article.image}
                  alt={article.title}
                  className="max-h-[600px] w-full object-cover"
                />
              </div>
            )}

            {/* Article body */}
            <div className="p-4 sm:p-6 lg:p-8">
              {article.description && (
                <p className="mb-7 border-l-4 border-amber-400 bg-slate-50 px-5 py-4 text-base font-medium leading-8 text-slate-700 sm:text-lg">
                  {article.description}
                </p>
              )}

              <div className="whitespace-pre-line break-words text-base leading-8 text-slate-700 sm:text-lg sm:leading-9">
                {article.content.trim()}
              </div>

              {/* Article footer */}
              <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-800 transition hover:text-amber-600"
                >
                  <ArrowLeft size={17} />
                  Back to All News
                </Link>

                <button
                  type="button"
                  onClick={() => shareArticle(article)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-800"
                >
                  <Share2 size={16} />
                  Share Article
                </button>
              </div>
            </div>
          </article>

          {/* RIGHT: Sidebar */}
          <aside className="min-w-0 space-y-6">
            {/* Academy information */}
            <section className="border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b-2 border-blue-950 pb-3">
                <h2 className="text-base font-bold text-blue-950">
                  About the Academy
                </h2>

                <Newspaper size={18} className="text-blue-800" />
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                Discover professional training activities, public service
                initiatives, and the latest updates from the Police Academy of
                Cambodia.
              </p>

              <Link
                to="/"
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-800 transition hover:text-amber-600"
              >
                Visit Homepage
                <ArrowRight size={16} />
              </Link>
            </section>

            {/* News tabs */}
            <section className="border border-slate-200 bg-white shadow-sm">
              <div className="grid grid-cols-3 border-b border-slate-200">
                {(
                  [
                    ["popular", "Popular"],
                    ["recent", "Recent"],
                    ["more", "More News"],
                  ] as [NewsTab, string][]
                ).map(([tab, label]) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    aria-pressed={activeTab === tab}
                    className={`border-r border-slate-200 px-1 py-4 text-xs font-semibold transition last:border-r-0 sm:text-sm ${
                      activeTab === tab
                        ? "border-b-2 border-b-amber-400 bg-blue-50 text-blue-950"
                        : "text-slate-500 hover:bg-slate-50 hover:text-blue-900"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="p-4 sm:p-5">
                <h2 className="text-lg font-bold text-blue-950">
                  {activeTab === "popular"
                    ? "Popular News"
                    : activeTab === "recent"
                      ? "Recent News"
                      : "More Academy News"}
                </h2>

                <div className="mb-2 mt-3 h-0.5 w-12 bg-amber-400" />

                {sidebarNews.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {sidebarNews.map((item) => (
                      <Link
                        key={item.id}
                        to={`/news/${item.id}`}
                        className="group flex gap-3 py-4"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            loading="lazy"
                            className="h-[76px] w-[100px] shrink-0 rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex h-[76px] w-[100px] shrink-0 items-center justify-center rounded-md bg-slate-100">
                            <Newspaper
                              size={24}
                              className="text-slate-400"
                            />
                          </div>
                        )}

                        <div className="min-w-0">
                          <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-amber-600">
                            {item.category}
                          </span>

                          <h3 className="line-clamp-3 text-sm font-semibold leading-5 text-slate-800 transition group-hover:text-blue-800">
                            {item.title}
                          </h3>

                          {item.date && (
                            <time className="mt-2 block text-[11px] text-slate-500">
                              {item.date}
                            </time>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="py-6 text-sm leading-6 text-slate-500">
                    No other articles are available yet. Add more articles to
                    your news data to show additional updates here.
                  </p>
                )}

                <Link
                  to="/"
                  className="mt-3 flex items-center justify-center gap-2 border border-blue-200 px-4 py-3 text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
                >
                  View All News
                  <ArrowRight size={16} />
                </Link>
              </div>
            </section>

            {/* Quick links */}
            <section className="border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-blue-950">
                Explore More
              </h2>

              <div className="space-y-4">
                <Link
                  to="/"
                  className="flex items-center justify-between gap-3 text-sm text-slate-600 transition hover:text-blue-800"
                >
                  <span className="flex items-center gap-2">
                    <Newspaper size={16} />
                    All News
                  </span>

                  <ArrowRight size={15} />
                </Link>

                <Link
                  to="/"
                  className="flex items-center justify-between gap-3 text-sm text-slate-600 transition hover:text-blue-800"
                >
                  <span className="flex items-center gap-2">
                    <CalendarDays size={16} />
                    Academy Updates
                  </span>

                  <ArrowRight size={15} />
                </Link>

                <Link
                  to="/"
                  className="flex items-center justify-between gap-3 text-sm text-slate-600 transition hover:text-blue-800"
                >
                  <span className="flex items-center gap-2">
                    <MessageCircle size={16} />
                    Community News
                  </span>

                  <ArrowRight size={15} />
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

