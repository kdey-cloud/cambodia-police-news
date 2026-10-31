import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import { supabase } from "./lib/supabase";
import LoadingScreen from "./components/common/LoadingScreen";

import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ScrollToTop from "./components/common/ScrollToTop";

import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import AdminLogin from "./pages/admin/AdminLogin";

import Home from "./pages/Home";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import Search from "./pages/Search";

import Background from "./pages/institution/Background";
import RolesAndResponsibilities from "./pages/institution/RolesAndResponsibilities";
import Strategic from "./pages/institution/Strategic";

import CompositionAndLeadership from "./pages/structure/Composition-And-Leadership";
import Directorate from "./pages/structure/Directorate";
import PoliceScienceResearchInstitute from "./pages/structure/PoliceScienceResearchInstitute";
import PostgraduateInstitute from "./pages/structure/PostgraduateInstitute";
import InstituteOfPoliceProfessionalTraining from "./pages/structure/InstituteOfPoliceProfessionalTraining";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageNews from "./pages/admin/ManageNews";
import CreateNews from "./pages/admin/CreateNews";
import Categories from "./pages/admin/Categories";
import MediaLibrary from "./pages/admin/MediaLibrary";
import EditNews from "./pages/admin/EditNews";
/* =========================================
TYPES
========================================= */

export interface FeaturedNews {
id: string;
title_kh: string | null;
title_en: string | null;
image_url: string | null;
published_at: string | null;
created_at: string;
}

/* =========================================
IMAGE PRELOADING
========================================= */

function preloadImage(url: string): Promise<void> {
return new Promise((resolve) => {
const image = new Image();
let finished = false;


const finish = () => {
  if (finished) return;

  finished = true;
  window.clearTimeout(timeout);
  resolve();
};

const timeout = window.setTimeout(finish, 3000);

image.onload = finish;
image.onerror = finish;
image.src = url;

if (image.complete) {
  finish();
}


});
}

/* =========================================
PUBLIC LAYOUT
========================================= */

interface PublicLayoutProps {
featuredNews: FeaturedNews[];
}

function PublicLayout({ featuredNews }: PublicLayoutProps) {
return ( <div className="flex min-h-screen flex-col"> <ScrollToTop />


  <Navbar />

  <main className="flex-1">
    <Routes>
      <Route
        path="/"
        element={<Home featuredNews={featuredNews} />}
      />

      <Route path="/news" element={<News />} />
      <Route path="/news/:id" element={<NewsDetail />} />
      <Route path="/search" element={<Search />} />

      <Route
        path="/institution/background"
        element={<Background />}
      />

      <Route
        path="/institution/roles-and-responsibilities"
        element={<RolesAndResponsibilities />}
      />

      <Route
        path="/institution/strategy"
        element={<Strategic />}
      />

      <Route
        path="/pac-leadership"
        element={<CompositionAndLeadership />}
      />

      <Route path="/directorate" element={<Directorate />} />

      <Route
        path="/police-science-research-institute"
        element={<PoliceScienceResearchInstitute />}
      />

      <Route
        path="/postgraduate-institute"
        element={<PostgraduateInstitute />}
      />

      <Route
        path="/institute-of-police-professional-training"
        element={<InstituteOfPoliceProfessionalTraining />}
      />
    </Routes>
  </main>

  <Footer />
</div>


);
}

/* =========================================
PUBLIC WEBSITE LOADER
========================================= */

function PublicWebsite() {
const [isLoading, setIsLoading] = useState(true);
const [featuredNews, setFeaturedNews] = useState<FeaturedNews[]>([]);

useEffect(() => {
let mounted = true;


async function initializeWebsite() {
  const startTime = performance.now();

  try {
    const { data, error } = await supabase
      .from("news")
      .select(
        "id, title_kh, title_en, image_url, published_at, created_at",
      )
      .eq("status", "published")
      .eq("is_pinned", true)
      .order("published_at", {
        ascending: false,
        nullsFirst: false,
      })
      .order("created_at", {
        ascending: false,
      })
      .limit(3);

    if (error) throw error;

    const news = (data ?? []) as FeaturedNews[];

    if (!mounted) return;

    setFeaturedNews(news);

    console.log(
      `[Featured News] Supabase: ${(
        performance.now() - startTime
      ).toFixed(0)} ms`,
    );

    // Preload all pinned news images in parallel.
    await Promise.all(
      news
        .map((article) => article.image_url)
        .filter((url): url is string => Boolean(url))
        .map(preloadImage),
    );

    console.log("[Featured News] Images ready.");
  } catch (error) {
    console.error("[Featured News] Loading failed:", error);
  } finally {
    if (mounted) {
      setIsLoading(false);
    }
  }
}

initializeWebsite();

return () => {
  mounted = false;
};


}, []);

if (isLoading) {
return ( <LoadingScreen message="កំពុងផ្ទុកព័ត៌មានសំខាន់ៗ... / Loading featured news..." />
);
}

return <PublicLayout featuredNews={featuredNews} />;
}

/* =========================================
MAIN APP
========================================= */

export default function App() {
return ( <Routes>
{/* Admin login */}
<Route path="/admin/login" element={<AdminLogin />} />


  {/* Admin pages */}
  <Route
    path="/admin"
    element={
      <AdminProtectedRoute>
        <AdminLayout />
      </AdminProtectedRoute>
    }
  >
    <Route index element={<AdminDashboard />} />
    <Route path="dashboard" element={<AdminDashboard />} />
    <Route path="news" element={<ManageNews />} />
    <Route path="news/edit/:id" element={<EditNews />} />
    <Route path="news/create" element={<CreateNews />} />
    <Route path="categories" element={<Categories />} />
    <Route path="media" element={<MediaLibrary />} />
  </Route>

  {/* Public website */}
  <Route path="/*" element={<PublicWebsite />} />
</Routes>


);
}
