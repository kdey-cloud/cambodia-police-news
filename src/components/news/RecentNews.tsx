
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  CalendarDays,
  Image as ImageIcon,
  Shield,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

type RecentArticle = {
  id: string;
  title_km: string | null;
  title_en: string | null;
  image_url: string | null;
  category: string | null;
  published_at: string | null;
  created_at: string;
};

type RecentNewsProps = {
  currentArticleId?: string;
  limit?: number;
};

function formatDate(dateString: string | null, language: string) {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(
    language.toLowerCase().startsWith("kh") ? "km-KH" : "en-GB",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  ).format(date);
}

function getCategoryLabel(category: string | null, isKhmer: boolean) {
  if (!category) {
    return isKhmer ? "ព័ត៌មាន" : "News";
  }

  const labels: Record<string, { en: string; km: string }> = {
    activities: { en: "Activities", km: "សកម្មភាព" },
    announcement: { en: "Announcement", km: "សេចក្តីជូនដំណឹង" },
    meeting: { en: "Meeting", km: "កិច្ចប្រជុំ" },
  };

  const label = labels[category.toLowerCase()];

  if (label) {
    return isKhmer ? label.km : label.en;
  }

  return category;
}

export default function RecentNews({
  currentArticleId,
  limit = 6,
}: RecentNewsProps) {
  const { i18n } = useTranslation();

  // Your project uses "kh" as the Khmer language key.
  const isKhmer = i18n.language.toLowerCase().startsWith("kh");

  const [recentNews, setRecentNews] = useState<RecentArticle[]>([]);

  useEffect(() => {
    let active = true;

    async function loadRecentNews() {
      const { data, error } = await supabase
        .from("news")
        .select(
          "id, title_km, title_en, image_url, category, published_at, created_at",
        )
        .eq("status", "published")
        .order("published_at", {
          ascending: false,
          nullsFirst: false,
        })
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!active) return;

      if (error) {
        console.error("Recent news loading error:", error);
        return;
      }

      const articles = (data ?? []) as RecentArticle[];

      setRecentNews(
        articles.filter((item) => item.id !== currentArticleId),
      );
    }

    void loadRecentNews();

    return () => {
      active = false;
    };
  }, [currentArticleId, limit]);

  return (
    <div className="mt-8 space-y-8">
      {/* Academy Information */}
      <section className="border-b border-slate-200 pb-7">
        <div className="flex items-start gap-3">
          <Shield
            size={26}
            className="mt-1 shrink-0 text-blue-700"
          />

          <div>
            <h2 className="text-lg font-bold leading-7 text-slate-900">
              {isKhmer
                ? "បណ្ឌិត្យសភានគរបាលកម្ពុជា"
                : "Police Academy of Cambodia"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isKhmer ? "ព័ត៌មាន និងសកម្មភាព" : "News and Activities"}
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-600">
          {isKhmer
            ? "សូមតាមដានព័ត៌មាន សកម្មភាព និងសេចក្តីជូនដំណឹងថ្មីៗពីបណ្ឌិត្យសភានគរបាលកម្ពុជា។"
            : "Follow the latest news, activities, announcements, and institutional updates from the Police Academy of Cambodia."}
        </p>

        <Link
          to="/institution/background"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-900"
        >
          {isKhmer ? "អំពីស្ថាប័ន" : "About the Academy"}
          <ArrowRight size={16} />
        </Link>
      </section>

      {/* Recent News */}
      <section>
        <h2 className="mb-5 border-b border-slate-200 pb-3 text-lg font-bold text-slate-900">
          {isKhmer ? "ព័ត៌មានថ្មីៗ" : "Recent News"}
        </h2>

        {recentNews.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentNews.map((item) => {
              const recentTitle = isKhmer
                ? item.title_km?.trim() || item.title_en?.trim() || ""
                : item.title_en?.trim() || item.title_km?.trim() || "";

              return (
                <Link
                  key={item.id}
                  to={`/news/${item.id}`}
                  className="group flex gap-3 py-4 first:pt-0"
                >
                  <div className="flex h-[76px] w-[96px] shrink-0 items-center justify-center overflow-hidden bg-slate-50">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={recentTitle}
                        loading="lazy"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <ImageIcon
                        size={23}
                        className="text-slate-400"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-blue-700">
                      {getCategoryLabel(item.category, isKhmer)}
                    </span>

                    <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-slate-800 transition group-hover:text-blue-700">
                      {recentTitle ||
                        (isKhmer ? "គ្មានចំណងជើង" : "Untitled")}
                    </h3>

                    <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                      <CalendarDays size={12} />

                      {formatDate(
                        item.published_at || item.created_at,
                        i18n.language,
                      )}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            {isKhmer
              ? "មិនមានព័ត៌មានផ្សេងទៀតទេ។"
              : "No other news articles are available."}
          </p>
        )}

        <Link
          to="/news"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-900"
        >
          {isKhmer ? "មើលព័ត៌មានទាំងអស់" : "View All News"}
          <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}

