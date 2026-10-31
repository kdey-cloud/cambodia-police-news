import { useEffect } from "react";
// import { ArrowLeft, ArrowRight } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function Hero() {
  const { i18n } = useTranslation();

  const language = (
    i18n.resolvedLanguage ||
    i18n.language ||
    "en"
  ).toLowerCase();

  const isKhmer = language.startsWith("kh") || language.startsWith("kh");

  useEffect(() => {
    document.documentElement.lang = isKhmer ? "kh" : "en";
  }, [isKhmer]);

  return (
    <section
      className="
        relative isolate flex items-center overflow-hidden
        bg-slate-950 text-white
        xl:min-h-[calc(100svh-128px)]
      "
    >
      {/* Background image */}

      <div className="absolute inset-0 -z-20">
        <img
          src="/hero-academy.jpg"
          alt=""
          className="
      h-full w-full object-cover object-center
      [mask-image:linear-gradient(to_bottom,black_calc(10%-20px),transparent_100%)]
    "
        />
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-950/95 via-blue-950/85 to-slate-950/50" />

      {/* Main content */}
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-8 sm:py-10 xl:px-12 xl:py-8">
        <div className="max-w-4xl">
          {/* Academy name */}
          <div
            className={`mb-3 inline-flex items-center gap-2 sm:mb-4 sm:gap-3 ${
              isKhmer ? "font-khmer" : "font-english"
            }`}
          >
            <span className="h-[2px] w-5 shrink-0 bg-amber-400 sm:w-8" />

            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-300 sm:text-sm sm:tracking-[0.15em]">
              {isKhmer
                ? "បណ្ឌិត្យសភានគរបាលកម្ពុជា"
                : "POLICE ACADEMY OF CAMBODIA"}
            </span>
          </div>

          {/* Heading */}
          <h1
            className={`max-w-4xl text-2xl font-normal leading-snug sm:text-4xl sm:leading-[1.35] xl:text-5xl ${
              isKhmer ? "font-moul" : "font-english font-extrabold"
            }`}
          >
            {isKhmer ? (
              <>
                បម្រើសហគមន៍
                <br />
                ការពារអនាគត
              </>
            ) : (
              <>
                Serving the Community.
                <br />
                <span className="text-amber-300">Protecting the Future.</span>
              </>
            )}
          </h1>

          {/* Description */}
          <p
            className={`mt-3 max-w-2xl text-xs leading-6 text-blue-50/90 sm:mt-4 sm:text-base sm:leading-8 ${
              isKhmer ? "font-khmer" : "font-english"
            }`}
          >
            {isKhmer
              ? "បណ្ឌិត្យសភានគរបាលកម្ពុជា ប្តេជ្ញាចិត្តក្នុងការអប់រំ បណ្តុះបណ្តាល និងអភិវឌ្ឍសមត្ថភាពមន្ត្រីនគរបាល ដើម្បីបម្រើប្រជាពលរដ្ឋ និងរក្សាសន្តិសុខសង្គម។"
              : "The Police Academy of Cambodia is committed to educating, training, and developing professional police officers dedicated to serving the people and protecting public safety."}
          </p>

          {/* Buttons */}
          <div className="mt-4 flex flex-col gap-2 min-[380px]:flex-row sm:mt-5 sm:gap-3">
            <Link
              to="/institution/background"
              className={`group inline-flex min-h-9 items-center justify-center gap-2 bg-amber-400 px-4 py-2 text-xs font-bold text-blue-950 transition hover:bg-amber-300 sm:min-h-11 sm:px-5 sm:py-2.5 sm:text-sm ${
                isKhmer ? "font-khmer" : "font-english"
              }`}
            >
              {isKhmer ? "ស្វែងយល់បន្ថែម" : "Learn More"}

              <ArrowUpRight
                size={15}
                className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:h-[17px] sm:w-[17px]"
              />
            </Link>

            <Link
              to="/public-information"
              className={`inline-flex min-h-9 items-center justify-center border border-white/50 px-4 py-2 text-xs font-semibold text-white transition hover:border-white hover:bg-white/10 sm:min-h-11 sm:px-5 sm:py-2.5 sm:text-sm ${
                isKhmer ? "font-khmer" : "font-english"
              }`}
            >
              {isKhmer ? "ព័ត៌មានសាធារណៈ" : "Public Information"}
            </Link>
          </div>

          {/* Core values */}
          <div className="mt-5 grid max-w-md grid-cols-3 border-t border-white/10 pt-3 sm:mt-8 sm:pt-4">
            {[
              { en: "DISCIPLINE", kh: "វិន័យ" },
              { en: "INTEGRITY", kh: "សុចរិតភាព" },
              { en: "SERVICE", kh: "សេវាកម្ម" },
            ].map((value, index) => (
              <div
                key={value.en}
                className={`min-w-0 px-2 first:pl-0 sm:px-3 ${
                  index !== 0 ? "border-l border-white/20 pl-3" : ""
                } ${isKhmer ? "font-khmer" : "font-english"}`}
              >
                <span className="break-words text-[9px] font-semibold sm:text-sm">
                  {isKhmer ? value.kh : value.en}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop arrows */}
      {/* <div className="absolute bottom-5 right-5 hidden items-center gap-2 sm:flex xl:right-12">
        <button
          type="button"
          aria-label="Previous slide"
          className="flex h-9 w-9 items-center justify-center border border-white/40 text-white/80 transition hover:border-amber-400 hover:bg-amber-400 hover:text-blue-950"
        >
          <ArrowLeft size={17} />
        </button>

        <button
          type="button"
          aria-label="Next slide"
          className="flex h-9 w-9 items-center justify-center border border-white/40 text-white/80 transition hover:border-amber-400 hover:bg-amber-400 hover:text-blue-950"
        >
          <ArrowRight size={17} />
        </button>
      </div> */}
    </section>
  );
}
