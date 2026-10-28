import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Image as ImageIcon,
  LoaderCircle,
  Share2,
  Shield,
  Tag,
} from "lucide-react";
import { supabase } from "../lib/supabase";

type NewsArticle = {
  id: string;
  title_kh: string | null;
  title_en: string | null;
  summary_kh: string | null;
  summary_en: string | null;
  content_kh: string | null;
  content_en: string | null;
  image_url: string | null;
  category: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
};

type NewsImage = {
  id: string;
  news_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
};

type GalleryImage = {
  id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
};

type RecentArticle = {
  id: string;
  title_kh: string | null;
  title_en: string | null;
  image_url: string | null;
  category: string | null;
  published_at: string | null;
  created_at: string;
};

function formatDate(dateString: string | null, language: string) {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(
    language.toLowerCase().startsWith("kh") ? "kh-KH" : "en-GB",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  ).format(date);
}

function getTitle(
  article: Pick<NewsArticle, "title_kh" | "title_en">,
  isKhmer: boolean,
) {
  return isKhmer
    ? article.title_kh?.trim() || article.title_en?.trim() || ""
    : article.title_en?.trim() || article.title_kh?.trim() || "";
}

function getSummary(
  article: Pick<NewsArticle, "summary_kh" | "summary_en">,
  isKhmer: boolean,
) {
  return isKhmer
    ? article.summary_kh?.trim() || article.summary_en?.trim() || ""
    : article.summary_en?.trim() || article.summary_kh?.trim() || "";
}

function getContent(
  article: Pick<NewsArticle, "content_kh" | "content_en">,
  isKhmer: boolean,
) {
  return isKhmer
    ? article.content_kh?.trim() || article.content_en?.trim() || ""
    : article.content_en?.trim() || article.content_kh?.trim() || "";
}

