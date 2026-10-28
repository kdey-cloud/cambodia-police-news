import facebookIcon from "../../assets/social/Facebook-300x300.png";
import youtubeIcon from "../../assets/social/youtube-300x300.png";
import coolappIcon from "../../assets/social/CoolApp_Logo512x512.png";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Camera,
  ExternalLink,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

interface MeetingArticle {
  id: string;
  title_kh: string | null;
  title_en: string | null;
  image_url: string | null;
  published_at: string | null;
  created_at: string;
}

export default function MeetingSection() {
  const { t, i18n } = useTranslation();

  const [meetings, setMeetings] = useState<MeetingArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isKhmer = i18n.language.toLowerCase().startsWith("kh");

  useEffect(() => {
    let isMounted = true;

    async function fetchMeetings() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("news")
        .select("id, title_kh, title_en, image_url, published_at, created_at")
        .eq("status", "published")
        .eq("category", "meeting")
        .order("published_at", {
          ascending: false,
          nullsFirst: false,
        })
        .order("created_at", { ascending: false })
        .limit(4);

      if (!isMounted) return;

      if (error) {
        console.error("Error loading meeting news:", error.message);
        setError(error.message);
        setMeetings([]);
      } else {
        setMeetings(data ?? []);
      }

      setLoading(false);
    }

    fetchMeetings();

    return () => {
      isMounted = false;
    };
  }, []);

  const getTitle = (article: MeetingArticle) =>
    isKhmer
      ? article.title_kh || article.title_en || "គ្មានចំណងជើង"
      : article.title_en || article.title_kh || "Untitled";

  const getDate = (article: MeetingArticle) => {
    const date = article.published_at || article.created_at;

    return new Intl.DateTimeFormat(isKhmer ? "kh-KH" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <section id="latest-news" className="bg-slate-50 py-10 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-8 border-b border-slate-200 pb-4 sm:mb-10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-1 rounded-full bg-blue-900" />

            <div>
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                {isKhmer ? "កិច្ចប្រជុំ" : "Meetings"}
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                {isKhmer
                  ? "ព័ត៌មាន និងសកម្មភាពពាក់ព័ន្ធនឹងកិច្ចប្រជុំរបស់បណ្ឌិត្យសភានគរបាលកម្ពុជា"
                  : "The latest meetings and official discussions from the Police Academy of Cambodia"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3 lg:gap-10">
          {/* Meeting News */}
          <div className="min-w-0 lg:col-span-2">
            {/* Loading */}
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="flex gap-4 border-b border-slate-200 pb-4"
                  >
                    <div className="h-24 w-32 shrink-0 animate-pulse rounded-lg bg-slate-200 sm:h-28 sm:w-40" />

                    <div className="flex-1 space-y-3 py-2">
                      <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                      <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="rounded-lg border border-red-200 bg-white p-5 text-sm text-red-600">
                {isKhmer
                  ? "មិនអាចទាញយកព័ត៌មានកិច្ចប្រជុំបានទេ។ សូមព្យាយាមម្ដងទៀត។"
                  : "Failed to load meeting news. Please try again later."}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && meetings.length === 0 && (
              <div className="rounded-lg border border-slate-200 bg-white px-5 py-12 text-center">
                <Camera size={32} className="mx-auto mb-3 text-slate-300" />

                <p className="text-sm text-slate-500">
                  {isKhmer
                    ? "មិនទាន់មានព័ត៌មានកិច្ចប្រជុំនៅឡើយទេ។"
                    : "No meeting news available at the moment."}
                </p>
              </div>
            )}

            {/* Meeting Articles */}
            {!loading &&
              !error &&
              meetings.map((article) => (
                <article
                  key={article.id}
                  className="group border-b border-slate-200 py-4 first:pt-0 last:border-b-0"
                >
                  <Link
                    to={`/news/${article.id}`}
                    className="flex items-start gap-4 sm:gap-5"
                  >
                    {/* Meeting Image */}
                    <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-slate-200 sm:h-28 sm:w-40 md:h-32 md:w-44">
                      {article.image_url ? (
                        <img
                          src={article.image_url}
                          alt={getTitle(article)}
                          loading="lazy"
                          style={{
                            width: "100%",
                            height: "100%",
                            maxWidth: "none",
                            display: "block",
                            objectFit: "cover",
                            objectPosition: "center",
                          }}
                          className="transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <Camera size={26} />
                        </div>
                      )}
                    </div>

                    {/* Meeting Information */}
                    <div className="min-w-0 flex-1 py-1">
                      <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                        <CalendarDays
                          size={14}
                          className="shrink-0 text-blue-900"
                        />

                        <time
                          dateTime={article.published_at || article.created_at}
                        >
                          {getDate(article)}
                        </time>
                      </div>

                      <h3 className="line-clamp-3 text-sm font-semibold leading-6 text-slate-800 transition-colors group-hover:text-blue-900 sm:text-base">
                        {getTitle(article)}
                      </h3>

                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-900 sm:text-sm">
                        {isKhmer ? "អានបន្ថែម" : "Read More"}

                        <ArrowRight
                          size={14}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </span>
                    </div>
                  </Link>
                </article>
              ))}

            {/* View All */}
            {!loading && !error && meetings.length > 0 && (
              <div className="mt-6">
                <Link
                  to="/news?category=meeting"
                  className="inline-flex items-center gap-2 rounded-md border border-blue-900 px-5 py-2.5 text-sm font-semibold text-blue-900 transition hover:bg-blue-900 hover:text-white"
                >
                  {isKhmer ? "មើលកិច្ចប្រជុំទាំងអស់" : "View All Meetings"}
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {/* Follow Us - Hidden on phones */}
            <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white sm:block">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="font-bold text-slate-900">{t("followUs")}</h2>

                <p className="mt-1 text-sm text-slate-500">
                  {isKhmer
                    ? "តាមដានព័ត៌មានតាមបណ្ដាញសង្គមផ្លូវការ"
                    : "Follow our official social media channels"}
                </p>
              </div>

              <div className="grid grid-cols-3 divide-x divide-slate-100 px-2 py-5">
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="group flex flex-col items-center gap-2 px-1 text-slate-500 transition hover:text-blue-600"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 transition group-hover:bg-blue-100">
                    <img
                      src={facebookIcon}
                      alt="Facebook"
                      className="h-6 w-6 object-contain"
                    />
                  </span>

                  <span className="text-xs font-medium">Facebook</span>
                </a>

                <a
                  href="https://www.youtube.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="group flex flex-col items-center gap-2 px-1 text-slate-500 transition hover:text-red-600"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 transition group-hover:bg-blue-100">
                    <img
                      src={youtubeIcon}
                      alt="YouTube"
                      className="h-6 w-6 object-contain"
                    />
                  </span>

                  <span className="text-xs font-medium">YouTube</span>
                </a>

                <a
                  href="https://www.coolapp.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="CoolApp"
                  className="group flex flex-col items-center gap-2 px-1 text-slate-500 transition hover:text-pink-600"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 transition group-hover:bg-blue-100">
                    <img
                      src={coolappIcon}
                      alt="CoolApp"
                      className="h-6 w-6 object-contain"
                    />
                  </span>

                  <span className="text-xs font-medium">CoolApp</span>
                </a>
              </div>
            </div>

            {/* Location */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-blue-900" />

                  <h2 className="font-bold text-slate-900">
                    {isKhmer ? "ទីតាំងរបស់យើង" : "Our Location"}
                  </h2>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {isKhmer
                    ? "បណ្ឌិត្យសភានគរបាលកម្ពុជា"
                    : "Police Academy of Cambodia"}
                </p>
              </div>

              <div className="h-48 bg-slate-100 sm:h-52 lg:h-56">
                <iframe
                  title="Police Academy of Cambodia Location"
                  src="https://maps.google.com/maps?q=Police%20Academy%20of%20Cambodia&t=&z=13&ie=UTF8&iwloc=&output=embed"
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>

              <div className="p-4">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Police+Academy+of+Cambodia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-900 transition hover:text-amber-600"
                >
                  {isKhmer ? "មើលទីតាំងលើផែនទី" : "View on Google Maps"}
                  <ExternalLink size={15} />
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
