import { CalendarDays, Camera } from "lucide-react";
import { useTranslation } from "react-i18next";
import { newsArticles } from "../data/news";

export default function NewsSection() {
  const { t } = useTranslation();

  return (
    <section id="latest-news" className="bg-white py-10">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-3">
        {/* News List */}
        <div className="lg:col-span-2">
          <h2 className="mb-5 border-b-2 border-blue-900 pb-3 text-2xl font-bold text-gray-900">
            {t("latestNews")}
          </h2>

          <div>
            {newsArticles.map((article) => (
              <article
                key={article.id}
                className="border-b border-gray-300 py-3 transition hover:bg-gray-50"
              >
                <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                  <CalendarDays size={13} />
                  <time>{article.date}</time>
                  <Camera size={13} />
                </div>

                <h3 className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-800">
                  <a href={`#news-${article.id}`}>{article.title}</a>
                </h3>
              </article>
            ))}
          </div>

          <a
            href="#all-news"
            className="mt-5 inline-block text-sm font-bold text-blue-900 hover:text-amber-500"
          >
            {t("viewAllNews")} →
          </a>
        </div>

        {/* Social Sidebar */}
        <aside>
          <h2 className="mb-5 border-b-2 border-blue-900 pb-3 text-lg font-bold text-gray-900">
            {t("followUs")}
          </h2>

          <div className="relative overflow-hidden">
            <img
              src={
                newsArticles[0]?.image ??
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