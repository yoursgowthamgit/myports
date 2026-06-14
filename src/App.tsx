import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import profileImg from "@/assets/profile.jpg";
import {
  Github, Linkedin, Code2, Trophy, Download, ExternalLink, Mail,
  Sparkles, Cpu, Layers, Wrench, GraduationCap, Award, Terminal as TerminalIcon,
  Send, Lock, Plus, Pencil, Trash2, X, Menu,
} from "lucide-react";
import { loadData, saveData, type PortfolioData, type Project, type Certification } from "@/lib/portfolio-data";
import { fetchProjects, upsertProject, deleteProject, fetchCertifications, upsertCertification, deleteCertification } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";



const NAV = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "certifications", label: "Certifications" },
  { id: "education", label: "Education" },
  { id: "achievements", label: "Achievements" },
  { id: "terminal", label: "Terminal" },
  { id: "contact", label: "Contact" },
];

// === Hooks ===
function useTyped(words: string[], speed = 70, pause = 1400) {
  const [text, setText] = useState("");
  const [i, setI] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const w = words[i % words.length];
    const t = setTimeout(() => {
      if (!del) {
        setText(w.slice(0, text.length + 1));
        if (text.length + 1 === w.length) setTimeout(() => setDel(true), pause);
      } else {
        setText(w.slice(0, text.length - 1));
        if (text.length - 1 === 0) { setDel(false); setI(i + 1); }
      }
    }, del ? speed / 2 : speed);
    return () => clearTimeout(t);
  }, [text, del, i, words, speed, pause]);
  return text;
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, shown };
}

function useCounter(target: number, active: boolean, duration = 1500) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setV(Math.floor(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return v;
}

// === Components ===
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, shown } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 700ms ${delay}ms ease, transform 700ms ${delay}ms cubic-bezier(.2,.8,.2,1)`,
      }}
    >
      {children}
    </div>
  );
}

function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${-y * 8}deg) rotateY(${x * 10}deg) translateY(-4px)`;
    el.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--my", `${(y + 0.5) * 100}%`);
  };
  const reset = () => { if (ref.current) ref.current.style.transform = ""; };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={reset} className={`tilt-card relative ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(400px circle at var(--mx,50%) var(--my,50%), rgba(255,152,0,0.15), transparent 40%)" }}
      />
      {children}
    </div>
  );
}

function Spotlight() {
  useEffect(() => {
    const el = document.getElementById("spotlight");
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      el.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, rgba(255,152,0,0.08), transparent 40%)`;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return <div id="spotlight" className="pointer-events-none fixed inset-0 z-0" aria-hidden />;
}

