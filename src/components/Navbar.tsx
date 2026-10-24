import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Menu,
  X,
  Search,
  Share2,
  Copy,
  Check,
  Send,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

type SubmenuLink = {
  label: string;
  href?: string;
  children?: SubmenuLink[];
};

type NavigationLink = {
  key: string;
  href: string;
  children?: SubmenuLink[];
};

const navLinks: NavigationLink[] = [
  {
    key: "home",
    href: "/",
  },
  {
    key: "institution",
    href: "/institution",
    children: [
      { label: "Background", href: "/institution/background" },
      {
        label: "Roles and Responsibilities",
        href: "/institution/roles-and-responsibilities",
      },
      { label: "Strategy", href: "/institution/strategy" },
    ],
  },
  {
    key: "structure",
    href: "/structure",
    children: [
      { label: "Composition of Leadership", href: "/pac-leadership" },
      { label: "Directorate", href: "/directorate" },
      {
        label: "Institute of Police Science Research",
        href: "/police-science-research-institute",
      },
      {
        label: "Institute of Post Graduate Studies",
        href: "/postgraduate-institute",
      },
      {
        label: "Institute of Police Professional Training",
        href: "/institute-of-police-professional-training",
      },
      {
        label: "Institute of Management and Command",
        href: "/institute-of-leadership-and-command",
      },
      {
        label: "Institute of Information Technology and Foreign Languages",
        href: "/information-and-foreign-languages-institute",
      },
      {
        label: "Prison Officers Professional Training Center",
        href: "/prison-official-professional-training-center",
      },
      {
        label: "Senior School for Police Professionalism",
        href: "/senior-school-for-police-professionalism",
      },
      {
        label: "Senior School for Technicalities",
        href: "/senior-school-for-technicalities",
      },
      {
        label: "National Police School of Cambodia-Vietnam Friendship",
        href: "/national-police-school-of-cambodia-vietnam-friendship",
      },
      { label: "Training Department", href: "/department-of-training" },
      {
        label: "National Police School, Region 1",
        href: "/national-police-school-region-i-stung-treng",
      },
      {
        label: "National Police School, Region 2",
        href: "/national-police-school-region-ii-kampong-cham",
      },
      {
        label: "National Police School, Region 3",
        href: "/national-police-school-region-iii-kampong-speu",
      },
      {
        label: "National Police School, Region 4 (Siem Reap)",
        href: "/national-police-school-region-iv-siem-reap",
      },
      {
        label: "National Police School, Region 5",
        href: "/national-police-school-region-v-battambang",
      },
      {
        label: "National Police School, Region 6",
        href: "/national-police-school-region-vi-kampong-chnang",
      },
      {
        label: "Department of Internal Quality Assurance",
        href: "/department-of-internal-quality-assurance",
      },
    ],
  },
  {
    key: "studyProgram",
    href: "/study-program",
    children: [
      {
        label: "Studies Curriculum",
        children: [
          {
            label: "Master Degree",
            children: [
              {
                label: "Security Specialization",
                href: "/security-specialization",
              },
              {
                label: "Judicial Police Specialization",
                href: "/judicial-police-specialization",
              },
              {
                label: "Management Specialization",
                href: "/management-specialization",
              },
            ],
          },
          {
            label: "Bachelor Degree",
            children: [
              { label: "Public Order", href: "/public-order-specialization-2" },
              { label: "Immigration", href: "/immigration-specialization" },
              {
                label: "Identification",
                href: "/identification-specialization",
              },
              { label: "Security", href: "/security-specialization-2" },
              {
                label: "English",
                href: "/english-for-communication-specialization",
              },
              {
                label: "Computer Science",
                href: "/english-for-computer-science",
              },
              {
                label: "Prison Management",
                href: "/prison-management-specialization",
              },
            ],
          },
          {
            label: "Bachelor Degree (Special Batch)",
            children: [
              {
                label: "Security",
                href: "/b-a-special-batch-on-security-specialization",
              },
              {
                label: "Public Order",
                href: "/b-a-special-batch-on-public-order-specialization",
              },
              {
                label: "Identification",
                href: "/b-a-special-batch-on-identification-specialization",
              },
              {
                label: "Judicial Police",
                href: "/b-a-special-batch-on-judicial-police-specialization",
              },
              {
                label: "Prison Management",
                href: "/b-a-special-batch-on-prison-specialization",
              },
              {
                label: "Border Management",
                href: "/b-a-special-batch-on-border-specialization",
              },
              {
                label: "Immigration",
                href: "/b-a-special-batch-on-immigration-specialization",
              },
              {
                label: "Management",
                href: "/b-a-special-batch-on-management-specialization",
              },
            ],
          },
        ],
      },
      { label: "Training Program" },
      { label: "Admission Criteria", href: "/admission-criteria" },
    ],
  },
  {
    key: "information",
    href: "/information",
    children: [
      { label: "Events" },
      { label: "Information Journal" },
      { label: "Examination" },
    ],
  },
  {
    key: "cooperation",
    href: "/cooperation",
    children: [
      { label: "National Cooperation" },
      {
        label: "International Cooperation",
        href: "/international-cooperation",
        children: [
          { label: "Memorandum of Understanding" },
          { label: "Studies Tour" },
          { label: "Partners Institution" },
          { label: "Student/cadet exchange" },
          { label: "Studies Dispatch" },
          { label: "Welcoming of Delegations" },
          {
            label: "Deputation for Studies abroad",
            href: "/deputation-for-studies-abroad",
          },
          { label: "Receipt of Foreign Delegation" },
        ],
      },
    ],
  },
  {
    key: "quality",
    href: "/quality",
    children: [
      {
        label: "Internal Educational Quality Assurance",
        href: "/internal-educational-quality-assurance",
        children: [
          {
            label: "IQA Standards",
            href: "https://drive.google.com/file/d/1DizPjJV0f8jL-cE57LTkXSr0BcuDi6_T/view?usp=sharing",
          },
          { label: "PAC Standards" },
          { label: "Advantages" },
        ],
      },
    ],
  },
  {
    key: "digitalResources",
    href: "/digital-resources",
    children: [
      {
        label: "Digital Library",
        href: "https://www.library.pac.edu.kh/",
      },
      {
        label: "Email",
        href: "https://outlook.office.com/mail/",
      },
    ],
  },
  {
    key: "contact",
    href: "/contact",
  },
];

