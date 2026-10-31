import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Image as ImageIcon,
  LoaderCircle,
  Share2,
  Shield,
  Tag,
  Send,
  Copy,
  Check,
} from "lucide-react";
import { supabase } from "../lib/supabase";

type DisplaySize = "large" | "medium" | "small";

type NewsArticle = {
  id: string;
  title_kh: string | null;
  title_en: string | null;
  summary_kh: string | null;
  summary_en: string | null;
  content_kh: string | null;
  content_en: string | null;
  image_url: string | null;
  image_display_size: DisplaySize | null;
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
  display_size: DisplaySize | null;
  is_featured: boolean;
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

function normalizeDisplaySize(
  size: string | null | undefined,
): DisplaySize {
  if (size === "medium" || size === "small") return size;
  return "large";
}

function formatDate(dateString: string | null, language: string) {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "";

  const locale =
    language.toLowerCase().startsWith("kh") ||
    language.toLowerCase().startsWith("km")
      ? "km-KH"
      : "en-GB";

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function getTitle(
  article: Pick<NewsArticle, "title_kh" | "title_en">,
  isKhmer: boolean,
) {
  return isKhmer
    ? article.title_kh?.trim() || article.title_en?.trim() || ""
    : article.title_en?.trim() || article.title_kh?.trim() || "";
}

// Preserve line breaks in Summary.
function getSummary(
  article: Pick<NewsArticle, "summary_kh" | "summary_en">,
  isKhmer: boolean,
) {
  const text = isKhmer
    ? article.summary_kh || article.summary_en || ""
    : article.summary_en || article.summary_kh || "";

  return text.replace(/\r\n?/g, "\n");
}

// Preserve line breaks in News Content.
function getContent(
  article: Pick<NewsArticle, "content_kh" | "content_en">,
  isKhmer: boolean,
) {
  const text = isKhmer
    ? article.content_kh || article.content_en || ""
    : article.content_en || article.content_kh || "";

  return text.replace(/\r\n?/g, "\n");
}

/**
 * Remove accidental Markdown image syntax and standalone image URLs.
 * Preserve real HTML images inserted through the rich-text editor.
 */
function cleanArticleContent(content: string | null | undefined): string {
  if (!content) return "";

  return (
    content
      // Remove Markdown image syntax.
      .replace(/!\[[^\]]*\]\([^)]+\)/gi, "")

      // Remove Markdown links pointing to image files.
      .replace(
        /\[([^\]]+)\]\(\s*<?https?:\/\/[^)\s>]+\.(?:jpg|jpeg|png|webp|gif|avif|svg)(?:\?[^)\s>]*)?>?\s*\)/gi,
        "",
      )

      // Remove standalone image URLs.
      .replace(
        /https?:\/\/[^\s<>"')]+\.(?:jpg|jpeg|png|webp|gif|avif|svg)(?:\?[^\s<>"')]*)?/gi,
        "",
      )

      // Remove standalone image filenames.
      .replace(
        /^[ \t]*[\w-]+(?:_[\w-]+)*\.(?:jpg|jpeg|png|webp|gif|avif|svg)[ \t]*$/gim,
        "",
      )
  );
}

/** Sanitize article HTML before rendering. */
function sanitizeArticleContent(content: string | null | undefined): string {
  if (!content) return "";

  return DOMPurify.sanitize(content, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["style", "script", "iframe", "object", "embed"],
    FORBID_ATTR: ["onerror", "onload"],
  });
}

/** Determine whether the article contains meaningful text or media. */
function hasArticleContent(html: string): boolean {
  if (!html.trim()) return false;

  const text = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;|&#160;|&#xA0;|&#8203;/gi, "")
    .replace(/\u200B/g, "")
    .trim();

  const hasMedia = /<(img|video|audio|figure)\b/i.test(html);

  return text.length > 0 || hasMedia;
}

