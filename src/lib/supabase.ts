import { createClient } from "@supabase/supabase-js";
import type { Certification, Project, PortfolioData } from "./portfolio-data";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

type DbProject = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  github_url: string | null;
  live_demo_url: string | null;
  technologies: string | string[] | null;
  category: string | null;
  created_at: string;
};

type DbCertification = {
  id: string;
  certificate_name: string;
  issuer: string | null;
  certificate_url: string | null;
  certificate_image: string | null;
  issue_date: string | null;
};

type DbProfileSettings = {
  id: string;
  about_text: string | null;
  resume_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  leetcode_url: string | null;
  codechef_url: string | null;
  email: string | null;
  leetcode_count: number | null;
  codechef_rating: number | null;
  github_repos: number | null;
  project_count: number | null;
  cert_count: number | null;
  created_at: string;
};

function parseTechnologies(value: string | string[] | null | undefined) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function dbProjectToProject(row: DbProject): Project {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    image: row.image_url || "",
    tech: parseTechnologies(row.technologies),
    github: row.github_url || "",
    demo: row.live_demo_url || "",
    category: row.category || "",
  };
}

function projectToDbProject(project: Project) {
  return {
    id: project.id || undefined,
    title: project.title,
    description: project.description,
    image_url: project.image || null,
    github_url: project.github || null,
    live_demo_url: project.demo || null,
    technologies: project.tech.join(", "),
    category: project.category || null,
  };
}

function dbCertificationToCertification(row: DbCertification): Certification {
  return {
    id: row.id,
    name: row.certificate_name,
    issuer: row.issuer || "",
    date: row.issue_date ? row.issue_date : "",
    image: row.certificate_image || "",
    url: row.certificate_url || "",
  };
}

function certificationToDbCertification(cert: Certification) {
  return {
    id: cert.id || undefined,
    certificate_name: cert.name,
    issuer: cert.issuer || null,
    certificate_url: cert.url || null,
    certificate_image: cert.image || null,
    issue_date: cert.date || null,
  };
}

function dbProfileSettingsToPartialPortfolio(row: DbProfileSettings): Partial<PortfolioData> {
  return {
    about: row.about_text || "",
    resumeUrl: row.resume_url || "",
    profiles: {
      github: row.github_url || "",
      linkedin: row.linkedin_url || "",
      leetcode: row.leetcode_url || "",
      codechef: row.codechef_url || "",
      email: row.email || "",
    },
    stats: {
      leetcode: row.leetcode_count ?? 0,
      codechef: row.codechef_rating ?? 0,
      github: row.github_repos ?? 0,
      projects: row.project_count ?? 0,
      certs: row.cert_count ?? 0,
    },
  };
}

function profileDataToDbProfileSettings(data: PortfolioData) {
  return {
    about_text: data.about || null,
    resume_url: data.resumeUrl || null,
    github_url: data.profiles.github || null,
    linkedin_url: data.profiles.linkedin || null,
    leetcode_url: data.profiles.leetcode || null,
    codechef_url: data.profiles.codechef || null,
    email: data.profiles.email || null,
    leetcode_count: data.stats.leetcode,
    codechef_rating: data.stats.codechef,
    github_repos: data.stats.github,
    project_count: data.stats.projects,
    cert_count: data.stats.certs,
  };
}

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from<DbProject>("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }
  return (data || []).map(dbProjectToProject);
}

export async function upsertProject(project: Project): Promise<string> {
  const payload = projectToDbProject(project);

  if (project.id) {
    const { error } = await supabase.from<DbProject>("projects").upsert(payload, { onConflict: "id" });
    if (error) throw error;
    return project.id;
  }

  const { data, error } = await supabase
    .from<DbProject>("projects")
    .insert(payload)
    .select("id")
    .single();

  if (error || !data) {
    throw error || new Error("Failed to create project");
  }
  return data.id;
}

export async function deleteProject(id: string) {
  await supabase.from<DbProject>("projects").delete().eq("id", id);
}

export async function fetchCertifications(): Promise<Certification[]> {
  const { data, error } = await supabase
    .from<DbCertification>("certifications")
    .select("*")
    .order("issue_date", { ascending: false });

  if (error) {
    throw error;
  }
  return (data || []).map(dbCertificationToCertification);
}

export async function upsertCertification(cert: Certification): Promise<string> {
  const payload = certificationToDbCertification(cert);

  if (cert.id) {
    const { error } = await supabase.from<DbCertification>("certifications").upsert(payload, { onConflict: "id" });
    if (error) throw error;
    return cert.id;
  }

  const { data, error } = await supabase
    .from<DbCertification>("certifications")
    .insert(payload)
    .select("id")
    .single();

  if (error || !data) {
    throw error || new Error("Failed to create certification");
  }
  return data.id;
}

export async function deleteCertification(id: string) {
  await supabase.from<DbCertification>("certifications").delete().eq("id", id);
}

export async function fetchProfileSettings(): Promise<{ id: string; settings: Partial<PortfolioData> } | null> {
  const { data, error } = await supabase
    .from<DbProfileSettings>("profile_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) return null;
  return { id: data.id, settings: dbProfileSettingsToPartialPortfolio(data) };
}

export async function upsertProfileSettings(data: PortfolioData, id?: string): Promise<string> {
  const payload = profileDataToDbProfileSettings(data);

  if (id) {
    const { error } = await supabase.from<DbProfileSettings>("profile_settings").upsert({ ...payload, id }, { onConflict: "id" });
    if (error) throw error;
    return id;
  }

  const { data: inserted, error } = await supabase
    .from<DbProfileSettings>("profile_settings")
    .insert(payload)
    .select("id")
    .single();

  if (error || !inserted) {
    throw error || new Error("Failed to save profile settings");
  }
  return inserted.id;
}
