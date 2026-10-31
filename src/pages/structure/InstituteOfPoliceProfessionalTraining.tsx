
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
  "https://djrrkrmnfgqbylvhhpap.supabase.co/storage/v1/object/public/leadership/Brigadier%20Khem%20Sary.jpg";

const responsibilities = [
  {
    en: "Considers in setting the direction for the national police training plan on police specialization for associate and bachelor degree level as determined by the Police Academy of Cambodia and the Ministry of Interior.",
    kh: "ចូលរួមកំណត់ទិសដៅផែនការបណ្តុះបណ្តាលនគរបាលជាតិលើជំនាញនគរបាលកម្រិតបរិញ្ញាបត្ររង និងបរិញ្ញាបត្រ តាមការកំណត់របស់បណ្ឌិត្យសភានគរបាលកម្ពុជា និងក្រសួងមហាផ្ទៃ។",
  },
  {
    en: "Takes action in implementing the educational and training plan in compliance with the programs of the Police Academy of Cambodia and the Ministry of Interior.",
    kh: "អនុវត្តផែនការអប់រំ និងបណ្តុះបណ្តាលឱ្យស្របតាមកម្មវិធីរបស់បណ្ឌិត្យសភានគរបាលកម្ពុជា និងក្រសួងមហាផ្ទៃ។",
  },
  {
    en: "Organizes the study materials, instruction and teaching, and manages the teaching staff on security, public order, judicial police and border police specialization.",
    kh: "រៀបចំឯកសារសិក្សា ការបង្រៀន និងគ្រប់គ្រងគ្រូបង្រៀនលើជំនាញសន្តិសុខ សណ្តាប់ធ្នាប់សាធារណៈ នគរបាលយុត្តិធម៌ និងនគរបាលការពារព្រំដែន។",
  },
  {
    en: "Manages the offices, departments, classrooms and teaching materials under the administration of the institute.",
    kh: "គ្រប់គ្រងការិយាល័យ នាយកដ្ឋាន បន្ទប់សិក្សា និងសម្ភារៈបង្រៀនដែលស្ថិតក្រោមការគ្រប់គ្រងរបស់វិទ្យាស្ថាន។",
  },
  {
    en: "Manages, designs and develops the educational curriculum and study materials.",
    kh: "គ្រប់គ្រង រៀបចំ និងអភិវឌ្ឍកម្មវិធីសិក្សា និងឯកសារសិក្សា។",
  },
  {
    en: "Proposes the plan for budgeting and material supplies of the institute.",
    kh: "ស្នើផែនការថវិកា និងការផ្គត់ផ្គង់សម្ភារៈសម្រាប់វិទ្យាស្ថាន។",
  },
  {
    en: "Consolidates the performance results and makes reports for submitting to the President of the Police Academy of Cambodia.",
    kh: "ប្រមូលផ្តុំលទ្ធផលការងារ និងរៀបចំរបាយការណ៍ដាក់ជូនប្រធានបណ្ឌិត្យសភានគរបាលកម្ពុជា។",
  },
  {
    en: "Collaborates with concerned institutions to carry out the educational process as determined by the Police Academy of Cambodia and the Ministry of Interior.",
    kh: "សហការជាមួយស្ថាប័នពាក់ព័ន្ធ ដើម្បីអនុវត្តដំណើរការអប់រំតាមការកំណត់របស់បណ្ឌិត្យសភានគរបាលកម្ពុជា និងក្រសួងមហាផ្ទៃ។",
  },
  {
    en: "Carries out other duties entrusted by the higher authorities.",
    kh: "អនុវត្តភារកិច្ចផ្សេងៗទៀតតាមការប្រគល់ជូនពីថ្នាក់ដឹកនាំ។",
  },
];

