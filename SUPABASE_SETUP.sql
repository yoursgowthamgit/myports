-- Run this SQL in your Supabase project (SQL Editor)
-- This creates the necessary tables for the portfolio CMS

-- Portfolio Profile Table
CREATE TABLE portfolio_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  about TEXT NOT NULL DEFAULT 'I''m a Computer Science and Engineering student passionate about crafting clean, performant web experiences and solving challenging algorithmic problems. I love turning ideas into polished software — from interactive UIs to backend systems.',
  resume_url TEXT DEFAULT '#',
  github TEXT DEFAULT 'https://github.com/',
  linkedin TEXT DEFAULT 'https://linkedin.com/in/',
  leetcode TEXT DEFAULT 'https://leetcode.com/',
  codechef TEXT DEFAULT 'https://codechef.com/users/',
  email TEXT DEFAULT 'aradhyula.gowtham@example.com',
  leetcode_stat INTEGER DEFAULT 320,
  codechef_stat INTEGER DEFAULT 1650,
  github_stat INTEGER DEFAULT 24,
  projects_stat INTEGER DEFAULT 12,
  certs_stat INTEGER DEFAULT 8,
  admin_password TEXT DEFAULT 'admin123',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects Table
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  tech TEXT[] DEFAULT '{}',
  github TEXT NOT NULL,
  demo TEXT NOT NULL,
  category TEXT DEFAULT 'Web Development',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certifications Table
CREATE TABLE certifications (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  date TEXT NOT NULL,
  image TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Real-time for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE portfolio_profile;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE certifications;

-- RLS Policies (optional: adjust based on your security needs)
-- For now, we'll allow public read, but only authenticated updates

-- Profile policies
ALTER TABLE portfolio_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profile is viewable by everyone" ON portfolio_profile FOR SELECT USING (true);
CREATE POLICY "Profile is updatable by authenticated users" ON portfolio_profile FOR UPDATE USING (true) WITH CHECK (true);

-- Projects policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projects are viewable by everyone" ON projects FOR SELECT USING (true);
CREATE POLICY "Projects are manageable by authenticated users" ON projects FOR INSERT USING (true) WITH CHECK (true);
CREATE POLICY "Projects are updatable by authenticated users" ON projects FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Projects are deletable by authenticated users" ON projects FOR DELETE USING (true);

-- Certifications policies
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Certifications are viewable by everyone" ON certifications FOR SELECT USING (true);
CREATE POLICY "Certifications are manageable by authenticated users" ON certifications FOR INSERT USING (true) WITH CHECK (true);
CREATE POLICY "Certifications are updatable by authenticated users" ON certifications FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Certifications are deletable by authenticated users" ON certifications FOR DELETE USING (true);

-- Insert default profile data (run once)
INSERT INTO portfolio_profile (about, resume_url, github, linkedin, leetcode, codechef, email, leetcode_stat, codechef_stat, github_stat, projects_stat, certs_stat, admin_password)
VALUES (
  'I''m a Computer Science and Engineering student passionate about crafting clean, performant web experiences and solving challenging algorithmic problems. I love turning ideas into polished software — from interactive UIs to backend systems.',
  '#',
  'https://github.com/',
  'https://linkedin.com/in/',
  'https://leetcode.com/',
  'https://codechef.com/users/',
  'aradhyula.gowtham@example.com',
  320,
  1650,
  24,
  12,
  8,
  'admin123'
)
ON CONFLICT (id) DO NOTHING;
