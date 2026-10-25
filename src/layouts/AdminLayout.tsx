
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Newspaper,
  Folder,
  Image,
  Settings,
  Menu,
  X,
  Search,
  Bell,
  ShieldCheck,
  LogOut,
  LoaderCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const menuItems = [
  {
    title: "WEBSITE",
    items: [
      {
        label: "Dashboard",
        path: "/admin/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "CONTENT",
    items: [
      {
        label: "Articles & News",
        path: "/admin/news",
        icon: Newspaper,
      },
      {
        label: "Categories",
        path: "/admin/categories",
        icon: Folder,
      },
      {
        label: "Media Library",
        path: "/admin/media",
        icon: Image,
      },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      {
        label: "Settings",
        path: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const navigate = useNavigate();

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setLogoutError("");

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setLogoutError(error.message);
        return;
      }

      navigate("/admin/login", { replace: true });
    } catch {
      setLogoutError("Unable to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      {/* Top navigation */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between bg-slate-800 px-3 text-white shadow-md sm:px-6">
        {/* Brand */}
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-md p-2 transition hover:bg-slate-700 lg:hidden"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <ShieldCheck size={25} className="text-blue-400" />

          <span className="text-sm font-bold sm:text-base">
            Police Academy
            <span className="ml-2 hidden font-normal text-slate-300 sm:inline">
              Admin
            </span>
          </span>
        </div>

        {/* Search */}
        <div className="hidden max-w-sm flex-1 px-8 md:block">
          <div className="flex items-center gap-2 rounded-md border border-slate-600 bg-slate-700 px-3 py-2">
            <Search size={17} className="text-slate-300" />
            <span className="text-sm text-slate-300">
              Admin dashboard
            </span>
          </div>
        </div>

        {/* Admin profile and Logout */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="Notifications"
            className="rounded-full p-2 transition hover:bg-slate-700"
          >
            <Bell size={19} />
          </button>

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold">
            AD
          </div>

          <span className="hidden text-sm sm:inline">
            Administrator
          </span>

          <div className="mx-1 h-7 w-px bg-slate-600" />

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-red-400 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Log out"
          >
            {isLoggingOut ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <LogOut size={17} />
            )}

            <span className="hidden sm:inline">
              {isLoggingOut ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed bottom-0 left-0 top-14 z-50 w-60 overflow-y-auto bg-slate-800 text-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-slate-700 px-5 py-5">
          <p className="text-xs font-semibold tracking-widest text-slate-400">
            CONTENT MANAGEMENT
          </p>
        </div>

        <nav className="space-y-6 px-3 py-5">
          {menuItems.map((group) => (
            <div key={group.title}>
              <p className="mb-2 px-3 text-xs font-semibold tracking-widest text-slate-400">
                {group.title}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                          isActive
                            ? "bg-blue-600 font-semibold text-white"
                            : "text-slate-300 hover:bg-slate-700 hover:text-white"
                        }`
                      }
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mx-4 mt-4 rounded-lg border border-slate-700 p-3">
          <p className="text-xs text-slate-400">Website language</p>
          <p className="mt-1 text-sm font-medium">
            Khmer / English
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-h-screen pt-14 lg:pl-60">
        <div className="min-h-[calc(100vh-3.5rem)] p-4 sm:p-6 lg:p-8">
          {logoutError && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              Logout failed: {logoutError}
            </div>
          )}

          <Outlet />
        </div>
      </main>
    </div>
  );
}

