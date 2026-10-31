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
  "https://djrrkrmnfgqbylvhhpap.supabase.co/storage/v1/object/public/leadership/Major%20General%20Bun%20Pheakdey.jpg";

const responsibilities = [
  {
    en: "Acts as the secretariat for PAC on overall administrative, management and leadership affairs over subordinating bodies.",
    kh: "បំពេញតួនាទីជាលេខាធិការដ្ឋានរបស់បណ្ឌិត្យសភា លើកិច្ចការរដ្ឋបាល ការគ្រប់គ្រង និងការដឹកនាំទូទៅរបស់អង្គភាពចំណុះ។",
  },
  {
    en: "Prepares working programs and various missions for PAC leadership.",
    kh: "រៀបចំកម្មវិធីការងារ និងបេសកកម្មផ្សេងៗជូនថ្នាក់ដឹកនាំបណ្ឌិត្យសភា។",
  },
  {
    en: "Organizes meetings, conferences, workshops/seminars and drafts agendas for opening/closing ceremonies of training courses under PAC.",
    kh: "រៀបចំកិច្ចប្រជុំ សន្និសីទ សិក្ខាសាលា និងរៀបចំរបៀបវារៈសម្រាប់ពិធីបើក និងបិទវគ្គបណ្តុះបណ្តាលក្រោមឱវាទបណ្ឌិត្យសភា។",
  },
  {
    en: "Formulates concerned legal instruments.",
    kh: "រៀបចំលិខិតបទដ្ឋានគតិយុត្តដែលពាក់ព័ន្ធ។",
  },
  {
    en: "Conducts international relations concerning PAC affairs.",
    kh: "អនុវត្តកិច្ចការទំនាក់ទំនងអន្តរជាតិដែលពាក់ព័ន្ធនឹងកិច្ចការរបស់បណ្ឌិត្យសភា។",
  },
  {
    en: "Extends hospitality to national/international visitors.",
    kh: "ទទួលបដិសណ្ឋារកិច្ចចំពោះភ្ញៀវជាតិ និងអន្តរជាតិ។",
  },
  {
    en: "Serves personnel affairs of national police, police officers, junior police officer students/trainees.",
    kh: "បម្រើការងារបុគ្គលិក និងធនធានមនុស្សរបស់នគរបាលជាតិ មន្ត្រីនគរបាល និងសិស្សនគរបាលជាន់ខ្ពស់ និងសិក្ខាកាម។",
  },
  {
    en: "Formulates recruitment and student admission criteria.",
    kh: "រៀបចំលក្ខខណ្ឌជ្រើសរើស និងលក្ខណៈវិនិច្ឆ័យក្នុងការជ្រើសរើសសិស្សចូលសិក្សា។",
  },
  {
    en: "Designs certificates/degrees for graduated trainees and students at all levels.",
    kh: "រៀបចំរចនាប័ទ្មវិញ្ញាបនបត្រ និងសញ្ញាបត្រសម្រាប់សិក្ខាកាម និងសិស្សដែលបានបញ្ចប់ការសិក្សាគ្រប់កម្រិត។",
  },
  {
    en: "Manages and controls existing trainees and students.",
    kh: "គ្រប់គ្រង និងត្រួតពិនិត្យសិក្ខាកាម និងសិស្សដែលកំពុងសិក្សា។",
  },
  {
    en: "Health checks and provides primary treatment to trainees and students.",
    kh: "ពិនិត្យសុខភាព និងផ្តល់ការព្យាបាលបឋមដល់សិក្ខាកាម និងសិស្ស។",
  },
  {
    en: "Security protection, maintenance and general hygiene.",
    kh: "អនុវត្តការងារការពារសន្តិសុខ ថែទាំ និងអនាម័យទូទៅ។",
  },
  {
    en: "Prepares budget/materials/means/fuel planning for police education/training and PAC operation; manages incomes, payment clearance per financial procedure, monitors annual budget.",
    kh: "រៀបចំផែនការថវិកា សម្ភារៈ មធ្យោបាយ និងប្រេងឥន្ធនៈ សម្រាប់ការអប់រំ និងបណ្តុះបណ្តាលនគរបាល ព្រមទាំងប្រតិបត្តិការរបស់បណ្ឌិត្យសភា គ្រប់គ្រងចំណូល ការទូទាត់តាមនីតិវិធីហិរញ្ញវត្ថុ និងតាមដានការអនុវត្តថវិកាប្រចាំឆ្នាំ។",
  },
  {
    en: "Manages equipment, means, materials, movable/immovable assets and canteens.",
    kh: "គ្រប់គ្រងបរិក្ខារ មធ្យោបាយ សម្ភារៈ ទ្រព្យសម្បត្តិចល័ត និងអចលនវត្ថុ ព្រមទាំងអាហារដ្ឋាន។",
  },
  {
    en: "Develops PAC development plan.",
    kh: "រៀបចំផែនការអភិវឌ្ឍន៍បណ្ឌិត្យសភានគរបាលកម្ពុជា។",
  },
  {
    en: "Carries out other duties entrusted by higher authorities.",
    kh: "អនុវត្តភារកិច្ចផ្សេងៗទៀតតាមការប្រគល់ជូនពីថ្នាក់ដឹកនាំ។",
  },
];

