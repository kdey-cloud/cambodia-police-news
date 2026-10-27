import { Routes, Route } from "react-router-dom";

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

// Admin pages
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageNews from "./pages/admin/ManageNews";
import CreateNews from "./pages/admin/CreateNews";

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />

      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/institution/background" element={<Background />} />
          <Route path="/institution/roles-and-responsibilities" element={<RolesAndResponsibilities />} />
          <Route path="/institution/strategy" element={<Strategic />} />
          <Route path="/pac-leadership" element={<CompositionAndLeadership />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Admin login */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected admin pages */}
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
        <Route path="news/new" element={<CreateNews />} />
      </Route>

      {/* Public website */}
      <Route path="/*" element={<PublicLayout />} />
    </Routes>
  );
}
