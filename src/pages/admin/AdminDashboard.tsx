import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Newspaper,
  Eye,
  FileEdit,
  Plus,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

interface NewsStatistics {
  total: number;
  published: number;
  drafts: number;
}

const initialStatistics: NewsStatistics = {
  total: 0,
  published: 0,
  drafts: 0,
};

export default function AdminDashboard() {
  const [statistics, setStatistics] =
    useState<NewsStatistics>(initialStatistics);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadStatistics = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      // Fetch the actual articles from Supabase.
      const { data, error: queryError } = await supabase
        .from("news")
        .select("id, status");

      if (queryError) {
        throw queryError;
      }

      const articles = data ?? [];

      const published = articles.filter(
        (article) => article.status === "published",
      ).length;

      const drafts = articles.filter(
        (article) => article.status === "draft",
      ).length;

      setStatistics({
        total: articles.length,
        published,
        drafts,
      });
    } catch (err) {
      console.error("Failed to load dashboard statistics:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load statistics from the database.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Load statistics when the dashboard opens.
    void loadStatistics(true);

    // Subscribe to changes in the news table.
    const channel = supabase
      .channel("admin-dashboard-news-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "news",
        },
        () => {
          void loadStatistics();
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.warn(
            "Supabase Realtime is unavailable. The dashboard will use periodic refreshes.",
          );
        }
      });

    // Fallback refresh in case Realtime is not configured.
    const refreshInterval = window.setInterval(() => {
      void loadStatistics();
    }, 30000);

    // Refresh when the user returns to this browser tab.
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadStatistics();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () => {
      window.clearInterval(refreshInterval);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );

      void supabase.removeChannel(channel);
    };
  }, [loadStatistics]);

  const cards = [
    {
      label: "Total Articles",
      value: statistics.total,
      description: "All news articles",
      icon: Newspaper,
    },
    {
      label: "Published",
      value: statistics.published,
      description: "Live on the website",
      icon: Eye,
    },
    {
      label: "Drafts",
      value: statistics.drafts,
      description: "Waiting for publication",
      icon: FileEdit,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-blue-600">
            POLICE ACADEMY WEBSITE
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your academy&apos;s news and website content.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void loadStatistics()}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <Link
            to="/admin/news/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            New Article
          </Link>
        </div>
      </div>

      {/* Database error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={20} className="mt-0.5 shrink-0" />

          <div>
            <p className="font-semibold">
              Could not load dashboard statistics
            </p>

            <p className="mt-1 break-words">{error}</p>

            <button
              type="button"
              onClick={() => void loadStatistics(true)}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {item.label}
                  </p>

                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {loading ? (
                      <span className="inline-block h-9 w-12 animate-pulse rounded bg-slate-200" />
                    ) : (
                      item.value
                    )}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    {item.description}
                  </p>
                </div>

                <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manage news */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Manage Academy News
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Create and manage Khmer and English news articles for the
              Police Academy website from one place.
            </p>
          </div>

          <Link
            to="/admin/news"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            Manage News
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* Bilingual information */}
      <section className="rounded-xl border border-blue-100 bg-blue-50 p-6">
        <h2 className="font-semibold text-slate-900">
          Bilingual Publishing
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Each news article can support Khmer and English titles,
          summaries, and content. Both language versions belong to the
          same article.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <span className="rounded-full border border-blue-100 bg-white px-3 py-1.5 text-sm font-medium text-slate-700">
            🇰🇭 Khmer
          </span>

          <span className="rounded-full border border-blue-100 bg-white px-3 py-1.5 text-sm font-medium text-slate-700">
            🇬🇧 English
          </span>
        </div>
      </section>
    </div>
  );
}