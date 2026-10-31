import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  CalendarDays,
  Eye,
  Fingerprint,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Shield,
  Building2,
  ClipboardList,
} from "lucide-react";

import RecentNews from "../../components/news/RecentNews";

const MAIN_COLOR = "#1D4ED8";

const directorImage =
  "https://djrrkrmnfgqbylvhhpap.supabase.co/storage/v1/object/public/leadership/Colonel%20keb%20bunly.jpg";

const responsibilities = [
  {
    en: "Considers setting directions for educational plans for Master's and Doctoral students according to each specialization.",
    kh: "ពិចារណាកំណត់ទិសដៅផែនការអប់រំសម្រាប់និស្សិតថ្នាក់បរិញ្ញាបត្រជាន់ខ្ពស់ និងថ្នាក់បណ្ឌិត តាមជំនាញនីមួយៗ។",
  },
  {
    en: "Assigns and implements educational plans as determined by the Police Academy of Cambodia.",
    kh: "រៀបចំចាត់ចែង និងអនុវត្តផែនការអប់រំតាមការកំណត់របស់បណ្ឌិត្យសភានគរបាលកម្ពុជា។",
  },
  {
    en: "Organizes teaching materials and manages teaching staff involved in postgraduate studies.",
    kh: "រៀបចំសម្ភារៈបង្រៀន និងគ្រប់គ្រងបុគ្គលិកបង្រៀនដែលពាក់ព័ន្ធនឹងការសិក្សាថ្នាក់ក្រោយបរិញ្ញាបត្រ។",
  },
  {
    en: "Manages and designs postgraduate curricula according to each specialization.",
    kh: "គ្រប់គ្រង និងរៀបចំកម្មវិធីសិក្សាថ្នាក់ក្រោយបរិញ្ញាបត្រ តាមជំនាញនីមួយៗ។",
  },
  {
    en: "Prepares budget plans and material supplies for postgraduate teaching.",
    kh: "រៀបចំផែនការថវិកា និងការផ្គត់ផ្គង់សម្ភារៈសម្រាប់ការបង្រៀនថ្នាក់ក្រោយបរិញ្ញាបត្រ។",
  },
  {
    en: "Collaborates with relevant institutions to effectively perform assigned tasks.",
    kh: "សហការជាមួយស្ថាប័នពាក់ព័ន្ធ ដើម្បីអនុវត្តភារកិច្ចដែលបានប្រគល់ជូនឱ្យមានប្រសិទ្ធភាព។",
  },
  {
    en: "Consolidates performance results and reports to the President of the Police Academy of Cambodia.",
    kh: "ប្រមូលផ្តុំលទ្ធផលការងារ និងរាយការណ៍ជូនប្រធានបណ្ឌិត្យសភានគរបាលកម្ពុជា។",
  },
  {
    en: "Carries out other duties entrusted by higher authorities.",
    kh: "អនុវត្តភារកិច្ចផ្សេងៗទៀតតាមការប្រគល់ជូនពីថ្នាក់ដឹកនាំ។",
  },
];

const offices = [
  {
    en: "Administrative Section",
    kh: "ផ្នែករដ្ឋបាល",
  },
  {
    en: "Academic Section",
    kh: "ផ្នែកសិក្សា",
  },
  {
    en: "Curriculum Section",
    kh: "ផ្នែកកម្មវិធីសិក្សា",
  },
  {
    en: "Section of Project Paper Writing and Thesis Management",
    kh: "ផ្នែកសរសេររបាយការណ៍គម្រោង និងគ្រប់គ្រងនិក្ខេបបទ",
  },
];

