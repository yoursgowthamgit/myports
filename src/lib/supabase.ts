import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "Supabase credentials not configured. Using localStorage fallback. " +
    "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local"
  );
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export type Database = {
  public: {
    Tables: {
      portfolio_profile: {
        Row: {
          id: string;
          about: string;
          resume_url: string;
          github: string;
          linkedin: string;
          leetcode: string;
          codechef: string;
          email: string;
          leetcode_stat: number;
          codechef_stat: number;
          github_stat: number;
          projects_stat: number;
          certs_stat: number;
          admin_password: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["portfolio_profile"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["portfolio_profile"]["Insert"]>;
      };
      projects: {
        Row: {
          id: string;
          title: string;
          description: string;
          image: string;
          tech: string[];
          github: string;
          demo: string;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["projects"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
      };
      certifications: {
        Row: {
          id: string;
          name: string;
          issuer: string;
          date: string;
          image: string;
          url: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["certifications"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["certifications"]["Insert"]>;
      };
    };
  };
};