function isExternalLink(href?: string) {
  return Boolean(href && /^https?:\/\//i.test(href));
}

function isActivePath(pathname: string, href?: string) {
  if (!href || isExternalLink(href)) {
    return false;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileOpenSubmenus, setMobileOpenSubmenus] = useState<string[]>([]);
  const [desktopOpenSubmenus, setDesktopOpenSubmenus] = useState<string[]>([]);

  const headerRef = useRef<HTMLElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Translate submenu labels using their English labels as keys.
  const translateLabel = (label: string) =>
    t(`navLabels.${label}`, { defaultValue: label });

  const closeMenus = () => {
    setMenuOpen(false);
    setShareOpen(false);
    setMobileOpenSubmenus([]);
    setDesktopOpenSubmenus([]);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        closeMenus();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenus();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Close menus when navigating to another page.
  useEffect(() => {
    closeMenus();
  }, [location.pathname]);

  // Automatically close the mobile menu when scrolling.
  useEffect(() => {
    if (!menuOpen) return;

    const handleScroll = () => {
      setMenuOpen(false);
      setMobileOpenSubmenus([]);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleResize = () => {
      setMobileOpenSubmenus([]);
      setDesktopOpenSubmenus([]);

      if (window.innerWidth >= 1280) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const toggleSubmenu = (id: string, mode: "mobile" | "desktop") => {
    const setter =
      mode === "mobile" ? setMobileOpenSubmenus : setDesktopOpenSubmenus;

    setter((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  };

  const openSearch = () => {
    closeMenus();
    navigate("/search");
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(window.location.href);

    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
      "noopener,noreferrer",
    );

    setShareOpen(false);
    setMenuOpen(false);
  };

  const shareToTelegram = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);

    window.open(
      `https://t.me/share/url?url=${url}&text=${title}`,
      "_blank",
      "noopener,noreferrer",
    );

    setShareOpen(false);
    setMenuOpen(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);

      if (copyTimerRef.current !== null) {
        clearTimeout(copyTimerRef.current);
      }

      copyTimerRef.current = setTimeout(() => {
        setCopied(false);
        copyTimerRef.current = null;
      }, 2000);
    } catch {
      window.prompt(
        t("copyLinkPrompt", { defaultValue: "Copy this link:" }),
        window.location.href,
      );
    }
  };

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative flex h-full shrink-0 items-center whitespace-nowrap px-3 text-sm font-semibold transition-colors duration-200 ${
      isActive ? "text-blue-700" : "text-slate-700 hover:text-blue-700"
    }`;

  const ShareOptions = () => (
    <div className="w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
      <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
        {t("shareTitle", { defaultValue: "Share this page" })}
      </p>

      <button
        type="button"
        onClick={shareToFacebook}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-700"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-lg font-extrabold text-blue-700">
          f
        </span>
        Facebook
      </button>

      <button
        type="button"
        onClick={shareToTelegram}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-sky-50 hover:text-sky-600"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600">
          <Send size={17} />
        </span>
        Telegram
      </button>

      <button
        type="button"
        onClick={copyLink}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-100"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          {copied ? <Check size={17} /> : <Copy size={17} />}
        </span>
        {copied
          ? t("copied", { defaultValue: "Copied!" })
          : t("copyLink", { defaultValue: "Copy link" })}
      </button>
    </div>
  );

  // Desktop dropdown supports multiple nested levels.
  const renderDesktopSubmenu = (
    items: SubmenuLink[],
    parentKey: string,
    depth = 0,
  ): ReactNode => {
    return items.map((item, index) => {
      const itemKey = `${parentKey}-${index}`;
      const hasChildren = Boolean(item.children?.length);
      const isOpen = desktopOpenSubmenus.includes(itemKey);
      const active = isActivePath(location.pathname, item.href);

      const linkContent = (
        <>
          <span className="min-w-0 flex-1">{translateLabel(item.label)}</span>

          {hasChildren && (
            <ChevronRight
              size={15}
              className={`shrink-0 transition-transform duration-200 ${
                isOpen ? "rotate-90" : ""
              }`}
            />
          )}
        </>
      );

      const itemClass = `flex min-h-10 w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm transition-colors duration-200 ${
        isOpen || active
          ? "bg-blue-50 font-semibold text-blue-700"
          : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
      }`;

      return (
        <div
          key={itemKey}
          className="relative"
          onMouseEnter={() => {
            if (hasChildren) {
              setDesktopOpenSubmenus((previous) =>
                previous.includes(itemKey) ? previous : [...previous, itemKey],
              );
            }
          }}
          onMouseLeave={() => {
            if (hasChildren) {
              setDesktopOpenSubmenus((previous) =>
                previous.filter((key) => key !== itemKey),
              );
            }
          }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleSubmenu(itemKey, "desktop")}
              aria-expanded={isOpen}
              className={itemClass}
            >
              {linkContent}
            </button>
          ) : item.href ? (
            isExternalLink(item.href) ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setDesktopOpenSubmenus([])}
                className={itemClass}
              >
                {linkContent}
              </a>
            ) : (
              <NavLink
                to={item.href}
                onClick={() => setDesktopOpenSubmenus([])}
                className={({ isActive: childActive }) =>
                  `flex min-h-10 w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm transition-colors duration-200 ${
                    childActive
                      ? "bg-blue-50 font-semibold text-blue-700"
                      : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                  }`
                }
              >
                {linkContent}
              </NavLink>
            )
          ) : (
            <button
              type="button"
              className="flex min-h-10 w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm text-slate-500"
              disabled
            >
              {translateLabel(item.label)}
            </button>
          )}

          {hasChildren && (
            <div
              className={`absolute left-full top-0 z-[80] w-72 pl-1 transition-[opacity,transform,visibility] duration-200 ease-out ${
                isOpen
                  ? "visible translate-x-0 opacity-100"
                  : "pointer-events-none invisible -translate-x-1 opacity-0"
              }`}
            >
              <div className="rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
                {renderDesktopSubmenu(item.children ?? [], itemKey, depth + 1)}
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  // Mobile dropdown supports nested levels.
  const renderMobileSubmenu = (
    items: SubmenuLink[],
    parentKey: string,
    depth = 0,
  ): ReactNode => {
    return items.map((item, index) => {
      const itemKey = `${parentKey}-${index}`;
      const hasChildren = Boolean(item.children?.length);
      const isOpen = mobileOpenSubmenus.includes(itemKey);
      const active = isActivePath(location.pathname, item.href);

      const labelClass = `flex min-h-11 min-w-0 flex-1 items-center py-2 text-left text-sm transition-colors duration-200 ${
        active
          ? "font-semibold text-blue-700"
          : "text-slate-700 hover:text-blue-700"
      }`;

      return (
        <div
          key={itemKey}
          className="border-b border-slate-100 last:border-b-0"
        >
          <div className={`flex items-center gap-2 ${depth > 0 ? "pl-3" : ""}`}>
            {hasChildren ? (
              <>
                <button
                  type="button"
                  onClick={() => toggleSubmenu(itemKey, "mobile")}
                  aria-expanded={isOpen}
                  className={labelClass}
                >
                  {translateLabel(item.label)}
                </button>

                <button
                  type="button"
                  onClick={() => toggleSubmenu(itemKey, "mobile")}
                  aria-label={
                    isOpen
                      ? t("collapse", {
                          label: translateLabel(item.label),
                          defaultValue: `Collapse ${item.label}`,
                        })
                      : t("expand", {
                          label: translateLabel(item.label),
                          defaultValue: `Expand ${item.label}`,
                        })
                  }
                  aria-expanded={isOpen}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  <ChevronDown
                    size={17}
                    className={`transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </>
            ) : item.href ? (
              isExternalLink(item.href) ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setMenuOpen(false);
                    setMobileOpenSubmenus([]);
                  }}
                  className={labelClass}
                >
                  {translateLabel(item.label)}
                </a>
              ) : (
                <NavLink
                  to={item.href}
                  onClick={() => {
                    setMenuOpen(false);
                    setMobileOpenSubmenus([]);
                  }}
                  className={labelClass}
                >
                  {translateLabel(item.label)}
                </NavLink>
              )
            ) : (
              <span className={`${labelClass} text-slate-400`}>
                {translateLabel(item.label)}
              </span>
            )}
          </div>

          {hasChildren && (
            <div
              className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="mb-2 ml-2 border-l-2 border-blue-100 pl-2">
                  {renderMobileSubmenu(item.children ?? [], itemKey, depth + 1)}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <header ref={headerRef} className="relative z-50 w-full bg-white">
      {/* Header */}
      <div className="relative border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 w-full max-w-[1400px] items-center gap-1.5 px-4 sm:min-h-[76px] sm:gap-4 sm:px-6 lg:px-10">
          {/* Logo */}
          <NavLink
            to="/"
            onClick={closeMenus}
            className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center sm:h-15 sm:w-15">
              <img
                src="/logo.png"
                alt={t("academyLogoAlt", {
                  defaultValue: "Police Academy Logo",
                })}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="min-w-0">
              <h1 className="whitespace-nowrap font-moul text-[15px] font-normal leading-relaxed text-blue-700 sm:text-base lg:text-lg">
                {t("academyName", {
                  defaultValue: "បណ្ឌិត្យសភានគរបាលកម្ពុជា",
                })}
              </h1>

              <p className="whitespace-nowrap text-[12px] font-semibold leading-normal tracking-[0.03em] text-blue-700 sm:text-[11px] sm:tracking-[0.12em] lg:text-xs">
                {t("academySubtitle", {
                  defaultValue: "POLICE ACADEMY OF CAMBODIA",
                })}
              </p>
            </div>
          </NavLink>

          {/* Header actions */}
          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-2">
            {/* Hide language flag at 440px or narrower */}
            <div className="max-[1280px]:hidden">
              <LanguageSwitcher />
            </div>

            {/* Hide search at 440px or narrower */}
            <button
              type="button"
              onClick={openSearch}
              aria-label={t("search", { defaultValue: "Search" })}
              title={t("search", { defaultValue: "Search" })}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-700 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-700 max-[375px]:hidden sm:h-10 sm:w-10"
            >
              <Search size={20} />
            </button>

            {/* Desktop share */}
            <div className="relative hidden shrink-0 sm:block">
              <button
                type="button"
                onClick={() => {
                  setShareOpen((previous) => !previous);
                  setMenuOpen(false);
                  setDesktopOpenSubmenus([]);
                }}
                aria-label={t("shareTitle", {
                  defaultValue: "Share this page",
                })}
                aria-expanded={shareOpen}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 ${
                  shareOpen
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Share2 size={20} />
              </button>

              <div
                className={`absolute right-0 top-[calc(100%+12px)] z-[90] origin-top-right transition-[opacity,transform,visibility] duration-200 ease-out ${
                  shareOpen
                    ? "visible translate-y-0 scale-100 opacity-100"
                    : "pointer-events-none invisible -translate-y-1 scale-95 opacity-0"
                }`}
              >
                <ShareOptions />
              </div>
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => {
                setMenuOpen((previous) => !previous);
                setShareOpen(false);
                setDesktopOpenSubmenus([]);
              }}
              aria-label={
                menuOpen
                  ? t("closeMenu", { defaultValue: "Close menu" })
                  : t("openMenu", { defaultValue: "Open menu" })
              }
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-700 transition-colors duration-200 hover:bg-slate-100 sm:h-10 sm:w-10 xl:hidden"
            >
              <span
                className={`transition-transform duration-300 ease-out ${
                  menuOpen ? "rotate-90" : ""
                }`}
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop navigation */}
      <div className="relative z-50 hidden border-b border-slate-200 bg-white xl:block">
        <nav className="mx-auto flex h-[52px] w-full max-w-[1400px] items-stretch px-4 sm:px-6 lg:px-10">
          {navLinks.map((link) => {
            const hasChildren = Boolean(link.children?.length);

            if (hasChildren) {
              const isOpen = desktopOpenSubmenus.includes(link.key);

              const active =
                isActivePath(location.pathname, link.href) ||
                (link.children ?? []).some(
                  (child) =>
                    isActivePath(location.pathname, child.href) ||
                    (child.children ?? []).some((grandchild) =>
                      isActivePath(location.pathname, grandchild.href),
                    ),
                );

              return (
                <div
                  key={link.key}
                  className="relative h-full shrink-0"
                  onMouseEnter={() => {
                    setDesktopOpenSubmenus((previous) =>
                      previous.includes(link.key)
                        ? previous
                        : [...previous, link.key],
                    );
                  }}
                  onMouseLeave={() => {
                    setDesktopOpenSubmenus((previous) =>
                      previous.filter((key) => key !== link.key),
                    );
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleSubmenu(link.key, "desktop")}
                    onFocus={() =>
                      setDesktopOpenSubmenus((previous) =>
                        previous.includes(link.key)
                          ? previous
                          : [...previous, link.key],
                      )
                    }
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    className={`flex h-full items-center gap-1 whitespace-nowrap px-3 text-sm font-semibold transition-colors duration-200 ${
                      active
                        ? "text-blue-700"
                        : "text-slate-700 hover:text-blue-700"
                    }`}
                  >
                    {t(link.key)}

                    <ChevronDown
                      size={15}
                      className={`transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* First-level dropdown */}
                  <div
                    className={`absolute left-0 top-[calc(100%-8px)] z-[70] w-72 pt-2 transition-[opacity,transform,visibility] duration-200 ease-out ${
                      isOpen
                        ? "visible translate-y-0 opacity-100"
                        : "pointer-events-none invisible -translate-y-2 opacity-0"
                    }`}
                  >
                    <div
                      className={`rounded-xl border border-slate-200 bg-white py-2 shadow-xl ${
                        link.key === "structure"
                          ? "max-h-[calc(100dvh-180px)] overflow-y-auto overscroll-contain"
                          : "overflow-visible"
                      }`}
                    >
                      {renderDesktopSubmenu(link.children ?? [], link.key)}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <NavLink
                key={link.key}
                to={link.href}
                end={link.href === "/"}
                className={getNavLinkClass}
              >
                {t(link.key)}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Mobile and tablet navigation */}
      <div
        id="mobile-navigation"
        aria-hidden={!menuOpen}
        className={`absolute inset-x-0 top-full z-40 origin-top overflow-hidden border-t border-slate-100 bg-white shadow-lg transition-[opacity,transform,visibility] duration-300 ease-out xl:hidden ${
          menuOpen
            ? "visible translate-y-0 scale-y-100 opacity-100"
            : "pointer-events-none invisible -translate-y-2 scale-y-[0.98] opacity-0"
        }`}
      >
        <div className="max-h-[calc(100dvh-5rem)] overflow-x-hidden overflow-y-auto overscroll-contain px-4 pb-6 pt-4 sm:px-6">
          {/* Mobile search and language row */}
          <div className="mb-4 flex items-center gap-3">
            {/* Search button */}
            <button
              type="button"
              onClick={openSearch}
              className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3 text-left text-sm font-medium text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <Search size={19} className="shrink-0" />
              <span>{t("search", { defaultValue: "Search" })}</span>
            </button>

            {/* Divider */}
            <div className="hidden h-7 w-px shrink-0 bg-slate-200 min-[441px]:hidden" />

            {/* Language switcher */}
            <div className="hover:text-blue-700 min-[1280px]:hidden">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile navigation links */}
          <nav className="flex flex-col">
            {navLinks.map((link) => {
              const hasChildren = Boolean(link.children?.length);

              if (hasChildren) {
                const isOpen = mobileOpenSubmenus.includes(link.key);

                const active =
                  isActivePath(location.pathname, link.href) ||
                  (link.children ?? []).some(
                    (child) =>
                      isActivePath(location.pathname, child.href) ||
                      (child.children ?? []).some((grandchild) =>
                        isActivePath(location.pathname, grandchild.href),
                      ),
                  );

                return (
                  <div key={link.key} className="border-b border-slate-100">
                    <div className="flex min-h-12 items-center">
                      <button
                        type="button"
                        onClick={() => toggleSubmenu(link.key, "mobile")}
                        aria-expanded={isOpen}
                        className={`flex min-h-12 flex-1 items-center py-3 text-left text-sm font-semibold transition-colors duration-200 ${
                          active
                            ? "text-blue-700"
                            : "text-slate-700 hover:text-blue-700"
                        }`}
                      >
                        {t(link.key)}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleSubmenu(link.key, "mobile")}
                        aria-label={
                          isOpen
                            ? t("collapse", {
                                label: t(link.key),
                                defaultValue: `Collapse ${link.key} submenu`,
                              })
                            : t("expand", {
                                label: t(link.key),
                                defaultValue: `Expand ${link.key} submenu`,
                              })
                        }
                        aria-expanded={isOpen}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <ChevronDown
                          size={18}
                          className={`transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>

                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="mb-3 ml-3 border-l-2 border-blue-100 pl-3">
                          {renderMobileSubmenu(link.children ?? [], link.key)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <NavLink
                  key={link.key}
                  to={link.href}
                  end={link.href === "/"}
                  onClick={() => {
                    setMenuOpen(false);
                    setMobileOpenSubmenus([]);
                  }}
                  className={({ isActive }) =>
                    `flex min-h-12 items-center justify-between gap-3 border-b border-slate-100 py-3 text-sm font-semibold transition-colors duration-200 ${
                      isActive
                        ? "text-blue-700"
                        : "text-slate-700 hover:text-blue-700"
                    }`
                  }
                >
                  <span>{t(link.key)}</span>
                  <span className="shrink-0 text-lg text-slate-300">›</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Mobile share */}
          <div className="mt-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("shareTitle", { defaultValue: "Share this page" })}
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={shareToFacebook}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50"
              >
                <span className="font-extrabold text-blue-700">f</span>
                Facebook
              </button>

              <button
                type="button"
                onClick={shareToTelegram}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-sky-200 hover:bg-sky-50"
              >
                <Send size={16} className="text-sky-600" />
                Telegram
              </button>

              <button
                type="button"
                onClick={copyLink}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                {copied ? (
                  <Check size={16} className="text-green-600" />
                ) : (
                  <Copy size={16} />
                )}

                {copied
                  ? t("copied", { defaultValue: "Copied!" })
                  : t("copyLink", { defaultValue: "Copy link" })}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