function Navbar({ active, onAdmin }: { active: string; onAdmin: () => void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
  };
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all ${scrolled ? "py-2" : "py-4"}`}>
      <div className="mx-auto w-[min(1200px,94%)]">
        <nav className="glass flex items-center justify-between px-5 py-3">
          <button onClick={() => go("home")} className="flex items-center gap-2 font-bold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground font-mono">AG</span>
            <span className="hidden sm:inline">Aradhyula<span className="text-primary">.</span></span>
          </button>
          <ul className="hidden lg:flex items-center gap-7 text-sm text-muted-foreground">
            {NAV.map((n) => (
              <li key={n.id}>
                <button onClick={() => go(n.id)} className="nav-link transition-colors hover:text-foreground" data-active={active === n.id}>
                  {n.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => go("contact")} className="hidden sm:inline-flex bg-primary text-primary-foreground hover:bg-primary/90 glow-orange">
              Let's Talk
            </Button>
            <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu"><Menu className="h-5 w-5" /></button>
          </div>
        </nav>
        {open && (
          <div className="glass mt-2 lg:hidden p-4 grid gap-2">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => go(n.id)} className="text-left py-2 px-3 rounded hover:bg-white/5">{n.label}</button>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={onAdmin}
        aria-label="Admin"
        className="fixed bottom-3 right-3 z-50 h-3 w-3 rounded-full bg-primary/70 animate-pulse-glow"
        title=""
      />
    </header>
  );
}

// === Section blocks ===
function Hero({ data, onResume }: { data: PortfolioData; onResume: () => void }) {
  const typed = useTyped([
    "Building Web Applications",
    "Solving DSA Problems",
    "Learning New Technologies",
    "Creating Innovative Projects",
  ]);
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const profiles = [
    { label: "GitHub", icon: Github, url: data.profiles.github, stat: `${data.stats.github} repos` },
    { label: "LinkedIn", icon: Linkedin, url: data.profiles.linkedin, stat: "Connect" },
    { label: "LeetCode", icon: Code2, url: data.profiles.leetcode, stat: `${data.stats.leetcode} solved` },
    { label: "CodeChef", icon: Trophy, url: data.profiles.codechef, stat: `${data.stats.codechef} rating` },
  ];

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-28 pb-16">
      <div className="mx-auto w-[min(1200px,94%)] grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
        <div>
          <Reveal>
            <div className="inline-flex items-center gap-2 glass px-3 py-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Available for opportunities
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-6 text-5xl md:text-7xl font-bold leading-[1.05]">
              Hi, I'm <span className="text-gradient">Aradhyula Gowtham</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-4 text-lg text-muted-foreground">
              Computer Science Student · Web Developer · Programmer · Problem Solver
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-6 font-mono text-xl md:text-2xl h-10">
              <span className="text-primary">&gt; </span>{typed}
              <span className="inline-block w-2 h-6 ml-1 bg-primary align-middle animate-blink" />
            </div>
          </Reveal>
          <Reveal delay={400}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => go("projects")} className="bg-primary text-primary-foreground hover:bg-primary/90 glow-orange">
                <Sparkles className="mr-2 h-4 w-4" /> View Projects
              </Button>
              <Button size="lg" variant="outline" onClick={onResume} className="border-white/20 bg-transparent hover:bg-white/5">
                <Download className="mr-2 h-4 w-4" /> Download Resume
              </Button>
            </div>
          </Reveal>
          <Reveal delay={500}>
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
              {profiles.map((p) => (
                <a key={p.label} href={p.url} target="_blank" rel="noreferrer" className="group">
                  <TiltCard className="glass p-4 hover:glow-orange transition-shadow">
                    <div className="flex items-center justify-between">
                      <p.icon className="h-5 w-5 text-primary" />
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                    </div>
                    <div className="mt-3 text-sm font-medium">{p.label}</div>
                    <div className="text-xs text-muted-foreground">{p.stat}</div>
                  </TiltCard>
                </a>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={200} className="flex justify-center lg:justify-end">
          <TiltCard className="group glass-strong w-full max-w-sm p-6 animate-float">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/40 to-transparent blur-2xl opacity-60" aria-hidden />
              <img
                src={profileImg}
                alt="Aradhyula Gowtham"
                width={400}
                height={400}
                className="relative w-full aspect-square object-cover rounded-2xl ring-1 ring-white/10"
              />
            </div>
            <div className="mt-5">
              <h3 className="text-lg font-semibold">Aradhyula Gowtham</h3>
              <p className="text-xs text-muted-foreground font-mono">CSE Student · Developer</p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                { l: "LeetCode", v: data.stats.leetcode },
                { l: "CodeChef", v: data.stats.codechef },
                { l: "GitHub", v: data.stats.github },
                { l: "Projects", v: data.stats.projects },
                { l: "Certs", v: data.stats.certs },
                { l: "Years", v: 3 },
              ].map((s) => (
                <div key={s.l} className="glass px-2 py-2">
                  <div className="text-sm font-bold text-primary">{s.v}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </TiltCard>
        </Reveal>
      </div>
    </section>
  );
}

function About({ data }: { data: PortfolioData }) {
  return (
    <section id="about" className="section-pad relative">
      <div className="mx-auto w-[min(1100px,94%)] grid md:grid-cols-2 gap-10 items-center">
        <Reveal>
          <SectionTitle eyebrow="01 / Profile" title="About Me" />
          <p className="mt-6 text-muted-foreground leading-relaxed">{data.about}</p>
          <div className="mt-6 grid sm:grid-cols-2 gap-3 text-sm">
            <InfoRow icon={GraduationCap} k="Education" v="B.Tech CSE" />
            <InfoRow icon={Cpu} k="Focus" v="Full-stack & DSA" />
            <InfoRow icon={Layers} k="Stack" v="React, Node, Python" />
            <InfoRow icon={Award} k="Interests" v="Open source, AI" />
          </div>
        </Reveal>
        <Reveal delay={150}>
          <TiltCard className="group glass-strong p-8 aspect-square grid place-items-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-30" aria-hidden style={{
              backgroundImage: "radial-gradient(circle at 30% 30%, rgba(255,152,0,0.4), transparent 50%), radial-gradient(circle at 70% 70%, rgba(255,152,0,0.2), transparent 50%)"
            }} />
            <div className="relative font-mono text-xs space-y-2 text-muted-foreground">
              <div><span className="text-primary">const</span> dev = {"{"}</div>
              <div className="pl-4">name: <span className="text-emerald-300">"Aradhyula Gowtham"</span>,</div>
              <div className="pl-4">role: <span className="text-emerald-300">"CSE Student"</span>,</div>
              <div className="pl-4">stack: [<span className="text-emerald-300">"React"</span>, <span className="text-emerald-300">"Python"</span>],</div>
              <div className="pl-4">loves: <span className="text-emerald-300">"clean code"</span>,</div>
              <div className="pl-4">coffee: <span className="text-primary">true</span>,</div>
              <div>{"}"};</div>
            </div>
          </TiltCard>
        </Reveal>
      </div>
    </section>
  );
}

function InfoRow({ icon: Icon, k, v }: { icon: React.ComponentType<{ className?: string }>; k: string; v: string }) {
  return (
    <div className="glass p-3 flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-primary/15 text-primary"><Icon className="h-4 w-4" /></span>
      <div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</div>
        <div className="text-sm font-medium">{v}</div>
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <div className="font-mono text-xs text-primary uppercase tracking-[0.3em]">{eyebrow}</div>
      <h2 className="mt-3 text-4xl md:text-5xl font-bold text-gradient">{title}</h2>
    </div>
  );
}

const SKILLS = {
  Languages: ["C", "C++", "Java", "Python", "JavaScript"],
  "Web Technologies": ["HTML", "CSS", "JavaScript"],
  Tools: ["Git", "GitHub", "VS Code"],
};

function Skills() {
  return (
    <section id="skills" className="section-pad">
      <div className="mx-auto w-[min(1100px,94%)]">
        <Reveal><SectionTitle eyebrow="02 / Stack" title="Skills & Tools" /></Reveal>
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {Object.entries(SKILLS).map(([cat, items], i) => (
            <Reveal key={cat} delay={i * 100}>
              <TiltCard className="group glass p-6 h-full hover:glow-orange transition-shadow">
                <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider">
                  <Wrench className="h-3.5 w-3.5" /> {cat}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {items.map((s) => (
                    <span key={s} className="glass px-3 py-1.5 text-sm font-mono hover:bg-primary/15 hover:text-primary transition cursor-default">
                      {s}
                    </span>
                  ))}
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Projects({ data }: { data: PortfolioData }) {
  return (
    <section id="projects" className="section-pad">
      <div className="mx-auto w-[min(1200px,94%)]">
        <Reveal><SectionTitle eyebrow="03 / Work" title="Projects" /></Reveal>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.projects.map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <TiltCard className="group glass overflow-hidden h-full flex flex-col">
                <div className="aspect-video overflow-hidden">
                  <img src={p.image} loading="lazy" alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="font-mono text-[10px] text-primary uppercase tracking-wider">{p.category}</div>
                  <h3 className="mt-1 text-lg font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground flex-1">{p.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.tech.map((t) => <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-muted-foreground">{t}</span>)}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <a href={p.github} target="_blank" rel="noreferrer" className="glass px-3 py-1.5 text-xs flex items-center gap-1.5 hover:text-primary"><Github className="h-3.5 w-3.5" /> Code</a>
                    <a href={p.demo} target="_blank" rel="noreferrer" className="glass px-3 py-1.5 text-xs flex items-center gap-1.5 hover:text-primary"><ExternalLink className="h-3.5 w-3.5" /> Demo</a>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Certifications({ data }: { data: PortfolioData }) {
  return (
    <section id="certifications" className="section-pad">
      <div className="mx-auto w-[min(1200px,94%)]">
        <Reveal><SectionTitle eyebrow="04 / Credentials" title="Certifications" /></Reveal>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.certifications.map((c, i) => (
            <Reveal key={c.id} delay={i * 80}>
              <TiltCard className="group glass overflow-hidden h-full flex flex-col">
                <div className="aspect-video overflow-hidden">
                  <img src={c.image} loading="lazy" alt={c.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold">{c.name}</h3>
                  <p className="text-sm text-muted-foreground">{c.issuer} · {c.date}</p>
                  <a href={c.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex w-fit items-center gap-2 glass px-4 py-2 text-xs hover:text-primary hover:glow-orange transition">
                    View Certificate <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const EDUCATION = [
  { year: "2023 — 2027", title: "B.Tech, Computer Science & Engineering", place: "Vignan's Foundation for Science, Technology & Research", desc: "CGPA: 7.95" },
  { year: "2021 — 2023", title: "Intermediate Education (MPC)", place: "Rajiv Gandhi University of Knowledge Technologies", desc: "Percentage: 96%" },
  { year: "2011 — 2021", title: "Secondary School (SSC)", place: "Bhasshyam High School", desc: "Percentage: 100%" },
];

function Education() {
  return (
    <section id="education" className="section-pad">
      <div className="mx-auto w-[min(900px,94%)]">
        <Reveal><SectionTitle eyebrow="05 / Journey" title="Education" /></Reveal>
        <div className="mt-12 relative pl-8 border-l border-white/10">
          {EDUCATION.map((e, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="relative pb-10">
                <span className="absolute -left-[37px] top-1.5 h-4 w-4 rounded-full bg-primary glow-orange" />
                <div className="font-mono text-xs text-primary">{e.year}</div>
                <h3 className="mt-1 text-xl font-semibold">{e.title}</h3>
                <p className="text-sm text-muted-foreground">{e.place}</p>
                <p className="mt-2 text-sm text-muted-foreground/80">{e.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Achievements({ data }: { data: PortfolioData }) {
  const { ref, shown } = useReveal();
  const items = [
    { label: "Projects Completed", v: data.stats.projects },
    { label: "Certifications", v: data.stats.certs },
    { label: "LeetCode Solved", v: data.stats.leetcode },
    { label: "GitHub Repositories", v: data.stats.github },
    { label: "CodeChef Rating", v: data.stats.codechef },
  ];
  return (
    <section id="achievements" className="section-pad">
      <div className="mx-auto w-[min(1200px,94%)]">
        <Reveal><SectionTitle eyebrow="06 / Metrics" title="Achievements" /></Reveal>
        <div ref={ref} className="mt-10 grid grid-cols-2 md:grid-cols-5 gap-4">
          {items.map((it, i) => (
            <Counter key={it.label} active={shown} target={it.v} label={it.label} delay={i * 50} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Counter({ target, label, active, delay }: { target: number; label: string; active: boolean; delay: number }) {
  const v = useCounter(target, active);
  return (
    <Reveal delay={delay}>
      <TiltCard className="group glass p-6 text-center hover:glow-orange transition-shadow">
        <div className="text-3xl md:text-4xl font-bold text-primary font-mono">{v}+</div>
        <div className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      </TiltCard>
    </Reveal>
  );
}

// === Terminal ===
function Terminal({ data }: { data: PortfolioData }) {
  type Line = { cmd: string; out: string[] };
  const [history, setHistory] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const commands: Record<string, () => string[]> = useMemo(() => ({
    help: () => ["Available: whoami, skills, projects, achievements, contact, clear"],
    whoami: () => ["Aradhyula Gowtham — Computer Science Student"],
    skills: () => ["HTML", "CSS", "JavaScript", "Python", "Java", "C++"],
    projects: () => data.projects.map((p) => `• ${p.title}`),
    achievements: () => [
      `LeetCode solved: ${data.stats.leetcode}`,
      `CodeChef rating: ${data.stats.codechef}`,
      `GitHub repos: ${data.stats.github}`,
    ],
    contact: () => [`Email: ${data.profiles.email}`, `GitHub: ${data.profiles.github}`],
    clear: () => [],
  }), [data]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history]);

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    if (cmd === "clear") { setHistory([]); return; }
    const fn = commands[cmd];
    const out = fn ? fn() : [`command not found: ${cmd}. Try 'help'.`];
    setHistory((h) => [...h, { cmd: raw, out }]);
  };

  return (
    <section id="terminal" className="section-pad">
      <div className="mx-auto w-[min(900px,94%)]">
        <Reveal><SectionTitle eyebrow="07 / Console" title="Developer Terminal" /></Reveal>
        <Reveal delay={120}>
          <div className="mt-10 glass-strong overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 bg-black/40">
              <span className="h-3 w-3 rounded-full bg-red-500/70" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <span className="h-3 w-3 rounded-full bg-green-500/70" />
              <span className="ml-3 text-xs text-muted-foreground font-mono flex items-center gap-1.5"><TerminalIcon className="h-3 w-3" /> aradhyula@portfolio: ~</span>
            </div>
            <div className="p-5 font-mono text-sm h-80 overflow-auto">
              <div className="text-muted-foreground">Welcome. Type <span className="text-primary">help</span> to list commands.</div>
              {history.map((l, i) => (
                <div key={i} className="mt-2">
                  <div><span className="text-emerald-400">➜</span> <span className="text-primary">~</span> {l.cmd}</div>
                  {l.out.map((o, j) => <div key={j} className="pl-4 text-muted-foreground">{o}</div>)}
                </div>
              ))}
              <form onSubmit={(e) => { e.preventDefault(); run(input); setInput(""); }} className="mt-2 flex items-center gap-2">
                <span className="text-emerald-400">➜</span><span className="text-primary">~</span>
                <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 bg-transparent outline-none" placeholder="type a command…" />
              </form>
              <div ref={endRef} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// === Contact (Formspark) ===
const FORMSPARK_ID = "IoQASOoZc";

function Contact({ data }: { data: PortfolioData }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error("Please fill in all required fields."); return; }
    setLoading(true);
    try {
      await fetch(`https://submit-form.com/${FORMSPARK_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(form),
      });
      toast.success("Message sent — I'll get back to you soon!");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast.error("Could not send. Try again later.");
    } finally { setLoading(false); }
  };
  return (
    <section id="contact" className="section-pad">
      <div className="mx-auto w-[min(900px,94%)] grid md:grid-cols-[1fr_1.2fr] gap-8">
        <Reveal>
          <SectionTitle eyebrow="08 / Reach out" title="Let's Build" />
          <p className="mt-5 text-muted-foreground">Have a project, an idea or just want to say hi? Drop a message.</p>
          <div className="mt-6 space-y-3 text-sm">
            <a href={`mailto:${data.profiles.email}`} className="glass flex items-center gap-3 p-3 hover:glow-orange transition">
              <Mail className="h-4 w-4 text-primary" /> {data.profiles.email}
            </a>
            <a href={data.profiles.github} target="_blank" rel="noreferrer" className="glass flex items-center gap-3 p-3 hover:glow-orange transition">
              <Github className="h-4 w-4 text-primary" /> GitHub Profile
            </a>
            <a href={data.profiles.linkedin} target="_blank" rel="noreferrer" className="glass flex items-center gap-3 p-3 hover:glow-orange transition">
              <Linkedin className="h-4 w-4 text-primary" /> LinkedIn
            </a>
          </div>
        </Reveal>
        <Reveal delay={150}>
          <form onSubmit={submit} className="glass-strong p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Name" v={form.name} on={(v) => setForm({ ...form, name: v })} />
              <Field label="Email" type="email" v={form.email} on={(v) => setForm({ ...form, email: v })} />
            </div>
            <Field label="Subject" v={form.subject} on={(v) => setForm({ ...form, subject: v })} />
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Message</Label>
              <Textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-1.5 bg-white/5 border-white/10" />
            </div>
            <Button disabled={loading} type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-orange">
              <Send className="mr-2 h-4 w-4" /> {loading ? "Sending…" : "Send Message"}
            </Button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

function Field({ label, v, on, type = "text" }: { label: string; v: string; on: (v: string) => void; type?: string }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input type={type} value={v} onChange={(e) => on(e.target.value)} className="mt-1.5 bg-white/5 border-white/10" />
    </div>
  );
}