export default function PostgraduateInstitute() {
  const { i18n } = useTranslation();

  const isKhmer = i18n.language.toLowerCase().startsWith("kh");

  const languageText = (en: string, kh: string) =>
    isKhmer ? kh : en;

  return (
    <main
      lang={isKhmer ? "kh" : "en"}
      className={`min-h-screen bg-gray-50 text-black ${
        isKhmer ? "font-battambang" : "font-inter"
      }`}
    >
      {/* ================= PAGE HEADER ================= */}
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

            {languageText("Home", "ទំព័រដើម")}
          </Link>

          <p
            className="mb-2 text-sm font-semibold uppercase tracking-wider"
            style={{ color: MAIN_COLOR }}
          >
            {languageText(
              "Police Academy of Cambodia",
              "បណ្ឌិត្យសភានគរបាលកម្ពុជា",
            )}
          </p>

          <h1 className="text-3xl font-bold leading-tight text-black sm:text-4xl">
            {languageText(
              "Post Graduate Studies Institute",
              "វិទ្យាស្ថានសិក្សាក្រោយបរិញ្ញាបត្រ",
            )}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600">
            <span className="inline-flex items-center gap-2">
              <CalendarDays
                size={16}
                style={{ color: MAIN_COLOR }}
              />

              {languageText(
                "Monday, 23 September, 2019",
                "ថ្ងៃចន្ទ ទី២៣ ខែកញ្ញា ឆ្នាំ២០១៩",
              )}
            </span>

            <span className="inline-flex items-center gap-2">
              <Eye size={16} style={{ color: MAIN_COLOR }} />

              {languageText("2.5K views", "ចំនួនទស្សនា ២.៥K")}
            </span>
          </div>
        </div>
      </section>

      {/* ================= MAIN CONTENT ================= */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <article className="min-w-0 space-y-8">
            {/* ================= DIRECTOR PROFILE ================= */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Shield
                    size={21}
                    style={{ color: MAIN_COLOR }}
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {languageText(
                      "Director of Post Graduate Studies Institute",
                      "នាយកវិទ្យាស្ថានសិក្សាក្រោយបរិញ្ញាបត្រ",
                    )}
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    {languageText(
                      "Institute Leadership",
                      "ថ្នាក់ដឹកនាំវិទ្យាស្ថាន",
                    )}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-[260px_minmax(0,1fr)]">
                  {/* Director Image */}
                  <div className="flex min-h-[280px] items-center justify-center bg-slate-50 p-4">
                    <img
                      src={directorImage}
                      alt="Kep Bunly"
                      width={640}
                      height={800}
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      className="max-h-[340px] w-full object-contain"
                    />
                  </div>

                  {/* Director Information */}
                  <div className="min-w-0 p-5 sm:p-6">
                    <h3 className="text-xl font-bold leading-8 text-slate-900">
                      {languageText(
                        "Kep Bunly",
                        "វរសេនីយ៍ឯក កែប ប៊ុនលី",
                      )}
                    </h3>

                    <p className="mt-1 font-semibold text-blue-800">
                      {languageText(
                        "Director of Post Graduate Studies Institute",
                        "នាយកវិទ្យាស្ថានសិក្សាក្រោយបរិញ្ញាបត្រ",
                      )}
                    </p>

                    <div className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                      <ProfileItem
                        icon={<Fingerprint size={17} />}
                        label={languageText(
                          "ID Number",
                          "លេខសម្គាល់",
                        )}
                        value="86512"
                      />

                      <ProfileItem
                        icon={<GraduationCap size={17} />}
                        label={languageText(
                          "Education Level",
                          "កម្រិតវប្បធម៌",
                        )}
                        value={languageText("Doctor", "បណ្ឌិត")}
                      />

                      <ProfileItem
                        icon={<MapPin size={17} />}
                        label={languageText(
                          "Address",
                          "អាសយដ្ឋាន",
                        )}
                        value={languageText(
                          "Phnom Penh",
                          "រាជធានីភ្នំពេញ",
                        )}
                      />

                      <ProfileItem
                        icon={<Phone size={17} />}
                        label={languageText(
                          "Mobile",
                          "ទូរស័ព្ទ",
                        )}
                        value="(855) 96 7802191"
                      />

                      <ProfileItem
                        icon={<Mail size={17} />}
                        label="Email"
                        value={
                          <a
                            href="mailto:kepbunly79@gmail.com"
                            className="break-all transition hover:text-blue-700"
                          >
                            kepbunly79@gmail.com
                          </a>
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ================= RESPONSIBILITIES ================= */}
            <section>
              <SectionHeading
                icon={<ClipboardList size={21} />}
                title={languageText(
                  "Roles and Responsibilities",
                  "តួនាទី និងភារកិច្ច",
                )}
                subtitle={languageText(
                  "Main responsibilities of the Institute",
                  "ភារកិច្ចសំខាន់ៗរបស់វិទ្យាស្ថាន",
                )}
              />

              <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
                <ol className="divide-y divide-slate-100">
                  {responsibilities.map((item, index) => (
                    <li
                      key={index}
                      className="flex gap-4 px-4 py-4 transition-colors hover:bg-slate-50 sm:px-5"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-800">
                        {index + 1}
                      </span>

                      <p className="min-w-0 pt-1 text-sm leading-7 text-slate-700">
                        {languageText(item.en, item.kh)}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            {/* ================= STRUCTURE ================= */}
            <section>
              <SectionHeading
                icon={<Building2 size={21} />}
                title={languageText(
                  "Structure of the Institute",
                  "រចនាសម្ព័ន្ធវិទ្យាស្ថាន",
                )}
                subtitle={languageText(
                  "Sections under the Post Graduate Studies Institute",
                  "ផ្នែកចំណុះវិទ្យាស្ថានសិក្សាក្រោយបរិញ្ញាបត្រ",
                )}
              />

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {offices.map((office, index) => (
                  <div
                    key={index}
                    className="group flex min-h-[105px] items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 transition group-hover:bg-blue-100">
                      <Building2
                        size={19}
                        style={{ color: MAIN_COLOR }}
                      />
                    </div>

                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-blue-700">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <h3 className="mt-1 text-sm font-semibold leading-6 text-slate-800">
                        {languageText(office.en, office.kh)}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </article>

          {/* ================= SIDEBAR ================= */}
          <aside className="min-w-0">
            <RecentNews limit={3} />

            {/* Academy Information */}
            <div className="mt-5 rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-3 font-bold text-black">
                {languageText(
                  "About the Academy",
                  "អំពីបណ្ឌិត្យសភា",
                )}
              </h3>

              <p className="mb-4 text-sm leading-7 text-gray-700">
                {languageText(
                  "The Police Academy of Cambodia plays an important role in training and developing the professional capabilities of police officers.",
                  "បណ្ឌិត្យសភានគរបាលកម្ពុជា មានតួនាទីសំខាន់ក្នុងការបណ្តុះបណ្តាល និងអភិវឌ្ឍសមត្ថភាពវិជ្ជាជីវៈមន្ត្រីនគរបាល។",
                )}
              </p>

              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                style={{ color: MAIN_COLOR }}
              >
                {languageText(
                  "Return Home",
                  "ត្រឡប់ទៅទំព័រដើម",
                )}

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
                  {languageText(
                    "Quick Links",
                    "តំណភ្ជាប់រហ័ស",
                  )}
                </h3>
              </div>

              <div className="divide-y divide-gray-200">
                <QuickLink
                  to="/"
                  label={languageText("Home", "ទំព័រដើម")}
                />

                <QuickLink
                  to="/news"
                  label={languageText("News", "ព័ត៌មាន")}
                />

                <QuickLink
                  to="/institution"
                  label={languageText(
                    "Institution",
                    "អំពីស្ថាប័ន",
                  )}
                />

                <QuickLink
                  to="/structure"
                  label={languageText(
                    "Structure",
                    "រចនាសម្ព័ន្ធ",
                  )}
                />
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function ProfileItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-1 shrink-0 text-blue-700">
        {icon}
      </span>

      <p className="min-w-0 break-words">
        <span className="font-semibold text-slate-800">
          {label}:
        </span>{" "}
        {value}
      </p>
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        {icon}
      </div>

      <div className="min-w-0">
        <h2 className="text-xl font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-0.5 text-sm text-slate-500">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function QuickLink({
  to,
  label,
}: {
  to: string;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-3 p-4 text-sm text-gray-800 transition-colors hover:bg-gray-50"
    >
      <span>{label}</span>

      <ArrowRight
        size={16}
        className="shrink-0"
        style={{ color: MAIN_COLOR }}
      />
    </Link>
  );
}