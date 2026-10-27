import Hero from "../components/Hero";
import AnnouncementsSection from "../components/AnnouncementsSection";
import LatestNewsSection from "../components/LatestNewsSection";
import PublicInformation from "../components/PublicInformation";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <LatestNewsSection />
        <AnnouncementsSection />
        <PublicInformation />
      </main>
    </>
  );
}