function Footer({ data }: { data: PortfolioData }) {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="mx-auto w-[min(1200px,94%)] glass p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">© {new Date().getFullYear()} Aradhyula Gowtham — Built with ❤️ and lots of ☕</div>
        <div className="flex items-center gap-3">
          {[
            { i: Github, u: data.profiles.github },
            { i: Linkedin, u: data.profiles.linkedin },
            { i: Code2, u: data.profiles.leetcode },
            { i: Trophy, u: data.profiles.codechef },
            { i: Mail, u: `mailto:${data.profiles.email}` },
          ].map((s, i) => (
            <a key={i} href={s.u} target="_blank" rel="noreferrer" className="glass h-9 w-9 grid place-items-center hover:text-primary hover:glow-orange transition">
              <s.i className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// === Admin ===
function AdminPanel({
  open, onClose, data, setData,
}: { open: boolean; onClose: () => void; data: PortfolioData; setData: (d: PortfolioData) => void }) {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [tab, setTab] = useState<"projects" | "certs" | "profile">("projects");

  useEffect(() => { if (!open) { setAuthed(false); setPw(""); } }, [open]);

  const update = (patch: Partial<PortfolioData>) => {
    const next = { ...data, ...patch };
    setData(next); saveData(next);
  };

  if (!open) return null;
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl bg-card border-white/10 max-h-[85vh] overflow-y-auto">
        {!authed ? (
          <div>
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> Admin Access</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); if (pw === data.adminPassword) setAuthed(true); else toast.error("Wrong password"); }} className="mt-4 space-y-3">
              <Input type="password" placeholder="Password (default: admin123)" value={pw} onChange={(e) => setPw(e.target.value)} className="bg-white/5 border-white/10" />
              <Button type="submit" className="w-full bg-primary text-primary-foreground">Unlock</Button>
            </form>
          </div>
        ) : (
          <div>
            <DialogHeader><DialogTitle>Admin Dashboard</DialogTitle></DialogHeader>
            <div className="mt-4 flex gap-2 border-b border-white/10 pb-2">
              {(["projects", "certs", "profile"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 text-sm rounded ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
              ))}
            </div>
            <div className="mt-4">
              {tab === "projects" && <ProjectsAdmin data={data} update={update} />}
              {tab === "certs" && <CertsAdmin data={data} update={update} />}
              {tab === "profile" && <ProfileAdmin data={data} update={update} />}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ProjectsAdmin({ data, update }: { data: PortfolioData; update: (p: Partial<PortfolioData>) => void }) {
  const empty: Project = { id: "", title: "", description: "", image: "", tech: [], github: "", demo: "", category: "Web Development" };
  const [editing, setEditing] = useState<Project | null>(null);

  const save = async (p: Project) => {
    const id = p.id || `p${Date.now()}`;
    const nextProject = { ...p, id };
    const exists = data.projects.find((x) => x.id === id);
    const next = exists ? data.projects.map((x) => x.id === id ? nextProject : x) : [...data.projects, nextProject];
    try {
      await upsertProject(nextProject);
      update({ projects: next });
      setEditing(null);
      toast.success("Saved");
    } catch (error) {
      console.error(error);
      toast.error("Could not save project to Supabase.");
    }
  };
  const del = async (id: string) => {
    try {
      await deleteProject(id);
      update({ projects: data.projects.filter((p) => p.id !== id) });
      toast.success("Deleted");
    } catch (error) {
      console.error(error);
      toast.error("Could not delete project from Supabase.");
    }
  };

  return (
    <div className="space-y-3">
      <Button size="sm" onClick={() => setEditing(empty)} className="bg-primary text-primary-foreground"><Plus className="h-4 w-4 mr-1" /> Add Project</Button>
      <div className="grid gap-2">
        {data.projects.map((p) => (
          <div key={p.id} className="glass p-3 flex items-center justify-between">
            <div className="text-sm">{p.title} <span className="text-muted-foreground text-xs">· {p.category}</span></div>
            <div className="flex gap-1">
              <button onClick={() => setEditing(p)} className="p-1.5 hover:text-primary"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => del(p.id)} className="p-1.5 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
      {editing && (
        <form onSubmit={(e) => { e.preventDefault(); save(editing); }} className="glass-strong p-4 space-y-2 mt-3">
          <div className="flex justify-between items-center"><div className="text-sm font-semibold">{editing.id ? "Edit" : "Add"} Project</div><button type="button" onClick={() => setEditing(null)}><X className="h-4 w-4" /></button></div>
          <Input placeholder="Title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="bg-white/5 border-white/10" />
          <Textarea placeholder="Description" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="bg-white/5 border-white/10" />
          <Input placeholder="Image URL" value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} className="bg-white/5 border-white/10" />
          <Input placeholder="Tech (comma separated)" value={editing.tech.join(", ")} onChange={(e) => setEditing({ ...editing, tech: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="bg-white/5 border-white/10" />
          <Input placeholder="GitHub URL" value={editing.github} onChange={(e) => setEditing({ ...editing, github: e.target.value })} className="bg-white/5 border-white/10" />
          <Input placeholder="Demo URL" value={editing.demo} onChange={(e) => setEditing({ ...editing, demo: e.target.value })} className="bg-white/5 border-white/10" />
          <Input placeholder="Category" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="bg-white/5 border-white/10" />
          <Button type="submit" className="w-full bg-primary text-primary-foreground">Save</Button>
        </form>
      )}
    </div>
  );
}

function CertsAdmin({ data, update }: { data: PortfolioData; update: (p: Partial<PortfolioData>) => void }) {
  const empty: Certification = { id: "", name: "", issuer: "", date: "", image: "", url: "" };
  const [editing, setEditing] = useState<Certification | null>(null);
  const save = async (c: Certification) => {
    const id = c.id || `c${Date.now()}`;
    const nextCert = { ...c, id };
    const exists = data.certifications.find((x) => x.id === id);
    const next = exists ? data.certifications.map((x) => x.id === id ? nextCert : x) : [...data.certifications, nextCert];
    try {
      await upsertCertification(nextCert);
      update({ certifications: next });
      setEditing(null);
      toast.success("Saved");
    } catch (error) {
      console.error(error);
      toast.error("Could not save certification to Supabase.");
    }
  };
  const del = async (id: string) => {
    try {
      await deleteCertification(id);
      update({ certifications: data.certifications.filter((c) => c.id !== id) });
      toast.success("Deleted");
    } catch (error) {
      console.error(error);
      toast.error("Could not delete certification from Supabase.");
    }
  };
  return (
    <div className="space-y-3">
      <Button size="sm" onClick={() => setEditing(empty)} className="bg-primary text-primary-foreground"><Plus className="h-4 w-4 mr-1" /> Add Certification</Button>
      <div className="grid gap-2">
        {data.certifications.map((c) => (
          <div key={c.id} className="glass p-3 flex items-center justify-between">
            <div className="text-sm">{c.name} <span className="text-muted-foreground text-xs">· {c.issuer}</span></div>
            <div className="flex gap-1">
              <button onClick={() => setEditing(c)} className="p-1.5 hover:text-primary"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => del(c.id)} className="p-1.5 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
      {editing && (
        <form onSubmit={(e) => { e.preventDefault(); save(editing); }} className="glass-strong p-4 space-y-2 mt-3">
          <div className="flex justify-between items-center"><div className="text-sm font-semibold">{editing.id ? "Edit" : "Add"} Certification</div><button type="button" onClick={() => setEditing(null)}><X className="h-4 w-4" /></button></div>
          <Input placeholder="Name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="bg-white/5 border-white/10" />
          <Input placeholder="Issuer" value={editing.issuer} onChange={(e) => setEditing({ ...editing, issuer: e.target.value })} className="bg-white/5 border-white/10" />
          <Input placeholder="Date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} className="bg-white/5 border-white/10" />
          <Input placeholder="Image URL" value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} className="bg-white/5 border-white/10" />
          <Input placeholder="Certificate URL" value={editing.url} onChange={(e) => setEditing({ ...editing, url: e.target.value })} className="bg-white/5 border-white/10" />
          <Button type="submit" className="w-full bg-primary text-primary-foreground">Save</Button>
        </form>
      )}
    </div>
  );
}

function ProfileAdmin({ data, update }: { data: PortfolioData; update: (p: Partial<PortfolioData>) => void }) {
  const [d, setD] = useState(data);
  useEffect(() => setD(data), [data]);
  return (
    <form onSubmit={(e) => { e.preventDefault(); update(d); toast.success("Profile updated"); }} className="space-y-3">
      <Textarea value={d.about} onChange={(e) => setD({ ...d, about: e.target.value })} placeholder="About" className="bg-white/5 border-white/10" rows={4} />
      <Input value={d.resumeUrl} onChange={(e) => setD({ ...d, resumeUrl: e.target.value })} placeholder="Resume URL" className="bg-white/5 border-white/10" />
      <div className="grid sm:grid-cols-2 gap-2">
        {(Object.keys(d.profiles) as (keyof PortfolioData["profiles"])[]).map((k) => (
          <Input key={k} value={d.profiles[k]} onChange={(e) => setD({ ...d, profiles: { ...d.profiles, [k]: e.target.value } })} placeholder={k} className="bg-white/5 border-white/10" />
        ))}
      </div>
      <div className="grid sm:grid-cols-3 gap-2">
        {(Object.keys(d.stats) as (keyof PortfolioData["stats"])[]).map((k) => (
          <div key={k}><Label className="text-xs">{k}</Label><Input type="number" value={d.stats[k]} onChange={(e) => setD({ ...d, stats: { ...d.stats, [k]: Number(e.target.value) } })} className="bg-white/5 border-white/10" /></div>
        ))}
      </div>
      <Input type="password" value={d.adminPassword} onChange={(e) => setD({ ...d, adminPassword: e.target.value })} placeholder="Admin password" className="bg-white/5 border-white/10" />
      <Button type="submit" className="w-full bg-primary text-primary-foreground">Save</Button>
    </form>
  );
}

// === Root ===
function Portfolio() {
  const [data, setData] = useState<PortfolioData>(() => loadData());
  const [active, setActive] = useState("home");
  const [adminOpen, setAdminOpen] = useState(false);

  useEffect(() => {
    setData(loadData());
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadRemote = async () => {
      try {
        const [projects, certifications] = await Promise.all([fetchProjects(), fetchCertifications()]);
        if (!mounted) return;
        setData((prev) => ({ ...prev, projects, certifications }));
      } catch (error) {
        console.error(error);
        toast.error("Could not load projects/certifications from Supabase. Using local data.");
      }
    };
    loadRemote();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, []);

  useEffect(() => {
    const ids = NAV.map((n) => n.id);
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const onResume = useCallback(() => {
    if (!data.resumeUrl || data.resumeUrl === "#") { toast.info("Resume link not set yet. Open admin to add one."); return; }
    window.open(data.resumeUrl, "_blank");
  }, [data.resumeUrl]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Spotlight />
      <div className="relative z-10">
        <Navbar active={active} onAdmin={() => setAdminOpen(true)} />
        <main>
          <Hero data={data} onResume={onResume} />
          <About data={data} />
          <Skills />
          <Projects data={data} />
          <Certifications data={data} />
          <Education />
          <Achievements data={data} />
          <Terminal data={data} />
          <Contact data={data} />
        </main>
        <Footer data={data} />
        <AdminPanel open={adminOpen} onClose={() => setAdminOpen(false)} data={data} setData={setData} />
      </div>
      <Toaster theme="dark" position="bottom-center" />
    </div>
  );
}
export default Portfolio;
