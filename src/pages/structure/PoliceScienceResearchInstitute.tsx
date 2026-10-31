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
  "https://djrrkrmnfgqbylvhhpap.supabase.co/storage/v1/object/public/leadership/Brigadier%20Yen%20Yat.jpg";

const responsibilities = [
  {
    en: "Acts as a secretariat for the Police Academy of Cambodia, manages and leads all the subordinating offices.",
    kh: "បំពេញតួនាទីជាលេខាធិការដ្ឋានរបស់បណ្ឌិត្យសភានគរបាលកម្ពុជា គ្រប់គ្រង និងដឹកនាំការិយាល័យចំណុះទាំងអស់។",
  },
  {
    en: "Conducts scientific research relating to issues of security and public order.",
    kh: "ធ្វើការស្រាវជ្រាវវិទ្យាសាស្ត្រពាក់ព័ន្ធនឹងបញ្ហាសន្តិសុខ និងសណ្តាប់ធ្នាប់សាធារណៈ។",
  },
  {
    en: "Builds research cooperation relations with national and international institutions having the same purposes and objectives.",
    kh: "កសាងទំនាក់ទំនងសហប្រតិបត្តិការស្រាវជ្រាវជាមួយស្ថាប័នជាតិ និងអន្តរជាតិដែលមានគោលបំណង និងគោលដៅដូចគ្នា។",
  },
  {
    en: "Collaborates in reviewing and evaluating students' and trainees' learning outcomes.",
    kh: "សហការពិនិត្យ និងវាយតម្លៃលទ្ធផលសិក្សារបស់និស្សិត សិស្ស និងសិក្ខាកាម។",
  },
  {
    en: "Collaborates in reviewing and evaluating forensic research findings and research development.",
    kh: "សហការពិនិត្យ និងវាយតម្លៃលទ្ធផលស្រាវជ្រាវកោសល្យវិច្ច័យ និងការអភិវឌ្ឍការស្រាវជ្រាវ។",
  },
  {
    en: "Compiles statistics and conducts crime analysis based on characteristics, ethnicity, race, religion, customs, traditions, territorial geography, logic, philosophy, procedures and laws, aiming to identify legal and procedural strengths and weaknesses as a basis for recommending appropriate legal reviews and amendments.",
    kh: "ប្រមូលស្ថិតិ និងវិភាគបទល្មើសដោយផ្អែកលើលក្ខណៈសម្បត្តិ ជាតិសាសន៍ ពូជសាសន៍ សាសនា ទំនៀមទម្លាប់ ប្រពៃណី ភូមិសាស្ត្រដែនដី តក្កវិជ្ជា ទស្សនវិជ្ជា នីតិវិធី និងច្បាប់ ដើម្បីកំណត់ចំណុចខ្លាំង និងចំណុចខ្សោយនៃច្បាប់ និងនីតិវិធី ជាមូលដ្ឋានសម្រាប់ផ្តល់អនុសាសន៍ពិនិត្យ និងកែសម្រួលច្បាប់ឱ្យបានសមស្រប។",
  },
  {
    en: "Collects and preserves research documents on national and international policing.",
    kh: "ប្រមូល និងរក្សាទុកឯកសារស្រាវជ្រាវពាក់ព័ន្ធនឹងនគរបាលជាតិ និងអន្តរជាតិ។",
  },
  {
    en: "Conducts training needs analysis and training gap assessments to design materials or provide recommendations to police teachers and instructors for revising and improving teaching materials and documents at all levels.",
    kh: "ធ្វើការវិភាគតម្រូវការបណ្តុះបណ្តាល និងគម្លាតបណ្តុះបណ្តាល ដើម្បីរៀបចំសម្ភារៈ ឬផ្តល់អនុសាសន៍ដល់គ្រូបង្រៀន និងគ្រូឧទ្ទេសនគរបាល ក្នុងការកែសម្រួល និងកែលម្អខ្លឹមសារឯកសារបង្រៀនគ្រប់កម្រិត។",
  },
  {
    en: "Prepares reports and recommendations for the Police Academy of Cambodia based on the above research findings.",
    kh: "រៀបចំរបាយការណ៍ និងអនុសាសន៍ជូនបណ្ឌិត្យសភានគរបាលកម្ពុជា ដោយផ្អែកលើលទ្ធផលស្រាវជ្រាវខាងលើ។",
  },
  {
    en: "Publishes recent research documents, achievements and findings.",
    kh: "ផ្សព្វផ្សាយឯកសារស្រាវជ្រាវ សមិទ្ធផល និងលទ្ធផលស្រាវជ្រាវថ្មីៗ។",
  },
  {
    en: "Manages and develops the library.",
    kh: "គ្រប់គ្រង និងអភិវឌ្ឍបណ្ណាល័យ។",
  },
  {
    en: "Manages and develops the laboratory.",
    kh: "គ្រប់គ្រង និងអភិវឌ្ឍមន្ទីរពិសោធន៍។",
  },
  {
    en: "Proposes plans and organizes comprehensive study programs for enrichment and improvement courses for police officers, senior police officers and general-level police officers on new specializations and approaches of the National Police in the context of security, social order and national development.",
    kh: "ស្នើផែនការ និងរៀបចំកម្មវិធីសិក្សារួមសម្រាប់វគ្គបំប៉ន និងពង្រឹងសមត្ថភាពដល់មន្ត្រីនគរបាល មន្ត្រីនគរបាលជាន់ខ្ពស់ និងមន្ត្រីនគរបាលគ្រប់កម្រិត លើជំនាញឯកទេស និងវិធីសាស្ត្រថ្មីៗរបស់នគរបាលជាតិ ក្នុងបរិបទសន្តិសុខ សណ្តាប់ធ្នាប់សង្គម និងការអភិវឌ្ឍជាតិ។",
  },
  {
    en: "Carries out other duties entrusted by the Police Academy of Cambodia.",
    kh: "អនុវត្តភារកិច្ចផ្សេងៗទៀតតាមការប្រគល់ជូនពីបណ្ឌិត្យសភានគរបាលកម្ពុជា។",
  },
];

