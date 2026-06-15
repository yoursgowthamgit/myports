import { supabase } from "./supabase";

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
  adminPassword: import.meta.env.VITE_ADMIN_PASSWORD || "admin123",
};

const KEY = "portfolio_data_v1";

// Fallback to localStorage if Supabase is not configured
function getLocalStorageData(): PortfolioData {
  if (typeof window === "undefined") return DEFAULT_DATA;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_DATA;
    return { ...DEFAULT_DATA, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_DATA;
  }
}

function saveToLocalStorage(data: PortfolioData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

// Supabase operations
async function loadFromSupabase(): Promise<PortfolioData> {
  if (!supabase) return getLocalStorageData();

  try {
    // Load profile
    const { data: profileData, error: profileError } = await supabase
      .from("portfolio_profile")
      .select("*")
      .single();

    if (profileError) throw profileError;

    // Load projects
    const { data: projectsData, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (projectsError) throw projectsError;

    // Load certifications
    const { data: certsData, error: certsError } = await supabase
      .from("certifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (certsError) throw certsError;

    return {
      about: profileData.about,
      resumeUrl: profileData.resume_url,
      profiles: {
        github: profileData.github,
        linkedin: profileData.linkedin,
        leetcode: profileData.leetcode,
        codechef: profileData.codechef,
        email: profileData.email,
      },
      stats: {
        leetcode: profileData.leetcode_stat,
        codechef: profileData.codechef_stat,
        github: profileData.github_stat,
        projects: profileData.projects_stat,
        certs: profileData.certs_stat,
      },
      projects: projectsData || [],
      certifications: certsData || [],
      adminPassword: profileData.admin_password,
    };
  } catch (err) {
    console.error("Failed to load from Supabase, falling back to localStorage:", err);
    return getLocalStorageData();
  }
}

export async function loadData(): Promise<PortfolioData> {
  if (supabase) {
    return loadFromSupabase();
  }
  return getLocalStorageData();
}

export async function saveData(data: PortfolioData) {
  if (!supabase) {
    saveToLocalStorage(data);
    return;
  }

  try {
    // Update profile
    const { error: profileError } = await supabase
      .from("portfolio_profile")
      .update({
        about: data.about,
        resume_url: data.resumeUrl,
        github: data.profiles.github,
        linkedin: data.profiles.linkedin,
        leetcode: data.profiles.leetcode,
        codechef: data.profiles.codechef,
        email: data.profiles.email,
        leetcode_stat: data.stats.leetcode,
        codechef_stat: data.stats.codechef,
        github_stat: data.stats.github,
        projects_stat: data.stats.projects,
        certs_stat: data.stats.certs,
        admin_password: data.adminPassword,
        updated_at: new Date().toISOString(),
      })
      .eq("id", (await supabase.from("portfolio_profile").select("id").single()).data?.id);

    if (profileError) throw profileError;

    // Projects and certifications are handled separately in the admin panel
  } catch (err) {
    console.error("Failed to save to Supabase:", err);
    saveToLocalStorage(data);
  }
}

// Project CRUD operations
export async function addProject(project: Omit<Project, "id">): Promise<Project | null> {
  if (!supabase) {
    const id = `p${Date.now()}`;
    return { ...project, id };
  }

  try {
    const id = project.category ? `${project.category.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}` : `p${Date.now()}`;
    const { error } = await supabase
      .from("projects")
      .insert([{ ...project, id }]);

    if (error) throw error;
    return { ...project, id };
  } catch (err) {
    console.error("Failed to add project:", err);
    return null;
  }
}

export async function updateProject(id: string, project: Partial<Project>): Promise<boolean> {
  if (!supabase) return true;

  try {
    const { error } = await supabase
      .from("projects")
      .update({ ...project, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Failed to update project:", err);
    return false;
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  if (!supabase) return true;

  try {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Failed to delete project:", err);
    return false;
  }
}

// Certification CRUD operations
export async function addCertification(cert: Omit<Certification, "id">): Promise<Certification | null> {
  if (!supabase) {
    const id = `c${Date.now()}`;
    return { ...cert, id };
  }

  try {
    const id = `c${Date.now()}`;
    const { error } = await supabase
      .from("certifications")
      .insert([{ ...cert, id }]);

    if (error) throw error;
    return { ...cert, id };
  } catch (err) {
    console.error("Failed to add certification:", err);
    return null;
  }
}

export async function updateCertification(id: string, cert: Partial<Certification>): Promise<boolean> {
  if (!supabase) return true;

  try {
    const { error } = await supabase
      .from("certifications")
      .update({ ...cert, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Failed to update certification:", err);
    return false;
  }
}

export async function deleteCertification(id: string): Promise<boolean> {
  if (!supabase) return true;

  try {
    const { error } = await supabase
      .from("certifications")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Failed to delete certification:", err);
    return false;
  }
}

// Real-time subscription
export function subscribeToChanges(callback: (data: PortfolioData) => void) {
  if (!supabase) return () => {};

  const subscriptions = [
    supabase
      .channel("portfolio_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "portfolio_profile" }, () => {
        loadFromSupabase().then(callback);
      })
      .subscribe(),
    supabase
      .channel("projects_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => {
        loadFromSupabase().then(callback);
      })
      .subscribe(),
    supabase
      .channel("certs_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "certifications" }, () => {
        loadFromSupabase().then(callback);
      })
      .subscribe(),
  ];

  return () => {
    subscriptions.forEach((sub) => sub.unsubscribe());
  };
}
