import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import NewsDetail from "./pages/NewsDetail";
import Search from "./pages/Search";
import Background from "./pages/Background";

export default function App() {
return ( <div className="flex min-h-screen flex-col">
{/* Navbar appears on every page */} <Navbar />

  {/* Page content changes based on the URL */}
  <main className="flex-1">
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/news/:id" element={<NewsDetail />} />
      <Route path="/search" element={<Search />} />
      <Route path="/institution/background" element={<Background />} />
    </Routes>
  </main>

  {/* Footer appears on every page */}
  <Footer />
</div>

);
}