const offices = [
  {
    en: "Administrative Office",
    kh: "ការិយាល័យរដ្ឋបាល",
  },
  {
    en: "Research Office of Criminology",
    kh: "ការិយាល័យស្រាវជ្រាវវិទ្យាសាស្ត្រឧក្រិដ្ឋកម្ម",
  },
  {
    en: "Legal Research Office",
    kh: "ការិយាល័យស្រាវជ្រាវច្បាប់",
  },
  {
    en: "Research Office of Leadership Science",
    kh: "ការិយាល័យស្រាវជ្រាវវិទ្យាសាស្ត្រភាពជាអ្នកដឹកនាំ",
  },
  {
    en: "Office of Enrichment and Improvement Training",
    kh: "ការិយាល័យបំប៉ន និងពង្រឹងការបណ្តុះបណ្តាល",
  },
  {
    en: "Library Management Office",
    kh: "ការិយាល័យគ្រប់គ្រងបណ្ណាល័យ",
  },
  {
    en: "Laboratory Management Office",
    kh: "ការិយាល័យគ្រប់គ្រងមន្ទីរពិសោធន៍",
  },
];

export default function PoliceScienceResearchInstitute() {
  const { i18n } = useTranslation();

  const isKhmer = i18n.language.toLowerCase().startsWith("kh");

  const languageText = (en: string, kh: string) => (isKhmer ? kh : en);

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
        {" "}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium hover:underline"
            style={{ color: MAIN_COLOR }}
          >
            {" "}
            <ArrowRight size={16} className="rotate-180" />
            {languageText("Home", "ទំព័រដើម")}{" "}
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
              "Police Science Research Institute",
              "វិទ្យាស្ថានស្រាវជ្រាវវិទ្យាសាស្ត្រនគរបាល",
            )}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={16} style={{ color: MAIN_COLOR }} />
              {languageText(
                "Wednesday, 23 October, 2019",
                "ថ្ងៃពុធ ទី២៣ ខែតុលា ឆ្នាំ២០១៩",
              )}
            </span>

            <span className="inline-flex items-center gap-2">
              <Eye size={16} style={{ color: MAIN_COLOR }} />
              {languageText("3.1K views", "ចំនួនទស្សនា ៣.១K")}
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
                  <Shield size={21} style={{ color: MAIN_COLOR }} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {languageText(
                      "Director of the Institute",
                      "ប្រធានវិទ្យាស្ថាន",
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
                      alt="Brigadier Yen Yat"
                      width={150}
                      height={205}
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
                        "Brigadier Yen Yat",
                        "ឧត្តមសេនីយ៍ត្រី យ៉េន យ៉ាត",
                      )}
                    </h3>

                    <p className="mt-1 font-semibold text-blue-800">
                      {languageText(
                        "Director of the Institute",
                        "ប្រធានវិទ្យាស្ថាន",
                      )}
                    </p>

                    <div className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                      <ProfileItem
                        icon={<Fingerprint size={17} />}
                        label={languageText("ID Number", "លេខសម្គាល់")}
                        value="91229"
                      />

                      <ProfileItem
                        icon={<GraduationCap size={17} />}
                        label={languageText("Education Level", "កម្រិតវប្បធម៌")}
                        value={languageText("Doctor", "បណ្ឌិត")}
                      />

                      <ProfileItem
                        icon={<MapPin size={17} />}
                        label={languageText("Address", "អាសយដ្ឋាន")}
                        value={languageText("Phnom Penh", "រាជធានីភ្នំពេញ")}
                      />

                      <ProfileItem
                        icon={<Phone size={17} />}
                        label={languageText("Mobile", "ទូរស័ព្ទ")}
                        value={
                          <a
                            href="tel:+85592439994"
                            className="transition hover:text-blue-700"
                          >
                            (+855) 92 439 994
                          </a>
                        }
                      />

                      <ProfileItem
                        icon={<Mail size={17} />}
                        label="Email"
                        value={
                          <a
                            href="mailto:yen.yat@interior.gov.kh"
                            className="break-all transition hover:text-blue-700"
                          >
                            yen.yat@interior.gov.kh
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
                  "Offices under the Institute",
                  "ការិយាល័យចំណុះវិទ្យាស្ថាន",
                )}
              />

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {offices.map((office, index) => (
                  <div
                    key={index}
                    className="group flex min-h-[105px] items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 transition group-hover:bg-blue-100">
                      <Building2 size={19} style={{ color: MAIN_COLOR }} />
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
                {languageText("About the Academy", "អំពីបណ្ឌិត្យសភា")}
              </h3>

              <p className="mb-4 text-sm leading-7 text-gray-700">
                {languageText(
                  "The Police Academy of Cambodia promotes scientific research, develops police knowledge and strengthens professional capabilities in security and public order.",
                  "បណ្ឌិត្យសភានគរបាលកម្ពុជា លើកកម្ពស់ការស្រាវជ្រាវវិទ្យាសាស្ត្រ អភិវឌ្ឍចំណេះដឹងនគរបាល និងពង្រឹងសមត្ថភាពវិជ្ជាជីវៈលើវិស័យសន្តិសុខ និងសណ្តាប់ធ្នាប់សាធារណៈ។",
                )}
              </p>

              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                style={{ color: MAIN_COLOR }}
              >
                {languageText("Return Home", "ត្រឡប់ទៅទំព័រដើម")}
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
                  {languageText("Quick Links", "តំណភ្ជាប់រហ័ស")}
                </h3>
              </div>

              <div className="divide-y divide-gray-200">
                <QuickLink to="/" label={languageText("Home", "ទំព័រដើម")} />

                <QuickLink to="/news" label={languageText("News", "ព័ត៌មាន")} />

                <QuickLink
                  to="/institution"
                  label={languageText("Institution", "អំពីស្ថាប័ន")}
                />

                <QuickLink
                  to="/structure"
                  label={languageText("Structure", "រចនាសម្ព័ន្ធ")}
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
      {" "}
      <span className="mt-1 shrink-0 text-blue-700">{icon}</span>
      <p className="min-w-0 break-words">
        <span className="font-semibold text-slate-800">{label}:</span> {value}
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
      {" "}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        {icon}{" "}
      </div>
      <div className="min-w-0">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function QuickLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-3 p-4 text-sm text-gray-800 transition-colors hover:bg-gray-50"
    >
      {" "}
      <span>{label}</span>
      <ArrowRight
        size={16}
        className="shrink-0"
        style={{ color: MAIN_COLOR }}
      />
    </Link>
  );
}