function getCategoryLabel(category: string | null, isKhmer: boolean) {
  if (!category) {
    return isKhmer ? "ព័ត៌មាន" : "News";
  }

  const labels: Record<string, { en: string; kh: string }> = {
    activities: { en: "Activities", kh: "សកម្មភាព" },
    announcement: { en: "Announcement", kh: "សេចក្តីជូនដំណឹង" },
    meeting: { en: "Meeting", kh: "កិច្ចប្រជុំ" },
  };

  const normalized = category.toLowerCase();

  if (labels[normalized]) {
    return isKhmer ? labels[normalized].kh : labels[normalized].en;
  }

  return category;
}

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const { i18n } = useTranslation();

  const isKhmer = i18n.language.toLowerCase().startsWith("kh");

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [recentNews, setRecentNews] = useState<RecentArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // Load article and combine the first image with all additional images.
  useEffect(() => {
    let active = true;

    async function loadArticle() {
      setLoading(true);
      setLoadError("");
      setArticle(null);
      setImages([]);

      if (!id) {
        setLoadError(
          isKhmer
            ? "មិនមានលេខសម្គាល់ព័ត៌មានទេ។"
            : "The news article ID is missing.",
        );
        setLoading(false);
        return;
      }

      const { data: articleData, error: articleError } = await supabase
        .from("news")
        .select(
          "id, title_kh, title_en, summary_kh, summary_en, content_kh, content_en, image_url, category, status, published_at, created_at",
        )
        .eq("id", id)
        .eq("status", "published")
        .maybeSingle();

      if (!active) return;

      if (articleError) {
        console.error("News detail loading error:", articleError);

        setLoadError(
          isKhmer
            ? "មិនអាចផ្ទុកព័ត៌មានបានទេ។ សូមព្យាយាមម្ដងទៀត។"
            : "Unable to load this article. Please try again.",
        );

        setLoading(false);
        return;
      }

      if (!articleData) {
        setLoadError(
          isKhmer
            ? "រកមិនឃើញព័ត៌មាននេះទេ។"
            : "This article could not be found.",
        );

        setLoading(false);
        return;
      }

      const currentArticle = articleData as NewsArticle;

      setArticle(currentArticle);

      const { data: imageData, error: imageError } = await supabase
        .from("news_images")
        .select("id, news_id, image_url, alt_text, display_order")
        .eq("news_id", id)
        .order("display_order", { ascending: true });

      if (!active) return;

      if (imageError) {
        console.error("News gallery loading error:", imageError);
      }

      const additionalImages: NewsImage[] = imageError
        ? []
        : ((imageData ?? []) as NewsImage[]);

      // The first image is stored in news.image_url.
      // All remaining images are stored in news_images.
      // Combine them into one gallery instead of showing a separate cover.
      const allImages: GalleryImage[] = [
        ...(currentArticle.image_url
          ? [
              {
                id: `main-${currentArticle.id}`,
                image_url: currentArticle.image_url,
                alt_text:
                  currentArticle.title_en || currentArticle.title_kh || "",
                display_order: 1,
              },
            ]
          : []),
        ...additionalImages.map((image) => ({
          id: image.id,
          image_url: image.image_url,
          alt_text: image.alt_text,
          display_order: image.display_order,
        })),
      ];

      // Avoid displaying the same image twice if the URL was saved in both places.
      const uniqueImages = allImages.filter(
        (image, index, array) =>
          image.image_url &&
          array.findIndex(
            (candidate) => candidate.image_url === image.image_url,
          ) === index,
      );

      uniqueImages.sort((a, b) => a.display_order - b.display_order);

      setImages(uniqueImages);
      setLoading(false);
    }

    void loadArticle();

    return () => {
      active = false;
    };
  }, [id, isKhmer]);

  // Load recent published news.
  useEffect(() => {
    let active = true;

    async function loadRecentNews() {
      const { data, error } = await supabase
        .from("news")
        .select(
          "id, title_kh, title_en, image_url, category, published_at, created_at",
        )
        .eq("status", "published")
        .order("published_at", {
          ascending: false,
          nullsFirst: false,
        })
        .order("created_at", { ascending: false })
        .limit(6);

      if (!active) return;

      if (error) {
        console.error("Recent news loading error:", error);
        return;
      }

      setRecentNews(
        ((data ?? []) as RecentArticle[]).filter((item) => item.id !== id),
      );
    }

    void loadRecentNews();

    return () => {
      active = false;
    };
  }, [id]);

  // Close the image viewer with the Escape key.
  useEffect(() => {
    if (!activeImage) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveImage(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeImage]);

  async function handleShare() {
    setShareMessage("");

    try {
      if (navigator.share) {
        await navigator.share({
          title: article ? getTitle(article, isKhmer) : "News",
          url: window.location.href,
        });

        return;
      }

      await navigator.clipboard.writeText(window.location.href);

      setShareMessage(isKhmer ? "បានចម្លងតំណរួចរាល់!" : "Article link copied!");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      setShareMessage(
        isKhmer
          ? "មិនអាចចែករំលែកបានទេ។ សូមចម្លងតំណពីកម្មវិធីរុករក។"
          : "Unable to share. Please copy the link from your browser.",
      );
    }
  }

  // Loading state.
  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-white px-4">
        <div className="text-center">
          <LoaderCircle
            size={36}
            className="mx-auto animate-spin text-blue-600"
          />

          <p className="mt-4 text-sm text-slate-500">
            {isKhmer ? "កំពុងផ្ទុកព័ត៌មាន..." : "Loading article..."}
          </p>
        </div>
      </main>
    );
  }

  // Error state.
  if (loadError || !article) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-white px-4">
        <div className="max-w-lg text-center">
          <Shield size={40} className="mx-auto text-slate-400" />

          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            {isKhmer ? "រកមិនឃើញព័ត៌មាន" : "News Not Found"}
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-500">
            {loadError ||
              (isKhmer
                ? "ព័ត៌មាននេះមិនមានទេ ឬមិនទាន់បានផ្សព្វផ្សាយ។"
                : "This article may not exist or may not have been published.")}
          </p>

          <Link
            to="/news"
            className="mt-6 inline-flex items-center gap-2 font-semibold text-blue-700 hover:text-blue-900"
          >
            <ArrowLeft size={17} />
            {isKhmer ? "ត្រឡប់ទៅព័ត៌មាន" : "Back to News"}
          </Link>
        </div>
      </main>
    );
  }

  const title = getTitle(article, isKhmer);
  const summary = getSummary(article, isKhmer);
  const content = getContent(article, isKhmer);

  const articleDate = formatDate(
    article.published_at || article.created_at,
    i18n.language,
  );

  const categoryLabel = getCategoryLabel(article.category, isKhmer);

  return (
    <main className="min-h-screen bg-white text-slate-800">
      {/* Breadcrumb */}
      <div className="border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link to="/" className="transition hover:text-blue-700">
              {isKhmer ? "ទំព័រដើម" : "Home"}
            </Link>

            <span className="text-slate-300">/</span>

            <Link to="/news" className="transition hover:text-blue-700">
              {isKhmer ? "ព័ត៌មាន" : "News"}
            </Link>

            <span className="text-slate-300">/</span>

            <span className="max-w-[240px] truncate font-medium text-slate-700">
              {title}
            </span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Main article */}
          <article className="min-w-0 lg:col-span-8">
            {/* Article heading */}
            <header>
              <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="inline-flex items-center gap-2 font-semibold text-blue-700">
                  <Tag size={15} />
                  {categoryLabel}
                </span>

                <span className="text-slate-300">|</span>

                <span className="inline-flex items-center gap-2 text-slate-500">
                  <CalendarDays size={15} />
                  {articleDate}
                </span>
              </div>

              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-[42px]">
                {title}
              </h1>

              {summary && (
                <p className="mt-6 max-w-4xl text-lg leading-8 text-slate-600 sm:text-xl sm:leading-9">
                  {summary}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-4 border-b border-slate-200 pb-6">
                <button
                  type="button"
                  onClick={() => void handleShare()}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-700"
                >
                  <Share2 size={17} />
                  {isKhmer ? "ចែករំលែកព័ត៌មាន" : "Share article"}
                </button>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Share on Facebook"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                >
                  f
                </a>

                {shareMessage && (
                  <span className="text-xs text-green-700">{shareMessage}</span>
                )}
              </div>
            </header>

            {/* ALL photos in one gallery.
                No separate cover photo, no gallery heading, no image count.
                Original image proportions are preserved. */}
            {images.length > 0 && (
              <div className="mt-8 space-y-6 sm:space-y-8">
                {images.map((image, index) => (
                  <figure key={image.id} className="min-w-0">
                    <button
                      type="button"
                      onClick={() => setActiveImage(image.image_url)}
                      className="block w-full cursor-zoom-in text-left"
                      aria-label={
                        isKhmer
                          ? `មើលរូបភាពទី ${index + 1}`
                          : `View image ${index + 1}`
                      }
                    >
                      <img
                        src={image.image_url}
                        alt={image.alt_text || title}
                        loading={index === 0 ? "eager" : "lazy"}
                        className="block h-auto w-full object-contain"
                      />
                    </button>
                  </figure>
                ))}
              </div>
            )}

            {/* Article content: hidden if null or empty. */}
            {content && (
              <section className="mt-10">
                <h2 className="mb-5 border-b border-slate-200 pb-3 text-xl font-bold text-slate-900">
                  {isKhmer ? "ខ្លឹមសារព័ត៌មាន" : "Article"}
                </h2>

                <div className="whitespace-pre-line break-words text-base leading-8 text-slate-700 sm:text-[17px] sm:leading-9">
                  {content}
                </div>
              </section>
            )}

            {/* Back to news */}
            <div className="mt-12 border-t border-slate-200 pt-6">
              <Link
                to="/news"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-900"
              >
                <ArrowLeft size={17} />
                {isKhmer ? "ត្រឡប់ទៅព័ត៌មាន" : "Back to News"}
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="min-w-0 lg:col-span-4">
            {/* Academy information */}
            <section className="border-b border-slate-200 pb-7">
              <div className="flex items-start gap-3">
                <Shield size={26} className="mt-1 shrink-0 text-blue-700" />

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

            {/* Recent news */}
            <section className="mt-8">
              <h2 className="mb-5 border-b border-slate-200 pb-3 text-lg font-bold text-slate-900">
                {isKhmer ? "ព័ត៌មានថ្មីៗ" : "Recent News"}
              </h2>

              {recentNews.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {recentNews.map((item) => {
                    const recentTitle = isKhmer
                      ? item.title_kh?.trim() || item.title_en?.trim() || ""
                      : item.title_en?.trim() || item.title_kh?.trim() || "";

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
                            <ImageIcon size={23} className="text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-semibold text-blue-700">
                            {getCategoryLabel(item.category, isKhmer)}
                          </span>

                          <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-slate-800 transition group-hover:text-blue-700">
                            {recentTitle}
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

            {/* Quick links */}
            <section className="mt-10 border-t border-slate-200 pt-7">
              <h2 className="mb-4 text-lg font-bold text-slate-900">
                {isKhmer ? "តំណភ្ជាប់រហ័ស" : "Quick Links"}
              </h2>

              <div className="space-y-3">
                {[
                  {
                    label: isKhmer ? "ទំព័រដើម" : "Home",
                    to: "/",
                  },
                  {
                    label: isKhmer ? "ព័ត៌មានទាំងអស់" : "All News",
                    to: "/news",
                  },
                  {
                    label: isKhmer ? "អំពីស្ថាប័ន" : "Institution",
                    to: "/institution/background",
                  },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center justify-between gap-3 text-sm text-slate-600 transition hover:text-blue-700"
                  >
                    {item.label}
                    <ArrowRight size={15} />
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* Full-size image viewer */}
      {activeImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={isKhmer ? "មើលរូបភាព" : "Image viewer"}
          onClick={() => setActiveImage(null)}
        >
          <button
            type="button"
            onClick={() => setActiveImage(null)}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label={isKhmer ? "បិទរូបភាព" : "Close image"}
          >
            <span className="text-3xl leading-none">×</span>
          </button>

          <img
            src={activeImage}
            alt={title}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] max-w-full object-contain"
          />
        </div>
      )}
    </main>
  );
}
