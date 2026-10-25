
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Languages,
  Newspaper,
  RefreshCw,
  AlertCircle,
  Eye,
  ExternalLink,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

interface NewsArticle {
  id: string | number;
  title_km: string | null;
  title_en: string | null;
  category: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
}

type Language = "en" | "km";

export default function ManageNews() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [language, setLanguage] = useState<Language>("en");

  // Load articles from Supabase.
  const loadArticles = useCallback(async (initial = false) => {
    if (initial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const { data, error: queryError } = await supabase
        .from("news")
        .select(
          "id, title_km, title_en, category, status, published_at, created_at",
        )
        .order("created_at", { ascending: false });

      if (queryError) throw queryError;

      setArticles((data ?? []) as NewsArticle[]);
    } catch (err) {
      console.error("Failed to load news:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load articles from Supabase.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load, live updates, and periodic refresh.
  useEffect(() => {
    void loadArticles(true);

    const channel = supabase
      .channel("manage-news-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "news",
        },
        () => {
          void loadArticles();
        },
      )
      .subscribe();

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadArticles();
      }
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadArticles();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      void supabase.removeChannel(channel);
    };
  }, [loadArticles]);

  // Get the title in the selected language.
  function getTitle(article: NewsArticle): string {
    if (language === "km") {
      return (
        article.title_km?.trim() ||
        article.title_en?.trim() ||
        "គ្មានចំណងជើង"
      );
    }

    return (
      article.title_en?.trim() ||
      article.title_km?.trim() ||
      "Untitled article"
    );
  }

  // Format dates.
  function formatDate(date: string | null): string {
    if (!date) return "Not published";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not published";
    }

    return new Intl.DateTimeFormat(
      language === "km" ? "km-KH" : "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    ).format(parsedDate);
  }

  // Get available categories.
  const categories = useMemo(() => {
    return Array.from(
      new Set(
        articles
          .map((article) => article.category?.trim())
          .filter((category): category is string => Boolean(category)),
      ),
    ).sort();
  }, [articles]);

  // Search and filter articles.
  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return articles.filter((article) => {
      const titleEn = article.title_en ?? "";
      const titleKm = article.title_km ?? "";
      const category = article.category ?? "";

      const matchesSearch =
        !query ||
        titleEn.toLowerCase().includes(query) ||
        titleKm.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query) ||
        String(article.id).toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        article.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesCategory =
        categoryFilter === "All" || category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [articles, search, statusFilter, categoryFilter]);

  // Delete an article from Supabase.
  async function deleteArticle(id: string | number) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this article? This action cannot be undone.",
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");

    try {
      const { error: deleteError } = await supabase
        .from("news")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      setArticles((current) =>
        current.filter((article) => article.id !== id),
      );
    } catch (err) {
      console.error("Failed to delete article:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete the article.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-blue-600">
            WEBSITE CONTENT
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Articles &amp; News
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage Khmer and English news articles for your public website.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void loadArticles()}
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
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600"
          >
            <Plus size={18} />
            New Article
          </Link>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={20} className="mt-0.5 shrink-0" />

          <div className="min-w-0">
            <p className="font-semibold">Something went wrong</p>
            <p className="mt-1 break-words">{error}</p>

            <button
              type="button"
              onClick={() => void loadArticles(true)}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Language selector */}
      <div className="flex flex-wrap items-center gap-3">
        <Languages size={19} className="text-slate-500" />

        <span className="text-sm font-medium text-slate-700">
          Preview titles in:
        </span>

        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setLanguage("km")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              language === "km"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Khmer
          </button>

          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              language === "en"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_200px_200px]">
        <div>
          <label
            htmlFor="news-search"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Search
          </label>

          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
            <Search size={18} className="shrink-0 text-slate-400" />

            <input
              id="news-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title or ID..."
              className="min-w-0 flex-1 py-2.5 text-sm outline-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="status-filter"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Status
          </label>

          <select
            id="status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="category-filter"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Category
          </label>

          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All Categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Results count */}
      <p className="text-sm text-slate-500">
        {loading
          ? "Loading articles..."
          : `Showing ${filteredArticles.length} of ${articles.length} articles`}
      </p>

      {/* Articles table */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">Title</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Publication Date</th>
                <th className="px-5 py-4">Views</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-16 text-center text-slate-500"
                  >
                    Loading articles from Supabase...
                  </td>
                </tr>
              ) : (
                <>
                  {filteredArticles.map((article) => {
                    const isPublished =
                      article.status.toLowerCase() === "published";

                    const isDraft =
                      article.status.toLowerCase() === "draft";

                    return (
                      <tr
                        key={article.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="max-w-xs px-5 py-5">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 rounded-lg bg-blue-50 p-2 text-blue-600">
                              <Newspaper size={18} />
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800">
                                {getTitle(article)}
                              </p>

                              <p className="mt-1 break-all text-xs text-slate-400">
                                {language === "km" ? "Khmer" : "English"} · ID{" "}
                                {article.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700">
                            {article.category || "Uncategorized"}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                              isPublished
                                ? "bg-emerald-100 text-emerald-700"
                                : isDraft
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {isPublished
                              ? "Published"
                              : isDraft
                                ? "Draft"
                                : article.status}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-5 text-slate-600">
                          {isPublished
                            ? formatDate(article.published_at)
                            : "Not published"}
                        </td>

                        <td className="px-5 py-5 text-slate-600">—</td>

                        <td className="px-5 py-5">
                          <div className="flex items-center justify-end gap-2">
                            {isPublished && (
                              <Link
                                to={`/news/${article.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`View ${getTitle(article)}`}
                                title="View public article"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                              >
                                <Eye size={14} />
                                View
                                <ExternalLink size={12} />
                              </Link>
                            )}

                            <Link
                              to={`/admin/news/${article.id}/edit`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              <Pencil size={14} />
                              Edit
                            </Link>

                            <button
                              type="button"
                              onClick={() => void deleteArticle(article.id)}
                              disabled={deletingId === article.id}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Trash2 size={14} />
                              {deletingId === article.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredArticles.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <Newspaper
                          size={32}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 font-medium text-slate-700">
                          No articles found
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {articles.length === 0
                            ? "No articles are available to your current Supabase session."
                            : "Try changing your search or filters."}
                        </p>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