const departments = [
  {
    en: "Administrative Office",
    kh: "ការិយាល័យរដ្ឋបាល",
  },
  {
    en: "Office of Planning and Curriculum",
    kh: "ការិយាល័យផែនការ និងកម្មវិធីសិក្សា",
  },
  {
    en: "Office of Practicum",
    kh: "ការិយាល័យកម្មសិក្សា",
  },
  {
    en: "Department of Martial Arts and Physical Education",
    kh: "នាយកដ្ឋានក្បាច់គុន និងអប់រំកាយ",
  },
  {
    en: "Department of Order Practice and Individual Tactics",
    kh: "នាយកដ្ឋានអនុវត្តសណ្តាប់ធ្នាប់ និងយុទ្ធវិធីបុគ្គល",
  },
  {
    en: "Department of Security",
    kh: "នាយកដ្ឋានសន្តិសុខ",
  },
  {
    en: "Department of Judicial Police",
    kh: "នាយកដ្ឋាននគរបាលយុត្តិធម៌",
  },
  {
    en: "Department of Public Order",
    kh: "នាយកដ្ឋានសណ្តាប់ធ្នាប់សាធារណៈ",
  },
  {
    en: "Department of Border Police Specialization",
    kh: "នាយកដ្ឋានជំនាញនគរបាលការពារព្រំដែន",
  },
];

export default function InstituteOfPoliceProfessionalTraining() {
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
              "Institute of Police Professional Training",
              "វិទ្យាស្ថានបណ្តុះបណ្តាលវិជ្ជាជីវៈនគរបាល",
            )}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={16} style={{ color: MAIN_COLOR }} />
              {languageText(
                "Tuesday, 22 October, 2019",
                "ថ្ងៃអង្គារ ទី២២ ខែតុលា ឆ្នាំ២០១៩",
              )}
            </span>

            <span className="inline-flex items-center gap-2">
              <Eye size={16} style={{ color: MAIN_COLOR }} />
              {languageText("3.5K views", "ចំនួនទស្សនា ៣.៥K")}
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
                      "Director of Institute",
                      "នាយកវិទ្យាស្ថាន",
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
                      alt="Brigadier General Khem Sary"
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
                        "Brigadier General Khem Sary",
                        "ឧត្តមសេនីយ៍ត្រី ខែម សារី",
                      )}
                    </h3>

                    <p className="mt-1 font-semibold text-blue-800">
                      {languageText(
                        "Director of Institute",
                        "នាយកវិទ្យាស្ថាន",
                      )}
                    </p>

                    <div className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                      <ProfileItem
                        icon={<Fingerprint size={17} />}
                        label={languageText("ID Number", "លេខសម្គាល់")}
                        value="58030"
                      />

                      <ProfileItem
                        icon={<GraduationCap size={17} />}
                        label={languageText("Education Level", "កម្រិតវប្បធម៌")}
                        value={languageText(
                          "Master Degree",
                          "បរិញ្ញាបត្រជាន់ខ្ពស់",
                        )}
                      />

                      <ProfileItem
                        icon={<MapPin size={17} />}
                        label={languageText("Address", "អាសយដ្ឋាន")}
                        value={languageText(
                          "Phnom Penh",
                          "រាជធានីភ្នំពេញ",
                        )}
                      />

                      <ProfileItem
                        icon={<Phone size={17} />}
                        label={languageText("Mobile", "ទូរស័ព្ទ")}
                        value="(+855) 077 56 07 07"
                      />

                      <ProfileItem
                        icon={<Mail size={17} />}
                        label="Email"
                        value={
                          <a
                            href="mailto:khemsary@gmail.com"
                            className="break-all transition hover:text-blue-700"
                          >
                            khemsary@gmail.com
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
                  "Structure of Institute",
                  "រចនាសម្ព័ន្ធវិទ្យាស្ថាន",
                )}
                subtitle={languageText(
                  "Departments and offices under the Institute",
                  "នាយកដ្ឋាន និងការិយាល័យចំណុះវិទ្យាស្ថាន",
                )}
              />

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {departments.map((department, index) => (
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
                        {languageText(department.en, department.kh)}
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
                  "The Police Academy of Cambodia plays an important role in training and developing the professional capabilities of police officers.",
                  "បណ្ឌិត្យសភានគរបាលកម្ពុជា មានតួនាទីសំខាន់ក្នុងការបណ្តុះបណ្តាល និងអភិវឌ្ឍសមត្ថភាពវិជ្ជាជីវៈមន្ត្រីនគរបាល។",
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
      <span className="mt-1 shrink-0 text-blue-700">{icon}</span>

      <p className="min-w-0 break-words">
        <span className="font-semibold text-slate-800">{label}:</span>{" "}
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
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
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

