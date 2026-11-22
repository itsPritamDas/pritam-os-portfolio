import {
  useCallback, useEffect, useMemo, useRef, useState,
  type CSSProperties, type PointerEvent,
} from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import {
  AppWindow, Award, BookOpen, BriefcaseBusiness, Check, ChevronRight,
  Code2, Command, Contact, Cpu, Download, ExternalLink, FileText,
  FolderKanban, Github, GraduationCap, HardDrive, Linkedin, Mail,
  Maximize2, Monitor, Moon, Power, Search, Settings2, ShieldCheck,
  Sparkles, Terminal as TerminalIcon, UserRound, Wifi, X, Sun, Clock3,
} from 'lucide-react';
import { profile, type AppId } from './data/profile';
import { WindowFrame } from './components/WindowFrame';
import { Terminal } from './components/Terminal';

const appMeta: Record<AppId, { title: string; description: string; icon: typeof UserRound }> = {
  about: { title: 'About Me', description: 'A little about the developer', icon: UserRound },
  projects: { title: 'Projects', description: 'Things I have built', icon: FolderKanban },
  skills: { title: 'Skills & Tools', description: 'Technology toolbox', icon: Code2 },
  experience: { title: 'Experience', description: 'Work and leadership', icon: BriefcaseBusiness },
  education: { title: 'Education', description: 'Academic journey', icon: GraduationCap },
  terminal: { title: 'Developer Terminal', description: 'Explore with commands', icon: TerminalIcon },
  resume: { title: 'Resume.pdf', description: 'Preview my resume', icon: FileText },
  contact: { title: 'Contact', description: 'Let’s connect', icon: Contact },
  certificates: { title: 'Certificates', description: 'Learning and credentials', icon: Award },
};

const desktopApps: AppId[] = ['about', 'projects', 'skills', 'experience', 'education', 'terminal', 'resume', 'contact'];
const pinnedApps: AppId[] = ['about', 'projects', 'skills', 'experience', 'education', 'terminal', 'resume', 'certificates', 'contact'];
const initialPositions: Record<AppId, { x: number; y: number; width: number; height: number }> = {
  about: { x: 160, y: 78, width: 760, height: 570 },
  projects: { x: 210, y: 70, width: 860, height: 620 },
  skills: { x: 230, y: 100, width: 760, height: 570 },
  experience: { x: 190, y: 92, width: 800, height: 600 },
  education: { x: 240, y: 105, width: 740, height: 560 },
  terminal: { x: 180, y: 130, width: 760, height: 480 },
  resume: { x: 220, y: 55, width: 850, height: 650 },
  contact: { x: 280, y: 135, width: 650, height: 510 },
  certificates: { x: 200, y: 80, width: 800, height: 600 },
};

type WindowState = { x: number; y: number; width: number; height: number; z: number; minimized: boolean; maximized: boolean };
type SystemState = 'power' | 'booting' | 'desktop';
type Filter = 'All' | 'AI / Research' | 'Computer Vision' | 'Web Application' | 'Frontend' | 'AI / Cybersecurity' | 'AI / Full Stack';

const BOOT_DURATION_MS = 5000;

function AppIcon({ id, size = 19 }: { id: AppId; size?: number }) {
  const Icon = appMeta[id].icon;
  return <Icon size={size} strokeWidth={1.8} />;
}