const offices = [
  {
    en: "Administrative Office",
    kh: "ការិយាល័យរដ្ឋបាល",
  },
  {
    en: "Personnel Office",
    kh: "ការិយាល័យបុគ្គលិក",
  },
  {
    en: "Supplies Office",
    kh: "ការិយាល័យផ្គត់ផ្គង់",
  },
  {
    en: "Office of Planning and Financial Affairs",
    kh: "ការិយាល័យផែនការ និងហិរញ្ញវត្ថុ",
  },
  {
    en: "Office of Students Affairs",
    kh: "ការិយាល័យកិច្ចការសិស្ស",
  },
  {
    en: "Office of Protocol and Relations",
    kh: "ការិយាល័យពិធីការ និងទំនាក់ទំនង",
  },
  {
    en: "Health Office",
    kh: "ការិយាល័យសុខាភិបាល",
  },
  {
    en: "Office of Protection and Maintenance",
    kh: "ការិយាល័យការពារ និងថែទាំ",
  },
  {
    en: "Office of Data Management",
    kh: "ការិយាល័យគ្រប់គ្រងទិន្នន័យ",
  },
];

export default function Directorate() {
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
            {languageText("Directorate", "នាយកដ្ឋាន")}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={16} style={{ color: MAIN_COLOR }} />
              {languageText(
                "Thursday, 24 October, 2019",
                "ថ្ងៃព្រហស្បតិ៍ ទី២៤ ខែតុលា ឆ្នាំ២០១៩",
              )}
            </span>

            <span className="inline-flex items-center gap-2">
              <Eye size={16} style={{ color: MAIN_COLOR }} />
              {languageText("3.4K views", "ចំនួនទស្សនា ៣.៤K")}
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
                    {languageText("Director of Directorate", "ប្រធាននាយកដ្ឋាន")}
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    {languageText(
                      "Directorate Leadership",
                      "ថ្នាក់ដឹកនាំនាយកដ្ឋាន",
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
                      alt="Major General Bun Pheakdey"
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
                        "Major General Bun Pheakdey",
                        "ឧត្តមសេនីយ៍ទោ ប៊ុន ភក្ដី",
                      )}
                    </h3>

                    <p className="mt-1 font-semibold text-blue-800">
                      {languageText(
                        "Director of Directorate",
                        "ប្រធាននាយកដ្ឋាន",
                      )}
                    </p>

                    <div className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                      <ProfileItem
                        icon={<Fingerprint size={17} />}
                        label={languageText("ID Number", "លេខសម្គាល់")}
                        value="70850"
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
                        value="010 50 40 50"
                      />

                      <ProfileItem
                        icon={<Mail size={17} />}
                        label="Email"
                        value={
                          <a
                            href="mailto:bun.pheakdey@interior.gov.kh"
                            className="break-all transition hover:text-blue-700"
                          >
                            bun.pheakdey@interior.gov.kh
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
                  "Main responsibilities of the Directorate",
                  "ភារកិច្ចសំខាន់ៗរបស់នាយកដ្ឋាន",
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
                  "Structure of Directorate",
                  "រចនាសម្ព័ន្ធនាយកដ្ឋាន",
                )}
                subtitle={languageText(
                  "Offices under the Directorate",
                  "ការិយាល័យចំណុះនាយកដ្ឋាន",
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