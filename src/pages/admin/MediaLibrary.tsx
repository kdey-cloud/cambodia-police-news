import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  Image as ImageIcon,
  Upload,
  Search,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  X,
  ExternalLink,
  LoaderCircle,
  Images,
  FileImage,
  Folder,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

const BUCKET_NAME = "news-images";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 200;

const ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "avif",
  "svg",
];

interface MediaFile {
  name: string;
  id: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  metadata?: {
    size?: number;
    mimetype?: string;
    [key: string]: unknown;
  } | null;
}

interface StorageEntry {
  name: string;
  id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  metadata?: {
    size?: number;
    mimetype?: string;
    [key: string]: unknown;
  } | null;
}

export default function MediaLibrary() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [copiedFile, setCopiedFile] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingFile, setDeletingFile] = useState("");
  const [failedImages, setFailedImages] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check whether a file is an allowed image.
  const isImageFile = (fileName: string) => {
    if (!fileName || fileName.startsWith(".")) {
      return false;
    }

    const extension = fileName.split(".").pop()?.toLowerCase();

    return ALLOWED_EXTENSIONS.includes(extension ?? "");
  };

  // Load images from the root and one level of folders.
  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const { data, error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .list("", {
          limit: MAX_FILES,
          offset: 0,
          sortBy: {
            column: "created_at",
            order: "desc",
          },
        });

      if (storageError) {
        throw storageError;
      }

      const entries: MediaFile[] = [];

      for (const item of (data ?? []) as StorageEntry[]) {
        if (!item.name || item.name.startsWith(".")) {
          continue;
        }

        // Files directly inside the bucket.
        if (isImageFile(item.name)) {
          entries.push({
            name: item.name,
            id: item.id ?? null,
            created_at: item.created_at ?? null,
            updated_at: item.updated_at ?? null,
            metadata: item.metadata ?? null,
          });

          continue;
        }

        // Items without image extensions may be folders.
        // List their contents and include image files.
        const { data: nestedItems, error: nestedError } =
          await supabase.storage.from(BUCKET_NAME).list(item.name, {
            limit: MAX_FILES,
            offset: 0,
            sortBy: {
              column: "created_at",
              order: "desc",
            },
          });

        if (nestedError) {
          console.warn(
            `Unable to list folder "${item.name}":`,
            nestedError.message,
          );

          continue;
        }

        for (const nestedItem of (nestedItems ?? []) as StorageEntry[]) {
          if (!isImageFile(nestedItem.name)) {
            continue;
          }

          entries.push({
            name: `${item.name}/${nestedItem.name}`,
            id: nestedItem.id ?? null,
            created_at: nestedItem.created_at ?? null,
            updated_at: nestedItem.updated_at ?? null,
            metadata: nestedItem.metadata ?? null,
          });
        }
      }

      setFiles(entries);
      setFailedImages([]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load media files.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  // Get the public URL for a file.
  const getPublicUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  // Get the file extension.
  const getFileExtension = (fileName: string) => {
    return fileName.split(".").pop()?.toUpperCase() ?? "FILE";
  };

  // Format file size.
  const formatFileSize = (bytes?: number) => {
    if (bytes === undefined || bytes === null) {
      return "Unknown size";
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Format upload date.
  const formatDate = (date?: string | null) => {
    if (!date) {
      return "Unknown date";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Unknown date";
    }

    return parsedDate.toLocaleString();
  };

  // Copy URL, with a fallback for clipboard restrictions.
  const handleCopyUrl = async (fileName: string) => {
    setError("");
    setSuccess("");

    const url = getPublicUrl(fileName);

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");

        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";

        document.body.appendChild(textArea);
        textArea.select();

        const copied = document.execCommand("copy");

        textArea.remove();

        if (!copied) {
          throw new Error("Copy command was unsuccessful.");
        }
      }

      setCopiedFile(fileName);
      setSuccess("Image URL copied to clipboard.");

      window.setTimeout(() => {
        setCopiedFile((current) =>
          current === fileName ? "" : current,
        );
      }, 2000);
    } catch {
      // Display the URL even if automatic copying is blocked.
      window.prompt("Copy this image URL:", url);
    }
  };

  // Upload images.
  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    setError("");
    setSuccess("");
    setIsUploading(true);

    let uploadedCount = 0;

    try {
      for (const file of selectedFiles) {
        const extension = file.name.split(".").pop()?.toLowerCase();

        if (!ALLOWED_EXTENSIONS.includes(extension ?? "")) {
          throw new Error(
            `${file.name} is not a supported image. Use JPG, PNG, WebP, GIF, AVIF, or SVG.`,
          );
        }

        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} is not an image.`);
        }

        if (file.size > MAX_FILE_SIZE) {
          throw new Error(`${file.name} exceeds the 10 MB upload limit.`);
        }

        const safeName = file.name
          .normalize("NFKD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-zA-Z0-9._-]/g, "-")
          .replace(/-+/g, "-");

        const uniqueName = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(uniqueName, file, {
            cacheControl: "3600",
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        uploadedCount++;
      }

      setSuccess(
        `${uploadedCount} image${uploadedCount === 1 ? "" : "s"} uploaded successfully.`,
      );

      await loadFiles();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload images.",
      );

      if (uploadedCount > 0) {
        setSuccess(
          `${uploadedCount} image${uploadedCount === 1 ? "" : "s"} uploaded before the error occurred.`,
        );

        await loadFiles();
      }
    } finally {
      setIsUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Delete an image from Supabase Storage.
  const handleDelete = async (fileName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${fileName}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingFile(fileName);
    setError("");
    setSuccess("");

    try {
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([fileName]);

      if (deleteError) {
        throw deleteError;
      }

      setFiles((currentFiles) =>
        currentFiles.filter((file) => file.name !== fileName),
      );

      setFailedImages((current) =>
        current.filter((name) => name !== fileName),
      );

      if (selectedFile?.name === fileName) {
        setSelectedFile(null);
      }

      setSuccess("Image deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete the image.",
      );
    } finally {
      setDeletingFile("");
    }
  };

  // Filter by filename.
  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  // Calculate total image storage size.
  const totalSize = files.reduce(
    (total, file) => total + (file.metadata?.size ?? 0),
    0,
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <Images size={23} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Media Library
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage images for your website.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void loadFiles()}
            disabled={isLoading || isUploading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={isLoading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <Upload size={18} />
            )}

            {isUploading ? "Uploading..." : "Upload Images"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <X size={18} className="mt-0.5 shrink-0" />

          <div className="min-w-0 flex-1 break-words">{error}</div>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
            className="shrink-0 rounded p-1 hover:bg-red-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          <Check size={18} className="shrink-0" />

          <span className="min-w-0 flex-1 break-words">{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss success message"
            className="rounded p-1 hover:bg-green-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Images
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {files.length}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ImageIcon size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Storage Used by Listed Images
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {formatFileSize(totalSize)}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <FileImage size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Media gallery */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="font-semibold text-slate-900">All Media</h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredFiles.length} image
              {filteredFiles.length === 1 ? "" : "s"} found
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search images..."
              aria-label="Search images"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {isLoading ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-slate-500">
              <LoaderCircle
                size={32}
                className="animate-spin text-blue-600"
              />

              <p className="mt-3 text-sm">Loading media library...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 px-5 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                {search ? <Search size={28} /> : <Images size={28} />}
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                {search ? "No images found" : "Your media library is empty"}
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {search
                  ? "Try another filename or search term."
                  : "Upload images to manage the media used on your website."}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Upload size={17} />
                  Upload your first image
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {filteredFiles.map((file) => {
                const imageUrl = getPublicUrl(file.name);
                const imageFailed = failedImages.includes(file.name);

                return (
                  <article
                    key={file.name}
                    className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-blue-300 hover:shadow-md"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedFile(file)}
                      className="relative block aspect-square w-full overflow-hidden bg-slate-100"
                      aria-label={`Preview ${file.name}`}
                    >
                      {imageFailed ? (
                        <div className="flex h-full flex-col items-center justify-center gap-2 p-3 text-center text-slate-500">
                          <FileImage size={32} />
                          <span className="text-xs">
                            Preview unavailable
                          </span>
                        </div>
                      ) : (
                        <img
                          src={imageUrl}
                          alt={file.name}
                          loading="lazy"
                          onError={() => {
                            setFailedImages((current) =>
                              current.includes(file.name)
                                ? current
                                : [...current, file.name],
                            );
                          }}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      )}

                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/0 transition group-hover:bg-slate-900/30">
                        <ImageIcon
                          size={26}
                          className="text-white opacity-0 transition group-hover:opacity-100"
                        />
                      </div>
                    </button>

                    <div className="space-y-3 p-3">
                      <p
                        className="truncate text-sm font-medium text-slate-800"
                        title={file.name}
                      >
                        {file.name.split("/").pop()}
                      </p>

                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded bg-slate-100 px-1.5 py-1 text-[10px] font-semibold text-slate-600">
                          {getFileExtension(file.name)}
                        </span>

                        <span className="truncate text-xs text-slate-500">
                          {formatFileSize(file.metadata?.size)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                        <button
                          type="button"
                          onClick={() => void handleCopyUrl(file.name)}
                          title="Copy image URL"
                          aria-label={`Copy URL for ${file.name}`}
                          className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-md p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                        >
                          {copiedFile === file.name ? (
                            <Check size={16} />
                          ) : (
                            <Copy size={16} />
                          )}

                          <span className="truncate text-xs">
                            {copiedFile === file.name ? "Copied" : "Copy URL"}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDelete(file.name)}
                          disabled={deletingFile === file.name}
                          title="Delete image"
                          aria-label={`Delete ${file.name}`}
                          className="shrink-0 rounded-md p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          {deletingFile === file.name ? (
                            <LoaderCircle
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Image preview modal */}
      {selectedFile && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedFile(null);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setSelectedFile(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Image preview"
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-6">
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900">
                  Image Preview
                </h3>

                <p
                  className="mt-1 truncate text-xs text-slate-500"
                  title={selectedFile.name}
                >
                  {selectedFile.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                aria-label="Close image preview"
                className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex min-h-48 max-h-[60vh] items-center justify-center bg-slate-100 p-4">
              {failedImages.includes(selectedFile.name) ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center text-slate-500">
                  <FileImage size={40} />
                  <p className="text-sm">
                    The image could not be loaded. Check the bucket permissions
                    and file path.
                  </p>
                </div>
              ) : (
                <img
                  src={getPublicUrl(selectedFile.name)}
                  alt={selectedFile.name}
                  onError={() => {
                    setFailedImages((current) =>
                      current.includes(selectedFile.name)
                        ? current
                        : [...current, selectedFile.name],
                    );
                  }}
                  className="max-h-[55vh] max-w-full rounded-lg object-contain"
                />
              )}
            </div>

            <div className="space-y-4 p-4 sm:p-6">
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">File size</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {formatFileSize(selectedFile.metadata?.size)}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Added on</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {formatDate(selectedFile.created_at)}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2">
                  <p className="text-xs text-slate-500">Image URL</p>
                  <p className="mt-1 break-all font-mono text-xs text-slate-700">
                    {getPublicUrl(selectedFile.name)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => void handleCopyUrl(selectedFile.name)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  {copiedFile === selectedFile.name ? (
                    <Check size={16} />
                  ) : (
                    <Copy size={16} />
                  )}

                  {copiedFile === selectedFile.name ? "Copied" : "Copy URL"}
                </button>

                <a
                  href={getPublicUrl(selectedFile.name)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <ExternalLink size={16} />
                  Open image
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <X size={16} />
                  Close
                </button>
              </div>

              {selectedFile.name.includes("/") && (
                <p className="flex items-center gap-2 text-xs text-slate-500">
                  <Folder size={14} />
                  Stored in folder: {selectedFile.name.split("/")[0]}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}