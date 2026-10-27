import { useEffect, useState } from "react";
import { CalendarDays, ArrowRight, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

interface MeetingArticle {
  id: string;
  title_km: string | null;
  title_en: string | null;
  summary_km: string | null;
  summary_en: string | null;
  image_url: string | null;
  published_at: string | null;
  created_at: string;
}

export default function MeetingSection() {
  const { i18n } = useTranslation();
  const isKhmer = i18n.language.toLowerCase().startsWith("kh");

  const [meetings, setMeetings] = useState<MeetingArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("news")
        .select(
          "id, title_km, title_en, summary_km, summary_en, image_url, published_at, created_at",
        )
        .eq("status", "published")
        .eq("category", "meeting")
        .order("published_at", {
          ascending: false,
          nullsFirst: false,
        })
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) {
        console.error("Error fetching meeting news:", error.message);
        setMeetings([]);
      } else {
        setMeetings(data ?? []);
      }

      setLoading(false);
    };

    fetchMeetings();
  }, []);

  const getTitle = (meeting: MeetingArticle) => {
    if (isKhmer) {
      return meeting.title_km || meeting.title_en || "";
    }

    return meeting.title_en || meeting.title_km || "";
  };

  const getSummary = (meeting: MeetingArticle) => {
    if (isKhmer) {
      return meeting.summary_km || meeting.summary_en || "";
    }

    return meeting.summary_en || meeting.summary_km || "";
  };

  const formatDate = (date: string | null, createdAt: string) => {
    const dateValue = date || createdAt;

    return new Date(dateValue).toLocaleDateString(isKhmer ? "km-KH" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <section className="bg-white py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mb-7 flex items-center justify-between gap-4 sm:mb-9">
          <div className="flex items-start gap-3">
            <div className="mt-1 h-9 w-1 shrink-0 rounded-full bg-blue-900" />

            <div>
              <div className="mb-1 flex items-center gap-2">
                <Users size={17} className="text-blue-900" />

                <span className="text-xs font-semibold uppercase tracking-widest text-blue-900">
                  {isKhmer ? "សកម្មភាពស្ថាប័ន" : "Academy Activities"}
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl md:text-3xl">
                {isKhmer ? "កិច្ចប្រជុំ" : "Meetings"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {isKhmer
                  ? "ព័ត៌មាន និងសកម្មភាពពាក់ព័ន្ធនឹងកិច្ចប្រជុំ"
                  : "Latest meetings and official discussions"}
              </p>
            </div>
          </div>

          <Link
            to="/news?category=meeting"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-blue-900 transition hover:text-blue-700"
          >
            <span>{isKhmer ? "មើលទាំងអស់" : "View All"}</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <div className="aspect-[16/10] animate-pulse bg-slate-200" />

                <div className="space-y-3 p-4">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
                  <div className="h-5 w-full animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : meetings.length === 0 ? (
          /* Empty state */
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
            <Users className="mx-auto mb-3 text-slate-400" size={32} />

            <p className="font-medium text-slate-600">
              {isKhmer
                ? "មិនទាន់មានព័ត៌មានកិច្ចប្រជុំនៅឡើយទេ។"
                : "No meeting news available yet."}
            </p>
          </div>
        ) : (
          /* Meeting cards */
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {meetings.map((meeting) => (
              <article
                key={meeting.id}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <Link
                  to={`/news/${meeting.id}`}
                  className="block"
                  aria-label={getTitle(meeting)}
                >
                  {/* Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    {meeting.image_url ? (
                      <img
                        src={meeting.image_url}
                        alt={getTitle(meeting)}
                        loading="lazy"
                        style={{
                          display: "block",
                          width: "100%",
                          height: "100%",
                          maxWidth: "none",
                          objectFit: "cover",
                          objectPosition: "center",
                        }}
                        className="transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Users size={36} className="text-slate-300" />
                      </div>
                    )}

                    <span className="absolute left-3 top-3 rounded-md bg-blue-900 px-2.5 py-1 text-xs font-medium text-white">
                      {isKhmer ? "កិច្ចប្រជុំ" : "Meeting"}
                    </span>
                  </div>
                  {/* Content */}
                  <div className="p-4">
                    <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
                      <CalendarDays size={14} className="shrink-0" />

                      <time
                        dateTime={meeting.published_at || meeting.created_at}
                      >
                        {formatDate(meeting.published_at, meeting.created_at)}
                      </time>
                    </div>

                    <h3 className="line-clamp-2 min-h-12 text-base font-bold leading-6 text-slate-900 transition-colors group-hover:text-blue-900">
                      {getTitle(meeting)}
                    </h3>

                    {getSummary(meeting) && (
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                        {getSummary(meeting)}
                      </p>
                    )}

                    <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-blue-900">
                      <span>{isKhmer ? "អានបន្ថែម" : "Read More"}</span>

                      <ArrowRight
                        size={15}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
