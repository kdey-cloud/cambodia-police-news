import { useEffect, useState } from "react";
import RouteLoading from "../../components/common/RouteLoading";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  CalendarDays,
  Fingerprint,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Shield,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { Leader } from "../../types/leadership";
import RecentNews from "../../components/news/RecentNews";

const MAIN_COLOR = "#1D4ED8";

export default function CompositionAndLeadership() {
  const { i18n } = useTranslation();

  const isKhmer = i18n.language.toLowerCase().startsWith("kh");

  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loadingLeaders, setLoadingLeaders] = useState(true);
  const [leaderError, setLeaderError] = useState("");

  // Load active leadership members.
  useEffect(() => {
    let active = true;

    async function loadLeaders() {
      setLoadingLeaders(true);
      setLeaderError("");

      const { data, error } = await supabase
        .from("leadership")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (!active) return;

      if (error) {
        console.error("Error loading leadership:", error);

        setLeaderError(
          isKhmer
            ? "មិនអាចផ្ទុកព័ត៌មានថ្នាក់ដឹកនាំបានទេ។ សូមព្យាយាមម្តងទៀត។"
            : "Unable to load leadership information. Please try again.",
        );

        setLoadingLeaders(false);
        return;
      }

      setLeaders((data ?? []) as Leader[]);
      setLoadingLeaders(false);
    }

    void loadLeaders();

    return () => {
      active = false;
    };
  }, [isKhmer]);

  return (
    <main
      lang={isKhmer ? "kh" : "en"}
      className={`min-h-screen bg-gray-50 text-black ${
        isKhmer ? "font-battambang" : "font-inter"
      }`}
    >
      {/* Page Header */}
      <section
        className="border-b border-gray-200 bg-white"
        style={{ borderTop: `4px solid ${MAIN_COLOR}` }}
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium hover:underline"
            style={{ color: MAIN_COLOR }}
          >
            <ArrowRight size={16} className="rotate-180" />
            {isKhmer ? "ទំព័រដើម" : "Home"}
          </Link>

          <p
            className="mb-2 text-sm font-semibold uppercase tracking-wider"
            style={{ color: MAIN_COLOR }}
          >
            {isKhmer
              ? "បណ្ឌិត្យសភានគរបាលកម្ពុជា"
              : "Police Academy of Cambodia"}
          </p>

          <h1 className="text-3xl font-bold leading-tight text-black sm:text-4xl">
            {isKhmer ? "សមាសភាព និងថ្នាក់ដឹកនាំ" : "Composition and Leadership"}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={16} style={{ color: MAIN_COLOR }} />
              {isKhmer
                ? "បណ្ឌិត្យសភានគរបាលកម្ពុជា"
                : "Police Academy of Cambodia"}
            </span>

            <span className="inline-flex items-center gap-2">
              <Shield size={16} style={{ color: MAIN_COLOR }} />
              {isKhmer ? "ថ្នាក់ដឹកនាំ" : "Leadership"}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Leadership */}
          <article className="order-1 min-w-0">
            {/* Loading */}
{loadingLeaders && (
  <div className="rounded-lg border border-gray-200 bg-white">
    <RouteLoading
      message={
        isKhmer
          ? "កំពុងផ្ទុកព័ត៌មានថ្នាក់ដឹកនាំ..."
          : "Loading leadership information..."
      }
    />
  </div>
)}

            {/* Error */}
            {!loadingLeaders && leaderError && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-white p-6 text-red-700"
              >
                {leaderError}
              </div>
            )}

            {/* Empty */}
            {!loadingLeaders && !leaderError && leaders.length === 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                <Shield
                  size={36}
                  className="mx-auto mb-3"
                  style={{ color: MAIN_COLOR }}
                />

                <h3 className="font-bold text-gray-900">
                  {isKhmer
                    ? "មិនទាន់មានព័ត៌មានថ្នាក់ដឹកនាំ"
                    : "No leadership information available"}
                </h3>

                <p className="mt-2 text-sm text-gray-600">
                  {isKhmer
                    ? "ព័ត៌មាននឹងបង្ហាញនៅទីនេះនៅពេលមានការបន្ថែម។"
                    : "Leadership information will appear here when available."}
                </p>
              </div>
            )}

            {/* Leadership cards */}
            {!loadingLeaders && !leaderError && leaders.length > 0 && (
              <div className="space-y-6">
                {leaders.map((leader) => (
                  <article
                    key={leader.id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-[180px_minmax(0,1fr)]">
                      {/* Leader photo */}
                      <div className="flex min-h-[200px] items-center justify-center bg-slate-50 p-3 sm:min-h-[220px]">
                        {leader.image_url ? (
                          <img
                            src={leader.image_url}
                            alt={
                              isKhmer
                                ? leader.name_kh || leader.name_en || ""
                                : leader.name_en || leader.name_kh || ""
                            }
                            width={400}
                            height={500}
                            loading={
                              leaders.indexOf(leader) === 0 ? "eager" : "lazy"
                            }
                            fetchPriority={
                              leaders.indexOf(leader) === 0 ? "high" : "auto"
                            }
                            decoding="async"
                            className="max-h-[270px] w-full object-contain"
                          />
                        ) : (
                          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-blue-100">
                            <Shield size={48} className="text-blue-700" />
                          </div>
                        )}
                      </div>

                      {/* Leader information */}
                      <div className="min-w-0 p-4 sm:p-5">
                        <h3 className="text-lg font-bold leading-7 text-slate-900">
                          {isKhmer
                            ? leader.name_kh || leader.name_en || ""
                            : leader.name_en || leader.name_kh || ""}
                        </h3>

                        {(leader.position_kh || leader.position_en) && (
                          <p className="mt-1 text-sm font-semibold leading-6 text-blue-800">
                            {isKhmer
                              ? leader.position_kh || leader.position_en
                              : leader.position_en || leader.position_kh}
                          </p>
                        )}

                        <div className="mt-4 space-y-2.5 text-sm leading-6 text-slate-600">
                          {/* ID Number */}
                          {leader.id_number && (
                            <div className="flex items-start gap-2">
                              <Fingerprint
                                size={17}
                                className="mt-1 shrink-0 text-blue-700"
                              />

                              <p className="min-w-0 break-words">
                                <span className="font-semibold text-slate-800">
                                  {isKhmer ? "លេខសម្គាល់" : "ID Number"}:
                                </span>{" "}
                                {leader.id_number}
                              </p>
                            </div>
                          )}

                          {/* Education */}
                          {(leader.education_kh || leader.education_en) && (
                            <div className="flex items-start gap-2">
                              <GraduationCap
                                size={17}
                                className="mt-1 shrink-0 text-blue-700"
                              />

                              <p className="min-w-0 break-words">
                                <span className="font-semibold text-slate-800">
                                  {isKhmer ? "កម្រិតវប្បធម៌" : "Education"}:
                                </span>{" "}
                                {isKhmer
                                  ? leader.education_kh || leader.education_en
                                  : leader.education_en || leader.education_kh}
                              </p>
                            </div>
                          )}

                          {/* Address */}
                          {(leader.address_kh || leader.address_en) && (
                            <div className="flex items-start gap-2">
                              <MapPin
                                size={17}
                                className="mt-1 shrink-0 text-blue-700"
                              />

                              <p className="min-w-0 break-words">
                                <span className="font-semibold text-slate-800">
                                  {isKhmer ? "អាសយដ្ឋាន" : "Address"}:
                                </span>{" "}
                                {isKhmer
                                  ? leader.address_kh || leader.address_en
                                  : leader.address_en || leader.address_kh}
                              </p>
                            </div>
                          )}

                          {/* Phone */}
                          {leader.phone && (
                            <div className="flex items-start gap-2">
                              <Phone
                                size={17}
                                className="mt-1 shrink-0 text-blue-700"
                              />

                              <p className="min-w-0 break-words">
                                <span className="font-semibold text-slate-800">
                                  {isKhmer ? "ទូរស័ព្ទ" : "Phone"}:
                                </span>{" "}
                                {leader.phone}
                              </p>
                            </div>
                          )}

                          {/* Email */}
                          {leader.email && (
                            <div className="flex items-start gap-2">
                              <Mail
                                size={17}
                                className="mt-1 shrink-0 text-blue-700"
                              />

                              <p className="min-w-0 break-words">
                                <span className="font-semibold text-slate-800">
                                  {isKhmer ? "អ៊ីមែល" : "Email"}:
                                </span>{" "}
                                <a
                                  href={`mailto:${leader.email}`}
                                  className="break-all transition hover:text-blue-700"
                                >
                                  {leader.email}
                                </a>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="order-2 min-w-0">
            {/* Recent News Component */}
            <RecentNews limit={3} />

            {/* Academy Information */}
            <div className="mt-5 rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-3 font-bold text-black">
                {isKhmer ? "អំពីបណ្ឌិត្យសភា" : "About the Academy"}
              </h3>

              <p className="mb-4 text-sm leading-7 text-gray-700">
                {isKhmer
                  ? "បណ្ឌិត្យសភានគរបាលកម្ពុជា មានតួនាទីក្នុងការបណ្តុះបណ្តាល និងអភិវឌ្ឍសមត្ថភាពមន្ត្រីនគរបាល។"
                  : "The Police Academy of Cambodia plays an important role in training and developing police officers."}
              </p>

              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                style={{ color: MAIN_COLOR }}
              >
                {isKhmer ? "ត្រឡប់ទៅទំព័រដើម" : "Return Home"}

                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Quick Links */}
            <div className="mt-5 overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div
                className="border-b-2 px-5 py-4"
                style={{ borderBottomColor: MAIN_COLOR }}
              >
                <h3 className="font-bold text-black">
                  {isKhmer ? "តំណភ្ជាប់រហ័ស" : "Quick Links"}
                </h3>
              </div>

              <div className="divide-y divide-gray-200">
                <Link
                  to="/"
                  className="flex items-center justify-between gap-3 p-4 text-sm text-gray-800 transition-colors hover:bg-gray-50"
                >
                  <span>{isKhmer ? "ទំព័រដើម" : "Home"}</span>

                  <ArrowRight
                    size={16}
                    className="shrink-0"
                    style={{ color: MAIN_COLOR }}
                  />
                </Link>

                <Link
                  to="/news"
                  className="flex items-center justify-between gap-3 p-4 text-sm text-gray-800 transition-colors hover:bg-gray-50"
                >
                  <span>{isKhmer ? "ព័ត៌មាន" : "News"}</span>

                  <ArrowRight
                    size={16}
                    className="shrink-0"
                    style={{ color: MAIN_COLOR }}
                  />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
