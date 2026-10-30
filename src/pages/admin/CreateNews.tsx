import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";
import RichTextEditor from "../../components/admin/RichTextEditor";
import {
  ArrowLeft,
  ImagePlus,
  LoaderCircle,
  Save,
  Send,
  X,
  FileText,
  CalendarDays,
  CheckCircle2,
  Eye,
} from "lucide-react";

type Category = {
  id: string;
  name_en: string;
  name_kh: string;
  slug: string;
};

type ArticleForm = {
  titlekh: string;
  summarykh: string;
  contentkh: string;
  titleEn: string;
  summaryEn: string;
  contentEn: string;
  category: string;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const STORAGE_BUCKET = "news-images";

const initialForm: ArticleForm = {
  titlekh: "",
  summarykh: "",
  contentkh: "",
  titleEn: "",
  summaryEn: "",
  contentEn: "",
  category: "",
};

function getSafeExtension(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase() || "jpg";

  return /^[a-z0-9]+$/.test(extension) ? extension : "jpg";
}

export default function CreateNews() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const isKhmer = i18n.language.startsWith("kh");

  const [form, setForm] = useState<ArticleForm>(initialForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Featured image
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [featuredPreview, setFeaturedPreview] = useState("");

  // Additional images
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>(
    [],
  );

  // Track preview URLs.
  const additionalPreviewsRef = useRef<string[]>([]);
  const featuredPreviewRef = useRef<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"draft" | "published">("draft");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load categories.
  useEffect(() => {
    let active = true;

    async function fetchCategories() {
      setLoadingCategories(true);

      const { data, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name_en, name_kh, slug")
        .order("name_en", { ascending: true });

      if (!active) return;

      if (categoriesError) {
        setError(categoriesError.message);
      } else {
        setCategories((data ?? []) as Category[]);
      }

      setLoadingCategories(false);
    }

    void fetchCategories();

    return () => {
      active = false;
    };
  }, []);

  // Release all preview URLs when component unmounts.
  useEffect(() => {
    return () => {
      if (featuredPreviewRef.current) {
        URL.revokeObjectURL(featuredPreviewRef.current);
      }

      additionalPreviewsRef.current.forEach((preview) => {
        URL.revokeObjectURL(preview);
      });

      additionalPreviewsRef.current = [];
      featuredPreviewRef.current = null;
    };
  }, []);

  function updateField(field: keyof ArticleForm, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function showError(message: string) {
    setError(message);
    setSuccess("");
  }

  function createFeaturedPreview(file: File) {
    if (featuredPreviewRef.current) {
      URL.revokeObjectURL(featuredPreviewRef.current);
    }

    const preview = URL.createObjectURL(file);

    featuredPreviewRef.current = preview;
    setFeaturedPreview(preview);
  }

  // Select featured image.
  function handleFeaturedImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    setError("");
    setSuccess("");

    if (!file.type.startsWith("image/")) {
      showError(
        isKhmer
          ? "សូមជ្រើសរើសឯកសាររូបភាព។"
          : "Please select an image file.",
      );
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      showError(
        isKhmer
          ? "រូបភាពមិនអាចលើសពី 5MB បានទេ។"
          : "The image must be 5MB or smaller.",
      );
      return;
    }

    setFeaturedImage(file);
    createFeaturedPreview(file);
  }

  // Remove featured image.
  function removeFeaturedImage() {
    if (featuredPreviewRef.current) {
      URL.revokeObjectURL(featuredPreviewRef.current);
      featuredPreviewRef.current = null;
    }

    setFeaturedImage(null);
    setFeaturedPreview("");
  }

  // Select additional images.
  function handleAdditionalImagesChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(event.target.files ?? []);

    event.target.value = "";

    if (files.length === 0) return;

    setError("");
    setSuccess("");

    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name}: Not an image file.`);
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        errors.push(`${file.name}: Image must be 5MB or smaller.`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      const newPreviews = validFiles.map((file) =>
        URL.createObjectURL(file),
      );

      additionalPreviewsRef.current = [
        ...additionalPreviewsRef.current,
        ...newPreviews,
      ];

      setAdditionalImages((previous) => [
        ...previous,
        ...validFiles,
      ]);

      setAdditionalPreviews((previous) => [
        ...previous,
        ...newPreviews,
      ]);
    }

    if (errors.length > 0) {
      showError(
        isKhmer
          ? `រូបភាពមួយចំនួនមិនអាចបន្ថែមបាន៖ ${errors.join(" ")}`
          : errors.join(" "),
      );
    }
  }

  // Remove one additional image.
  function removeAdditionalImage(index: number) {
    const preview = additionalPreviews[index];

    if (preview) {
      URL.revokeObjectURL(preview);

      additionalPreviewsRef.current =
        additionalPreviewsRef.current.filter(
          (item) => item !== preview,
        );
    }

    setAdditionalImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index),
    );

    setAdditionalPreviews((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index),
    );
  }

  // Remove all additional images.
  function removeAllAdditionalImages() {
    additionalPreviews.forEach((preview) => {
      URL.revokeObjectURL(preview);
    });

    additionalPreviewsRef.current = [];

    setAdditionalImages([]);
    setAdditionalPreviews([]);
  }

  // Upload an image to Supabase Storage.
  async function uploadImage(file: File, path: string) {
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  // Save as draft or publish.
  async function handleSave(
    nextStatus: "draft" | "published",
  ) {
    if (saving) return;

    setError("");
    setSuccess("");

    if (!form.titlekh.trim() && !form.titleEn.trim()) {
      showError(
        isKhmer
          ? "សូមបញ្ចូលចំណងជើងជាភាសាខ្មែរ ឬភាសាអង់គ្លេស។"
          : "Please enter a title in Khmer or English.",
      );
      return;
    }

    if (!form.category) {
      showError(
        isKhmer
          ? "សូមជ្រើសរើសប្រភេទព័ត៌មាន។"
          : "Please select a news category.",
      );
      return;
    }

    setSaving(true);
    setStatus(nextStatus);

    let uploadedFeaturedPath: string | null = null;
    let createdNewsId: string | null = null;

    const uploadedAdditionalPaths: string[] = [];

    try {
      let imageUrl: string | null = null;

      // 1. Upload featured image.
      if (featuredImage) {
        const extension = getSafeExtension(featuredImage.name);

        uploadedFeaturedPath =
          `news/${crypto.randomUUID()}.${extension}`;

        imageUrl = await uploadImage(
          featuredImage,
          uploadedFeaturedPath,
        );
      }

      // 2. Create news record.
      const { data: newsData, error: newsError } = await supabase
        .from("news")
        .insert({
          title_kh: form.titlekh.trim() || null,
          summary_kh: form.summarykh.trim() || null,
          content_kh: form.contentkh.trim() || null,

          title_en: form.titleEn.trim() || null,
          summary_en: form.summaryEn.trim() || null,
          content_en: form.contentEn.trim() || null,

          category: form.category,
          image_url: imageUrl,
          status: nextStatus,
          published_at:
            nextStatus === "published"
              ? new Date().toISOString()
              : null,
        })
        .select("id")
        .single();

      if (newsError) {
        throw new Error(newsError.message);
      }

      if (!newsData) {
        throw new Error("The news article could not be created.");
      }

      createdNewsId = newsData.id;

      // 3. Upload additional images.
      if (additionalImages.length > 0) {
        const imageRecords: {
          news_id: string;
          image_url: string;
          alt_text: string | null;
          display_order: number;
        }[] = [];

        for (const [index, file] of additionalImages.entries()) {
          const extension = getSafeExtension(file.name);

          const imagePath =
            `news/${newsData.id}/${crypto.randomUUID()}.${extension}`;

          const publicUrl = await uploadImage(file, imagePath);

          uploadedAdditionalPaths.push(imagePath);

          imageRecords.push({
            news_id: newsData.id,
            image_url: publicUrl,
            alt_text: file.name,
            display_order: index + 1,
          });
        }

        // 4. Insert additional image records.
        const { error: imagesInsertError } = await supabase
          .from("news_images")
          .insert(imageRecords);

        if (imagesInsertError) {
          throw new Error(
            `Could not save additional image records: ${imagesInsertError.message}`,
          );
        }
      }

      setSuccess(
        nextStatus === "published"
          ? isKhmer
            ? "បានផ្សព្វផ្សាយព័ត៌មានដោយជោគជ័យ!"
            : "News published successfully!"
          : isKhmer
            ? "បានរក្សាទុកសេចក្តីព្រាងដោយជោគជ័យ!"
            : "Draft saved successfully!",
      );

      window.setTimeout(() => {
        navigate("/admin/news");
      }, 1000);
    } catch (err: unknown) {
      console.error("[CreateNews] Save failed:", err);

      // Remove incomplete news record.
      if (createdNewsId) {
        const { error: deleteError } = await supabase
          .from("news")
          .delete()
          .eq("id", createdNewsId);

        if (deleteError) {
          console.error(
            "[CreateNews] Could not remove incomplete article:",
            deleteError,
          );
        }
      }

      // Remove uploaded additional images.
      if (uploadedAdditionalPaths.length > 0) {
        const { error: cleanupError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove(uploadedAdditionalPaths);

        if (cleanupError) {
          console.error(
            "[CreateNews] Additional image cleanup failed:",
            cleanupError,
          );
        }
      }

      // Remove featured image.
      if (uploadedFeaturedPath) {
        const { error: cleanupError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([uploadedFeaturedPath]);

        if (cleanupError) {
          console.error(
            "[CreateNews] Featured image cleanup failed:",
            cleanupError,
          );
        }
      }

      showError(
        err instanceof Error
          ? err.message
          : isKhmer
            ? "មានបញ្ហាកើតឡើង។ សូមព្យាយាមម្ដងទៀត។"
            : "Something went wrong. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handleSave("published");
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {/* Top toolbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/news")}
              aria-label="Back to news"
              className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white">
              <FileText size={21} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-slate-900">
                {isKhmer ? "បង្កើតព័ត៌មានថ្មី" : "New Article"}
              </h1>

              <p className="hidden text-xs text-slate-500 sm:block">
                {isKhmer
                  ? "កម្មវិធីគ្រប់គ្រងព័ត៌មាន"
                  : "News Content Management"}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 sm:inline-flex">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              {isKhmer ? "សេចក្តីព្រាង" : "New draft"}
            </span>

            <button
              type="button"
              onClick={() => void handleSave("draft")}
              disabled={saving || loadingCategories}
              className="hidden items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:inline-flex"
            >
              {saving && status === "draft" ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}

              {isKhmer ? "រក្សាទុក" : "Save Draft"}
            </button>

            <button
              type="submit"
              form="create-news-form"
              disabled={saving || loadingCategories}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
            >
              {saving && status === "published" ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}

              {isKhmer ? "ផ្សព្វផ្សាយ" : "Publish"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:py-8">
        {/* Notifications */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <div className="flex items-start gap-2">
              <X size={18} className="mt-0.5 shrink-0" />
              <p className="break-words">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            <CheckCircle2 size={19} />
            {success}
          </div>
        )}

        <form
          id="create-news-form"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_350px]"
        >
          {/* Main editor */}
          <div className="min-w-0 space-y-5">
            {/* Titles and summaries */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-5">
                <h2 className="text-base font-bold text-slate-900">
                  {isKhmer ? "ចំណងជើង និងសេចក្តីសង្ខេប" : "Article Details"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter your article title and summary in both languages.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                {/* English title */}
                <div>
                  <label
                    htmlFor="title-en"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    English Title
                  </label>

                  <input
                    id="title-en"
                    type="text"
                    value={form.titleEn}
                    onChange={(event) =>
                      updateField("titleEn", event.target.value)
                    }
                    placeholder="Enter your English headline..."
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base font-semibold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Khmer title */}
                <div>
                  <label
                    htmlFor="title-kh"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    ចំណងជើងជាភាសាខ្មែរ
                  </label>

                  <input
                    id="title-kh"
                    type="text"
                    value={form.titlekh}
                    onChange={(event) =>
                      updateField("titlekh", event.target.value)
                    }
                    placeholder="បញ្ចូលចំណងជើងជាភាសាខ្មែរ..."
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* English summary */}
                <div>
                  <label
                    htmlFor="summary-en"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    English Summary
                  </label>

                  <textarea
                    id="summary-en"
                    rows={6}
                    value={form.summaryEn}
                    onChange={(event) =>
                      updateField("summaryEn", event.target.value)
                    }
                    placeholder="Write a short summary of this news..."
                    className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-sm leading-7 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Khmer summary */}
                <div>
                  <label
                    htmlFor="summary-kh"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    សេចក្តីសង្ខេបជាភាសាខ្មែរ
                  </label>

                  <textarea
                    id="summary-kh"
                    rows={6}
                    value={form.summarykh}
                    onChange={(event) =>
                      updateField("summarykh", event.target.value)
                    }
                    placeholder="សរសេរសេចក្តីសង្ខេបព័ត៌មាន..."
                    className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-sm leading-8 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </section>

            {/* Featured image */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-4">
                <h2 className="text-base font-bold text-slate-900">
                  {isKhmer ? "រូបភាពមេ" : "Featured Image"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {isKhmer
                    ? "រូបភាពនេះនឹងបង្ហាញលើកាតព័ត៌មាន និងផ្នែកខាងលើនៃអត្ថបទ។"
                    : "This image appears on the news card and at the top of the article."}
                </p>
              </div>

              {featuredPreview ? (
                <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <img
                    src={featuredPreview}
                    alt="Featured image preview"
                    className="max-h-[420px] w-full object-contain"
                  />

                  <button
                    type="button"
                    onClick={removeFeaturedImage}
                    disabled={saving}
                    className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-red-600 shadow-md transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <X size={16} />
                    {isKhmer ? "ដករូបភាព" : "Remove"}
                  </button>

                  <div className="border-t border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                    {featuredImage?.name}
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="featured-image"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 px-5 py-12 text-center transition hover:border-blue-400 hover:bg-blue-50/40"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <ImagePlus size={25} />
                  </div>

                  <span className="text-sm font-semibold text-slate-800">
                    {isKhmer
                      ? "ចុចដើម្បីជ្រើសរើសរូបភាព"
                      : "Select featured image"}
                  </span>

                  <span className="mt-2 text-xs text-slate-500">
                    PNG, JPG, WEBP · Maximum 5MB
                  </span>

                  <input
                    id="featured-image"
                    type="file"
                    accept="image/*"
                    onChange={handleFeaturedImageChange}
                    disabled={saving}
                    className="sr-only"
                  />
                </label>
              )}

              {featuredPreview && (
                <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  <ImagePlus size={17} />
                  {isKhmer ? "ផ្លាស់ប្តូររូបភាព" : "Change image"}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFeaturedImageChange}
                    disabled={saving}
                    className="sr-only"
                  />
                </label>
              )}
            </section>

            {/* Article content - English and Khmer */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-5">
                <h2 className="text-base font-bold text-slate-900">
                  {isKhmer ? "ខ្លឹមសារព័ត៌មាន" : "Article Content"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Write and format your article in both languages.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                {/* English editor */}
                <div className="min-w-0">
                  <h3 className="mb-3 text-sm font-semibold text-slate-700">
                    English Content
                  </h3>

                  <div className="[&_.tiptap]:min-h-[600px] [&_.ProseMirror]:min-h-[600px]">
                    <RichTextEditor
                      value={form.contentEn}
                      onChange={(value) =>
                        updateField("contentEn", value)
                      }
                      placeholder="Start writing your English news article..."
                      language="en"
                      disabled={saving}
                    />
                  </div>
                </div>

                {/* Khmer editor */}
                <div className="min-w-0">
                  <h3 className="mb-3 text-sm font-semibold text-slate-700">
                    ខ្លឹមសារជាភាសាខ្មែរ
                  </h3>

                  <div className="[&_.tiptap]:min-h-[600px] [&_.ProseMirror]:min-h-[600px]">
                    <RichTextEditor
                      value={form.contentkh}
                      onChange={(value) =>
                        updateField("contentkh", value)
                      }
                      placeholder="សរសេរខ្លឹមសារព័ត៌មានជាភាសាខ្មែរ..."
                      language="km"
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Additional images */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-5">
                <h2 className="text-base font-bold text-slate-900">
                  {isKhmer
                    ? "រូបភាពបន្ថែមក្នុងអត្ថបទ"
                    : "Additional Article Images"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {isKhmer
                    ? "បន្ថែមរូបភាពជាច្រើនសម្រាប់បង្ហាញជាមួយអត្ថបទព័ត៌មាន។ រូបភាពនីមួយៗមិនអាចលើសពី 5MB បានទេ។"
                    : "Upload multiple images to display with your news article. Each image must be 5MB or smaller."}
                </p>
              </div>

              <label
                htmlFor="additional-images"
                className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 px-5 py-8 text-center transition ${
                  saving
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:border-blue-400 hover:bg-blue-50/40"
                }`}
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <ImagePlus size={25} />
                </div>

                <span className="text-sm font-semibold text-slate-800">
                  {isKhmer
                    ? "ចុចដើម្បីបន្ថែមរូបភាព"
                    : "Click to add images"}
                </span>

                <span className="mt-2 text-xs text-slate-500">
                  PNG, JPG, WEBP · Maximum 5MB per image
                </span>

                <input
                  id="additional-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAdditionalImagesChange}
                  disabled={saving}
                  className="sr-only"
                />
              </label>

              {additionalImages.length > 0 && (
                <div className="mt-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-800">
                      {isKhmer
                        ? "រូបភាពដែលបានជ្រើសរើស"
                        : "Selected Images"}
                    </h3>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {additionalImages.length}{" "}
                      {isKhmer ? "រូបភាព" : "images"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {additionalPreviews.map((preview, index) => (
                      <div
                        key={`${additionalImages[index]?.name}-${index}`}
                        className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                      >
                        <img
                          src={preview}
                          alt={
                            additionalImages[index]?.name ??
                            "Article image"
                          }
                          className="h-36 w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => removeAdditionalImage(index)}
                          disabled={saving}
                          aria-label={`Remove image ${index + 1}`}
                          className="absolute right-2 top-2 rounded-lg bg-white/95 p-2 text-red-600 shadow transition hover:bg-red-50 disabled:opacity-50"
                        >
                          <X size={16} />
                        </button>

                        <div className="px-3 py-2">
                          <p className="truncate text-xs font-medium text-slate-700">
                            {additionalImages[index]?.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {(
                              (additionalImages[index]?.size ?? 0) /
                              (1024 * 1024)
                            ).toFixed(2)}{" "}
                            MB
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={removeAllAdditionalImages}
                    disabled={saving}
                    className="mt-4 text-sm font-medium text-red-600 transition hover:text-red-700 disabled:opacity-50"
                  >
                    {isKhmer
                      ? "លុបរូបភាពទាំងអស់"
                      : "Remove all images"}
                  </button>
                </div>
              )}
            </section>

            {/* Mobile publishing buttons */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
              <button
                type="button"
                onClick={() => void handleSave("draft")}
                disabled={saving || loadingCategories}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
              >
                {saving && status === "draft" ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Save size={17} />
                )}
                {isKhmer ? "រក្សាទុកសេចក្តីព្រាង" : "Save Draft"}
              </button>

              <button
                type="submit"
                disabled={saving || loadingCategories}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving && status === "published" ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Send size={17} />
                )}
                {isKhmer ? "ផ្សព្វផ្សាយ" : "Publish Article"}
              </button>
            </div>
          </div>

          {/* Right sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-[90px]">
            {/* Publish panel */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <h2 className="font-bold text-slate-900">
                  {isKhmer ? "ការផ្សព្វផ្សាយ" : "Publish"}
                </h2>

                <Eye size={18} className="text-slate-400" />
              </div>

              <div className="space-y-5 p-5">
                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    {isKhmer ? "ប្រភេទព័ត៌មាន" : "Category"}
                  </label>

                  <select
                    id="category"
                    value={form.category}
                    onChange={(event) =>
                      updateField("category", event.target.value)
                    }
                    disabled={loadingCategories || saving}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  >
                    <option value="">
                      {loadingCategories
                        ? "Loading categories..."
                        : "Select category"}
                    </option>

                    {categories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {isKhmer ? category.name_kh : category.name_en}
                      </option>
                    ))}
                  </select>

                  {!loadingCategories && categories.length === 0 && (
                    <p className="mt-2 text-xs text-amber-700">
                      No categories found. Create a category before publishing.
                    </p>
                  )}
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        status === "published"
                          ? "bg-green-500"
                          : "bg-amber-500"
                      }`}
                    />

                    <span className="text-sm font-semibold text-slate-800">
                      {status === "published" ? "Published" : "Draft"}
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {status === "published"
                      ? "The article will be available on your public website."
                      : "The article is saved as a draft until you publish it."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void handleSave("draft")}
                  disabled={saving || loadingCategories}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  {saving && status === "draft" ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <Save size={17} />
                  )}
                  Save as Draft
                </button>

                <button
                  type="submit"
                  disabled={saving || loadingCategories}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving && status === "published" ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <Send size={17} />
                  )}
                  Publish Article
                </button>
              </div>
            </section>

            {/* Article outline */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
                <FileText size={17} className="text-slate-500" />

                <h2 className="font-bold text-slate-900">
                  Article Outline
                </h2>
              </div>

              <div className="space-y-3 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  English
                </p>

                {form.contentEn.replace(/<[^>]*>/g, " ").trim() ? (
                  <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                    {form.contentEn
                      .replace(/<[^>]*>/g, " ")
                      .replace(/\s+/g, " ")
                      .trim()}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400">
                    Your article outline will appear here.
                  </p>
                )}

                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    ខ្មែរ
                  </p>

                  {form.contentkh.replace(/<[^>]*>/g, " ").trim() ? (
                    <p className="mt-2 line-clamp-3 text-sm leading-7 text-slate-600">
                      {form.contentkh
                        .replace(/<[^>]*>/g, " ")
                        .replace(/\s+/g, " ")
                        .trim()}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-slate-400">
                      មាតិកាអត្ថបទនឹងបង្ហាញនៅទីនេះ។
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Article information */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <CalendarDays size={17} className="text-slate-500" />

                <h2 className="font-bold text-slate-900">
                  Article Information
                </h2>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Featured image</span>

                  <span className="font-medium text-slate-800">
                    {featuredImage ? "Selected" : "Not selected"}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Additional images</span>

                  <span className="font-medium text-slate-800">
                    {additionalImages.length}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">English title</span>

                  <span className="font-medium text-slate-800">
                    {form.titleEn.trim() ? "Added" : "Empty"}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Khmer title</span>

                  <span className="font-medium text-slate-800">
                    {form.titlekh.trim() ? "Added" : "Empty"}
                  </span>
                </div>
              </div>
            </section>
          </aside>
        </form>
      </main>
    </div>
  );
}