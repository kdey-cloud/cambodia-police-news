
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { supabase } from "../../lib/supabase";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  ImagePlus,
  Undo2,
  Redo2,
  LoaderCircle,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  language: "km" | "en";
}

interface ToolbarButtonProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function ToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onMouseDown={(event) => {
        // Keep the editor selection when clicking toolbar buttons.
        event.preventDefault();
      }}
      onClick={onClick}
      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "bg-blue-100 text-blue-700"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your article...",
  disabled = false,
  language,
}: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Track the last value received from the parent.
  const lastExternalValue = useRef(value);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),

      Underline,

      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: "article-inline-image",
        },
      }),

      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),

      Placeholder.configure({
        placeholder,
      }),
    ],

    content: value || "",

    editable: !disabled,

    onUpdate: ({ editor }) => {
  const html = editor.getHTML();

  lastExternalValue.current = html;
  onChange(html);
},

    editorProps: {
      attributes: {
        class:
          "tiptap-editor min-h-[300px] px-5 py-4 text-sm leading-8 text-slate-800 outline-none sm:min-h-[380px]",
        "aria-label": placeholder,
        lang: language,
      },
    },
  });

  // Synchronize only genuine external changes.
  // Do not reset editor content on every keystroke.
  useEffect(() => {
    if (!editor) return;

    if (value === lastExternalValue.current) {
      return;
    }

    const currentHTML = editor.getHTML();
    const incomingHTML = value || "";

    if (currentHTML !== incomingHTML) {
      editor.commands.setContent(incomingHTML, {
        emitUpdate: false,
      });
    }

    lastExternalValue.current = incomingHTML;
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  async function insertLink() {
    if (!editor) return;

    setUploadError("");

    const previousUrl = editor.getAttributes("link").href as
      | string
      | undefined;

    const url = window.prompt(
      language === "km" ? "បញ្ចូលតំណភ្ជាប់" : "Enter a URL",
      previousUrl || "https://",
    );

    if (url === null) return;

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    try {
      const parsedUrl = new URL(trimmedUrl);

      if (!["http:", "https:", "mailto:"].includes(parsedUrl.protocol)) {
        throw new Error("Unsupported URL protocol.");
      }

      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: parsedUrl.href })
        .run();
    } catch {
      setUploadError(
        language === "km"
          ? "សូមបញ្ចូលតំណភ្ជាប់ដែលត្រឹមត្រូវ។"
          : "Please enter a valid URL.",
      );
    }
  }

  async function handleInlineImage(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const input = event.target;
    const file = input.files?.[0];

    // Allow selecting the same file again.
    input.value = "";

    if (!file || !editor) return;

    setUploadError("");

    if (!file.type.startsWith("image/")) {
      setUploadError(
        language === "km"
          ? "សូមជ្រើសរើសឯកសាររូបភាព។"
          : "Please select an image file.",
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError(
        language === "km"
          ? "រូបភាពមិនអាចលើសពី 5MB បានទេ។"
          : "Images must be 5MB or smaller.",
      );
      return;
    }

    setUploadingImage(true);

    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";

      const safeExtension = /^[a-z0-9]+$/.test(extension)
        ? extension
        : "jpg";

      const path = `news-inline/${crypto.randomUUID()}.${safeExtension}`;

      const { error } = await supabase.storage
        .from("news-images")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from("news-images")
        .getPublicUrl(path);

      editor
        .chain()
        .focus()
        .setImage({
          src: data.publicUrl,
          alt: file.name,
        })
        .run();
    } catch (error) {
      console.error("[RichTextEditor] Image upload failed:", error);

      setUploadError(
        error instanceof Error
          ? error.message
          : language === "km"
            ? "មិនអាចបញ្ចូលរូបភាពបានទេ។"
            : "Could not upload the image.",
      );
    } finally {
      setUploadingImage(false);
    }
  }

  if (!editor) {
    return (
      <div className="flex min-h-80 items-center justify-center text-sm text-slate-500">
        <LoaderCircle className="mr-2 animate-spin" size={20} />
        {language === "km" ? "កំពុងផ្ទុកកម្មវិធីកែអត្ថបទ..." : "Loading editor..."}
      </div>
    );
  }

  function toolbarButton(
    label: string,
    active: boolean,
    action: () => void,
    icon: React.ReactNode,
  ) {
    return (
      <ToolbarButton
        key={label}
        label={label}
        active={active}
        disabled={disabled || uploadingImage}
        onClick={action}
      >
        {icon}
      </ToolbarButton>
    );
  }

  function renderToolbar(currentEditor: Editor) {
    return (
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2">
        {toolbarButton(
          "Bold",
          currentEditor.isActive("bold"),
          () => currentEditor.chain().focus().toggleBold().run(),
          <Bold size={17} />,
        )}

        {toolbarButton(
          "Italic",
          currentEditor.isActive("italic"),
          () => currentEditor.chain().focus().toggleItalic().run(),
          <Italic size={17} />,
        )}

        {toolbarButton(
          "Underline",
          currentEditor.isActive("underline"),
          () => currentEditor.chain().focus().toggleUnderline().run(),
          <UnderlineIcon size={17} />,
        )}

        {toolbarButton(
          "Strikethrough",
          currentEditor.isActive("strike"),
          () => currentEditor.chain().focus().toggleStrike().run(),
          <Strikethrough size={17} />,
        )}

        <span className="mx-1 h-6 w-px bg-slate-200" />

        {toolbarButton(
          "Heading 1",
          currentEditor.isActive("heading", { level: 1 }),
          () =>
            currentEditor.chain().focus().toggleHeading({ level: 1 }).run(),
          <Heading1 size={18} />,
        )}

        {toolbarButton(
          "Heading 2",
          currentEditor.isActive("heading", { level: 2 }),
          () =>
            currentEditor.chain().focus().toggleHeading({ level: 2 }).run(),
          <Heading2 size={18} />,
        )}

        {toolbarButton(
          "Heading 3",
          currentEditor.isActive("heading", { level: 3 }),
          () =>
            currentEditor.chain().focus().toggleHeading({ level: 3 }).run(),
          <Heading3 size={18} />,
        )}

        <span className="mx-1 h-6 w-px bg-slate-200" />

        {toolbarButton(
          "Bullet list",
          currentEditor.isActive("bulletList"),
          () => currentEditor.chain().focus().toggleBulletList().run(),
          <List size={18} />,
        )}

        {toolbarButton(
          "Numbered list",
          currentEditor.isActive("orderedList"),
          () => currentEditor.chain().focus().toggleOrderedList().run(),
          <ListOrdered size={18} />,
        )}

        {toolbarButton(
          "Quote",
          currentEditor.isActive("blockquote"),
          () => currentEditor.chain().focus().toggleBlockquote().run(),
          <Quote size={17} />,
        )}

        <span className="mx-1 h-6 w-px bg-slate-200" />

        <ToolbarButton
          label="Insert link"
          active={currentEditor.isActive("link")}
          disabled={disabled || uploadingImage}
          onClick={() => void insertLink()}
        >
          <LinkIcon size={17} />
        </ToolbarButton>

        <ToolbarButton
          label="Insert image"
          disabled={disabled || uploadingImage}
          onClick={() => imageInputRef.current?.click()}
        >
          {uploadingImage ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <ImagePlus size={17} />
          )}
        </ToolbarButton>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInlineImage}
        />

        <span className="mx-1 h-6 w-px bg-slate-200" />

        <ToolbarButton
          label="Undo"
          disabled={disabled || !currentEditor.can().undo()}
          onClick={() => currentEditor.chain().focus().undo().run()}
        >
          <Undo2 size={17} />
        </ToolbarButton>

        <ToolbarButton
          label="Redo"
          disabled={disabled || !currentEditor.can().redo()}
          onClick={() => currentEditor.chain().focus().redo().run()}
        >
          <Redo2 size={17} />
        </ToolbarButton>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
      {renderToolbar(editor)}

      {uploadError && (
        <div
          role="alert"
          className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700"
        >
          {uploadError}

          <button
            type="button"
            className="ml-3 font-semibold"
            onClick={() => setUploadError("")}
          >
            ×
          </button>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}

