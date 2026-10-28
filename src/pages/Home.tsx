import Hero from "../components/Home/Hero";
import AnnouncementsSection from "../components/Home/AnnouncementsSection";
import LatestNewsSection from "../components/Home/LatestNewsSection";
import MeetingSection from "../components/Home/MeetingSection";
// import PublicInformation from "../components/Home/PublicInformation";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <AnnouncementsSection />
        <LatestNewsSection />
        <MeetingSection />
        {/* <PublicInformation /> */}
      </main>
    </>
  );
}
