export interface NewsArticle {
  id: number;
  category: string;
  title: string;
  date: string;
  image: string;
  description: string;
  content: string;
}

export const newsArticles: NewsArticle[] = [
  {
    id: 1,
    category: "PUBLIC SAFETY",
    title: "Strengthening Public Safety Through Community Cooperation",
    date: "October 21, 2026",
    image:
      "https://images.unsplash.com/photo-1453873531674-2151bcd01707?auto=format&fit=crop&w=1000&q=80",
    description:
      "Learn how cooperation between communities and law enforcement can contribute to safer neighborhoods.",
    content: `
Public safety is an important responsibility shared by law enforcement agencies and the communities they serve.

Cooperation between police officers and local residents helps identify safety concerns, improve communication, and prevent crime. When communities actively participate in public safety initiatives, they can contribute to safer neighborhoods and stronger relationships with law enforcement.

The Police Academy of Cambodia supports professional education and training that prepares police officers to serve the public responsibly, respectfully, and effectively.

Through professional development, community engagement, and public awareness, law enforcement and local communities can work together to build a safer society.
    `,
  },
  {
    id: 2,
    category: "TRAINING",
    title: "Professional Training and Development",
    date: "October 20, 2026",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    description:
      "Explore the importance of professional development, discipline, and public service.",
    content: `
Professional training plays an important role in preparing police officers for their duties and responsibilities.

Continuous learning helps officers improve their knowledge, practical skills, discipline, and decision-making abilities. Effective training also encourages professionalism, accountability, and respect for the law.

The Police Academy of Cambodia provides a learning environment where trainees can develop the skills and knowledge needed for professional public service.

Through ongoing education and development, police officers can strengthen their ability to respond to challenges and serve their communities effectively.
    `,
  },
  {
    id: 3,
    category: "COMMUNITY",
    title: "Building Stronger Connections With Local Communities",
    date: "October 19, 2026",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
    description:
      "Community engagement helps build trust, improve communication, and promote public awareness.",
    content: `
Strong relationships between law enforcement and local communities are essential for building trust and encouraging cooperation.

Community engagement creates opportunities for police officers and residents to exchange information, discuss concerns, and work together on public safety initiatives.

Open communication can help improve public awareness, address local challenges, and encourage people to participate in making their communities safer.

By promoting mutual understanding, respect, and cooperation, law enforcement agencies and communities can develop stronger partnerships that benefit society.
    `,
  },
];