import { Shield, Mail, MapPin, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-blue-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* Branding */}
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-400 text-blue-950">
              <Shield size={25} />
            </div>

            <div>
              <h2 className="text-base font-extrabold tracking-wide">
                POLICE ACADEMY
              </h2>
              <p className="text-[10px] tracking-widest text-blue-200">
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

          <ul className="space-y-3 text-sm text-blue-100">
            {[
              { label: t("home"), href: "/" },
              { label: t("institution"), href: "/institution" },
              { label: t("information"), href: "/information" },
              { label: t("contact"), href: "/contact" },
            ].map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="transition hover:text-amber-400"
                >
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
              <span>Phnom Penh, Cambodia</span>
            </li>

            <li className="flex items-center gap-3">
              <Phone size={18} className="shrink-0 text-amber-400" />
              <span>Contact information coming soon</span>
            </li>

            <li className="flex items-center gap-3">
              <Mail size={18} className="shrink-0 text-amber-400" />
              <span>Email information coming soon</span>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="mb-4 border-b border-white/20 pb-3 font-bold">
            {t("followUs")}
          </h3>

          <div className="flex gap-3">
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="flex h-10 w-10 items-center justify-center rounded bg-white/10 font-bold transition hover:bg-amber-400 hover:text-blue-950"
            >
              f
            </a>

            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded bg-white/10 font-bold transition hover:bg-amber-400 hover:text-blue-950"
            >
              ◎
            </a>

            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="flex h-10 w-10 items-center justify-center rounded bg-white/10 font-bold transition hover:bg-amber-400 hover:text-blue-950"
            >
              ▶
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-xs text-blue-200 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Police Academy. All rights reserved.
          </p>

          <p>
            Demonstration website — not an official Cambodian government or
            police website.
          </p>
        </div>
      </div>
    </footer>
  );
}