function getCategoryLabel(category: string | null, isKhmer: boolean) {
  if (!category) return isKhmer ? "ព័ត៌មាន" : "News";

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

/**
 * Featured and gallery image widths.
 *
 * Large  = full row
 * Medium = half row on desktop
 * Small  = one-third row on desktop
 */
function getGalleryColumnSize(size: DisplaySize) {
  switch (size) {
    case "medium":
      return "col-span-12 sm:col-span-6";

    case "small":
      return "col-span-6 sm:col-span-4";

    default:
      return "col-span-12";
  }
}

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const { i18n } = useTranslation();

  const isKhmer =
    i18n.language.toLowerCase().startsWith("kh") ||
    i18n.language.toLowerCase().startsWith("km");

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [images, setImages] = useState<NewsImage[]>([]);
  const [recentNews, setRecentNews] = useState<RecentArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // Reference for detecting clicks outside the share dropdown.
  const shareDropdownRef = useRef<HTMLDivElement>(null);

  // Close the share dropdown when clicking outside it.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        shareDropdownRef.current &&
        !shareDropdownRef.current.contains(event.target as Node)
      ) {
        setShowShareOptions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load the published article and its additional images.
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
          "id, title_kh, title_en, summary_kh, summary_en, content_kh, content_en, image_url, image_display_size, category, status, published_at, created_at",
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
        .select(
          "id, news_id, image_url, alt_text, display_order, display_size, is_featured",
        )
        .eq("news_id", id)
        .order("display_order", { ascending: true });

      if (!active) return;

      if (imageError) {
        console.error("News gallery loading error:", imageError);
      }

      const additionalImages: NewsImage[] = imageError
        ? []
        : ((imageData ?? []) as NewsImage[]);

      const uniqueImages = additionalImages
        .filter(
          (image, index, array) =>
            Boolean(image.image_url) &&
            image.image_url !== currentArticle.image_url &&
            array.findIndex(
              (candidate) => candidate.image_url === image.image_url,
            ) === index,
        )
        .sort((a, b) => a.display_order - b.display_order);

      setImages(uniqueImages);
      setLoading(false);
    }

    void loadArticle();

    return () => {
      active = false;
    };
  }, [id, isKhmer]);

  // Load recent published articles.
  useEffect(() => {
    let active = true;

    async function loadRecentNews() {
      const { data, error } = await supabase
        .from("news")
        .select(
          "id, title_kh, title_en, image_url, category, published_at, created_at",
        )
        .eq("status", "published")
        // Sort by creation date so newly added articles appear first.
        .order("created_at", { ascending: false })
        .limit(7);

      if (!active) return;

      if (error) {
        console.error("Recent news loading error:", error);
        return;
      }

      setRecentNews(
        ((data ?? []) as RecentArticle[])
          .filter((item) => item.id !== id)
          .slice(0, 6),
      );
    }

    void loadRecentNews();

    return () => {
      active = false;
    };
  }, [id]);

  // Close the image viewer with Escape.
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

  // Share article to Facebook.
  function shareToFacebook() {
    const shareUrl = window.location.href;

    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl,
    )}`;

    window.open(url, "_blank", "width=600,height=500");

    setShowShareOptions(false);
  }

  // Share article to Telegram.
  function shareToTelegram() {
    const shareUrl = window.location.href;
    const shareTitle = article ? getTitle(article, isKhmer) : "News";

    const url = `https://t.me/share/url?url=${encodeURIComponent(
      shareUrl,
    )}&text=${encodeURIComponent(shareTitle)}`;

    window.open(url, "_blank", "width=600,height=500");

    setShowShareOptions(false);
  }

  // Copy article link.
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
        setShowShareOptions(false);
      }, 2000);
    } catch (error) {
      console.error("Unable to copy article link:", error);
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

  // Error or article not found.
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
            className="mt-6 inline-flex items-center gap-2 font-semibold text-blue-700 transition hover:text-blue-900"
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

  const rawContent = cleanArticleContent(getContent(article, isKhmer));
  const content = sanitizeArticleContent(rawContent);
  const showArticleContent = hasArticleContent(content);

  const featuredImageSize = normalizeDisplaySize(
    article.image_display_size,
  );

  const articleDate = formatDate(
    article.published_at || article.created_at,
    i18n.language,
  );

  const categoryLabel = getCategoryLabel(article.category, isKhmer);

  // Featured images are displayed together as a static image group.
  // Each image respects its own selected display size.
  const featuredImages = [
    ...(article.image_url
      ? [
          {
            id: "main-featured-image",
            image_url: article.image_url,
            alt_text: title,
            display_size: featuredImageSize,
          },
        ]
      : []),

    ...images
      .filter(
        (image) =>
          image.is_featured &&
          image.image_url !== article.image_url,
      )
      .map((image) => ({
        id: image.id,
        image_url: image.image_url,
        alt_text: image.alt_text || title,
        display_size: normalizeDisplaySize(image.display_size),
      })),
  ];

  // Photo Gallery displays ONLY images that are not featured.
  const galleryImages = images.filter((image) => !image.is_featured);

  return (
    <main className="min-h-screen bg-white text-slate-800">
      {/* Breadcrumb - KEEP THIS HORIZONTAL LINE */}
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
            {/* Title and summary */}
            <header>
              {/* Category, date and share dropdown */}
              <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm">
                <span className="inline-flex items-center gap-2 font-semibold text-blue-700">
                  <Tag size={15} />
                  {categoryLabel}
                </span>

                <span className="text-slate-300">|</span>

                <span className="inline-flex items-center gap-2 text-slate-500">
                  <CalendarDays size={15} />
                  {articleDate}
                </span>

                {/* Share dropdown */}
                <div
                  ref={shareDropdownRef}
                  className="relative flex items-center"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setShowShareOptions((previous) => !previous)
                    }
                    aria-expanded={showShareOptions}
                    aria-haspopup="true"
                    className="inline-flex items-center gap-2 font-semibold text-slate-600 transition hover:text-blue-700"
                  >
                    <Share2 size={17} />
                    {isKhmer ? "ចែករំលែកព័ត៌មាន" : "Share article"}
                  </button>

                  {showShareOptions && (
                    <div className="absolute left-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                      <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                        {isKhmer
                          ? "ចែករំលែកទំព័រនេះ"
                          : "Share this page"}
                      </p>

                      <button
                        type="button"
                        onClick={shareToFacebook}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-lg font-extrabold text-blue-700">
                          f
                        </span>
                        Facebook
                      </button>

                      <button
                        type="button"
                        onClick={shareToTelegram}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-sky-50 hover:text-sky-600"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                          <Send size={17} />
                        </span>
                        Telegram
                      </button>

                      <button
                        type="button"
                        onClick={() => void copyLink()}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-100"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                          {copied ? (
                            <Check size={17} />
                          ) : (
                            <Copy size={17} />
                          )}
                        </span>

                        {copied
                          ? isKhmer
                            ? "បានចម្លង!"
                            : "Copied!"
                          : isKhmer
                            ? "ចម្លងតំណ"
                            : "Copy link"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-[42px]">
                {title}
              </h1>

              {summary && (
                <div className="mt-5 whitespace-pre-wrap break-words text-lg leading-8 text-slate-600">
                  {summary}
                </div>
              )}
            </header>

            {/* Featured Images */}
            {featuredImages.length > 0 && (
              <section className="mt-4">
                <div className="grid grid-cols-12 gap-2 sm:gap-4">
                  {featuredImages.map((image, index) => {
                    const imageSize = normalizeDisplaySize(
                      image.display_size,
                    );

                    return (
                      <figure
                        key={image.id}
                        className={`min-w-0 ${getGalleryColumnSize(
                          imageSize,
                        )}`}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveImage(image.image_url)}
                          className="group block w-full cursor-zoom-in overflow-hidden bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          aria-label={
                            isKhmer
                              ? `មើលរូបភាពសំខាន់ទី ${index + 1}`
                              : `View featured image ${index + 1}`
                          }
                        >
                          <img
                            src={image.image_url}
                            alt={image.alt_text}
                            loading={index === 0 ? "eager" : "lazy"}
                            fetchPriority={index === 0 ? "high" : "auto"}
                            className="block h-auto max-h-[650px] w-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                          />
                        </button>
                      </figure>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Formatted article content */}
            {showArticleContent && (
              <section className="mt-4">
                <div
                  className="whitespace-pre-wrap break-words text-base leading-8 text-slate-700 sm:text-[17px]"
                  lang={isKhmer ? "kh" : "en"}
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </section>
            )}

            {/* Photo Gallery */}
{galleryImages.length > 0 && (
  <section className="mt-4">
    {/* Gallery Heading */}
    

    {/* Gallery Grid */}
    <div className="grid grid-cols-12 gap-3 sm:gap-4">
      {galleryImages.map((image, index) => {
        const imageSize = normalizeDisplaySize(
          image.display_size,
        );

        return (
          <figure
            key={image.id}
            className={`
              group relative min-w-0 overflow-hidden 
              border border-slate-200/70 bg-slate-100
              shadow-sm transition-all duration-300
              hover:-translate-y-1 hover:shadow-lg
              ${getGalleryColumnSize(imageSize)}
            `}
          >
            <button
              type="button"
              onClick={() => setActiveImage(image.image_url)}
              className="relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
              aria-label={
                isKhmer
                  ? `មើលរូបភាពទី ${index + 1}`
                  : `View gallery image ${index + 1}`
              }
            >
              {/* Gallery Image */}
              <img
                src={image.image_url}
                alt={
                  image.alt_text ||
                  `${title} - ${index + 1}`
                }
                loading="lazy"
                className="
                  h-full w-full object-cover
                  transition-transform duration-500 ease-out
                  group-hover:scale-105
                "
              />

              {/* Dark Hover Overlay */}
              <div className="
                absolute inset-0
                bg-gradient-to-t from-black/45 via-transparent to-transparent
                opacity-0 transition-opacity duration-300
                group-hover:opacity-100
              " />

              {/* Image Number */}
              <span className="
                absolute bottom-3 left-3
                flex h-8 min-w-8 items-center justify-center
                rounded-lg border border-white/30
                bg-black/40 px-2 text-xs font-semibold text-white
                opacity-0 backdrop-blur-sm
                transition-all duration-300
                group-hover:opacity-100
              ">
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* Zoom Icon */}
              <span className="
                absolute right-3 top-3
                flex h-9 w-9 items-center justify-center
                rounded-full border border-white/30
                bg-black/40 text-white backdrop-blur-sm
                opacity-0 scale-90
                transition-all duration-300
                group-hover:scale-100 group-hover:opacity-100
              ">
                <ImageIcon size={17} />
              </span>
            </button>
          </figure>
        );
      })}
    </div>
  </section>
)}

            {/* Back to news */}
            <div className="mt-12 pt-6">
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
            <section className="pb-7">
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
                    {isKhmer
                      ? "ព័ត៌មាន និងសកម្មភាព"
                      : "News and Activities"}
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
              <h2 className="mb-5 text-lg font-bold text-slate-900">
                {isKhmer ? "ព័ត៌មានថ្មីៗ" : "Recent News"}
              </h2>

              {recentNews.length > 0 ? (
                <div>
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
            <section className="mt-10 pt-7">
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