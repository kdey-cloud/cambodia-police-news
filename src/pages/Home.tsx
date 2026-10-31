import Hero from "../components/Home/Hero";
import AnnouncementsSection from "../components/Home/AnnouncementsSection";
import LatestNewsSection from "../components/Home/LatestNewsSection";
import MeetingSection from "../components/Home/MeetingSection";

import type { FeaturedNews } from "../types/news";

interface HomeProps {
  featuredNews: FeaturedNews[];
}

export default function Home({ featuredNews }: HomeProps) {
  return (
    <main>
      <Hero />

      <AnnouncementsSection featuredNews={featuredNews} />

      <LatestNewsSection />

      <MeetingSection />

      {/* <PublicInformation /> */}
    </main>
  );
}