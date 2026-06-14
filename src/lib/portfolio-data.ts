export type Project = {
  id: string;
  title: string;
  description: string;
  image: string;
  tech: string[];
  github: string;
  demo: string;
  category: string;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  image: string;
  url: string;
};

export type PortfolioData = {
  about: string;
  resumeUrl: string;
  profiles: { github: string; linkedin: string; leetcode: string; codechef: string; email: string };
  stats: { leetcode: number; codechef: number; github: number; projects: number; certs: number };
  projects: Project[];
  certifications: Certification[];
  adminPassword: string;
};

export const DEFAULT_DATA: PortfolioData = {
  about:
    "I'm a Computer Science and Engineering student passionate about crafting clean, performant web experiences and solving challenging algorithmic problems. I love turning ideas into polished software — from interactive UIs to backend systems.",
  resumeUrl: "#",
  profiles: {
    github: "https://github.com/",
    linkedin: "https://linkedin.com/in/",
    leetcode: "https://leetcode.com/",
    codechef: "https://codechef.com/users/",
    email: "aradhyula.gowtham@example.com",
  },
  stats: { leetcode: 320, codechef: 1650, github: 24, projects: 12, certs: 8 },
  projects: [
    {
      id: "p1",
      title: "Portfolio Command Center",
      description: "Futuristic personal portfolio with glassmorphism, 3D tilt, and a hidden CMS.",
      image: "https://images.unsplash.com/photo-1581276879432-15e50529f34b?w=800&q=70",
      tech: ["React", "TypeScript", "Tailwind"],
      github: "https://github.com/",
      demo: "#",
      category: "Web Development",
    },
    {
      id: "p2",
      title: "Weather Forecast App",
      description: "Real-time weather with animated visuals and geolocation support.",
      image: "https://images.unsplash.com/photo-1561553873-e8491a564fd0?w=800&q=70",
      tech: ["JavaScript", "API", "CSS"],
      github: "https://github.com/",
      demo: "#",
      category: "Web Development",
    },
    {
      id: "p3",
      title: "Fitness Tracker",
      description: "Track workouts, log progress and visualize trends with charts.",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=70",
      tech: ["Python", "Flask", "SQLite"],
      github: "https://github.com/",
      demo: "#",
      category: "Python Projects",
    },
  ],
  certifications: [
    {
      id: "c1",
      name: "Full Stack Web Development",
      issuer: "Coursera",
      date: "2025",
      image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&q=70",
      url: "https://coursera.org/",
    },
    {
      id: "c2",
      name: "Data Structures & Algorithms",
      issuer: "NPTEL",
      date: "2024",
      image: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&q=70",
      url: "https://nptel.ac.in/",
    },
  ],
  adminPassword: "admin123",
};

const KEY = "portfolio_data_v1";

export function loadData(): PortfolioData {
  if (typeof window === "undefined") return DEFAULT_DATA;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_DATA;
    return { ...DEFAULT_DATA, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_DATA;
  }
}

export function saveData(data: PortfolioData) {
  localStorage.setItem(KEY, JSON.stringify(data));
}