function App() {
  const [system, setSystem] = useState<SystemState>('power');
  const [bootProgress, setBootProgress] = useState(0);
  const [openWindows, setOpenWindows] = useState<AppId[]>([]);
  const [windows, setWindows] = useState<Record<AppId, WindowState>>(() => {
    const result = {} as Record<AppId, WindowState>;
    (Object.keys(initialPositions) as AppId[]).forEach((id, index) => {
      result[id] = { ...initialPositions[id], z: index + 1, minimized: false, maximized: false };
    });
    return result;
  });
  const [topZ, setTopZ] = useState(20);
  const [startOpen, setStartOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [powerMenu, setPowerMenu] = useState(false);
  const [confirmShutdown, setConfirmShutdown] = useState(false);
  const [clock, setClock] = useState(new Date());
  const [lightMode, setLightMode] = useState(true);
  const [wallpaper, setWallpaper] = useState(0);
  const [projectFilter, setProjectFilter] = useState<Filter>('All');
  const [projectSearch, setProjectSearch] = useState('');
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const dragRef = useRef<{ id: AppId; startX: number; startY: number; originX: number; originY: number } | null>(null);
  const bootTimer = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (system !== 'booting') return;
    setBootProgress(0);
    const started = Date.now();
    const timer = window.setInterval(() => {
      const progress = Math.min(100, Math.round(((Date.now() - started) / BOOT_DURATION_MS) * 100));
      setBootProgress(progress);
      if (progress >= 100) {
        window.clearInterval(timer);
        setSystem('desktop');
      }
    }, 35);
    bootTimer.current = timer;
    return () => window.clearInterval(timer);
  }, [system]);

  useEffect(() => {
    const onPointerMove = (event: globalThis.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      setWindows((current) => ({
        ...current,
        [drag.id]: {
          ...current[drag.id],
          x: Math.max(0, Math.min(window.innerWidth - 260, drag.originX + event.clientX - drag.startX)),
          y: Math.max(8, Math.min(window.innerHeight - 160, drag.originY + event.clientY - drag.startY)),
        },
      }));
    };
    const onPointerUp = () => { dragRef.current = null; };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  const beginBoot = useCallback(() => {
    setStartOpen(false);
    setPowerMenu(false);
    setConfirmShutdown(false);
    setSystem('booting');
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (system === 'power' && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        beginBoot();
      }
      if (system === 'desktop' && event.key === 'Escape') {
        setStartOpen(false);
        setPowerMenu(false);
        setConfirmShutdown(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [system, beginBoot]);

  const shutdown = useCallback(() => {
    setOpenWindows([]);
    setStartOpen(false);
    setPowerMenu(false);
    setConfirmShutdown(false);
    setSystem('power');
  }, []);

  const openApp = useCallback((id: AppId) => {
    setTopZ((current) => current + 1);
    setWindows((current) => ({
      ...current,
      [id]: { ...current[id], z: topZ + 1, minimized: false },
    }));
    setOpenWindows((current) => current.includes(id) ? current : [...current, id]);
    setStartOpen(false);
    setSearch('');
  }, [topZ]);

  const focusApp = useCallback((id: AppId) => {
    setTopZ((current) => current + 1);
    setWindows((current) => ({ ...current, [id]: { ...current[id], z: topZ + 1 } }));
  }, [topZ]);

  const closeApp = (id: AppId) => setOpenWindows((current) => current.filter((item) => item !== id));
  const minimizeApp = (id: AppId) => setWindows((current) => ({ ...current, [id]: { ...current[id], minimized: true } }));
  const maximizeApp = (id: AppId) => setWindows((current) => ({ ...current, [id]: { ...current[id], maximized: !current[id].maximized } }));

  const startDrag = (id: AppId, event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button')) return;
    if (windows[id].maximized) return;
    dragRef.current = { id, startX: event.clientX, startY: event.clientY, originX: windows[id].x, originY: windows[id].y };
    focusApp(id);
  };

  const filteredApps = useMemo(() => pinnedApps.filter((id) =>
    `${appMeta[id].title} ${appMeta[id].description}`.toLowerCase().includes(search.toLowerCase()),
  ), [search]);

  const projectItems = useMemo(() => profile.projects.filter((project) => {
    const matchesFilter = projectFilter === 'All' || project.category === projectFilter;
    const text = `${project.name} ${project.summary} ${project.stack.join(' ')}`.toLowerCase();
    return matchesFilter && text.includes(projectSearch.toLowerCase());
  }), [projectFilter, projectSearch]);

  function contentFor(id: AppId) {
    switch (id) {
      case 'about': return <AboutContent />;
      case 'projects': return <ProjectsContent filter={projectFilter} setFilter={setProjectFilter} search={projectSearch} setSearch={setProjectSearch} projects={projectItems} expanded={expandedProject} setExpanded={setExpandedProject} />;
      case 'skills': return <SkillsContent />;
      case 'experience': return <ExperienceContent />;
      case 'education': return <EducationContent />;
      case 'terminal': return <Terminal />;
      case 'resume': return <ResumeContent />;
      case 'contact': return <ContactContent />;
      case 'certificates': return <CertificatesContent />;
    }
  }

  const backgroundClass = `desktop-wallpaper wallpaper-${wallpaper}${lightMode ? ' light-mode' : ''}`;

  return (
    <MotionConfig reducedMotion="always">
      <main className={`system-shell${lightMode ? ' theme-light' : ''}`}>
        <AnimatePresence mode="wait">
          {system === 'power' && (
            <motion.section key="power" className="power-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.025 }} transition={{ duration: 0.45 }}>
              <div className="power-orb orb-one" /><div className="power-orb orb-two" />
              <div className="power-topline"><span className="os-brand"><span className="os-mark"><i /><i /><i /><i /></span> PRITAM OS</span><span className="topline-meta">DEVELOPER PORTFOLIO / 2027 EDITION</span></div>
              <div className="power-center">
                <div className="power-emblem"><div className="os-mark large"><i /><i /><i /><i /></div></div>
                <p className="eyebrow">A PERSONAL DIGITAL WORKSPACE</p>
                <h1>Welcome to <span>Pritam OS.</span></h1>
                <p className="power-subtitle">Explore the work, ideas and technical journey of<br className="desktop-break" /> a developer who loves building things.</p>
                <button className="power-on-button" onClick={beginBoot}><Power size={18} /> <span>Power on</span> <ChevronRight size={17} /></button>
                <button className="skip-intro" onClick={() => setSystem('desktop')}>Skip intro <span>↗</span></button>
              </div>
              <div className="power-footer"><span>© {new Date().getFullYear()} PRITAM DAS</span><span>FULL STACK · AI · CYBERSECURITY</span><span>PRESS ENTER TO START</span></div>
              <button className="power-enter" aria-label="Start portfolio" onClick={beginBoot} />
            </motion.section>
          )}
          {system === 'booting' && (
            <motion.section key="booting" className="boot-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <video
                className="boot-background-video"
                autoPlay
                muted
                playsInline
                preload="auto"
                aria-hidden="true"
                tabIndex={-1}
              >
                <source src="/videos/workspace-intro.mp4" type="video/mp4" />
              </video>
              <div className="boot-video-overlay" aria-hidden="true" />
              <div className="boot-lockup"><div className="os-mark large"><i /><i /><i /><i /></div><div className="boot-name">PRITAM OS</div><div className="boot-welcome">Preparing your workspace</div></div>
              <div className="boot-loader"><div className="boot-track"><motion.div className="boot-fill" animate={{ width: `${bootProgress}%` }} /></div><div className="boot-progress-label">{bootProgress}%</div></div>
              <button className="boot-skip" onClick={() => { if (bootTimer.current) window.clearInterval(bootTimer.current); setSystem('desktop'); }}>Skip boot animation</button>
            </motion.section>
          )}
          {system === 'desktop' && (
            <motion.section key="desktop" className={backgroundClass} initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55 }}>
              <div className="desktop-glow glow-a" /><div className="desktop-glow glow-b" />
              <div className="desktop-topbar"><div className="desktop-signature"><span className="mini-os-mark"><i /><i /><i /><i /></span><span>PRITAM <b>OS</b></span></div><div className="topbar-center">A DEVELOPER'S DIGITAL WORKSPACE</div><div className="topbar-right"><span className="online-dot" /> AVAILABLE FOR OPPORTUNITIES</div></div>
              <div className="desktop-welcome"><span className="welcome-kicker">WELCOME TO MY WORKSPACE</span><h2>Hi, I’m <em>Pritam...</em></h2><p>Final Year B.Tech CSE student@JIS UNUVERSITY · Full Stack Developer · AI Enthusiast<p>Aspiring Software Engineer</p> </p><div className="welcome-chips"><span><Code2 size={12}/> BUILD</span><span><Sparkles size={12}/> EXPLORE</span><span><ShieldCheck size={12}/> SECURE</span></div></div>
              <div className="desktop-icon-grid" aria-label="Desktop applications">
                {desktopApps.map((id) => (
                  <button key={id} className="desktop-icon" onDoubleClick={() => openApp(id)} onClick={() => openApp(id)}>
                    <span className={`desktop-icon-art icon-${id}`}><AppIcon id={id} size={22} /></span>
                    <span>{id === 'about' ? 'This PC · About' : appMeta[id].title}</span>
                  </button>
                ))}
                <button className="desktop-icon" onClick={() => openApp('certificates')}>
                  <span className="desktop-icon-art icon-certificates"><Award size={22}/></span><span>Certificates</span>
                </button>
              </div>
              <div className="desktop-side-note"><span className="side-line" /> <span>THOUGHTFULLY BUILT<br/>WITH CODE & CURIOSITY</span></div>

              <AnimatePresence>
                {openWindows.map((id) => {
                  const state = windows[id];
                  if (state.minimized) return null;
                  const style: CSSProperties = state.maximized
                    ? { zIndex: state.z }
                    : { left: state.x, top: state.y, width: state.width, height: state.height, zIndex: state.z };
                  return (
                    <motion.div key={id} className="window-positioner" initial={{ opacity: 0, scale: 0.94, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
                      <WindowFrame
                        title={appMeta[id].title}
                        icon={<AppIcon id={id} size={15} />}
                        style={style}
                        maximized={state.maximized}
                        onClose={() => closeApp(id)}
                        onMinimize={() => minimizeApp(id)}
                        onMaximize={() => maximizeApp(id)}
                        onFocus={() => focusApp(id)}
                        onHeaderPointerDown={(event) => startDrag(id, event)}
                      >
                        {contentFor(id)}
                      </WindowFrame>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <AnimatePresence>
                {startOpen && (
                  <motion.div className="start-menu" initial={{ opacity: 0, y: 18, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.97 }} transition={{ duration: 0.18 }}>
                    <div className="start-search"><Search size={16}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search apps, projects and more" autoFocus /></div>
                    <div className="start-section-heading"><span>PINNED</span><span className="all-apps">All apps <ChevronRight size={13}/></span></div>
                    <div className="pinned-grid">
                      {filteredApps.map((id) => <button key={id} className="pinned-app" onClick={() => openApp(id)}><span className={`pinned-icon icon-${id}`}><AppIcon id={id}/></span><span>{appMeta[id].title}</span></button>)}
                      {filteredApps.length === 0 && <p className="empty-search">No matching apps. Try “projects” or “skills”.</p>}
                    </div>
                    <div className="start-recommended"><div className="start-section-heading"><span>RECOMMENDED</span><button onClick={() => openApp('projects')}>See all <ChevronRight size={12}/></button></div><button className="recommended-project" onClick={() => openApp('projects')}><span className="recommend-icon"><Cpu size={17}/></span><span><b>Early Warning System</b><small>Featured project · AI / Research</small></span><ChevronRight size={14}/></button><button className="recommended-project" onClick={() => openApp('resume')}><span className="recommend-icon"><FileText size={17}/></span><span><b>Pritam_Das_Resume.pdf</b><small>Personal document · PDF</small></span><ChevronRight size={14}/></button></div>
                    <div className="start-footer"><div className="start-user"><div className="user-avatar">PD</div><span><b>Pritam Das</b><small>Developer workspace</small></span></div><div className="start-power-wrap"><button className="start-power" onClick={() => setPowerMenu((value) => !value)} aria-label="Power options"><Power size={17}/></button>{powerMenu && <div className="power-popover"><button onClick={() => setConfirmShutdown(true)}><Power size={15}/> Shut down</button><button onClick={beginBoot}><Settings2 size={15}/> Restart</button><button onClick={() => { setLightMode((value) => !value); setPowerMenu(false); }}>{lightMode ? <Moon size={15}/> : <Sun size={15}/>} {lightMode ? 'Dark theme' : 'Light theme'}</button><button onClick={() => { setWallpaper((value) => (value + 1) % 3); setPowerMenu(false); }}><Monitor size={15}/> Next wallpaper</button></div>}</div></div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="taskbar">
                <div className="taskbar-left"><span className="taskbar-weather"><span className="weather-dot">✦</span> <span>BUILDING<br/><b>WHAT'S NEXT</b></span></span></div>
                <div className="taskbar-center">
                  <button className={`taskbar-start${startOpen ? ' active' : ''}`} onClick={() => { setStartOpen((value) => !value); setPowerMenu(false); }} aria-label="Open Start menu"><span className="mini-os-mark"><i/><i/><i/><i/></span></button>
                  <button className="taskbar-search" onClick={() => { setStartOpen(true); setSearch(''); }}><Search size={15}/><span>Search</span></button>
                  {(['about', 'projects', 'terminal', 'resume'] as AppId[]).map((id) => <button key={id} className={`taskbar-app${openWindows.includes(id) ? ' is-running' : ''}`} onClick={() => openWindows.includes(id) && !windows[id].minimized ? minimizeApp(id) : openApp(id)} aria-label={appMeta[id].title}><AppIcon id={id} size={17}/></button>)}
                </div>
                <div className="taskbar-tray"><Wifi size={15}/><span className="tray-clock"><b>{clock.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</b><small>{clock.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</small></span><button className="tray-power" onClick={() => setConfirmShutdown(true)} aria-label="Shut down"><Power size={14}/></button></div>
              </div>
              {confirmShutdown && <div className="shutdown-overlay"><motion.div className="shutdown-dialog" initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}><div className="shutdown-icon"><Power size={22}/></div><h3>Power options</h3><p>What would you like to do with Pritam OS?</p><div className="shutdown-actions"><button onClick={shutdown}><Power size={16}/> Shut down</button><button onClick={beginBoot}><Settings2 size={16}/> Restart</button><button onClick={() => setConfirmShutdown(false)}>Cancel</button></div></motion.div></div>}
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </MotionConfig>
  );
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return <div className="content-heading"><span className="content-eyebrow">{eyebrow}</span><h2>{title}</h2>{text && <p>{text}</p>}</div>;
}

function AboutContent() {
  return <div className="page-content about-page"><div className="about-hero"><div className="profile-orbit"><div className="profile-monogram">PD</div><span className="orbit-dot"/></div><div className="about-intro"><span className="status-pill"><i/> OPEN TO LEARNING & OPPORTUNITIES</span><h2>Hey, I’m <em>Pritam Das.</em></h2><p className="about-role">{profile.headline}</p><p>{profile.summary}</p><div className="inline-links"><a href={profile.github} target="_blank" rel="noreferrer"><Github size={14}/> GitHub <ExternalLink size={12}/></a><a href={profile.linkedin} target="_blank" rel="noreferrer"><Linkedin size={14}/> LinkedIn <ExternalLink size={12}/></a></div></div></div><div className="stat-grid">{profile.stats.map((item) => <div className="stat-card" key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div><div className="two-column-info"><section><h3>What I’m interested in</h3><div className="focus-list">{profile.focus.map((item) => <span key={item}><Check size={13}/>{item}</span>)}</div></section><section><h3>Quick facts</h3><div className="fact-list"><div><span>Currently studying</span><b>B.Tech CSE · {profile.batch}</b></div><div><span>University</span><b>{profile.university}</b></div><div><span>Based in</span><b>{profile.location}</b></div></div></section></div></div>;
}

function ProjectsContent({ filter, setFilter, search, setSearch, projects, expanded, setExpanded }: { filter: Filter; setFilter: (value: Filter) => void; search: string; setSearch: (value: string) => void; projects: typeof profile.projects; expanded: string | null; setExpanded: (value: string | null) => void }) {
  const filters: Filter[] = ['All', 'AI / Research', 'Computer Vision', 'Web Application', 'Frontend', 'AI / Cybersecurity', 'AI / Full Stack'];
  return <div className="page-content projects-page"><SectionHeading eyebrow="SELECTED WORK / 01—08" title="Projects Explorer" text="A selection of applications, experiments and ideas I have worked on."/><div className="project-toolbar"><div className="project-search"><Search size={15}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a project..."/></div><span className="project-count">{projects.length} PROJECTS</span></div><div className="filter-row">{filters.map((item) => <button key={item} className={filter === item ? 'selected' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="project-grid">{projects.map((project, index) => <article className={`project-card project-card-${index % 4}`} key={project.id}><div className="project-card-top"><span className="project-number">0{index + 1}</span><span className={`project-status${project.status === 'In development' ? ' in-progress' : ''}`}>{project.status}</span></div><div className="project-symbol">{project.category.includes('AI') ? <Sparkles size={22}/> : project.category === 'Computer Vision' ? <Cpu size={22}/> : <AppWindow size={22}/>}</div><div className="project-category">{project.category}</div><h3>{project.name}</h3><p>{project.summary}</p><div className="tag-list">{project.stack.map((tag) => <span key={tag}>{tag}</span>)}</div><button className="project-details" onClick={() => setExpanded(expanded === project.id ? null : project.id)}>{expanded === project.id ? 'Hide details' : 'Explore project'} <ChevronRight size={14}/></button>{expanded === project.id && <div className="project-expanded"><b>Highlights</b><ul>{project.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul><a href={profile.github} target="_blank" rel="noreferrer">Visit GitHub profile <ExternalLink size={12}/></a></div>}</article>)}</div>{projects.length === 0 && <div className="empty-state">No projects match this search. Try another keyword.</div>}</div>;
}

function SkillsContent() {
  return <div className="page-content"><SectionHeading eyebrow="TOOLBOX / STACK" title="Skills & Technologies" text="Tools and concepts I have used, explored or studied through projects and learning."/><div className="skills-intro"><div className="skills-orb"><Code2 size={29}/></div><div><b>Practical learning, one build at a time.</b><span>I keep expanding my toolkit through hands-on projects and consistent practice.</span></div></div><div className="skills-grid">{profile.skills.map((group, index) => <section className="skill-group" key={group.group}><div className="skill-group-head"><span className={`skill-index skill-index-${index % 5}`}>0{index + 1}</span><h3>{group.group}</h3></div><div className="skill-chips">{group.items.map((item) => <span key={item}>{item}</span>)}</div></section>)}</div><div className="skills-note"><ShieldCheck size={17}/><span>Skill labels reflect practical exposure and learning. They are not self-assigned percentage ratings.</span></div></div>;
}

function ExperienceContent() {
  return <div className="page-content"><SectionHeading eyebrow="JOURNEY / EXPERIENCE" title="Experience & Leadership" text="Professional experience, student leadership and technical involvement."/><div className="timeline">{profile.experience.map((item) => <article className="timeline-item" key={item.role}><div className="timeline-marker"><BriefcaseBusiness size={16}/></div><div className="timeline-body"><div className="timeline-meta"><span>{item.period}</span><span>{item.location}</span></div><h3>{item.role}</h3><h4>{item.organization}</h4><ul>{item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul></div></article>)}</div><div className="subsection-title"><span>COMMUNITY / LEADERSHIP</span></div><div className="leadership-list">{profile.leadership.map((item) => <article key={item.role + item.organization}><div className="leadership-icon"><Award size={17}/></div><div><span className="timeline-meta">{item.period}</span><h3>{item.role}</h3><b>{item.organization}</b><p>{item.detail}</p></div></article>)}</div></div>;
}

function EducationContent() {
  return <div className="page-content"><SectionHeading eyebrow="ACADEMIC PROFILE" title="Education" text="My academic path and current qualification."/><div className="education-highlight"><div className="education-icon"><GraduationCap size={26}/></div><div><span className="content-eyebrow">CURRENT PROGRAMME</span><h3>{profile.degree}</h3><p>{profile.university} · {profile.universityLocation}</p><div className="education-tags"><span>{profile.batch}</span><span>{profile.graduation}</span><span>CGPA {profile.cgpa}</span></div></div></div><div className="education-list">{profile.education.map((item, index) => <article key={item.qualification} className="education-row"><div className="education-year">{item.period}</div><div className="education-bullet"><span/></div><div className="education-detail"><span className="content-eyebrow">{index === 0 ? 'UNDERGRADUATE' : 'SCHOOL EDUCATION'}</span><h3>{item.qualification}</h3><b>{item.subject}</b><p>{item.institution}</p><div className="education-result"><span>{item.result}</span><span>{item.status}</span></div></div></article>)}</div></div>;
}

function ResumeContent() {
  return <div className="resume-viewer"><div className="resume-toolbar"><div><FileText size={16}/><span>Pritam_Das_Resume.pdf</span></div><a href="/resume/Pritam_Das_Resume.pdf" download><Download size={14}/> Download PDF</a></div><iframe title="Pritam Das resume PDF" src="/resume/Pritam_Das_Resume.pdf#toolbar=0&navpanes=0" /><div className="resume-fallback">PDF preview not visible? <a href="/resume/Pritam_Das_Resume.pdf" target="_blank" rel="noreferrer">Open resume in a new tab</a>.</div></div>;
}

function ContactContent() {
  const cards = [
    { label: 'Email', value: profile.email, href: `mailto:${profile.email}`, icon: Mail, hint: 'Best for professional enquiries' },
    { label: 'LinkedIn', value: 'Connect professionally', href: profile.linkedin, icon: Linkedin, hint: '15K+ community' },
    { label: 'GitHub', value: 'Explore repositories', href: profile.github, icon: Github, hint: 'Code and project work' },
    { label: 'LeetCode', value: 'Problem-solving profile', href: profile.leetcode, icon: Code2, hint: `${profile.leetcodeSolved} problems solved` },
  ];
  return <div className="page-content contact-page"><SectionHeading eyebrow="LET’S CONNECT" title="Have an idea?" text="I’m always interested in meaningful conversations, collaborative projects and opportunities to learn."/><div className="contact-card-grid">{cards.map(({ label, value, href, icon: Icon, hint }) => <a className="contact-card" key={label} href={href} target={href.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer"><span className="contact-card-icon"><Icon size={20}/></span><span className="contact-label">{label}</span><b>{value}</b><small>{hint}</small><ExternalLink size={13} className="contact-external"/></a>)}</div><div className="contact-bottom"><div><span className="content-eyebrow">BASED IN</span><b>{profile.location}</b></div><div><span className="content-eyebrow">EMAIL</span><b>{profile.email}</b></div></div></div>;
}

function CertificatesContent() {
  return <div className="page-content"><SectionHeading eyebrow="CONTINUOUS LEARNING" title="Certificates & Training" text="Courses, certifications and learning programmes listed in my resume and profile history."/><div className="certificate-list">{profile.certifications.map((item, index) => <article className="certificate-row" key={item.name}><div className="certificate-icon"><Award size={17}/></div><div className="certificate-info"><span className="certificate-type">{item.type} · {item.date}</span><h3>{item.name}</h3><p>{item.issuer}</p></div><div className="certificate-result">{item.result}</div></article>)}</div><div className="certificate-footnote">Certificate scans and verification links have not been attached to this starter package. Add them only after checking the exact credential details.</div></div>;
}

export default App;
