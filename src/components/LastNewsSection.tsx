
import { useEffect, useState } from "react";
import { CalendarDays, Camera } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface NewsArticle {
  id: string;
  title_km: string | null;
  title_en: string | null;
  image_url: string | null;
  published_at: string | null;
  created_at: string;
}

export default function NewsSection() {
  const { t, i18n } = useTranslation();

  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isKhmer = i18n.language.toLowerCase().startsWith("km");

  useEffect(() => {
    async function fetchNews() {
      const { data, error } = await supabase
        .from("news")
        .select(
          "id, title_km, title_en, image_url, published_at, created_at"
        )
        .eq("status", "published")
        .order("published_at", {
          ascending: false,
          nullsFirst: false,
        })
        .limit(10);

      if (error) {
        console.error("Error loading news:", error);
        setError(error.message);
        setNewsArticles([]);
      } else {
        setNewsArticles(data ?? []);
      }

      setLoading(false);
    }

    fetchNews();
  }, []);

  const getTitle = (article: NewsArticle) => {
    return isKhmer
      ? article.title_km || article.title_en || "គ្មានចំណងជើង"
      : article.title_en || article.title_km || "Untitled";
  };

  const getDate = (article: NewsArticle) => {
    const date = article.published_at || article.created_at;

    return new Intl.DateTimeFormat(isKhmer ? "km-KH" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <section id="latest-news" className="bg-white py-10">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-3">
        {/* News List */}
        <div className="lg:col-span-2">
          <h2 className="mb-5 border-b-2 border-blue-900 pb-3 text-2xl font-bold text-gray-900">
            {t("latestNews")}
          </h2>

          <div>
            {loading && (
              <p className="py-4 text-sm text-gray-500">
                {isKhmer ? "កំពុងផ្ទុកព័ត៌មាន..." : "Loading news..."}
              </p>
            )}

            {!loading && error && (
              <p className="py-4 text-sm text-red-600">
                {isKhmer
                  ? "មិនអាចផ្ទុកព័ត៌មានបានទេ។"
                  : "Unable to load news."}
              </p>
            )}

            {!loading && !error && newsArticles.length === 0 && (
              <p className="py-4 text-sm text-gray-500">
                {isKhmer
                  ? "មិនទាន់មានព័ត៌មានទេ។"
                  : "No news available."}
              </p>
            )}

            {!loading &&
              !error &&
              newsArticles.map((article) => (
                <article
                  key={article.id}
                  className="border-b border-gray-300 py-3 transition hover:bg-gray-50"
                >
                  <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                    <CalendarDays size={13} />
                    <time>{getDate(article)}</time>
                    <Camera size={13} />
                  </div>

                  <h3 className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-800">
                    <Link to={`/news/${article.id}`}>
                      {getTitle(article)}
                    </Link>
                  </h3>
                </article>
              ))}
          </div>

          <Link
            to="/news"
            className="mt-5 inline-block text-sm font-bold text-blue-900 hover:text-amber-500"
          >
            {t("viewAllNews")} →
          </Link>
        </div>

        {/* Social Sidebar */}
        <aside className="hidden lg:block">
          <h2 className="mb-5 border-b-2 border-blue-900 pb-3 text-lg font-bold text-gray-900">
            {t("followUs")}
          </h2>

          <div className="relative overflow-hidden">
            <img
              src={
                newsArticles[0]?.image_url ??
                "https://images.unsplash.com/photo-1453873531674-2151bcd01707?auto=format&fit=crop&w=800&q=80"
              }
              alt=""
              className="h-48 w-full object-cover"
              loading="lazy"
            />

            <div className="absolute inset-0 flex items-center justify-center gap-3 bg-blue-950/10">
              <a
                href="https://www.facebook.com/"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center bg-blue-700 text-xl font-bold text-white"
              >
                f
              </a>

              <a
                href="https://www.youtube.com/"
                aria-label="YouTube"
                className="flex h-10 w-10 items-center justify-center bg-red-600 text-white"
              >
                ▶
              </a>

              <a
                href="https://www.instagram.com/"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center bg-pink-600 text-sm font-bold text-white"
              >
                IG
              </a>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

