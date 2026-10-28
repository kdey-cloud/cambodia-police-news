import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Save,
  LoaderCircle,
  Tag,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";

interface Category {
  id: string;
  name_en: string;
  name_kh: string;
  slug: string;
  created_at: string;
}

interface CategoryForm {
  name_en: string;
  name_kh: string;
  slug: string;
}

const initialForm: CategoryForm = {
  name_en: "",
  name_kh: "",
  slug: "",
};

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function Categories() {
  const { i18n } = useTranslation();

  const isKhmer = i18n.language.toLowerCase().startsWith("kh");

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<CategoryForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function fetchCategories() {
    setLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
        .from("categories")
        .select("id, name_en, name_kh, slug, created_at")
        .order("name_en", { ascending: true });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setCategories((data ?? []) as Category[]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load categories.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchCategories();
  }, []);

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
    setError("");
    setSuccess("");
  }

  function updateField(field: keyof CategoryForm, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleEnglishNameChange(value: string) {
    setForm((previous) => ({
      ...previous,
      name_en: value,
      ...(!editingId ? { slug: generateSlug(value) } : {}),
    }));
  }

  function startEditing(category: Category) {
    setEditingId(category.id);

    setForm({
      name_en: category.name_en,
      name_kh: category.name_kh,
      slug: category.slug,
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const nameEn = form.name_en.trim();
    const nameKh = form.name_kh.trim();
    const slug = generateSlug(form.slug);

    if (!nameEn || !nameKh) {
      setError(
        isKhmer
          ? "សូមបញ្ចូលឈ្មោះប្រភេទព័ត៌មានជាភាសាខ្មែរ និងអង់គ្លេស។"
          : "Please enter both English and Khmer category names.",
      );
      return;
    }

    if (!editingId && !slug) {
      setError(
        isKhmer
          ? "សូមបញ្ចូលឈ្មោះភាសាអង់គ្លេសដែលអាចបង្កើត slug បាន។"
          : "Please enter a valid English category name for the slug.",
      );
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        // Keep the existing slug so existing news articles
        // continue to use the same category identifier.
        const { error: updateError } = await supabase
          .from("categories")
          .update({
            name_en: nameEn,
            name_kh: nameKh,
          })
          .eq("id", editingId);

        if (updateError) {
          throw new Error(updateError.message);
        }

        setSuccess(
          isKhmer
            ? "បានកែប្រែប្រភេទព័ត៌មានដោយជោគជ័យ!"
            : "Category updated successfully!",
        );
      } else {
        const { error: insertError } = await supabase
          .from("categories")
          .insert({
            name_en: nameEn,
            name_kh: nameKh,
            slug,
          });

        if (insertError) {
          throw new Error(insertError.message);
        }

        setSuccess(
          isKhmer
            ? "បានបង្កើតប្រភេទព័ត៌មានដោយជោគជ័យ!"
            : "Category created successfully!",
        );
      }

      setForm(initialForm);
      setEditingId(null);

      await fetchCategories();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(
      isKhmer
        ? `តើអ្នកប្រាកដថាចង់លុបប្រភេទព័ត៌មាន "${category.name_kh}" មែនទេ?`
        : `Are you sure you want to delete "${category.name_en}"?`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingId(category.id);

    try {
      // Prevent deleting categories that are used by news.
      const { count, error: newsError } = await supabase
        .from("news")
        .select("id", { count: "exact", head: true })
        .eq("category", category.slug);

      if (newsError) {
        throw new Error(newsError.message);
      }

      if ((count ?? 0) > 0) {
        throw new Error(
          isKhmer
            ? `មិនអាចលុបប្រភេទព័ត៌មាននេះបានទេ ព្រោះមានព័ត៌មានចំនួន ${count} អត្ថបទកំពុងប្រើវា។`
            : `Cannot delete this category because ${count} news article(s) use it.`,
        );
      }

      const { error: deleteError } = await supabase
        .from("categories")
        .delete()
        .eq("id", category.id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      if (editingId === category.id) {
        setForm(initialForm);
        setEditingId(null);
      }

      setSuccess(
        isKhmer
          ? "បានលុបប្រភេទព័ត៌មានដោយជោគជ័យ!"
          : "Category deleted successfully!",
      );

      await fetchCategories();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete category.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredCategories = categories.filter((category) => {
    const query = search.trim().toLowerCase();

    return (
      category.name_en.toLowerCase().includes(query) ||
      category.name_kh.toLowerCase().includes(query) ||
      category.slug.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <FolderOpen size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                {isKhmer ? "គ្រប់គ្រងប្រភេទព័ត៌មាន" : "Categories"}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {isKhmer
                  ? "បង្កើត កែប្រែ និងគ្រប់គ្រងប្រភេទព័ត៌មានរបស់អ្នក។"
                  : "Create, edit, and manage your news categories."}
              </p>
            </div>
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
            className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            <p>{success}</p>

            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Dismiss success message"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          {/* Create / Edit Form */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-1">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                {editingId ? <Pencil size={20} /> : <Plus size={21} />}
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  {editingId
                    ? isKhmer
                      ? "កែប្រែប្រភេទព័ត៌មាន"
                      : "Edit Category"
                    : isKhmer
                      ? "បន្ថែមប្រភេទថ្មី"
                      : "Add Category"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {isKhmer
                    ? "បញ្ចូលព័ត៌មានប្រភេទព័ត៌មាន"
                    : "Enter category information"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* English Name */}
              <div>
                <label
                  htmlFor="category-name-en"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  English Name
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  id="category-name-en"
                  type="text"
                  value={form.name_en}
                  onChange={(event) =>
                    handleEnglishNameChange(event.target.value)
                  }
                  placeholder="e.g. Education and Training"
                  required
                  maxLength={100}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Khmer Name */}
              <div>
                <label
                  htmlFor="category-name-kh"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  ឈ្មោះជាភាសាខ្មែរ
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  id="category-name-kh"
                  type="text"
                  value={form.name_kh}
                  onChange={(event) =>
                    updateField("name_kh", event.target.value)
                  }
                  placeholder="បញ្ចូលឈ្មោះប្រភេទព័ត៌មាន"
                  required
                  maxLength={100}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Slug */}
              <div>
                <label
                  htmlFor="category-slug"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Slug
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <div className="relative">
                  <Tag
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="category-slug"
                    type="text"
                    value={form.slug}
                    onChange={(event) =>
                      updateField(
                        "slug",
                        event.target.value.toLowerCase(),
                      )
                    }
                    placeholder="education-and-training"
                    required
                    disabled={Boolean(editingId)}
                    maxLength={100}
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    title="Use lowercase letters, numbers, and single hyphens."
                    className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {editingId
                    ? "The slug cannot be changed here because existing news articles may use it."
                    : "Generated from the English name. You can also edit it."}
                </p>
              </div>

              {/* Form Buttons */}
              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : editingId ? (
                    <Save size={18} />
                  ) : (
                    <Plus size={19} />
                  )}

                  {saving
                    ? isKhmer
                      ? "កំពុងរក្សាទុក..."
                      : "Saving..."
                    : editingId
                      ? isKhmer
                        ? "រក្សាទុកការកែប្រែ"
                        : "Save Changes"
                      : isKhmer
                        ? "បង្កើតប្រភេទ"
                        : "Create Category"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    <X size={18} />
                    {isKhmer ? "បោះបង់" : "Cancel"}
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* Categories List */}
          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
            {/* List Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {isKhmer ? "ប្រភេទព័ត៌មានទាំងអស់" : "All Categories"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {categories.length}{" "}
                  {isKhmer ? "ប្រភេទព័ត៌មាន" : "categories"}
                </p>
              </div>

              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <FolderOpen size={22} />
              </span>
            </div>

            {/* Search */}
            <div className="relative mb-5">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={
                  isKhmer
                    ? "ស្វែងរកប្រភេទព័ត៌មាន..."
                    : "Search categories..."
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Loading */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <LoaderCircle
                  size={30}
                  className="mb-3 animate-spin text-blue-600"
                />

                <p className="text-sm">
                  {isKhmer
                    ? "កំពុងផ្ទុកប្រភេទព័ត៌មាន..."
                    : "Loading categories..."}
                </p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 px-4 py-12 text-center">
                <FolderOpen
                  size={35}
                  className="mx-auto mb-3 text-slate-300"
                />

                <h3 className="font-semibold text-slate-700">
                  {search
                    ? isKhmer
                      ? "រកមិនឃើញប្រភេទព័ត៌មានទេ"
                      : "No categories found"
                    : isKhmer
                      ? "មិនទាន់មានប្រភេទព័ត៌មានទេ"
                      : "No categories yet"}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {search
                    ? isKhmer
                      ? "សូមសាកល្បងពាក្យស្វែងរកផ្សេង។"
                      : "Try a different search term."
                    : isKhmer
                      ? "បង្កើតប្រភេទព័ត៌មានថ្មីដើម្បីចាប់ផ្ដើម។"
                      : "Create a category to get started."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCategories.map((category) => (
                  <article
                    key={category.id}
                    className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-slate-50/70 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      {/* Category Information */}
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                          <Tag size={20} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="break-words font-bold text-slate-900">
                            {isKhmer
                              ? category.name_kh
                              : category.name_en}
                          </h3>

                          <p className="mt-1 break-words text-sm text-slate-500">
                            {isKhmer
                              ? category.name_en
                              : category.name_kh}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                              {category.slug}
                            </span>

                            <span className="text-xs text-slate-400">
                              {new Date(
                                category.created_at,
                              ).toLocaleDateString(
                                isKhmer ? "km-KH" : "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-2 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => startEditing(category)}
                          disabled={saving || deletingId !== null}
                          aria-label={`Edit ${category.name_en}`}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Pencil size={16} />
                          {isKhmer ? "កែប្រែ" : "Edit"}
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDelete(category)}
                          disabled={
                            saving || deletingId !== null
                          }
                          aria-label={`Delete ${category.name_en}`}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === category.id ? (
                            <LoaderCircle
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={16} />
                          )}

                          {isKhmer ? "លុប" : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}