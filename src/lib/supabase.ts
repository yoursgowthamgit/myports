import { createClient } from "@supabase/supabase-js";
import type { Certification, Project } from "./portfolio-data";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

type DbProject = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  github_url: string;
  live_demo_url: string;
  technologies: string[];
  category: string;
  created_at: string;
};

type DbCertification = {
  id: string;
  certificate_name: string;
  issuer: string;
  certificate_url: string;
  certificate_image: string;
  issue_date: string;
};

function dbProjectToProject(row: DbProject): Project {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    image: row.image_url,
    tech: row.technologies || [],
    github: row.github_url,
    demo: row.live_demo_url,
    category: row.category,
  };
}

function projectToDbProject(project: Project) {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    image_url: project.image,
    github_url: project.github,
    live_demo_url: project.demo,
    technologies: project.tech,
    category: project.category,
  };
}

function dbCertificationToCertification(row: DbCertification): Certification {
  return {
    id: row.id,
    name: row.certificate_name,
    issuer: row.issuer,
    date: row.issue_date,
    image: row.certificate_image,
    url: row.certificate_url,
  };
}

function certificationToDbCertification(cert: Certification) {
  return {
    id: cert.id,
    certificate_name: cert.name,
    issuer: cert.issuer,
    certificate_url: cert.url,
    certificate_image: cert.image,
    issue_date: cert.date,
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

export async function upsertProject(project: Project) {
  await supabase.from<DbProject>("projects").upsert(projectToDbProject(project), { onConflict: "id" });
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

export async function upsertCertification(cert: Certification) {
  await supabase.from<DbCertification>("certifications").upsert(certificationToDbCertification(cert), { onConflict: "id" });
}

export async function deleteCertification(id: string) {
  await supabase.from<DbCertification>("certifications").delete().eq("id", id);
}
