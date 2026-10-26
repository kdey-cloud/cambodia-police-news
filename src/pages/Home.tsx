import Hero from "../components/Hero";
import AnnouncementsSection from "../components/AnnouncementsSection";
import LastNewsSection from "../components/LastNewsSection";
import PublicInformation from "../components/PublicInformation";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <LastNewsSection />
        <AnnouncementsSection />
        <PublicInformation />
      </main>
    </>
  );
}