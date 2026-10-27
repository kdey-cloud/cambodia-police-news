
import {
  ShieldCheck,
  GraduationCap,
  Users,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const informationCards = [
  {
    id: 1,
    title: "Institution",
    description:
      "Learn about the institution, its mission, and its commitment to public service.",
    image:
      "https://images.unsplash.com/photo-1453873531674-2151bcd01707?auto=format&fit=crop&w=800&q=85",
    icon: ShieldCheck,
    href: "/institution",
  },
  {
    id: 2,
    title: "Study Programs",
    description:
      "Discover educational programs, professional training, and learning opportunities.",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=85",
    icon: GraduationCap,
    href: "/study-program",
  },
  {
    id: 3,
    title: "Community",
    description:
      "Explore public information, community initiatives, and important announcements.",
    image:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=85",
    icon: Users,
    href: "/information",
  },
];

export default function PublicInformation() {
  const { t } = useTranslation();

  return (
    <section className="bg-gray-50 py-10 sm:py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-5">
        {/* Section heading */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-600 sm:text-sm">
              {t("publicInformation")}
            </p>

            <h2 className="text-xl font-extrabold text-blue-950 sm:text-2xl md:text-3xl">
              Explore Our Institution
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 sm:mt-3 md:text-base">
              {t("publicInformationDescription")}
            </p>
          </div>

          <a
            href="/information"
            className="inline-flex w-fit shrink-0 items-center gap-2 text-sm font-bold text-blue-900 transition hover:text-amber-600"
          >
            {t("learnMore")}
            <ArrowRight size={17} />
          </a>
        </div>

        {/* Information cards */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {informationCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.id}
                className="group flex overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:flex-col"
              >
                {/* Image */}
                <div className="relative h-auto min-h-[145px] w-[36%] shrink-0 overflow-hidden sm:h-52 sm:min-h-0 sm:w-full">
                  <img
                    src={card.image}
                    alt={card.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/60 to-transparent" />

                  <div className="absolute bottom-2 left-2 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 text-blue-950 shadow-md sm:bottom-4 sm:left-4 sm:h-12 sm:w-12">
                    <Icon size={20} className="sm:hidden" />
                    <Icon size={25} className="hidden sm:block" />
                  </div>
                </div>

                {/* Card content */}
                <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-6">
                  <h3 className="text-base font-bold leading-snug text-blue-950 sm:text-xl">
                    {card.title}
                  </h3>

                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-gray-600 sm:mt-3 sm:line-clamp-none sm:text-sm sm:leading-7">
                    {card.description}
                  </p>

                  <a
                    href={card.href}
                    className="mt-auto inline-flex w-fit items-center gap-1 pt-3 text-xs font-bold text-blue-900 transition hover:text-amber-600 sm:mt-5 sm:gap-2 sm:pt-0 sm:text-sm"
                  >
                    {t("learnMore")}
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1 sm:h-4 sm:w-4"
                    />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

