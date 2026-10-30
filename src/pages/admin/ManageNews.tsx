
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  LoaderCircle,
  Pin,
  PinOff,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Power,
  Pencil,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

interface NewsArticle {
  id: string;
  title_kh: string | null;
  title_en: string | null;
  category: string | null;
  status: string | null;
  published_at: string | null;
  created_at: string | null;
  is_pinned: boolean | null;
}

type StatusFilter = "all" | "published" | "draft";

const NEWS_SELECT =
  "id, title_kh, title_en, category, status, published_at, created_at, is_pinned";

interface SupabaseErrorDetails {
  message: string;
  code?: string;
  details?: string | null;
  hint?: string | null;
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    const supabaseError = error as SupabaseErrorDetails;

    return [
      supabaseError.message,
      supabaseError.code ? `Code: ${supabaseError.code}` : null,
      supabaseError.details ? `Details: ${supabaseError.details}` : null,
      supabaseError.hint ? `Hint: ${supabaseError.hint}` : null,
    ]
      .filter(Boolean)
      .join(" | ");
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}

export default function ManageNews() {
  const navigate = useNavigate();

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setSuccessMessage("");
  }, []);

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setErrorMessage("");
  }, []);

  // Automatically clear success messages.
  useEffect(() => {
    if (!successMessage) return;

    const timeout = window.setTimeout(() => {
      setSuccessMessage("");
    }, 3500);

    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  // Load ALL news, including published articles and drafts.
  // IMPORTANT: Do not filter by status in this query.
  const loadNews = useCallback(
    async (showLoader = true) => {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const { data, error } = await supabase
          .from("news")
          .select(NEWS_SELECT)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setArticles((data ?? []) as unknown as NewsArticle[]);
      } catch (error: unknown) {
        console.error("[ManageNews] Failed to load news:", error);

        showError(
          `Unable to load news: ${getErrorMessage(error)}`,
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showError],
  );

  // Load on page entry and refresh when the page becomes visible.
  useEffect(() => {
    void loadNews();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadNews(false);
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadNews(false);
      }
    }, 30000);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );

      window.clearInterval(interval);
    };
  }, [loadNews]);

  // Search and filter news locally.
  const filteredArticles = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesSearch =
        !searchTerm ||
        (article.title_kh ?? "").toLowerCase().includes(searchTerm) ||
        (article.title_en ?? "").toLowerCase().includes(searchTerm) ||
        (article.category ?? "").toLowerCase().includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" ||
        article.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [articles, search, statusFilter]);

  // Publish or deactivate an article.
  const toggleStatus = async (article: NewsArticle) => {
    if (processingId) return;

    const newStatus =
      article.status === "published" ? "draft" : "published";

    const action =
      newStatus === "draft" ? "deactivate" : "publish";

    setProcessingId(article.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Confirm the current user.
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        throw new Error(
          "Your session has expired. Please sign in again.",
        );
      }

      // Verify admin access.
      const { data: isAdmin, error: adminError } =
        await supabase.rpc("is_admin");

      if (adminError) throw adminError;

      if (isAdmin !== true) {
        throw new Error(
          "Your account is not authorized to manage news.",
        );
      }

      // Update status using the secure RPC function.
      const { data: updateResult, error: updateError } =
        await supabase.rpc("admin_update_news_status", {
          p_news_id: article.id,
          p_new_status: newStatus,
        });

      if (updateError) throw updateError;

      if (updateResult !== true) {
        throw new Error(
          "Supabase did not confirm the news status update.",
        );
      }

      // Update the status immediately without removing the article.
      setArticles((previous) =>
        previous.map((item) =>
          item.id === article.id
            ? { ...item, status: newStatus }
            : item,
        ),
      );

      showSuccess(
        newStatus === "draft"
          ? "Article deactivated. It remains available in Manage News."
          : "Article published successfully.",
      );

      // Refresh data from Supabase.
      await loadNews(false);
    } catch (error: unknown) {
      console.error(
        `[ManageNews] Unable to ${action} article:`,
        error,
      );

      showError(
        `Unable to ${action} article: ${getErrorMessage(error)}`,
      );
    } finally {
      setProcessingId(null);
    }
  };

  // Pin or unpin an article.
  const togglePinned = async (article: NewsArticle) => {
    if (processingId) return;

    const newPinnedStatus = !article.is_pinned;

    setProcessingId(article.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { data, error } = await supabase
        .from("news")
        .update({ is_pinned: newPinnedStatus })
        .eq("id", article.id)
        .select("id");

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error(
          "No article was updated. Check your update permissions.",
        );
      }

      setArticles((previous) =>
        previous.map((item) =>
          item.id === article.id
            ? { ...item, is_pinned: newPinnedStatus }
            : item,
        ),
      );

      showSuccess(
        newPinnedStatus
          ? "Article pinned successfully."
          : "Article unpinned successfully.",
      );

      await loadNews(false);
    } catch (error: unknown) {
      console.error("[ManageNews] Pin update failed:", error);

      showError(
        `Unable to update pinned status: ${getErrorMessage(error)}`,
      );
    } finally {
      setProcessingId(null);
    }
  };

  // Delete an article permanently.
  const deleteArticle = async (article: NewsArticle) => {
    if (processingId) return;

    const title =
      article.title_en ||
      article.title_kh ||
      "this article";

    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setProcessingId(article.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase
        .from("news")
        .delete()
        .eq("id", article.id);

      if (error) throw error;

      setArticles((previous) =>
        previous.filter((item) => item.id !== article.id),
      );

      showSuccess("Article deleted successfully.");
    } catch (error: unknown) {
      console.error("[ManageNews] Delete failed:", error);

      showError(
        `Unable to delete article: ${getErrorMessage(error)}`,
      );
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const publishedCount = articles.filter(
    (article) => article.status === "published",
  ).length;

  const draftCount = articles.filter(
    (article) => article.status === "draft",
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Manage News
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Create, publish, deactivate, and manage news articles.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void loadNews(false)}
              disabled={refreshing || loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/news/create")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              <Plus size={17} />
              Create News
            </button>
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div className="min-w-0">
              <p className="font-semibold">
                Something went wrong
              </p>

              <p className="mt-1 break-words">
                {errorMessage}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setErrorMessage("")}
              className="ml-auto shrink-0 text-red-700 hover:text-red-900"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* Success notification */}
        {successMessage && (
          <div
            role="status"
            className="mb-5 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            <CheckCircle2 size={20} />
            {successMessage}
          </div>
        )}

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Articles</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {articles.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Published</p>
            <p className="mt-2 text-3xl font-bold text-green-700">
              {publishedCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Drafts / Deactivated</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {draftCount}
            </p>
          </div>
        </div>

        {/* Search and status filter */}
        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search Khmer title, English title, or category..."
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Drafts / Deactivated</option>
            </select>
          </div>
        </div>

        {/* Articles */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8">
              <LoaderCircle
                size={32}
                className="animate-spin text-blue-700"
              />

              <p className="text-sm text-slate-500">
                Loading news articles...
              </p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <Search
                size={36}
                className="mb-3 text-slate-300"
              />

              <h2 className="font-semibold text-slate-800">
                No articles found
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Try another search term or change the status filter.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Article
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Category
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Date
                      </th>
                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredArticles.map((article) => {
                      const isProcessing =
                        processingId === article.id;

                      return (
                        <tr
                          key={article.id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="max-w-sm px-5 py-4">
                            <div className="flex items-start gap-2">
                              {article.is_pinned && (
                                <Pin
                                  size={15}
                                  className="mt-1 shrink-0 text-amber-500"
                                />
                              )}

                              <div className="min-w-0">
                                <p className="line-clamp-2 font-semibold text-slate-900">
                                  {article.title_en ||
                                    article.title_kh ||
                                    "Untitled article"}
                                </p>

                                {article.title_kh && article.title_en && (
                                  <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                                    {article.title_kh}
                                  </p>
                                )}

                                <p className="mt-1 text-xs text-slate-400">
                                  ID: {article.id.slice(0, 8)}…
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                              {article.category || "Uncategorized"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                article.status === "published"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {article.status === "published"
                                ? "Published"
                                : article.status === "draft"
                                  ? "Draft / Deactivated"
                                  : article.status || "Unknown"}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                            {formatDate(
                              article.published_at || article.created_at,
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                title="View article"
                                onClick={() =>
                                  navigate(`/news/${article.id}`)
                                }
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-700"
                              >
                                <Eye size={17} />
                              </button>

                              <button
                                type="button"
                                title="Edit article"
                                onClick={() =>
                                  navigate(
                                    `/admin/news/edit/${article.id}`,
                                  )
                                }
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-700"
                              >
                                <Pencil size={17} />
                              </button>

                              <button
                                type="button"
                                title={
                                  article.is_pinned
                                    ? "Unpin article"
                                    : "Pin article"
                                }
                                disabled={isProcessing}
                                onClick={() =>
                                  void togglePinned(article)
                                }
                                className="rounded-lg p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-50"
                              >
                                {article.is_pinned ? (
                                  <PinOff size={17} />
                                ) : (
                                  <Pin size={17} />
                                )}
                              </button>

                              <button
                                type="button"
                                title={
                                  article.status === "published"
                                    ? "Deactivate article"
                                    : "Publish article"
                                }
                                disabled={isProcessing}
                                onClick={() =>
                                  void toggleStatus(article)
                                }
                                className={`rounded-lg p-2 disabled:opacity-50 ${
                                  article.status === "published"
                                    ? "text-amber-600 hover:bg-amber-50"
                                    : "text-green-600 hover:bg-green-50"
                                }`}
                              >
                                {isProcessing ? (
                                  <LoaderCircle
                                    size={17}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Power size={17} />
                                )}
                              </button>

                              <button
                                type="button"
                                title="Delete article"
                                disabled={isProcessing}
                                onClick={() =>
                                  void deleteArticle(article)
                                }
                                className="rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-slate-100 md:hidden">
                {filteredArticles.map((article) => {
                  const isProcessing =
                    processingId === article.id;

                  return (
                    <div key={article.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="font-semibold text-slate-900">
                            {article.title_en ||
                              article.title_kh ||
                              "Untitled article"}
                          </h2>

                          {article.title_kh && article.title_en && (
                            <p className="mt-1 text-sm text-slate-500">
                              {article.title_kh}
                            </p>
                          )}
                        </div>

                        {article.is_pinned && (
                          <Pin
                            size={17}
                            className="shrink-0 text-amber-500"
                          />
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                          {article.category || "Uncategorized"}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            article.status === "published"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {article.status === "published"
                            ? "Published"
                            : article.status === "draft"
                              ? "Draft / Deactivated"
                              : article.status || "Unknown"}
                        </span>

                        <span className="text-xs text-slate-400">
                          {formatDate(
                            article.published_at || article.created_at,
                          )}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/news/${article.id}`)
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700"
                        >
                          <Eye size={14} />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/news/edit/${article.id}`,
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => void toggleStatus(article)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <LoaderCircle
                              size={14}
                              className="animate-spin"
                            />
                          ) : (
                            <Power size={14} />
                          )}

                          {article.status === "published"
                            ? "Deactivate"
                            : "Publish"}
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => void togglePinned(article)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 disabled:opacity-50"
                        >
                          {article.is_pinned ? (
                            <PinOff size={14} />
                          ) : (
                            <Pin size={14} />
                          )}

                          {article.is_pinned ? "Unpin" : "Pin"}
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => void deleteArticle(article)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {!loading && filteredArticles.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-500">
              Showing {filteredArticles.length} of {articles.length} articles
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

