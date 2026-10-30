import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Image as ImageIcon,
  LoaderCircle,
  Save,
  Send,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

interface Category {
  id: string;
  name_en: string;
  name_kh: string;
  slug: string;
}

interface NewsForm {
  title_kh: string;
  title_en: string;
  summary_kh: string;
  summary_en: string;
  content_kh: string;
  content_en: string;
  category: string;
  image_url: string | null;
  status: "draft" | "published";
  published_at: string | null;
}

interface NewsImage {
  id: string;
  news_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
}

interface NewImage {
  id: string;
  file: File;
  preview: string;
  alt_text: string;
}

type TextareaField =
  | "summary_kh"
  | "summary_en"
  | "content_kh"
  | "content_en";

const MAX_IMAGES = 20;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const STORAGE_BUCKET = "news-images";

const initialForm: NewsForm = {
  title_kh: "",
  title_en: "",
  summary_kh: "",
  summary_en: "",
  content_kh: "",
  content_en: "",
  category: "",
  image_url: null,
  status: "draft",
  published_at: null,
};

export default function EditNews() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const featuredInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Track temporary image previews
  const objectUrlsRef = useRef<Set<string>>(new Set());

  const [form, setForm] = useState<NewsForm>(initialForm);
  const [categories, setCategories] = useState<Category[]>([]);

  const [existingImages, setExistingImages] = useState<NewsImage[]>([]);
  const [newImages, setNewImages] = useState<NewImage[]>([]);

  const [featuredFile, setFeaturedFile] = useState<File | null>(null);
  const [featuredPreview, setFeaturedPreview] = useState<string | null>(null);

  // ID of a newly selected gallery image to use as the main image
  const [mainNewImageId, setMainNewImageId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create a temporary image preview
  const createPreview = (file: File) => {
    const preview = URL.createObjectURL(file);

    objectUrlsRef.current.add(preview);

    return preview;
  };

  // Remove a temporary image preview
  const revokePreview = (preview: string) => {
    URL.revokeObjectURL(preview);
    objectUrlsRef.current.delete(preview);
  };

  // Clean up previews when component unmounts
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });

      objectUrlsRef.current.clear();
    };
  }, []);

  // Get the newly selected main gallery image
  const selectedNewMainImage = newImages.find(
    (image) => image.id === mainNewImageId,
  );

  // Check whether current main image is an existing gallery image


  // Main image preview priority:
  // 1. Newly uploaded featured image
  // 2. Newly selected main gallery image
  // 3. Existing main image
  // 4. First existing additional image
  // 5. First newly selected additional image
  const featuredDisplayImage =
    featuredPreview ||
    selectedNewMainImage?.preview ||
    form.image_url ||
    existingImages[0]?.image_url ||
    newImages[0]?.preview ||
    null;

  const hasSelectedMainImage = Boolean(
    featuredPreview ||
      selectedNewMainImage ||
      form.image_url ||
      existingImages.length > 0 ||
      newImages.length > 0,
  );

  // Update form fields
  const updateField = <K extends keyof NewsForm>(
    field: K,
    value: NewsForm[K],
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // Tab inserts four spaces in textareas
  const handleTextareaTab = (
    event: KeyboardEvent<HTMLTextAreaElement>,
    field: TextareaField,
  ) => {
    if (event.key !== "Tab") return;

    event.preventDefault();

    const textarea = event.currentTarget;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const currentValue = form[field];
    const spaces = "    ";

    const newValue =
      currentValue.substring(0, start) +
      spaces +
      currentValue.substring(end);

    updateField(field, newValue);

    requestAnimationFrame(() => {
      textarea.focus();

      textarea.setSelectionRange(
        start + spaces.length,
        start + spaces.length,
      );
    });
  };

  // Load news and related data
  const loadNews = useCallback(async () => {
    if (!id) {
      setError("News ID was not found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [
        { data: newsData, error: newsError },
        { data: categoryData, error: categoryError },
        { data: imageData, error: imageError },
      ] = await Promise.all([
        supabase.from("news").select("*").eq("id", id).single(),

        supabase
          .from("categories")
          .select("id, name_en, name_kh, slug")
          .order("name_en"),

        supabase
          .from("news_images")
          .select("*")
          .eq("news_id", id)
          .order("display_order", { ascending: true }),
      ]);

      if (newsError) throw newsError;
      if (categoryError) throw categoryError;
      if (imageError) throw imageError;

      setForm({
        title_kh: newsData.title_kh ?? "",
        title_en: newsData.title_en ?? "",
        summary_kh: newsData.summary_kh ?? "",
        summary_en: newsData.summary_en ?? "",
        content_kh: newsData.content_kh ?? "",
        content_en: newsData.content_en ?? "",
        category: newsData.category ?? "",
        image_url: newsData.image_url ?? null,
        status: newsData.status === "published" ? "published" : "draft",
        published_at: newsData.published_at ?? null,
      });

      setCategories(categoryData ?? []);
      setExistingImages(imageData ?? []);
    } catch (err) {
      console.error("Error loading news:", err);

      setError(
        err instanceof Error ? err.message : "Failed to load news article.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadNews();
  }, [loadNews]);

  // Select a separate featured image
  const handleFeaturedImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Featured image must be smaller than 5MB.");
      event.target.value = "";
      return;
    }

    if (featuredPreview) {
      revokePreview(featuredPreview);
    }

    setFeaturedFile(file);
    setFeaturedPreview(createPreview(file));

    // A separately uploaded featured image takes priority
    setMainNewImageId(null);

    setError("");
    setSuccess("");

    event.target.value = "";
  };

  // Select additional gallery images
  const handleGalleryImages = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) return;

    const availableSlots =
      MAX_IMAGES - existingImages.length - newImages.length;

    if (availableSlots <= 0) {
      setError(`You can upload a maximum of ${MAX_IMAGES} gallery images.`);
      event.target.value = "";
      return;
    }

    const selectedFiles = files.slice(0, availableSlots);

    const validImages: NewImage[] = [];

    for (const file of selectedFiles) {
      if (!file.type.startsWith("image/")) {
        setError(`${file.name} is not a valid image.`);
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        setError(`${file.name} is larger than 5MB.`);
        continue;
      }

      validImages.push({
        id: crypto.randomUUID(),
        file,
        preview: createPreview(file),
        alt_text: "",
      });
    }

    setNewImages((previous) => [...previous, ...validImages]);

    setError("");
    event.target.value = "";
  };

  // Remove newly selected gallery image
  const removeNewImage = (imageId: string) => {
    const image = newImages.find((item) => item.id === imageId);

    if (!image) return;

    revokePreview(image.preview);

    setNewImages((previous) =>
      previous.filter((item) => item.id !== imageId),
    );

    // If selected main image is removed, clear its selection
    if (mainNewImageId === imageId) {
      setMainNewImageId(null);
    }
  };

  // Select an existing additional image as the main image
  const setAsMainImage = (image: NewsImage) => {
    // Clear a separately uploaded featured image
    if (featuredPreview) {
      revokePreview(featuredPreview);
    }

    setFeaturedFile(null);
    setFeaturedPreview(null);

    // Clear new gallery image selection
    setMainNewImageId(null);

    // Save selected existing image URL in form state
    updateField("image_url", image.image_url);

    if (featuredInputRef.current) {
      featuredInputRef.current.value = "";
    }

    setError("");
    setSuccess("Main image selected. Save changes to confirm.");
  };

  // Select a newly added gallery image as the main image
  const setNewImageAsMain = (image: NewImage) => {
    // Clear a separately uploaded featured image
    if (featuredPreview) {
      revokePreview(featuredPreview);
    }

    setFeaturedFile(null);
    setFeaturedPreview(null);

    // Remember which new image should become the main image
    setMainNewImageId(image.id);

    // Do not save the temporary blob URL to the database
    updateField("image_url", null);

    if (featuredInputRef.current) {
      featuredInputRef.current.value = "";
    }

    setError("");
    setSuccess("Main image selected. Save changes to confirm.");
  };

  // Remove featured/main image selection
  const removeFeaturedImage = () => {
    if (featuredPreview) {
      revokePreview(featuredPreview);
    }

    setFeaturedFile(null);
    setFeaturedPreview(null);
    setMainNewImageId(null);

    updateField("image_url", null);

    if (featuredInputRef.current) {
      featuredInputRef.current.value = "";
    }

    setError("");
    setSuccess("Main image removed. Save changes to confirm.");
  };

  // Update new image alt text
  const updateNewImageAlt = (imageId: string, value: string) => {
    setNewImages((previous) =>
      previous.map((image) =>
        image.id === imageId ? { ...image, alt_text: value } : image,
      ),
    );
  };

  // Delete existing gallery image
  const deleteExistingImage = async (image: NewsImage) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this image?",
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const { error: deleteError } = await supabase
        .from("news_images")
        .delete()
        .eq("id", image.id);

      if (deleteError) throw deleteError;

      const remainingImages = existingImages.filter(
        (item) => item.id !== image.id,
      );

      setExistingImages(remainingImages);

      // If deleted image was the main image, choose another image
      if (form.image_url === image.image_url) {
        updateField(
          "image_url",
          remainingImages[0]?.image_url ?? null,
        );
      }

      setSuccess("Image deleted successfully.");
    } catch (err) {
      console.error("Error deleting image:", err);

      setError(err instanceof Error ? err.message : "Failed to delete image.");
    }
  };

  // Upload image to Supabase Storage
  const uploadImage = async (file: File): Promise<string> => {
    const fileExtension = file.name.split(".").pop() || "jpg";

    const fileName = `${id}/${crypto.randomUUID()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  // Save changes or publish news
  const handleSave = async (
    event?: FormEvent<HTMLFormElement>,
    publish = false,
  ) => {
    event?.preventDefault();

    if (!id || saving) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // 1. Upload separately selected featured image
      let featuredImageUrl = form.image_url;

      if (featuredFile) {
        featuredImageUrl = await uploadImage(featuredFile);
      }

      // 2. Upload new gallery images
      const uploadedImages: {
        news_id: string;
        image_url: string;
        alt_text: string | null;
        display_order: number;
      }[] = [];

      // Keep the uploaded URL associated with each new image ID
      const uploadedImageUrls = new Map<string, string>();

      for (let index = 0; index < newImages.length; index++) {
        const image = newImages[index];

        const imageUrl = await uploadImage(image.file);

        uploadedImageUrls.set(image.id, imageUrl);

        uploadedImages.push({
          news_id: id,
          image_url: imageUrl,
          alt_text: image.alt_text.trim() || null,
          display_order: existingImages.length + index + 1,
        });
      }

      // 3. Determine which image should be the main image
      //
      // Priority:
      // 1. Separately uploaded featured image
      // 2. Newly selected gallery main image
      // 3. Existing selected main image
      // 4. First existing gallery image
      // 5. First newly uploaded gallery image

      if (featuredFile) {
        // Already uploaded above
      } else if (mainNewImageId) {
        featuredImageUrl =
          uploadedImageUrls.get(mainNewImageId) ?? null;
      } else if (!featuredImageUrl) {
        featuredImageUrl =
          existingImages[0]?.image_url ??
          uploadedImages[0]?.image_url ??
          null;
      }

      // 4. Determine publication status
      const nextStatus = publish ? "published" : form.status;

      const publishedAt =
        nextStatus === "published"
          ? form.published_at || new Date().toISOString()
          : null;

      // 5. Update news article
      const { error: updateError } = await supabase
        .from("news")
        .update({
          title_kh: form.title_kh.trim() || null,
          title_en: form.title_en.trim() || null,

          summary_kh: form.summary_kh.trim() ? form.summary_kh : null,
          summary_en: form.summary_en.trim() ? form.summary_en : null,

          content_kh: form.content_kh,
          content_en: form.content_en,

          category: form.category || null,

          // Save selected main image URL
          image_url: featuredImageUrl,

          status: nextStatus,
          published_at: publishedAt,
        })
        .eq("id", id);

      if (updateError) throw updateError;

      // 6. Insert new gallery images
      if (uploadedImages.length > 0) {
        const { error: galleryError } = await supabase
          .from("news_images")
          .insert(uploadedImages);

        if (galleryError) throw galleryError;
      }

      // 7. Update local state
      setForm((previous) => ({
        ...previous,
        image_url: featuredImageUrl,
        status: nextStatus,
        published_at: publishedAt,
      }));

      // 8. Clean up temporary previews
      if (featuredPreview) {
        revokePreview(featuredPreview);
      }

      newImages.forEach((image) => {
        revokePreview(image.preview);
      });

      setFeaturedFile(null);
      setFeaturedPreview(null);
      setNewImages([]);
      setMainNewImageId(null);

      setSuccess(
        nextStatus === "published"
          ? "News published successfully."
          : "News updated successfully.",
      );

      // Reload saved data
      await loadNews();
    } catch (err) {
      console.error("Error saving news:", err);

      setError(err instanceof Error ? err.message : "Failed to save news.");
    } finally {
      setSaving(false);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Error screen
  if (!id) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        News ID was not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/news"
            className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={16} />
            Back to News
          </Link>

          <h1 className="text-2xl font-bold text-gray-900">Edit News</h1>

          <p className="mt-1 text-sm text-gray-500">
            Update your news article and images.
          </p>
        </div>

        <span
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            form.status === "published"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {form.status === "published" ? "Published" : "Draft"}
        </span>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <X size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <Check size={18} className="mt-0.5 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={(event) => void handleSave(event)} className="space-y-6">
        {/* Titles */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            News Title
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
                value={form.title_kh}
                onChange={(event) =>
                  updateField("title_kh", event.target.value)
                }
                placeholder="បញ្ចូលចំណងជើងព័ត៌មាន..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                value={form.title_en}
                onChange={(event) =>
                  updateField("title_en", event.target.value)
                }
                placeholder="Enter news title..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </section>

        {/* Summary */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Short Summary
          </h2>

          <p className="mb-5 text-sm text-gray-500">
            Press Tab to insert four spaces. Press Enter for a new line. Spaces
            and line breaks are preserved when saving.
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
                value={form.summary_kh}
                onChange={(event) =>
                  updateField("summary_kh", event.target.value)
                }
                onKeyDown={(event) => handleTextareaTab(event, "summary_kh")}
                placeholder="សរសេរសេចក្ដីសង្ខេបព័ត៌មាន..."
                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm leading-7 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                value={form.summary_en}
                onChange={(event) =>
                  updateField("summary_en", event.target.value)
                }
                onKeyDown={(event) => handleTextareaTab(event, "summary_en")}
                placeholder="Write a short summary..."
                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm leading-7 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            News Content
          </h2>

          <p className="mb-5 text-sm text-gray-500">
            Press Tab to insert four spaces. Press Enter for a new line. Spaces
            and line breaks are preserved when saving.
          </p>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="content_kh"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Khmer Content
              </label>

              <textarea
                id="content_kh"
                rows={12}
                value={form.content_kh}
                onChange={(event) =>
                  updateField("content_kh", event.target.value)
                }
                onKeyDown={(event) => handleTextareaTab(event, "content_kh")}
                placeholder="សរសេរខ្លឹមសារព័ត៌មាន..."
                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm leading-7 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="content_en"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                English Content
              </label>

              <textarea
                id="content_en"
                rows={12}
                value={form.content_en}
                onChange={(event) =>
                  updateField("content_en", event.target.value)
                }
                onKeyDown={(event) => handleTextareaTab(event, "content_en")}
                placeholder="Write news content..."
                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm leading-7 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </section>

        {/* Category */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">Category</h2>

          <select
            value={form.category}
            onChange={(event) => updateField("category", event.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select a category</option>

            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name_en} / {category.name_kh}
              </option>
            ))}
          </select>
        </section>

        {/* Featured Image */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Featured / Main Image
            </h2>

            {hasSelectedMainImage ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                Main image selected
              </span>
            ) : (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                No image
              </span>
            )}
          </div>

          <input
            ref={featuredInputRef}
            type="file"
            accept="image/*"
            onChange={handleFeaturedImage}
            className="hidden"
          />

          {featuredDisplayImage ? (
            <div className="mb-4">
              <div className="relative overflow-hidden rounded-xl border border-gray-200">
                <img
                  src={featuredDisplayImage}
                  alt="Main image preview"
                  className="max-h-96 w-full object-cover"
                />

                <button
                  type="button"
                  onClick={removeFeaturedImage}
                  disabled={saving}
                  className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-md transition hover:bg-red-700 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  Remove Main Image
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-5 py-12 text-center">
              <div className="mb-3 rounded-full bg-gray-100 p-4">
                <ImageIcon size={30} className="text-gray-400" />
              </div>

              <p className="text-sm font-medium text-gray-700">
                No main image
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Select an Additional Image or upload a featured image.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => featuredInputRef.current?.click()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-blue-500 hover:text-blue-600 disabled:opacity-50"
          >
            <Upload size={17} />
            Upload Featured Image
          </button>

          <p className="mt-2 text-xs text-gray-500">
            You can upload a separate featured image or select one from
            Additional Images below. Maximum file size: 5MB.
          </p>
        </section>

        {/* Additional Gallery Images */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Additional Images
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage images and choose which one appears as the main image.
              </p>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              {existingImages.length + newImages.length}/{MAX_IMAGES} images
            </span>
          </div>

          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryImages}
            className="hidden"
          />

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {/* Existing images */}
            {existingImages.map((image) => {
              const isMainImage = form.image_url === image.image_url;

              return (
                <div
                  key={image.id}
                  className={`group overflow-hidden rounded-xl border ${
                    isMainImage
                      ? "border-green-400 ring-2 ring-green-100"
                      : "border-gray-200"
                  }`}
                >
                  <div className="relative aspect-square bg-gray-100">
                    <img
                      src={image.image_url}
                      alt={image.alt_text || "News image"}
                      className="h-full w-full object-cover"
                    />

                    {isMainImage && (
                      <span className="absolute bottom-2 left-2 rounded-md bg-green-600 px-2 py-1 text-xs font-semibold text-white shadow">
                        Main Image
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => void deleteExistingImage(image)}
                      disabled={saving}
                      className="absolute right-2 top-2 rounded-lg bg-red-600 p-2 text-white opacity-100 transition hover:bg-red-700 disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label="Delete image"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="space-y-2 p-2">
                    <p className="truncate text-xs text-gray-500">
                      Existing image
                    </p>

                    {isMainImage ? (
                      <span className="block rounded-lg bg-green-100 px-3 py-2 text-center text-xs font-semibold text-green-700">
                        <Check size={14} className="mr-1 inline" />
                        Main Image
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAsMainImage(image)}
                        disabled={saving}
                        className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                      >
                        Set as Main Image
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Newly selected images */}
            {newImages.map((image) => {
              const isMainImage = mainNewImageId === image.id;

              return (
                <div
                  key={image.id}
                  className={`overflow-hidden rounded-xl border ${
                    isMainImage
                      ? "border-green-400 ring-2 ring-green-100"
                      : "border-blue-200"
                  }`}
                >
                  <div className="relative aspect-square bg-gray-100">
                    <img
                      src={image.preview}
                      alt="New image preview"
                      className="h-full w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removeNewImage(image.id)}
                      disabled={saving}
                      className="absolute right-2 top-2 rounded-lg bg-red-600 p-2 text-white transition hover:bg-red-700 disabled:opacity-50"
                      aria-label="Remove image"
                    >
                      <X size={16} />
                    </button>

                    <span className="absolute bottom-2 left-2 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white">
                      New
                    </span>
                  </div>

                  <div className="space-y-2 p-2">
                    <input
                      type="text"
                      value={image.alt_text}
                      onChange={(event) =>
                        updateNewImageAlt(image.id, event.target.value)
                      }
                      placeholder="Image description"
                      disabled={saving}
                      className="w-full rounded-lg border border-gray-200 px-2 py-2 text-xs outline-none focus:border-blue-500 disabled:opacity-50"
                    />

                    {isMainImage ? (
                      <span className="block rounded-lg bg-green-100 px-3 py-2 text-center text-xs font-semibold text-green-700">
                        <Check size={14} className="mr-1 inline" />
                        Main Image
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setNewImageAsMain(image)}
                        disabled={saving}
                        className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                      >
                        Set as Main Image
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Add image button */}
            {existingImages.length + newImages.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={saving}
                className="flex aspect-square flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
              >
                <div className="rounded-full bg-gray-100 p-3">
                  <ImageIcon size={22} />
                </div>

                <span className="text-sm font-medium">Add Images</span>
              </button>
            )}
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Maximum {MAX_IMAGES} images. Each image must be smaller than 5MB.
          </p>
        </section>

        {/* Status */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Publication Status
          </h2>

          <select
            value={form.status}
            onChange={(event) =>
              updateField("status", event.target.value as "draft" | "published")
            }
            disabled={saving}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/news")}
            disabled={saving}
            className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}
              Save Changes
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSave(undefined, true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Send size={17} />
              )}
              Publish
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}