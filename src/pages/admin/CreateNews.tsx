import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";
import RichTextEditor from "../../components/admin/RichTextEditor";

import {
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  Save,
  Send,
  Star,
  Trash2,
  X,
} from "lucide-react";

interface Category {
  id: string;
  name_en: string;
  name_kh: string;
  slug: string;
}

type DisplaySize = "large" | "medium" | "small";

type FeaturedImage = {
  id: string;
  file: File;
  preview: string;
  displaySize: DisplaySize;
};

type AdditionalImage = {
  id: string;
  file: File;
  preview: string;
  displaySize: DisplaySize;
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

const MAX_IMAGES = 20;
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

const DISPLAY_SIZE_OPTIONS: {
  value: DisplaySize;
  label: string;
}[] = [
  { value: "large", label: "Large" },
  { value: "medium", label: "Medium" },
  { value: "small", label: "Small" },
];

function getSafeExtension(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase() || "jpg";

  return /^[a-z0-9]+$/.test(extension) ? extension : "jpg";
}

export default function CreateNews() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const isKhmer = i18n.language.startsWith("kh");

  const featuredInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<Set<string>>(new Set());

  const [form, setForm] = useState<ArticleForm>(initialForm);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Featured Images
  const [featuredImages, setFeaturedImages] = useState<FeaturedImage[]>([]);
  const [primaryFeaturedImageId, setPrimaryFeaturedImageId] = useState("");

  // Separate Photo Gallery
  const [additionalImages, setAdditionalImages] = useState<AdditionalImage[]>(
    [],
  );

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"draft" | "published">("draft");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const primaryFeaturedImage =
    featuredImages.find((image) => image.id === primaryFeaturedImageId) ??
    featuredImages[0] ??
    null;

  // Create temporary image preview.
  function createPreview(file: File): string {
    const preview = URL.createObjectURL(file);
    objectUrlsRef.current.add(preview);

    return preview;
  }

  // Release temporary image preview.
  function revokePreview(preview: string) {
    URL.revokeObjectURL(preview);
    objectUrlsRef.current.delete(preview);
  }

  // Clean up previews when leaving this page.
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });

      objectUrlsRef.current.clear();
    };
  }, []);

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

  // Update form fields.
  function updateField(field: keyof ArticleForm, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  // Display error message.
  function showError(message: string) {
    setError(message);
    setSuccess("");
  }

  // Add multiple Featured Images.
  function handleFeaturedImageChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    event.target.value = "";

    if (files.length === 0) return;

    const availableSlots = MAX_IMAGES - featuredImages.length;

    if (availableSlots <= 0) {
      showError(
        isKhmer
          ? `អ្នកអាចបន្ថែមរូបភាពសំខាន់បានអតិបរមា ${MAX_IMAGES}។`
          : `You can upload a maximum of ${MAX_IMAGES} featured images.`,
      );
      return;
    }

    const validImages: FeaturedImage[] = [];
    const errors: string[] = [];

    for (const file of files.slice(0, availableSlots)) {
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name}: Not a valid image.`);
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        errors.push(`${file.name}: Image must be smaller than 5MB.`);
        continue;
      }

      validImages.push({
        id: crypto.randomUUID(),
        file,
        preview: createPreview(file),
        displaySize: "large",
      });
    }

    if (validImages.length > 0) {
      setFeaturedImages((previous) => {
        const updated = [...previous, ...validImages];

        if (previous.length === 0) {
          setPrimaryFeaturedImageId(validImages[0].id);
        }

        return updated;
      });
    }

    if (errors.length > 0) {
      showError(errors.join(" "));
    } else {
      setError("");
      setSuccess("");
    }
  }

  // Select primary Featured Image.
  function setPrimaryImage(id: string) {
    setPrimaryFeaturedImageId(id);
    setError("");
    setSuccess("");
  }

  // Update Featured Image display size.
  function updateFeaturedImageSize(id: string, displaySize: DisplaySize) {
    setFeaturedImages((previous) =>
      previous.map((image) =>
        image.id === id ? { ...image, displaySize } : image,
      ),
    );
  }

  // Remove one Featured Image.
  function removeFeaturedImage(id: string) {
    const image = featuredImages.find((item) => item.id === id);

    if (image) {
      revokePreview(image.preview);
    }

    const remainingImages = featuredImages.filter((item) => item.id !== id);

    setFeaturedImages(remainingImages);

    if (primaryFeaturedImageId === id) {
      setPrimaryFeaturedImageId(remainingImages[0]?.id ?? "");
    }

    setError("");
    setSuccess("");
  }

  // Remove all Featured Images.
  function removeAllFeaturedImages() {
    featuredImages.forEach((image) => {
      revokePreview(image.preview);
    });

    setFeaturedImages([]);
    setPrimaryFeaturedImageId("");

    setError("");
    setSuccess("");
  }

  // Add multiple Photo Gallery images.
  function handleAdditionalImagesChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    event.target.value = "";

    if (files.length === 0) return;

    const availableSlots = MAX_IMAGES - additionalImages.length;

    if (availableSlots <= 0) {
      showError(
        isKhmer
          ? `អ្នកអាចបន្ថែមរូបភាពបានអតិបរមា ${MAX_IMAGES}។`
          : `You can upload a maximum of ${MAX_IMAGES} gallery images.`,
      );
      return;
    }

    const validImages: AdditionalImage[] = [];
    const errors: string[] = [];

    for (const file of files.slice(0, availableSlots)) {
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name}: Not a valid image.`);
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        errors.push(`${file.name}: Image must be smaller than 5MB.`);
        continue;
      }

      validImages.push({
        id: crypto.randomUUID(),
        file,
        preview: createPreview(file),
        displaySize: "large",
      });
    }

    if (validImages.length > 0) {
      setAdditionalImages((previous) => [...previous, ...validImages]);
    }

    if (errors.length > 0) {
      showError(errors.join(" "));
    } else {
      setError("");
      setSuccess("");
    }
  }

  // Update Photo Gallery image settings.
  function updateAdditionalImage(
    id: string,
    updates: Partial<Pick<AdditionalImage, "displaySize">>,
  ) {
    setAdditionalImages((previous) =>
      previous.map((image) =>
        image.id === id ? { ...image, ...updates } : image,
      ),
    );
  }

  // Remove one Photo Gallery image.
  function removeAdditionalImage(id: string) {
    const image = additionalImages.find((item) => item.id === id);

    if (image) {
      revokePreview(image.preview);
    }

    setAdditionalImages((previous) =>
      previous.filter((item) => item.id !== id),
    );
  }

  // Remove all Photo Gallery images.
  function removeAllAdditionalImages() {
    additionalImages.forEach((image) => {
      revokePreview(image.preview);
    });

    setAdditionalImages([]);
  }

  // Upload image to Supabase Storage.
  async function uploadImage(file: File, path: string): Promise<string> {
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

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

    return data.publicUrl;
  }

  // Save as draft or publish.
  async function handleSave(nextStatus: "draft" | "published") {
    if (saving || loadingCategories) return;

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

    let createdNewsId: string | null = null;

    const uploadedPaths: string[] = [];

    try {
      // 1. Upload the selected primary Featured Image.
      let imageUrl: string | null = null;

      if (primaryFeaturedImage) {
        const extension = getSafeExtension(primaryFeaturedImage.file.name);

        const imagePath = `news/${crypto.randomUUID()}.${extension}`;

        imageUrl = await uploadImage(primaryFeaturedImage.file, imagePath);

        uploadedPaths.push(imagePath);
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
          image_display_size: primaryFeaturedImage?.displaySize ?? null,

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
        throw new Error("The news article could not be created.");
      }

      createdNewsId = newsData.id;

      // 3. Prepare additional image records.
      const imageRecords: {
        news_id: string;
        image_url: string;
        alt_text: string | null;
        display_order: number;
        display_size: DisplaySize;
        is_featured: boolean;
      }[] = [];

      // 4. Upload the other Featured Images.
      const otherFeaturedImages = featuredImages.filter(
        (image) => image.id !== primaryFeaturedImage?.id,
      );

      for (const [index, image] of otherFeaturedImages.entries()) {
        const extension = getSafeExtension(image.file.name);

        const imagePath = `news/${newsData.id}/${crypto.randomUUID()}.${extension}`;

        const publicUrl = await uploadImage(image.file, imagePath);

        uploadedPaths.push(imagePath);

        imageRecords.push({
          news_id: newsData.id,
          image_url: publicUrl,
          alt_text: image.file.name,
          display_order: index + 1,
          display_size: image.displaySize,
          is_featured: true,
        });
      }

      // 5. Upload separate Photo Gallery images.
      for (const [index, image] of additionalImages.entries()) {
        const extension = getSafeExtension(image.file.name);

        const imagePath = `news/${newsData.id}/${crypto.randomUUID()}.${extension}`;

        const publicUrl = await uploadImage(image.file, imagePath);

        uploadedPaths.push(imagePath);

        imageRecords.push({
          news_id: newsData.id,
          image_url: publicUrl,
          alt_text: image.file.name,
          display_order: otherFeaturedImages.length + index + 1,
          display_size: image.displaySize,
          is_featured: false,
        });
      }

      // 6. Save all additional image records.
      if (imageRecords.length > 0) {
        const { error: imagesInsertError } = await supabase
          .from("news_images")
          .insert(imageRecords);

        if (imagesInsertError) {
          throw new Error(
            `Could not save image records: ${imagesInsertError.message}`,
          );
        }
      }

      // 7. Success message.
      setSuccess(
        nextStatus === "published"
          ? isKhmer
            ? "បានផ្សព្វផ្សាយព័ត៌មានដោយជោគជ័យ!"
            : "News published successfully!"
          : isKhmer
            ? "បានរក្សាទុកសេចក្តីព្រាងដោយជោគជ័យ!"
            : "Draft saved successfully!",
      );

      // 8. Navigate back to news list.
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

      // Remove uploaded images.
      if (uploadedPaths.length > 0) {
        const { error: cleanupError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove(uploadedPaths);

        if (cleanupError) {
          console.error("[CreateNews] Image cleanup failed:", cleanupError);
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

  // Publish form.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handleSave("published");
  }

  // Display size label.
  function getDisplaySizeLabel(size: DisplaySize) {
    if (isKhmer) {
      switch (size) {
        case "large":
          return "ធំ";
        case "medium":
          return "មធ្យម";
        case "small":
          return "តូច";
      }
    }

    return size.charAt(0).toUpperCase() + size.slice(1);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate("/admin/news")}
            className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={16} />
            {isKhmer ? "ត្រឡប់ទៅព័ត៌មាន" : "Back to News"}
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            {isKhmer ? "បង្កើតព័ត៌មានថ្មី" : "Create News"}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {isKhmer
              ? "បង្កើត និងផ្សព្វផ្សាយអត្ថបទព័ត៌មានថ្មី។"
              : "Create a new news article and manage its images."}
          </p>
        </div>

        <span
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            status === "published"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {status === "published"
            ? isKhmer
              ? "បានផ្សព្វផ្សាយ"
              : "Published"
            : isKhmer
              ? "សេចក្តីព្រាង"
              : "Draft"}
        </span>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <X size={18} className="mt-0.5 shrink-0" />
          <p className="break-words">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      <form id="create-news-form" onSubmit={handleSubmit} className="space-y-6">
        {/* 1. News Title */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            {isKhmer ? "ចំណងជើងព័ត៌មាន" : "News Title"}
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="title_kh"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Khmer Title
              </label>

              <input
                id="title_kh"
                type="text"
                value={form.titlekh}
                onChange={(event) => updateField("titlekh", event.target.value)}
                placeholder="បញ្ចូលចំណងជើងព័ត៌មាន..."
                disabled={saving}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="title_en"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                English Title
              </label>

              <input
                id="title_en"
                type="text"
                value={form.titleEn}
                onChange={(event) => updateField("titleEn", event.target.value)}
                placeholder="Enter news title..."
                disabled={saving}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
              />
            </div>
          </div>
        </section>

        {/* 2. Summary */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            {isKhmer ? "សេចក្តីសង្ខេប" : "Short Summary"}
          </h2>

          <p className="mb-5 text-sm text-gray-500">
            {isKhmer
              ? "សរសេរសេចក្តីសង្ខេបជាភាសាខ្មែរ និងភាសាអង់គ្លេស។"
              : "Write a short summary in both Khmer and English."}
          </p>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="summary_kh"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Khmer Summary
              </label>

              <textarea
                id="summary_kh"
                rows={4}
                value={form.summarykh}
                onChange={(event) =>
                  updateField("summarykh", event.target.value)
                }
                placeholder="សរសេរសេចក្ដីសង្ខេបព័ត៌មាន..."
                disabled={saving}
                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm leading-7 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="summary_en"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                English Summary
              </label>

              <textarea
                id="summary_en"
                rows={4}
                value={form.summaryEn}
                onChange={(event) =>
                  updateField("summaryEn", event.target.value)
                }
                placeholder="Write a short summary..."
                disabled={saving}
                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm leading-7 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
              />
            </div>
          </div>
        </section>

        {/* 3. Featured Images */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isKhmer ? "រូបភាពសំខាន់" : "Featured Images"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {isKhmer
                  ? "បន្ថែមរូបភាពច្រើន និងជ្រើសរើសរូបភាពមួយជារូបភាពចម្បង។"
                  : "Upload multiple images and select one as the primary image."}
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {featuredImages.length}/{MAX_IMAGES} images
            </span>
          </div>

          <input
            ref={featuredInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFeaturedImageChange}
            className="hidden"
          />

          {featuredImages.length > 0 ? (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  {isKhmer ? "រូបភាពដែលបានបន្ថែម" : "Selected Images"}
                </h3>

                <button
                  type="button"
                  onClick={removeAllFeaturedImages}
                  disabled={saving}
                  className="text-xs font-medium text-red-600 transition hover:text-red-700 disabled:opacity-50"
                >
                  {isKhmer ? "លុបរូបភាពទាំងអស់" : "Remove All"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {featuredImages.map((image, index) => {
                  const isPrimary = image.id === primaryFeaturedImageId;

                  return (
                    <div
                      key={image.id}
                      className={`group overflow-hidden rounded-xl border ${
                        isPrimary
                          ? "border-blue-500 ring-2 ring-blue-100"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="relative aspect-square bg-gray-100">
                        <img
                          src={image.preview}
                          alt={image.file.name}
                          className="h-full w-full object-cover"
                        />

                        {isPrimary && (
                          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
                            <Star size={11} fill="currentColor" />
                            Primary
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => removeFeaturedImage(image.id)}
                          disabled={saving}
                          className="absolute right-2 top-2 rounded-lg bg-red-600 p-2 text-white opacity-100 transition hover:bg-red-700 disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100"
                          aria-label={`Remove featured image ${index + 1}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="space-y-3 p-3">
                        <p className="truncate text-xs font-medium text-gray-700">
                          {image.file.name}
                        </p>

                        <p className="text-xs text-gray-400">
                          {(image.file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>

                        <label className="block text-xs font-medium text-gray-600">
                          {isKhmer ? "ទំហំរូបភាព" : "Display Size"}

                          <select
                            value={image.displaySize}
                            onChange={(event) =>
                              updateFeaturedImageSize(
                                image.id,
                                event.target.value as DisplaySize,
                              )
                            }
                            disabled={saving}
                            className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs outline-none focus:border-blue-500 disabled:opacity-50"
                          >
                            {DISPLAY_SIZE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {getDisplaySizeLabel(option.value)}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-2 text-xs font-medium transition ${
                            isPrimary
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="primaryFeaturedImage"
                            checked={isPrimary}
                            onChange={() => setPrimaryImage(image.id)}
                            disabled={saving}
                            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                          />

                          {isKhmer ? "ជ្រើសរើសជារូបភាពចម្បង" : "Set as Primary"}
                        </label>
                      </div>
                    </div>
                  );
                })}

                {featuredImages.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => featuredInputRef.current?.click()}
                    disabled={saving}
                    className="flex aspect-square flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
                  >
                    <div className="rounded-full bg-gray-100 p-3">
                      <ImagePlus size={22} />
                    </div>

                    <span className="text-sm font-medium">
                      {isKhmer ? "បន្ថែមរូបភាព" : "Add Images"}
                    </span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => featuredInputRef.current?.click()}
              disabled={saving}
              className="flex min-h-48 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
            >
              <div className="rounded-full bg-white p-4 shadow-sm">
                <ImagePlus size={28} />
              </div>

              <span className="text-sm font-medium">
                {isKhmer ? "បន្ថែមរូបភាពសំខាន់" : "Add Featured Images"}
              </span>

              <span className="text-xs text-gray-400">
                {isKhmer ? "អាចជ្រើសរើសរូបភាពច្រើន" : "Select multiple images"}
              </span>
            </button>
          )}

          <p className="mt-5 text-xs text-gray-500">
            {isKhmer
              ? `អាចបន្ថែមរូបភាពបានអតិបរមា ${MAX_IMAGES}។ រូបភាពនីមួយៗមិនអាចលើសពី 5MB។`
              : `Maximum ${MAX_IMAGES} featured images. Each image must be smaller than 5MB.`}
          </p>
        </section>

        {/* 4. Article Content */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            {isKhmer ? "ខ្លឹមសារព័ត៌មាន" : "Article Content"}
          </h2>

          <p className="mb-5 text-sm text-gray-500">
            {isKhmer
              ? "សរសេរខ្លឹមសារព័ត៌មានជាភាសាខ្មែរ និងភាសាអង់គ្លេស។"
              : "Write and format your article in both languages."}
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Khmer Content - LEFT */}
            <div className="min-w-0">
              <label className="mb-3 block text-sm font-medium text-gray-700">
                Khmer Content
              </label>

              <div className="[&_.tiptap]:min-h-[500px] [&_.ProseMirror]:min-h-[500px]">
                <RichTextEditor
                  value={form.contentkh}
                  onChange={(value) => updateField("contentkh", value)}
                  placeholder="សរសេរខ្លឹមសារព័ត៌មាន..."
                  language="km"
                  disabled={saving}
                />
              </div>
            </div>

            {/* English Content - RIGHT */}
            <div className="min-w-0">
              <label className="mb-3 block text-sm font-medium text-gray-700">
                English Content
              </label>

              <div className="[&_.tiptap]:min-h-[500px] [&_.ProseMirror]:min-h-[500px]">
                <RichTextEditor
                  value={form.contentEn}
                  onChange={(value) => updateField("contentEn", value)}
                  placeholder="Write news content..."
                  language="en"
                  disabled={saving}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 5. Photo Gallery */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Photo Gallery
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {isKhmer
                  ? "គ្រប់គ្រងរូបភាពបន្ថែមដែលបង្ហាញនៅខាងក្រោមខ្លឹមសារព័ត៌មាន។"
                  : "Manage additional photos displayed below the article content."}
              </p>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              {additionalImages.length}/{MAX_IMAGES} images
            </span>
          </div>

          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleAdditionalImagesChange}
            className="hidden"
          />

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {additionalImages.map((image, index) => (
              <div
                key={image.id}
                className="group overflow-hidden rounded-xl border border-gray-200"
              >
                <div className="relative aspect-square bg-gray-100">
                  <img
                    src={image.preview}
                    alt={image.file.name}
                    className="h-full w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => removeAdditionalImage(image.id)}
                    disabled={saving}
                    className="absolute left-2 top-2 rounded-lg bg-red-600 p-2 text-white opacity-100 transition hover:bg-red-700 disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label={`Delete image ${index + 1}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-3 p-3">
                  <p className="truncate text-xs text-gray-500">
                    {image.file.name}
                  </p>

                  <p className="text-xs text-gray-400">
                    {(image.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>

                  <label className="block text-xs font-medium text-gray-600">
                    Display Size
                    <select
                      value={image.displaySize}
                      onChange={(event) =>
                        updateAdditionalImage(image.id, {
                          displaySize: event.target.value as DisplaySize,
                        })
                      }
                      disabled={saving}
                      className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs outline-none focus:border-blue-500 disabled:opacity-50"
                    >
                      {DISPLAY_SIZE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {getDisplaySizeLabel(option.value)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            ))}

            {additionalImages.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={saving}
                className="flex aspect-square flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
              >
                <div className="rounded-full bg-gray-100 p-3">
                  <ImagePlus size={22} />
                </div>

                <span className="text-sm font-medium">
                  {isKhmer ? "បន្ថែមរូបភាព" : "Add Images"}
                </span>
              </button>
            )}
          </div>

          {additionalImages.length > 0 && (
            <button
              type="button"
              onClick={removeAllAdditionalImages}
              disabled={saving}
              className="mt-4 text-sm font-medium text-red-600 transition hover:text-red-700 disabled:opacity-50"
            >
              {isKhmer ? "លុបរូបភាពទាំងអស់" : "Remove all images"}
            </button>
          )}

          <p className="mt-4 text-xs text-gray-500">
            Maximum {MAX_IMAGES} gallery images. Each image must be smaller than
            5MB.
          </p>
        </section>

        {/* 6. Category */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            {isKhmer ? "ប្រភេទព័ត៌មាន" : "Category"}
          </h2>

          <select
            value={form.category}
            onChange={(event) => updateField("category", event.target.value)}
            disabled={loadingCategories || saving}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
          >
            <option value="">
              {loadingCategories
                ? "Loading categories..."
                : isKhmer
                  ? "ជ្រើសរើសប្រភេទព័ត៌មាន"
                  : "Select a category"}
            </option>

            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name_en} / {category.name_kh}
              </option>
            ))}
          </select>

          {!loadingCategories && categories.length === 0 && (
            <p className="mt-2 text-xs text-amber-700">
              No categories found. Create a category before publishing.
            </p>
          )}
        </section>

        {/* 7. Publication Status */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            {isKhmer ? "ស្ថានភាពផ្សព្វផ្សាយ" : "Publication Status"}
          </h2>

          <div className="rounded-xl bg-gray-50 p-4">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  status === "published" ? "bg-green-500" : "bg-yellow-500"
                }`}
              />

              <span className="text-sm font-semibold text-gray-800">
                {status === "published" ? "Published" : "Draft"}
              </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-gray-500">
              {status === "published"
                ? "The article will be available on your public website."
                : "The article will be saved as a draft until you publish it."}
            </p>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/news")}
            disabled={saving}
            className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            {isKhmer ? "បោះបង់" : "Cancel"}
          </button>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleSave("draft")}
              disabled={saving || loadingCategories}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Send size={17} />
              )}

              {isKhmer ? "ផ្សព្វផ្សាយ" : "Publish"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
