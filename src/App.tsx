import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLogin from "./pages/admin/AdminLogin";

import Home from "./pages/Home";
import NewsDetail from "./pages/NewsDetail";
import Search from "./pages/Search";
import Background from "./pages/Background";

// Admin pages
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageNews from "./pages/admin/ManageNews";
import CreateNews from "./pages/admin/CreateNews";

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/institution/background" element={<Background />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public website */}
      <Route path="/*" element={<PublicLayout />} />
      {/* Admin login */}
      <Route path="/admin/login" element={<AdminLogin />} />
      {/* Admin dashboard */}
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
    </Routes>
  );
}
