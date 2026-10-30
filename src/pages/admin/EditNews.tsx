
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
  X,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

interface Category {
  id: string;
  name_en: string;
  name_kh: string;
  slug: string;
}

type DisplaySize = "large" | "medium" | "small";

interface NewsForm {
  title_kh: string;
  title_en: string;
  summary_kh: string;
  summary_en: string;
  content_kh: string;
  content_en: string;
  category: string;
  image_url: string | null;
  image_display_size: DisplaySize;
  status: "draft" | "published";
  published_at: string | null;
}

interface NewsImage {
  id: string;
  news_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  display_size: DisplaySize;
  is_featured: boolean;
}

interface NewImage {
  id: string;
  file: File;
  preview: string;
  alt_text: string;
  display_size: DisplaySize;
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
  image_display_size: "large",
  status: "draft",
  published_at: null,
};

export default function EditNews() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const featuredInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<Set<string>>(new Set());

  const [form, setForm] = useState<NewsForm>(initialForm);
  const [categories, setCategories] = useState<Category[]>([]);

  // Existing images from news_images
  const [existingImages, setExistingImages] = useState<NewsImage[]>([]);

  // Newly uploaded featured images
  const [newFeaturedImages, setNewFeaturedImages] = useState<NewImage[]>([]);

  // Newly uploaded gallery images
  const [newGalleryImages, setNewGalleryImages] = useState<NewImage[]>([]);

  // Selected primary image
  // "current" = current news.image_url
  // "existing-ID" = existing featured image
  // "new-ID" = newly uploaded featured image
  const [primaryImageId, setPrimaryImageId] = useState("current");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create preview URL
  const createPreview = (file: File) => {
    const preview = URL.createObjectURL(file);
    objectUrlsRef.current.add(preview);
    return preview;
  };

  // Remove preview URL
  const revokePreview = (preview: string) => {
    URL.revokeObjectURL(preview);
    objectUrlsRef.current.delete(preview);
  };

  // Clean up previews
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });

      objectUrlsRef.current.clear();
    };
  }, []);

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

  // Tab inserts four spaces
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

  // Load news
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
        image_display_size: newsData.image_display_size ?? "large",
        status: newsData.status === "published" ? "published" : "draft",
        published_at: newsData.published_at ?? null,
      });

      setCategories(categoryData ?? []);

      setExistingImages(
        (imageData ?? []).map((image) => ({
          ...image,
          display_size: image.display_size ?? "large",
          is_featured: Boolean(image.is_featured),
        })),
      );

      setPrimaryImageId("current");
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

  // Existing featured images
  const existingFeaturedImages = existingImages.filter(
    (image) => image.is_featured,
  );

  // Existing gallery images
  const existingGalleryImages = existingImages.filter(
    (image) => !image.is_featured,
  );

  // Upload new featured images
  const handleFeaturedImages = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) return;

    const validImages: NewImage[] = [];

    for (const file of files) {
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
        display_size: "large",
      });
    }

    setNewFeaturedImages((previous) => [...previous, ...validImages]);

    if (validImages.length > 0) {
      setError("");
      setSuccess("");
    }

    event.target.value = "";
  };

  // Upload new gallery images
  const handleGalleryImages = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) return;

    const availableSlots =
      MAX_IMAGES - existingGalleryImages.length - newGalleryImages.length;

    if (availableSlots <= 0) {
      setError(`You can upload a maximum of ${MAX_IMAGES} gallery images.`);
      event.target.value = "";
      return;
    }

    const validImages: NewImage[] = [];

    for (const file of files.slice(0, availableSlots)) {
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
        display_size: "large",
      });
    }

    setNewGalleryImages((previous) => [...previous, ...validImages]);

    if (validImages.length > 0) {
      setError("");
      setSuccess("");
    }

    event.target.value = "";
  };

  // Remove new featured image
  const removeNewFeaturedImage = (imageId: string) => {
    const image = newFeaturedImages.find((item) => item.id === imageId);

    if (!image) return;

    revokePreview(image.preview);

    setNewFeaturedImages((previous) =>
      previous.filter((item) => item.id !== imageId),
    );

    if (primaryImageId === `new-${imageId}`) {
      setPrimaryImageId("current");
    }
  };

  // Remove new gallery image
  const removeNewGalleryImage = (imageId: string) => {
    const image = newGalleryImages.find((item) => item.id === imageId);

    if (!image) return;

    revokePreview(image.preview);

    setNewGalleryImages((previous) =>
      previous.filter((item) => item.id !== imageId),
    );
  };

  // Delete existing image
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

      setExistingImages((previous) =>
        previous.filter((item) => item.id !== image.id),
      );

      if (primaryImageId === `existing-${image.id}`) {
        setPrimaryImageId("current");
      }

      setSuccess("Image deleted successfully.");
    } catch (err) {
      console.error("Error deleting image:", err);

      setError(
        err instanceof Error ? err.message : "Failed to delete image.",
      );
    }
  };

  // Update existing image display size
  const updateExistingImageSize = (
    imageId: string,
    size: DisplaySize,
  ) => {
    setExistingImages((previous) =>
      previous.map((image) =>
        image.id === imageId ? { ...image, display_size: size } : image,
      ),
    );
  };

  // Update new image display size
  const updateNewImageSize = (
    imageId: string,
    size: DisplaySize,
    type: "featured" | "gallery",
  ) => {
    const setter =
      type === "featured" ? setNewFeaturedImages : setNewGalleryImages;

    setter((previous) =>
      previous.map((image) =>
        image.id === imageId ? { ...image, display_size: size } : image,
      ),
    );
  };

  // Update new image alt text
  const updateNewImageAlt = (
    imageId: string,
    value: string,
    type: "featured" | "gallery",
  ) => {
    const setter =
      type === "featured" ? setNewFeaturedImages : setNewGalleryImages;

    setter((previous) =>
      previous.map((image) =>
        image.id === imageId ? { ...image, alt_text: value } : image,
      ),
    );
  };

  // Upload image to Supabase Storage
  const uploadImage = async (file: File): Promise<string> => {
    if (!id) throw new Error("News ID was not found.");

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

  // Save news
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

      // 1. Upload new featured images
      const uploadedFeatured = new Map<string, string>();

      for (const image of newFeaturedImages) {
        const url = await uploadImage(image.file);
        uploadedFeatured.set(image.id, url);
      }

      // 2. Upload new gallery images
      const uploadedGallery: {
        news_id: string;
        image_url: string;
        alt_text: string | null;
        display_order: number;
        display_size: DisplaySize;
        is_featured: boolean;
      }[] = [];

      for (let index = 0; index < newGalleryImages.length; index++) {
        const image = newGalleryImages[index];
        const url = await uploadImage(image.file);

        uploadedGallery.push({
          news_id: id,
          image_url: url,
          alt_text: image.alt_text.trim() || null,
          display_order: existingImages.length + index + 1,
          display_size: image.display_size,
          is_featured: false,
        });
      }

      // 3. Determine primary image URL
      let primaryImageUrl: string | null = form.image_url;

      if (primaryImageId.startsWith("existing-")) {
        const selectedId = primaryImageId.replace("existing-", "");

        const selectedImage = existingFeaturedImages.find(
          (image) => image.id === selectedId,
        );

        if (!selectedImage) {
          throw new Error("Selected featured image was not found.");
        }

        primaryImageUrl = selectedImage.image_url;
      } else if (primaryImageId.startsWith("new-")) {
        const selectedId = primaryImageId.replace("new-", "");

        primaryImageUrl = uploadedFeatured.get(selectedId) ?? null;
      }

      // 4. Prepare other featured images
      const otherFeaturedImages = existingFeaturedImages.filter(
        (image) =>
          primaryImageId !== `existing-${image.id}`,
      );

      const newFeaturedRows = newFeaturedImages
        .filter((image) => primaryImageId !== `new-${image.id}`)
        .map((image, index) => {
          const url = uploadedFeatured.get(image.id);

          if (!url) {
            throw new Error("Failed to upload a featured image.");
          }

          return {
            news_id: id,
            image_url: url,
            alt_text: image.alt_text.trim() || null,
            display_order:
              existingImages.length + newGalleryImages.length + index + 1,
            display_size: image.display_size,
            is_featured: true,
          };
        });

      // 5. Publication status
      const nextStatus = publish ? "published" : form.status;

      const publishedAt =
        nextStatus === "published"
          ? form.published_at || new Date().toISOString()
          : null;

      // 6. Update news table
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
          image_url: primaryImageUrl,
          image_display_size:
            primaryImageId.startsWith("existing-")
              ? existingFeaturedImages.find(
                  (image) =>
                    primaryImageId === `existing-${image.id}`,
                )?.display_size ?? form.image_display_size
              : primaryImageId.startsWith("new-")
                ? newFeaturedImages.find(
                    (image) =>
                      primaryImageId === `new-${image.id}`,
                  )?.display_size ?? form.image_display_size
                : form.image_display_size,
          status: nextStatus,
          published_at: publishedAt,
        })
        .eq("id", id);

      if (updateError) throw updateError;

      // 7. Update existing featured images
      // The selected primary image is removed from news_images
      // because it is now stored in news.image_url.
      if (primaryImageId.startsWith("existing-")) {
        const selectedId = primaryImageId.replace("existing-", "");

        const { error: deletePrimaryError } = await supabase
          .from("news_images")
          .delete()
          .eq("id", selectedId);

        if (deletePrimaryError) throw deletePrimaryError;
      }

      const featuredUpdates = await Promise.all(
        otherFeaturedImages.map((image) =>
          supabase
            .from("news_images")
            .update({
              display_size: image.display_size,
              is_featured: true,
            })
            .eq("id", image.id),
        ),
      );

      const failedFeaturedUpdate = featuredUpdates.find(
        (result) => result.error,
      );

      if (failedFeaturedUpdate?.error) {
        throw failedFeaturedUpdate.error;
      }

      // 8. Update existing gallery images
      const galleryUpdates = await Promise.all(
        existingGalleryImages.map((image) =>
          supabase
            .from("news_images")
            .update({
              display_size: image.display_size,
              is_featured: false,
            })
            .eq("id", image.id),
        ),
      );

      const failedGalleryUpdate = galleryUpdates.find(
        (result) => result.error,
      );

      if (failedGalleryUpdate?.error) {
        throw failedGalleryUpdate.error;
      }

      // 9. Insert newly uploaded featured images
      const allNewRows = [...newFeaturedRows, ...uploadedGallery];

      if (allNewRows.length > 0) {
        const { error: insertError } = await supabase
          .from("news_images")
          .insert(allNewRows);

        if (insertError) throw insertError;
      }

      // 10. Update local form
      setForm((previous) => ({
        ...previous,
        image_url: primaryImageUrl,
        status: nextStatus,
        published_at: publishedAt,
      }));

      // 11. Clean up previews
      [...newFeaturedImages, ...newGalleryImages].forEach((image) => {
        revokePreview(image.preview);
      });

      setNewFeaturedImages([]);
      setNewGalleryImages([]);
      setPrimaryImageId("current");

      setSuccess(
        nextStatus === "published"
          ? "News published successfully."
          : "News updated successfully.",
      );

      await loadNews();
    } catch (err) {
      console.error("Error saving news:", err);

      setError(
        err instanceof Error ? err.message : "Failed to save news.",
      );
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

      <form
        onSubmit={(event) => void handleSave(event)}
        className="space-y-6"
      >
        {/* 1. News Title */}
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
                value={form.title_en}
                onChange={(event) =>
                  updateField("title_en", event.target.value)
                }
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
            Short Summary
          </h2>

          <p className="mb-5 text-sm text-gray-500">
            Press Tab to insert four spaces. Press Enter for a new line.
            Spaces and line breaks are preserved when saving.
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
                onKeyDown={(event) =>
                  handleTextareaTab(event, "summary_kh")
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
                value={form.summary_en}
                onChange={(event) =>
                  updateField("summary_en", event.target.value)
                }
                onKeyDown={(event) =>
                  handleTextareaTab(event, "summary_en")
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
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Featured Images
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              All featured images are managed here. Select one image as the
              primary image.
            </p>
          </div>

          <input
            ref={featuredInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFeaturedImages}
            className="hidden"
          />

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {/* Current Primary Image */}
            {form.image_url && (
              <div
                className={`overflow-hidden rounded-xl border-2 ${
                  primaryImageId === "current"
                    ? "border-blue-500"
                    : "border-gray-200"
                }`}
              >
                <div className="relative aspect-square bg-gray-100">
                  <img
                    src={form.image_url}
                    alt="Primary featured image"
                    className="h-full w-full object-cover"
                  />

                  <span className="absolute left-2 top-2 rounded-md bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
                    Current Primary
                  </span>
                </div>

                <div className="p-3">
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="radio"
                      name="primaryFeaturedImage"
                      checked={primaryImageId === "current"}
                      onChange={() => setPrimaryImageId("current")}
                      disabled={saving}
                      className="h-4 w-4 accent-blue-600"
                    />
                    Primary Image
                  </label>

                  <label className="mt-3 block text-xs font-medium text-gray-600">
                    Display Size

                    <select
                      value={form.image_display_size}
                      onChange={(event) =>
                        updateField(
                          "image_display_size",
                          event.target.value as DisplaySize,
                        )
                      }
                      disabled={saving}
                      className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs"
                    >
                      <option value="large">Large</option>
                      <option value="medium">Medium</option>
                      <option value="small">Small</option>
                    </select>
                  </label>
                </div>
              </div>
            )}

            {/* Existing Additional Featured Images */}
            {existingFeaturedImages.map((image) => {
              const selected = primaryImageId === `existing-${image.id}`;

              return (
                <div
                  key={image.id}
                  className={`overflow-hidden rounded-xl border-2 ${
                    selected ? "border-blue-500" : "border-gray-200"
                  }`}
                >
                  <div className="relative aspect-square bg-gray-100">
                    <img
                      src={image.image_url}
                      alt={image.alt_text || "Featured image"}
                      className="h-full w-full object-cover"
                    />

                    <span className="absolute left-2 top-2 rounded-md bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
                      Featured
                    </span>

                    <button
                      type="button"
                      onClick={() => void deleteExistingImage(image)}
                      disabled={saving}
                      className="absolute right-2 top-2 rounded-lg bg-red-600 p-2 text-white hover:bg-red-700 disabled:opacity-50"
                      aria-label="Delete featured image"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="space-y-3 p-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="radio"
                        name="primaryFeaturedImage"
                        checked={selected}
                        onChange={() =>
                          setPrimaryImageId(`existing-${image.id}`)
                        }
                        disabled={saving}
                        className="h-4 w-4 accent-blue-600"
                      />
                      Primary Image
                    </label>

                    <label className="block text-xs font-medium text-gray-600">
                      Display Size

                      <select
                        value={image.display_size}
                        onChange={(event) =>
                          updateExistingImageSize(
                            image.id,
                            event.target.value as DisplaySize,
                          )
                        }
                        disabled={saving}
                        className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs"
                      >
                        <option value="large">Large</option>
                        <option value="medium">Medium</option>
                        <option value="small">Small</option>
                      </select>
                    </label>
                  </div>
                </div>
              );
            })}

            {/* New Featured Images */}
            {newFeaturedImages.map((image) => {
              const selected = primaryImageId === `new-${image.id}`;

              return (
                <div
                  key={image.id}
                  className={`overflow-hidden rounded-xl border-2 ${
                    selected ? "border-blue-500" : "border-blue-200"
                  }`}
                >
                  <div className="relative aspect-square bg-gray-100">
                    <img
                      src={image.preview}
                      alt={image.alt_text || "New featured image"}
                      className="h-full w-full object-cover"
                    />

                    <span className="absolute left-2 top-2 rounded-md bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
                      New Featured
                    </span>

                    <button
                      type="button"
                      onClick={() => removeNewFeaturedImage(image.id)}
                      disabled={saving}
                      className="absolute right-2 top-2 rounded-lg bg-red-600 p-2 text-white hover:bg-red-700 disabled:opacity-50"
                      aria-label="Remove featured image"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="space-y-3 p-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="radio"
                        name="primaryFeaturedImage"
                        checked={selected}
                        onChange={() =>
                          setPrimaryImageId(`new-${image.id}`)
                        }
                        disabled={saving}
                        className="h-4 w-4 accent-blue-600"
                      />
                      Primary Image
                    </label>

                    <label className="block text-xs font-medium text-gray-600">
                      Display Size

                      <select
                        value={image.display_size}
                        onChange={(event) =>
                          updateNewImageSize(
                            image.id,
                            event.target.value as DisplaySize,
                            "featured",
                          )
                        }
                        disabled={saving}
                        className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs"
                      >
                        <option value="large">Large</option>
                        <option value="medium">Medium</option>
                        <option value="small">Small</option>
                      </select>
                    </label>
                  </div>
                </div>
              );
            })}

            {/* Add Featured Images */}
            <button
              type="button"
              onClick={() => featuredInputRef.current?.click()}
              disabled={saving}
              className="flex aspect-square flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
            >
              <div className="rounded-full bg-gray-100 p-3">
                <ImageIcon size={22} />
              </div>

              <span className="text-sm font-medium">
                Add Featured Images
              </span>
            </button>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Select one image as Primary. Other featured images will be saved
            separately. Each image must be smaller than 5MB.
          </p>
        </section>

        {/* 4. Article Content */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Article Content
          </h2>

          <p className="mb-5 text-sm text-gray-500">
            Press Tab to insert four spaces. Press Enter for a new line.
            Spaces and line breaks are preserved when saving.
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
                onKeyDown={(event) =>
                  handleTextareaTab(event, "content_kh")
                }
                placeholder="សរសេរខ្លឹមសារព័ត៌មាន..."
                disabled={saving}
                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm leading-7 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
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
                onKeyDown={(event) =>
                  handleTextareaTab(event, "content_en")
                }
                placeholder="Write news content..."
                disabled={saving}
                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm leading-7 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
              />
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
                Manage additional photos displayed below the article content.
                Featured images are not displayed here.
              </p>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              {existingGalleryImages.length + newGalleryImages.length}/
              {MAX_IMAGES} images
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
            {/* Existing Gallery Images */}
            {existingGalleryImages.map((image) => (
              <div
                key={image.id}
                className="group overflow-hidden rounded-xl border border-gray-200"
              >
                <div className="relative aspect-square bg-gray-100">
                  <img
                    src={image.image_url}
                    alt={image.alt_text || "Gallery image"}
                    className="h-full w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => void deleteExistingImage(image)}
                    disabled={saving}
                    className="absolute right-2 top-2 rounded-lg bg-red-600 p-2 text-white opacity-100 transition hover:bg-red-700 disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label="Delete gallery image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-3 p-3">
                  <p className="truncate text-xs text-gray-500">
                    Existing gallery image
                  </p>

                  <label className="block text-xs font-medium text-gray-600">
                    Display Size

                    <select
                      value={image.display_size}
                      onChange={(event) =>
                        updateExistingImageSize(
                          image.id,
                          event.target.value as DisplaySize,
                        )
                      }
                      disabled={saving}
                      className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs"
                    >
                      <option value="large">Large</option>
                      <option value="medium">Medium</option>
                      <option value="small">Small</option>
                    </select>
                  </label>
                </div>
              </div>
            ))}

            {/* New Gallery Images */}
            {newGalleryImages.map((image) => (
              <div
                key={image.id}
                className="overflow-hidden rounded-xl border border-blue-200"
              >
                <div className="relative aspect-square bg-gray-100">
                  <img
                    src={image.preview}
                    alt={image.alt_text || "New gallery image"}
                    className="h-full w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => removeNewGalleryImage(image.id)}
                    disabled={saving}
                    className="absolute right-2 top-2 rounded-lg bg-red-600 p-2 text-white transition hover:bg-red-700 disabled:opacity-50"
                    aria-label="Remove new gallery image"
                  >
                    <X size={16} />
                  </button>

                  <span className="absolute bottom-2 left-2 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white">
                    New Image
                  </span>
                </div>

                <div className="space-y-3 p-3">
                  <input
                    type="text"
                    value={image.alt_text}
                    onChange={(event) =>
                      updateNewImageAlt(
                        image.id,
                        event.target.value,
                        "gallery",
                      )
                    }
                    placeholder="Image description"
                    disabled={saving}
                    className="w-full rounded-lg border border-gray-200 px-2 py-2 text-xs outline-none focus:border-blue-500 disabled:opacity-50"
                  />

                  <label className="block text-xs font-medium text-gray-600">
                    Display Size

                    <select
                      value={image.display_size}
                      onChange={(event) =>
                        updateNewImageSize(
                          image.id,
                          event.target.value as DisplaySize,
                          "gallery",
                        )
                      }
                      disabled={saving}
                      className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs"
                    >
                      <option value="large">Large</option>
                      <option value="medium">Medium</option>
                      <option value="small">Small</option>
                    </select>
                  </label>
                </div>
              </div>
            ))}

            {/* Add Gallery Images */}
            {existingGalleryImages.length + newGalleryImages.length <
              MAX_IMAGES && (
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
            Maximum {MAX_IMAGES} gallery images. Each image must be smaller
            than 5MB.
          </p>
        </section>

        {/* 6. Category */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Category
          </h2>

          <select
            value={form.category}
            onChange={(event) => updateField("category", event.target.value)}
            disabled={saving}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
          >
            <option value="">Select a category</option>

            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name_en} / {category.name_kh}
              </option>
            ))}
          </select>
        </section>

        {/* 7. Publication Status */}
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

