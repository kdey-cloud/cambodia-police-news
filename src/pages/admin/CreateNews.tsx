import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";
import {
  ArrowLeft,
  ImagePlus,
  LoaderCircle,
  Save,
  Send,
  X,
} from "lucide-react";

type Category = {
  id: string;
  name_en: string;
  name_km: string;
  slug: string;
};

type ArticleForm = {
  titleKm: string;
  summaryKm: string;
  contentKm: string;
  titleEn: string;
  summaryEn: string;
  contentEn: string;
  category: string;
};

type SelectedImage = {
  file: File;
  preview: string;
};

const MAX_IMAGES = 20;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const initialForm: ArticleForm = {
  titleKm: "",
  summaryKm: "",
  contentKm: "",
  titleEn: "",
  summaryEn: "",
  contentEn: "",
  category: "",
};

export default function CreateNews() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const isKhmer = i18n.language.startsWith("km");

  const [form, setForm] = useState<ArticleForm>(initialForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchCategories() {
      setLoadingCategories(true);

      const { data, error } = await supabase
        .from("categories")
        .select("id, name_en, name_km, slug")
        .order("name_en", { ascending: true });

      if (!active) return;

      if (error) {
        setError(error.message);
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

  useEffect(() => {
    return () => {
      images.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, [images]);

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

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);

    // Reset the input so the same file can be selected again.
    event.target.value = "";

    if (selectedFiles.length === 0) return;

    setError("");
    setSuccess("");

    const remainingSlots = MAX_IMAGES - images.length;

    if (remainingSlots <= 0) {
      showError(
        isKhmer
          ? `អាចបញ្ចូលរូបភាពបានត្រឹមតែ ${MAX_IMAGES} រូបប៉ុណ្ណោះ។`
          : `You can upload a maximum of ${MAX_IMAGES} images.`,
      );
      return;
    }

    const acceptedFiles: File[] = [];

    for (const file of selectedFiles) {
      if (!file.type.startsWith("image/")) {
        showError(
          isKhmer
            ? "សូមជ្រើសរើសឯកសាររូបភាពប៉ុណ្ណោះ។"
            : "Please select image files only.",
        );
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        showError(
          isKhmer
            ? `${file.name} មានទំហំលើសពី 5MB។`
            : `${file.name} exceeds the 5MB size limit.`,
        );
        continue;
      }

      acceptedFiles.push(file);
    }

    const availableFiles = acceptedFiles.slice(0, remainingSlots);

    if (acceptedFiles.length > remainingSlots) {
      showError(
        isKhmer
          ? `អាចបន្ថែមរូបភាពបានត្រឹមតែ ${remainingSlots} រូបទៀត។`
          : `You can add only ${remainingSlots} more images.`,
      );
    }

    if (availableFiles.length > 0) {
      const newImages = availableFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      setImages((previous) => [...previous, ...newImages]);
    }
  }

  function removeImage(indexToRemove: number) {
    setImages((previous) => {
      const imageToRemove = previous[indexToRemove];

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      return previous.filter((_, index) => index !== indexToRemove);
    });
  }

  async function handleSave(nextStatus: "draft" | "published") {
    setError("");
    setSuccess("");

    // Require a title in at least one language.
    if (!form.titleKm.trim() && !form.titleEn.trim()) {
      showError(
        isKhmer
          ? "សូមបញ្ចូលចំណងជើងជាភាសាខ្មែរ ឬភាសាអង់គ្លេស។"
          : "Please enter a title in Khmer or English.",
      );
      return;
    }

    // Require a category.
    if (!form.category) {
      showError(
        isKhmer
          ? "សូមជ្រើសរើសប្រភេទព័ត៌មាន។"
          : "Please select a news category.",
      );
      return;
    }

    if (categories.length === 0) {
      showError(
        isKhmer
          ? "មិនមានប្រភេទព័ត៌មានទេ។ សូមបង្កើតប្រភេទព័ត៌មានជាមុន។"
          : "No categories are available. Please create a category first.",
      );
      return;
    }

    // Article content is optional.
    // Do not require contentKm or contentEn to publish.

    setSaving(true);
    setStatus(nextStatus);

    const uploadedPaths: string[] = [];
    let createdNewsId: string | null = null;

    try {
      // Upload images first.
      const imageUrls: string[] = [];

      for (let index = 0; index < images.length; index++) {
        const file = images[index].file;
        const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";

        const safeExtension = /^[a-z0-9]+$/.test(extension)
          ? extension
          : "jpg";

        const filePath = `news/${crypto.randomUUID()}-${index}.${safeExtension}`;

        const { error: uploadError } = await supabase.storage
          .from("news-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

        if (uploadError) {
          throw new Error(
            isKhmer
              ? `មិនអាចបញ្ចូលរូបភាព ${file.name} បានទេ៖ ${uploadError.message}`
              : `Failed to upload ${file.name}: ${uploadError.message}`,
          );
        }

        uploadedPaths.push(filePath);

        const { data: publicUrlData } = supabase.storage
          .from("news-images")
          .getPublicUrl(filePath);

        imageUrls.push(publicUrlData.publicUrl);
      }

      // Insert the news article.
      const { data: newsData, error: newsError } = await supabase
        .from("news")
        .insert({
          title_km: form.titleKm.trim() || null,
          summary_km: form.summaryKm.trim() || null,

          // Empty article content is saved as null.
          content_km: form.contentKm.trim() || null,

          title_en: form.titleEn.trim() || null,
          summary_en: form.summaryEn.trim() || null,

          // Empty article content is saved as null.
          content_en: form.contentEn.trim() || null,

          category: form.category,
          image_url: imageUrls[0] || null,
          status: nextStatus,
          published_at:
            nextStatus === "published" ? new Date().toISOString() : null,
        })
        .select("id")
        .single();

      if (newsError) {
        throw new Error(newsError.message);
      }

      if (!newsData) {
        throw new Error(
          isKhmer
            ? "មិនអាចបង្កើតព័ត៌មានបានទេ។"
            : "Could not create the news article.",
        );
      }

      createdNewsId = newsData.id;

      // Save additional images to news_images.
      // The first image is stored in news.image_url.
      // Additional images begin at display_order 2.
      if (imageUrls.length > 1) {
        const additionalImages = imageUrls.slice(1).map((imageUrl, index) => ({
          news_id: newsData.id,
          image_url: imageUrl,
          alt_text: null,
          display_order: index + 2,
        }));

        const { error: galleryError } = await supabase
          .from("news_images")
          .insert(additionalImages);

        if (galleryError) {
          throw new Error(galleryError.message);
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

      setTimeout(() => {
        navigate("/admin/news");
      }, 1200);
    } catch (err) {
      // Attempt to clean up uploaded files if saving fails.
      if (uploadedPaths.length > 0) {
        await supabase.storage.from("news-images").remove(uploadedPaths);
      }

      // If the article was created but saving the gallery failed,
      // attempt to remove the incomplete article.
      if (createdNewsId) {
        await supabase.from("news").delete().eq("id", createdNewsId);
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
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => navigate("/admin/news")}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft size={18} />
              {isKhmer ? "ត្រឡប់ទៅព័ត៌មាន" : "Back to News"}
            </button>

            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {isKhmer ? "បង្កើតព័ត៌មានថ្មី" : "Create News"}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {isKhmer
                ? "បញ្ចូលព័ត៌មានខាងក្រោមដើម្បីបង្កើតអត្ថបទថ្មី។"
                : "Fill in the information below to create a news article."}
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Khmer */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">
                ព័ត៌មានជាភាសាខ្មែរ
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {isKhmer
                  ? "វាលដែលមានសញ្ញា * គឺត្រូវបំពេញ។"
                  : "The title is required in at least one language."}
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="title-km"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  ចំណងជើង
                </label>

                <input
                  id="title-km"
                  type="text"
                  value={form.titleKm}
                  onChange={(event) =>
                    updateField("titleKm", event.target.value)
                  }
                  placeholder="បញ្ចូលចំណងជើងជាភាសាខ្មែរ..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="summary-km"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  សេចក្តីសង្ខេប
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    (មិនចាំបាច់បំពេញ)
                  </span>
                </label>

                <textarea
                  id="summary-km"
                  rows={3}
                  value={form.summaryKm}
                  onChange={(event) =>
                    updateField("summaryKm", event.target.value)
                  }
                  placeholder="បញ្ចូលសេចក្តីសង្ខេប..."
                  className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="content-km"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  ខ្លឹមសារព័ត៌មាន
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    (មិនចាំបាច់បំពេញ)
                  </span>
                </label>

                <textarea
                  id="content-km"
                  rows={8}
                  value={form.contentKm}
                  onChange={(event) =>
                    updateField("contentKm", event.target.value)
                  }
                  placeholder="សរសេរខ្លឹមសារព័ត៌មាន ប្រសិនបើមាន..."
                  className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-7 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </section>

          {/* English */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">
                English Content
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter an English title if you want to publish the English
                version.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="title-en"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Title
                </label>

                <input
                  id="title-en"
                  type="text"
                  value={form.titleEn}
                  onChange={(event) =>
                    updateField("titleEn", event.target.value)
                  }
                  placeholder="Enter the English title..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="summary-en"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Summary
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    (Optional)
                  </span>
                </label>

                <textarea
                  id="summary-en"
                  rows={3}
                  value={form.summaryEn}
                  onChange={(event) =>
                    updateField("summaryEn", event.target.value)
                  }
                  placeholder="Enter a short summary..."
                  className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="content-en"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Article Content
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    (Optional)
                  </span>
                </label>

                <textarea
                  id="content-en"
                  rows={8}
                  value={form.contentEn}
                  onChange={(event) =>
                    updateField("contentEn", event.target.value)
                  }
                  placeholder="Write the article content here (optional)..."
                  className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-7 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </section>

          {/* Category */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="mb-5 text-lg font-bold text-slate-900">
              {isKhmer ? "ប្រភេទព័ត៌មាន" : "News Category"}
            </h2>

            <label
              htmlFor="category"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              {isKhmer ? "ជ្រើសរើសប្រភេទ" : "Select Category"}
              <span className="ml-1 text-red-500">*</span>
            </label>

            <select
              id="category"
              value={form.category}
              onChange={(event) =>
                updateField("category", event.target.value)
              }
              disabled={loadingCategories}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="">
                {loadingCategories
                  ? isKhmer
                    ? "កំពុងផ្ទុកប្រភេទ..."
                    : "Loading categories..."
                  : isKhmer
                    ? "ជ្រើសរើសប្រភេទព័ត៌មាន"
                    : "Choose a category"}
              </option>

              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {isKhmer ? category.name_km : category.name_en}
                </option>
              ))}
            </select>
          </section>

          {/* Images */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {isKhmer ? "រូបភាពព័ត៌មាន" : "News Images"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {isKhmer
                    ? "អាចបញ្ចូលរូបភាពបានរហូតដល់ 20 រូប។ មួយរូបមិនលើសពី 5MB។"
                    : "Upload up to 20 images. Each image must be 5MB or smaller."}
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                {images.length}/{MAX_IMAGES}
              </span>
            </div>

            <label
              htmlFor="news-images"
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 px-5 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50/50"
            >
              <ImagePlus size={32} className="mb-3 text-blue-600" />

              <span className="text-sm font-semibold text-slate-800">
                {isKhmer ? "ចុចដើម្បីជ្រើសរើសរូបភាព" : "Click to select images"}
              </span>

              <span className="mt-1 text-xs text-slate-500">
                PNG, JPG, JPEG, WEBP
              </span>

              <input
                id="news-images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                disabled={images.length >= MAX_IMAGES}
                className="sr-only"
              />
            </label>

            {images.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {images.map((image, index) => (
                  <div
                    key={image.preview}
                    className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <img
                      src={image.preview}
                      alt={image.file.name}
                      className="h-36 w-full object-contain"
                    />

                    <div className="px-2 py-2">
                      <p className="truncate text-xs text-slate-600">
                        {image.file.name}
                      </p>

                      {index === 0 && (
                        <span className="mt-1 inline-block text-xs font-medium text-blue-600">
                          {isKhmer ? "រូបភាពដំបូង" : "First image"}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      aria-label={`Remove ${image.file.name}`}
                      className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-slate-700 shadow transition hover:bg-red-50 hover:text-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => void handleSave("draft")}
              disabled={saving || loadingCategories}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && status === "draft" ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}

              {isKhmer ? "រក្សាទុកជាសេចក្តីព្រាង" : "Save as Draft"}
            </button>

            <button
              type="submit"
              disabled={saving || loadingCategories}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && status === "published" ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}

              {isKhmer ? "ផ្សព្វផ្សាយព័ត៌មាន" : "Publish News"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}