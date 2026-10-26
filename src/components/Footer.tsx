import { Mail, MapPin, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import facebookIcon from "../assets/social/Facebook-300x300.png"
import youtubeIcon from "../assets/social/youtube-300x300.png"
import telegramIcon from "../assets/social/Telegram_logo.svg_-150x150.png"
import tiktokIcon from "../assets/social/titokicon-300x300.png"
import coolappIcon from "../assets/social/CoolApp_Logo512x512.png"

export default function Footer() {
  const { t } = useTranslation();

  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // Fetch the latest published news from Supabase
  useEffect(() => {
    let mounted = true;

    async function fetchLastUpdate() {
      const { data, error } = await supabase
        .from("news")
        .select("published_at, created_at")
        .eq("status", "published")
        .order("published_at", {
          ascending: false,
          nullsFirst: false,
        })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Failed to fetch latest news update:", error.message);
        return;
      }

      if (mounted && data) {
        const timestamp = data.published_at ?? data.created_at;
        const parsedTimestamp = timestamp
          ? new Date(timestamp).getTime()
          : null;

        setUpdatedAt(
          parsedTimestamp !== null && Number.isFinite(parsedTimestamp)
            ? parsedTimestamp
            : null,
        );
      }
    }

    fetchLastUpdate();

    const databaseInterval = setInterval(fetchLastUpdate, 60000);
    const clockInterval = setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => {
      mounted = false;
      clearInterval(databaseInterval);
      clearInterval(clockInterval);
    };
  }, []);

  // Format the time since the latest publication
  function getTimeAgo(timestamp: number) {
    const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));

    if (seconds < 60) return "just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }

    const days = Math.floor(hours / 24);
    if (days < 30) {
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
      return `${months} ${months === 1 ? "month" : "months"} ago`;
    }

    const years = Math.floor(months / 12);
    return `${years} ${years === 1 ? "year" : "years"} ago`;
  }

  return (
    <footer className="bg-blue-950 text-white">
      {" "}
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* Branding */}{" "}
        <div className="min-w-0">
          {" "}
          <div className="mb-4 flex items-center gap-2">
            {/* Responsive Logo */}{" "}
            <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center sm:h-[54px] sm:w-[54px] lg:h-[60px] lg:w-[60px]">
              <img
                src="/logo.png"
                alt={t("academyLogoAlt", {
                  defaultValue: "Police Academy Logo",
                })}
                className="h-full w-full object-contain"
              />{" "}
            </div>
            {/* Academy Name */}
            <div className="min-w-0 flex-1">
              <h2 className="whitespace-nowrap text-[17px] font-extrabold leading-snug tracking-normal min-[400px]:text-[19px] min-[640px]:text-[16px] min-[768px]:text-[18px] min-[1024px]:text-[19px] min-[1280px]:text-[21px]">
                បណ្ឌិត្យសភានគរបាលកម្ពុជា
              </h2>

              <p className="mt-1 whitespace-nowrap text-[8px] font-medium leading-relaxed tracking-[0.04em] text-blue-200 min-[400px]:text-[9px] min-[1024px]:text-[10px]">
                EDUCATION · DISCIPLINE · SERVICE
              </p>
            </div>
          </div>
          <p className="max-w-xs text-sm leading-6 text-blue-100">
            Public information, institutional news, and community updates.
          </p>
        </div>
        {/* Quick Links */}
        <div>
          <h3 className="mb-4 border-b border-white/20 pb-3 font-bold">
            {t("quickLinks")}
          </h3>

          <ul className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-blue-100">
            {[
              { label: t("home"), href: "/" },
              { label: t("institution"), href: "/institution/background" },
              { label: t("information"), href: "/information" },
              { label: t("contact"), href: "/contact" },
              { label: t("news"), href: "/" },
              { label: t("search"), href: "/search" },
            ].map((link) => (
              <li key={link.href}>
                <a href={link.href} className="transition hover:text-amber-400">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        {/* Contact */}
        <div>
          <h3 className="mb-4 border-b border-white/20 pb-3 font-bold">
            {t("contactUs")}
          </h3>

          <ul className="space-y-4 text-sm text-blue-100">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-amber-400" />
              <span>
                Sdoa Kunleng Village, Dei Eith Commune, Kien Svay Distric,
                Kandal Province, Cambodia.
              </span>
            </li>

            <li className="flex items-center gap-3">
              <Phone size={18} className="shrink-0 text-amber-400" />
              <span>(+855)10 504 050</span>
            </li>

            <li className="flex items-center gap-3">
              <Mail size={18} className="shrink-0 text-amber-400" />
              <span>info@pac.edu.kh</span>
            </li>
          </ul>
        </div>
        {/* Social Media */}

<div>
  <h3 className="mb-4 border-b border-white/20 pb-3 font-bold">
    {t("followUs")}
  </h3>

  <div className="flex flex-wrap gap-3">
    {/* Facebook */}
    <a
      href="https://www.facebook.com/"
      target="_blank"
      rel="noreferrer"
      aria-label="Facebook"
      title="Facebook"
      className="flex h-10 w-10 items-center justify-center rounded bg-white/10 transition hover:bg-amber-400"
    >
      <img
        src={facebookIcon}
        alt=""
        className="h-6 w-6 object-contain"
      />
    </a>


{/* YouTube */}
<a
  href="https://www.youtube.com/"
  target="_blank"
  rel="noreferrer"
  aria-label="YouTube"
  title="YouTube"
  className="flex h-10 w-10 items-center justify-center rounded bg-white/10 transition hover:bg-amber-400"
>
  <img
    src={youtubeIcon}
    alt=""
    className="h-6 w-6 object-contain"
  />
</a>

{/* Telegram */}
<a
  href="https://telegram.org/"
  target="_blank"
  rel="noreferrer"
  aria-label="Telegram"
  title="Telegram"
  className="flex h-10 w-10 items-center justify-center rounded bg-white/10 transition hover:bg-amber-400"
>
  <img
    src={telegramIcon}
    alt=""
    className="h-6 w-6 object-contain"
  />
</a>

{/* TikTok */}
<a
  href="https://www.tiktok.com/"
  target="_blank"
  rel="noreferrer"
  aria-label="TikTok"
  title="TikTok"
  className="flex h-10 w-10 items-center justify-center rounded bg-white/10 transition hover:bg-amber-400"
>
  <img
    src={tiktokIcon}
    alt=""
    className="h-6 w-6 object-contain"
  />
</a>

{/* CoolApp Cambodia */}
<a
  href="https://www.facebook.com/"
  target="_blank"
  rel="noreferrer"
  aria-label="CoolApp Cambodia"
  title="CoolApp Cambodia"
  className="flex h-10 w-10 items-center justify-center rounded bg-white/10 transition hover:bg-amber-400"
>
  <img
    src={coolappIcon}
    alt=""
    className="h-6 w-6 object-contain"
  />
</a>


  </div>
</div>

      </div>
      {/* Bottom Bar */}
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-xs text-blue-200 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} All Rights Reserved by POLICE ACADEMY
            OF CAMBODIA
          </p>

          <p>
            Last update:{" "}
            {updatedAt !== null ? getTimeAgo(updatedAt) : "Loading..."}
          </p>
        </div>
      </div>
    </footer>
  );
}
