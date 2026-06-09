import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  Linkedin,
  Github,
  Globe,
  Edit3,
  Search,
  Terminal,
  Shield,
  MessageSquare,
  Database,
  Server,
  Wifi,
  Facebook,
  Instagram,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  Check,
  Key,
  Menu,
  X,
  FileText,
  Award,
  BookOpen,
  GraduationCap,
  Briefcase,
  Cpu,
  Layers,
  Sparkles,
  MapPin,
  Clock,
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Copy,
  Share2,
  Grid,
  List,
  Sun,
  Moon,
  Send,
  Loader2,
  ZoomIn,
  ZoomOut
} from "lucide-react";

import {
  navLinks,
  marqueeItems,
  stats,
  languages,
  skillCategories,
  experienceData,
  educationData,
  socialLinks,
  projectsData
} from "./data";

import ParticleBackground from "./components/ParticleBackground";
import CustomCursor from "./components/CustomCursor";
import ProjectCard from "./components/ProjectCard";
import TiltCard from "./components/TiltCard";
import { dataService } from "./dataService";
import AdminCMS from "./components/AdminCMS";
import BeforeAfterSlider from "./components/BeforeAfterSlider";
import AIPortfolioRaphael from "./components/AIPortfolioRaphael";
import SystemMonitor from "./components/SystemMonitor";
import GuestbookLedger from "./components/GuestbookLedger";

export default function App() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as "dark" | "light") || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Dynamic Datasets backed by CMS & LocalStorage
  const [profile, setProfile] = useState<any>({
    name: "Rimon Ahmed",
    title: "System Support Co-Ordinator / Web Administrator",
    bio: "Highly organized and tech-savvy professional with professional experience in system administration, WordPress management, video editing, and graphic design. Adept at maintaining web infrastructures, executing digital marketing campaigns, and managing large-scale database operations with high precision.",
    email: "dev.rimonahmed@gmail.com",
    location: "Savar DOHS, Dhaka",
    cvUrl: "https://github.com/AymanSaikat/aymansaikat.github.io/blob/aefd51a899d3de2ec5724b4f0c1a4b469d275bb1/assets/Rimon%20Ahmed%20Resume%20for%20web.pdf",
    github: "https://github.com/aymansaikat",
    linkedin: "https://linkedin.com/in/aymansaikat",
    twitter: "https://twitter.com/AymanSaikat",
    blog: "https://aymansaikat.blogspot.com",
    portfolio: "https://aymansaikat.github.io"
  });
  const [projectsList, setProjectsList] = useState<any[]>(projectsData);
  const [skillsList, setSkillsList] = useState<any[]>(skillCategories);
  const [experienceList, setExperienceList] = useState<any[]>(experienceData);
  const [educationList, setEducationList] = useState<any[]>(educationData);
  const [statsList, setStatsList] = useState<any[]>(stats);
  const [marqueeList, setMarqueeList] = useState<string[]>(marqueeItems);
  const [isCmsOpen, setIsCmsOpen] = useState(false);

  const [isMaintenanceActive, setIsMaintenanceActive] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ayman_portfolio_maintenance_active") === "true";
    }
    return false;
  });
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ayman_portfolio_logged_in") === "true";
    }
    return false;
  });

  const loadCmsData = async () => {
    if (typeof window !== "undefined") {
      try {
        setIsMaintenanceActive(localStorage.getItem("ayman_portfolio_maintenance_active") === "true");
        setIsAdminLoggedIn(localStorage.getItem("ayman_portfolio_logged_in") === "true");
      } catch (storageErr) {
        console.warn("Storage item parsing error:", storageErr);
      }
    }

    try {
      const p = await dataService.getProfile();
      if (p) {
        setProfile(p);
        setOriginalCvUrl(p.cvUrl);
      }
    } catch (err) {
      console.warn("Profiles fetch offline status, using local default dataset.");
    }

    try {
      const prs = await dataService.getProjects();
      if (prs) setProjectsList(prs);
    } catch (err) {
      console.warn("Projects fetch offline status, using local default dataset.");
    }

    try {
      const sks = await dataService.getSkillCategories();
      if (sks) setSkillsList(sks);
    } catch (err) {
      console.warn("Skills fetch offline status, using local default dataset.");
    }

    try {
      const exps = await dataService.getExperiences();
      if (exps) setExperienceList(exps);
    } catch (err) {
      console.warn("Experiences fetch offline status, using local default dataset.");
    }

    try {
      const eds = await dataService.getEducation();
      if (eds) setEducationList(eds);
    } catch (err) {
      console.warn("Education fetch offline status, using local default dataset.");
    }

    try {
      const sts = await dataService.getStats();
      if (sts) setStatsList(sts);
    } catch (err) {
      console.warn("Stats fetch offline status, using local default dataset.");
    }

    try {
      const mrq = await dataService.getMarquee();
      if (mrq) setMarqueeList(mrq);
    } catch (err) {
      console.warn("Marquee items fetch offline status, using local default dataset.");
    }
  };

  useEffect(() => {
    loadCmsData();
  }, []);

  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [activeSection, setActiveSection] = useState("hero");
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isEmailCopied, setIsEmailCopied] = useState(false);
  const [originalCvUrl, setOriginalCvUrl] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("originalCvUrl") || "https://github.com/AymanSaikat/aymansaikat.github.io/blob/aefd51a899d3de2ec5724b4f0c1a4b469d275bb1/assets/Rimon%20Ahmed%20Resume%20for%20web.pdf";
    }
    return "https://github.com/AymanSaikat/aymansaikat.github.io/blob/aefd51a899d3de2ec5724b4f0c1a4b469d275bb1/assets/Rimon%20Ahmed%20Resume%20for%20web.pdf";
  });

  // Client interactive state triggers for projects & skill viewmodes
  const [activeProject, setActiveProject] = useState<typeof projectsData[0] | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [collapsedSkills, setCollapsedSkills] = useState<Record<string, boolean>>({});
  const [isHighLevelOverview, setIsHighLevelOverview] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [projectSearchQuery, setProjectSearchQuery] = useState<string>("");
  const [copiedShare, setCopiedShare] = useState(false);
  const [projectLayoutMode, setProjectLayoutMode] = useState<"bento" | "list">("bento");

  // Lightbox & Zoom Scale State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxScale, setLightboxScale] = useState(1);

  // Interactive Contact Form Validation & Submission State
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  // Check for deep link to project on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("project") || window.location.hash.replace("#", "");
    if (projectId) {
      const found = projectsData.find((p) => p.id === projectId);
      if (found) {
        setActiveProject(found);
        setTimeout(() => {
          const el = document.getElementById("projects");
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }, 400);
      }
    }
  }, []);

  // Update URL search parameters when activeProject changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (activeProject) {
      params.set("project", activeProject.id);
      const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
      window.history.replaceState({}, "", newUrl);
    } else {
      params.delete("project");
      const paramStr = params.toString();
      const newUrl = paramStr 
        ? `${window.location.pathname}?${paramStr}${window.location.hash}`
        : `${window.location.pathname}${window.location.hash}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [activeProject]);

  // Real-time Network Connectivity Monitor State & Toasts
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      return navigator.onLine;
    }
    return true;
  });
  const [showNetworkToast, setShowNetworkToast] = useState(false);
  const [networkToastType, setNetworkToastType] = useState<"online" | "offline">("online");

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNetworkToastType("online");
      setShowNetworkToast(true);
      setTimeout(() => setShowNetworkToast(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setNetworkToastType("offline");
      setShowNetworkToast(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // SEO & UX: Dynamic Page Title updating depending on navigation spy
  useEffect(() => {
    const sectionNames: Record<string, string> = {
      hero: "Systems & Support Core",
      about: "Executive Dossier",
      skills: "Capabilities Index",
      projects: "Project Stack Matrix",
      experience: "Career Timeline",
      education: "Educational Background",
      contact: "Direct Secure Channel",
    };

    const currentSubtitle = sectionNames[activeSection] || "Portfolio Systems";
    document.title = `${profile.name} | ${currentSubtitle}`;
  }, [activeSection, profile.name]);

  // SEO Schema Integration: Dynamic JSON-LD structured data injection inside head
  useEffect(() => {
    let scriptTag = document.getElementById("ayman-seo-schema") as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.id = "ayman-seo-schema";
      scriptTag.type = "application/ld+json";
      document.head.appendChild(scriptTag);
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": profile.name || "Md. Rimon Ahmed",
      "alternateName": "Ayman Saikat",
      "jobTitle": profile.title || "System Support Co-Ordinator / Web Administrator",
      "description": profile.bio || "Systems Specialist & Web Administrator",
      "email": profile.email || "dev.rimonahmed@gmail.com",
      "url": profile.portfolio || "https://aymansaikat.github.io",
      "location": {
        "@type": "Place",
        "name": profile.location || "Savar, Dhaka, Bangladesh"
      },
      "alumniOf": {
        "@type": "EducationalOrganization",
        "name": "Savar Govt. University College (National University)"
      },
      "worksFor": {
        "@type": "Organization",
        "name": "ST Group",
        "sameAs": "https://facebook.com/AymanSaikat"
      },
      "sameAs": [
        profile.github || "https://github.com/aymansaikat",
        profile.linkedin || "https://linkedin.com/in/aymansaikat",
        "https://www.facebook.com/AymanSaikat",
        "https://www.instagram.com/aymansaikat",
        "https://aymansaikat.blogspot.com"
      ]
    };

    scriptTag.textContent = JSON.stringify(structuredData, null, 2);

    return () => {
      const existing = document.getElementById("ayman-seo-schema");
      if (existing) {
        existing.remove();
      }
    };
  }, [profile]);

  const handleShareProject = (projectId: string) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?project=${projectId}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
      });
    } else {
      const el = document.createElement("textarea");
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  // Keyboard navigation for active project detail modal & interactive lightbox
  useEffect(() => {
    if (!activeProject) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
          setLightboxScale(1);
        } else {
          setActiveProject(null);
        }
      } else if (e.key === "ArrowLeft") {
        if (activeProject.screenshots && activeProject.screenshots.length > 0) {
          setActiveImageIndex((prev) => 
            prev === 0 ? activeProject.screenshots!.length - 1 : prev - 1
          );
          setLightboxScale(1); // reset zoom level on slider navigation
        }
      } else if (e.key === "ArrowRight") {
        if (activeProject.screenshots && activeProject.screenshots.length > 0) {
          setActiveImageIndex((prev) => 
            prev === activeProject.screenshots!.length - 1 ? 0 : prev + 1
          );
          setLightboxScale(1); // reset zoom level on slider navigation
        }
      } else if (e.key === "=" || e.key === "+") {
        if (isLightboxOpen) {
          setLightboxScale((prev) => Math.min(prev + 0.25, 3));
        }
      } else if (e.key === "-" || e.key === "_") {
        if (isLightboxOpen) {
          setLightboxScale((prev) => Math.max(prev - 0.25, 1));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeProject, isLightboxOpen]);

  const toggleSkillCategory = (id: string) => {
    setCollapsedSkills((prev) => ({
      ...prev,
      [id]: prev[id] !== undefined ? !prev[id] : !isHighLevelOverview,
    }));
  };

  const getSkillCategoryCollapsed = (id: string) => {
    return collapsedSkills[id] !== undefined ? collapsedSkills[id] : isHighLevelOverview;
  };

  // Track scroll position to trigger navbar glassmorphism
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);

          // Scroll progress percentage calculation
          const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
          if (totalScroll > 0) {
            setScrollProgress(window.scrollY / totalScroll);
          }

          // Simple active link spy
          const sections = ["hero", "about", "skills", "projects", "experience", "education", "contact"];
          const scrollPosition = window.scrollY + 200;

          for (const section of sections) {
            const el = document.getElementById(section);
            if (el) {
              const top = el.offsetTop;
              const height = el.offsetHeight;
              if (scrollPosition >= top && scrollPosition < top + height) {
                setActiveSection(section);
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Set real-time clock indicator in JetBrains Mono
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      try {
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Dhaka",
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false
        });
        
        const bstParts = formatter.formatToParts(now);
        const weekday = bstParts.find(p => p.type === "weekday")?.value || "";
        const day = bstParts.find(p => p.type === "day")?.value || "";
        const month = bstParts.find(p => p.type === "month")?.value || "";
        const year = bstParts.find(p => p.type === "year")?.value || "";
        const hour = bstParts.find(p => p.type === "hour")?.value || "";
        const minute = bstParts.find(p => p.type === "minute")?.value || "";
        const second = bstParts.find(p => p.type === "second")?.value || "";
        
        setCurrentTime(`${weekday}, ${day} ${month} ${year} ${hour}:${minute}:${second} BST`);
      } catch (e) {
        // Fallback in case of runtime issues or older environments
        setCurrentTime(now.toUTCString().replace("GMT", "BST"));
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper to map string names back to Lucide components dynamically
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Mail": return <Mail className="w-4.5 h-4.5" />;
      case "Linkedin": return <Linkedin className="w-4.5 h-4.5" />;
      case "Github": return <Github className="w-4.5 h-4.5" />;
      case "Globe": return <Globe className="w-4.5 h-4.5" />;
      case "Edit3": return <Edit3 className="w-4.5 h-4.5" />;
      case "Facebook": return <Facebook className="w-4.5 h-4.5" />;
      case "Instagram": return <Instagram className="w-4.5 h-4.5" />;
      default: return <ExternalLink className="w-4.5 h-4.5" />;
    }
  };

  const getEducationIcon = (iconName: string) => {
    switch (iconName) {
      case "GraduationCap": return <GraduationCap className="w-8 h-8 text-gold" />;
      case "BookOpen": return <BookOpen className="w-8 h-8 text-gold" />;
      case "Award": return <Award className="w-8 h-8 text-gold" />;
      default: return <GraduationCap className="w-8 h-8 text-gold" />;
    }
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setIsEmailCopied(true);
    setTimeout(() => {
      setIsEmailCopied(false);
    }, 2500);
  };

  // Reusable Framer Motion variants for scroll-triggered staggered entrances
  const headerVariants = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for a smooth editorial ease
      },
    },
  };

  const staggerContainer = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: (i: number) => ({
      opacity: 0,
      y: 20,
      scale: 0.95,
      transition: {
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1],
        delay: typeof i === 'number' ? i * 0.05 : 0,
      },
    }),
  };

  const fadeUpTransition = {
    hidden: { opacity: 0, y: 25 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  if (isMaintenanceActive && !isAdminLoggedIn) {
    return (
      <div className="bg-[#050508] text-[#f0eeea] min-h-screen relative flex flex-col justify-between items-center p-6 select-none font-mono selection:bg-gold selection:text-bg-dark antialiased overflow-hidden">
        {/* Floating background particles */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <ParticleBackground />
        </div>

        {/* Global Header decorative branding */}
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between z-10 border-b border-white/[0.04] pb-4">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-gold/10 border border-gold/40 rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
            </div>
            <span className="text-[0.55rem] tracking-[0.25em] text-[#8a8a93] uppercase font-bold">
              RIMON A. CORE ARCHITECT
            </span>
          </div>
          <div className="text-[0.52rem] text-muted-slate/75 uppercase tracking-widest flex items-center gap-1.5">
            <span>CHANNELS FROZEN</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          </div>
        </div>

        {/* Interactive Maintenance Shield Block */}
        <div className="w-full max-w-lg mx-auto py-12 flex flex-col items-center text-center z-10 space-y-8 my-auto">
          {/* Pulsing Core Hologram Sphere */}
          <div className="relative flex items-center justify-center w-24 h-24">
            <div className="absolute inset-0 bg-gold/10 rounded-full border border-gold/20 animate-pulse duration-[3s]" />
            <div className="absolute inset-2 bg-gradient-to-tr from-gold-dark/20 to-gold-light/20 rounded-full border border-gold/45 select-none animate-spin" style={{ animationDuration: '10s' }} />
            <div className="absolute w-3 h-3 bg-gold rounded-full shadow-[0_0_20px_#c8a96e]" />
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-[2.5rem] tracking-[0.16em] text-gold uppercase text-outline-gold font-black">
              STEALTH MODE ACTIVE
            </h1>
            <p className="font-mono text-[0.45rem] tracking-[0.22em] text-[#8a8a93] uppercase">
              ADMINISTRATIVE INFRASTRUCTURE SYNCHRONIZATION
            </p>
          </div>

          <div className="bg-[#0c0c12]/85 border border-[#ffffff]/[0.05] p-5 rounded-[2px] max-w-md w-full space-y-4 shadow-3xl text-left">
            <div className="flex items-center gap-1.5 border-b border-[#ffffff]/[0.04] pb-2 text-[0.45rem] font-bold text-gold tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              SYSTEM PROTOCOL DIRECTIVE
            </div>
            
            <p className="font-mono text-[0.52rem] text-muted-lavender leading-relaxed uppercase tracking-wider">
              The portfolio landing systems have been locked with an administrative maintenance shield. Dynamic databases, media streams, and page render engines are running calibration tasks.
            </p>

            <div className="flex items-center justify-between text-[0.45rem] text-[#8a8a93] uppercase tracking-widest pt-2 border-t border-[#ffffff]/[0.02]">
              <span>System Clock Sync:</span>
              <span className="text-gold font-bold flex items-center gap-1">
                <Clock className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: '8s' }} />
                {currentTime || "RESTRICTED"}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <p className="font-sans text-[0.62rem] text-muted-slate/50 leading-relaxed max-w-xs lowercase first-letter:uppercase">
              Standard operations and interactive modules will restore automatically once adjustments are saved. Direct queries remains active via mail channel.
            </p>
          </div>
        </div>

        {/* Global Footer bypass portal */}
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between z-10 border-t border-white/[0.04] pt-4 text-[0.48rem] text-muted-slate/40 uppercase tracking-widest font-mono">
          <span>© 2026 Rimon Ahmed. ALL SECURED.</span>
          <button 
            onClick={() => setIsCmsOpen(true)}
            className="p-1 px-2 border border-white/[0.03] hover:border-gold/30 hover:bg-gold/5 bg-transparent rounded-[1px] transition-all flex items-center gap-1 cursor-pointer hover:text-gold uppercase tracking-[0.16em] group"
            title="Administrator Bypass Authorization Trigger"
          >
            <Key className="w-3 h-3 text-muted-slate/50 group-hover:text-gold transition-colors" />
            ADMIN GATES
          </button>
        </div>

        {/* ADMIN CONTROL PANEL CMS (available even under maintenance mode) */}
        <AdminCMS isOpen={isCmsOpen} onClose={() => setIsCmsOpen(false)} onDataUpdate={loadCmsData} />
      </div>
    );
  }

  return (
    <div className="bg-bg-dark text-text-primary min-h-screen relative font-serif selection:bg-gold selection:text-bg-dark antialiased transition-colors duration-500">
      <div className="print:hidden">
        {/* SCROLL PROGRESS BAR */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-white/[0.03] z-[120] pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-gold via-gold-light to-gold-dark transition-all duration-75"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* FLOATING SIDE-NAV INDICATOR */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[100] hidden lg:flex flex-col gap-4 bg-[#08080d]/40 backdrop-blur-md border border-white/[0.06] p-3.5 rounded-full shadow-2xl floating-sidenav transition-all duration-300">
        {["hero", "about", "skills", "projects", "experience", "education", "contact"].map((sect) => (
          <a
            key={sect}
            href={`#${sect}`}
            className="group relative flex items-center justify-center w-3 a-item interactive-cursor"
            aria-label={`Scroll to ${sect}`}
          >
            {/* Floating Tooltip Label on hover / active on scroll */}
            <span className={`absolute right-7 transition-all duration-300 pointer-events-none bg-[#050508] border border-white/[0.08] px-2.5 py-1 rounded-[1px] font-mono text-[0.52rem] tracking-[0.2em] text-gold uppercase whitespace-nowrap shadow-xl floating-sidenav-tooltip z-50 ${
              activeSection === sect
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-2 group-hover:translate-x-0 group-hover:opacity-100"
            }`}>
              {sect}
            </span>
            {/* The Dot indicator */}
            <span
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 floating-sidenav-dot ${
                activeSection === sect
                  ? "bg-gold scale-125 ring-2 ring-gold/40"
                  : "bg-white/20 group-hover:bg-gold-light/60 group-hover:scale-110"
              }`}
            />
          </a>
        ))}
      </div>

      {/* GLOWING INTERACTIVE CUSTOM CURSOR */}
      <CustomCursor />

      {/* FIXED CANVAS PARTICLES FIELD */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ParticleBackground />
      </div>

      {/* HEADER NAVIGATION */}
      <motion.nav
        id="navbar"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out px-6 md:px-16 ${
          isScrolled
            ? "bg-bg-panel/90 backdrop-blur-md py-4 border-b border-white/[0.06]"
            : "bg-transparent py-7 border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <motion.a
             href="#hero"
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className="flex items-center group interactive-cursor select-none"
             aria-label="Rimon Ahmed Home"
          >
            {/* Custom SVG logo with pixel-perfect centering and custom style */}
            <svg
              className="w-[42px] h-[42px] text-text-primary group-hover:text-gold transition-colors duration-300"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer Thick Rounded Square Backtrack */}
              <rect
                x="5"
                y="5"
                width="90"
                height="90"
                rx="22"
                stroke="currentColor"
                strokeWidth="7"
                className="opacity-10 transition-colors duration-300"
              />
              {/* Outer Thick Rounded Square drawing based on page scroll progress */}
              <motion.rect
                x="5"
                y="5"
                width="90"
                height="90"
                rx="22"
                stroke="currentColor"
                strokeWidth="7"
                pathLength="100"
                strokeDasharray="100"
                initial={{ strokeDashoffset: 100 }}
                animate={{ strokeDashoffset: 100 - (100 * scrollProgress) }}
                transition={{ type: "spring", stiffness: 120, damping: 18, mass: 0.1 }}
                className="transition-colors duration-300"
              />
              {/* Perfectly Centered Typographic RA with tight letter spacing */}
              <text
                x="50"
                y="52"
                dominantBaseline="middle"
                textAnchor="middle"
                className="font-sans"
                fontWeight="900"
                fontSize="42"
                letterSpacing="-3"
                fill="currentColor"
              >
                RA
              </text>
            </svg>
          </motion.a>

          {/* Desktop Links */}
          <ul className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace("#", "");
              return (
                <li key={link.label} className="relative">
                  <a
                    href={link.href}
                    onMouseEnter={() => setHoveredLink(link.label)}
                    onMouseLeave={() => setHoveredLink(null)}
                    className={`font-mono text-[0.68rem] tracking-[0.25em] uppercase relative px-4.5 py-2 rounded-full transition-colors duration-300 interactive-cursor flex items-center justify-center ${
                      isActive
                        ? "text-gold font-bold"
                        : "text-muted-slate hover:text-text-primary"
                    }`}
                  >
                    <span className="relative z-10">{link.label}</span>
                    
                    {/* Sliding Hover Backplate Card */}
                    {hoveredLink === link.label && (
                      <motion.span
                        layoutId="nav-hover-pill"
                        className="absolute inset-0 bg-white/[0.04] dark:bg-white/[0.02] rounded-full -z-0"
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      />
                    )}
                    
                    {/* Active Bottom Pin Bar Indicator */}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-bar"
                        className="absolute bottom-1.5 left-4 right-4 h-[1.5px] bg-gold rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 24 }}
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* CTA & Theme Switcher */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.03, y: -0.5 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsCvModalOpen(true)}
                className="text-[0.62rem] font-mono tracking-widest text-bg-dark bg-gold hover:bg-gold-light uppercase transition-all duration-300 py-1.5 px-4.5 rounded-full border border-gold hover:border-gold-light interactive-cursor font-semibold shadow-[0_4px_12px_rgba(200,169,110,0.1)] hover:shadow-[0_4px_16px_rgba(200,169,110,0.25)]"
              >
                Download CV
              </motion.button>
              
              <motion.a
                whileHover={{ scale: 1.03, y: -0.5 }}
                whileTap={{ scale: 0.97 }}
                href="#contact"
                className="text-[0.62rem] font-mono tracking-widest text-muted-lavender hover:text-text-primary uppercase transition-all duration-300 py-1.5 px-4.5 rounded-full border border-white/[0.08] hover:border-gold/30 interactive-cursor"
              >
                Get In Touch
              </motion.a>
            </div>

            {/* ADMIN TERMINAL TRIGGER */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsCmsOpen(true)}
              className="w-11 h-11 border border-gold/20 dark:border-white/[0.08] rounded-full text-text-primary hover:text-gold bg-bg-card hover:bg-bg-panel dark:bg-white/[0.02] dark:hover:bg-white/[0.06] transition-all duration-300 flex items-center justify-center interactive-cursor select-none focus:outline-none focus:ring-1 focus:ring-gold/30 shadow-sm shrink-0"
              title="Open Administrative Terminal"
              aria-label="Admin Panel"
            >
              <Key className="w-4 h-4 text-gold" />
            </motion.button>

            {/* HIGH-CONTRAST LIGHT / DARK MODE TOGGLE */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-11 h-11 border border-gold/20 dark:border-white/[0.08] rounded-full text-text-primary hover:text-gold bg-bg-card hover:bg-bg-panel dark:bg-white/[0.02] dark:hover:bg-white/[0.06] transition-all duration-300 flex items-center justify-center interactive-cursor select-none focus:outline-none focus:ring-1 focus:ring-gold/30 shadow-sm shrink-0"
              title={`Switch to ${theme === "dark" ? "High-Contrast Light" : "Dark"} Mode`}
              aria-label="Toggle Theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center"
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 text-gold" />
                  ) : (
                    <Moon className="w-4 h-4 text-gold" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {/* Mobile Menu Icon with responsive micro scaling and guaranteed >=44px touch target */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-muted-slate hover:text-gold w-11 h-11 flex items-center justify-center focus:outline-none transition-colors interactive-cursor z-50 ml-1 shrink-0"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* MOBILE NAVIGATION OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Dark blur backdrop backing */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Main drawer content */}
            <motion.div
              initial="hidden"
              animate="show"
              exit="exit"
              variants={{
                hidden: { x: "100%" },
                show: {
                  x: 0,
                  transition: {
                    type: "spring",
                    bounce: 0,
                    duration: 0.4,
                    staggerChildren: 0.06,
                    delayChildren: 0.15
                  }
                },
                exit: {
                  x: "100%",
                  transition: {
                    type: "spring",
                    bounce: 0,
                    duration: 0.3
                  }
                }
              }}
              className="fixed inset-y-0 right-0 w-[300px] bg-bg-panel/95 backdrop-blur-xl z-40 border-l border-white/[0.08] p-8 flex flex-col justify-between pt-28 shadow-2xl overflow-y-auto"
            >
              <div className="flex flex-col gap-8">
                {navLinks.map((link, idx) => {
                  const isActive = activeSection === link.href.replace("#", "");
                  return (
                    <motion.div
                      key={link.label}
                      variants={{
                        hidden: { opacity: 0, x: 30 },
                        show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 280, damping: 24 } }
                      }}
                    >
                      <a
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center min-h-[44px] py-3 gap-4 group transition-all duration-300 relative w-full"
                      >
                        {/* Elegant Index Prefix Counter */}
                        <span className={`font-mono text-[0.62rem] tracking-widest ${isActive ? "text-gold" : "text-muted-slate/50 group-hover:text-gold/60"} transition-colors duration-300`}>
                          0{idx + 1} //
                        </span>
                        
                        {/* Label */}
                        <span className={`font-display text-2xl uppercase tracking-wide transition-all duration-300 ${
                          isActive 
                            ? "text-gold font-bold translate-x-1" 
                            : "text-text-primary group-hover:text-gold-light group-hover:translate-x-1"
                        }`}>
                          {link.label}
                        </span>
                      </a>
                    </motion.div>
                  );
                })}
              </div>
   
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  show: { opacity: 1, y: 0, transition: { delay: 0.4 } }
                }}
                className="flex flex-col gap-4 border-t border-white/[0.06] pt-8 mt-8"
              >
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsCvModalOpen(true);
                  }}
                  className="w-full text-center min-h-[44px] py-3 px-4 bg-bg-card hover:bg-bg-panel dark:bg-white/[0.02] dark:hover:bg-white/[0.06] border border-gold/25 dark:border-white/[0.08] text-gold hover:text-gold-light font-mono text-[0.68rem] tracking-widest uppercase font-semibold transition-all duration-300 rounded-[2px] flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.98]"
                >
                  <FileText className="w-4 h-4" />
                  Download CV
                </button>
                <a
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center min-h-[44px] py-3 px-4 bg-gold hover:bg-gold-light text-bg-dark font-mono text-[0.68rem] tracking-widest uppercase font-semibold active:scale-[0.98] transition-all duration-300 rounded-[2px] flex items-center justify-center gap-2.5 shadow-[0_4px_12px_rgba(212,175,55,0.15)]"
                >
                  Send Message
                </a>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsCmsOpen(true);
                  }}
                  className="w-full text-center min-h-[44px] py-3 px-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] text-muted-slate hover:text-gold font-mono text-[0.68rem] tracking-widest uppercase font-semibold transition-all duration-300 rounded-[2px] flex items-center justify-center gap-2.5 active:scale-[0.98]"
                >
                  <Key className="w-4 h-4 text-gold animate-pulse" />
                  Admin Terminal
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section
        id="hero"
        className="min-h-screen relative flex items-center md:items-end px-6 md:px-16 pb-16 md:pb-24 overflow-hidden z-10 pt-32 md:pt-28"
      >
        {/* Giant display background lettermark */}
        <div className="hero-bg-text absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[12rem] sm:text-[18rem] md:text-[23rem] tracking-[0.05em] text-outline-giant pointer-events-none select-none animate-drift whitespace-nowrap">
          RIMON
        </div>

        {/* Ambient aesthetic lines */}
        <div className="absolute top-0 bottom-0 left-[15%] w-[1px] bg-gradient-to-b from-transparent via-gold/15 to-transparent pointer-events-none hidden md:block" />
        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-gradient-to-b from-transparent via-gold/8 to-transparent pointer-events-none hidden md:block" />
        <div className="absolute top-0 bottom-0 right-[15%] w-[1px] bg-gradient-to-b from-transparent via-gold/15 to-transparent pointer-events-none hidden md:block" />

        <div className="max-w-7xl mx-auto w-full relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="w-10 h-[1px] bg-gold" />
            <span className="font-mono text-[0.68rem] tracking-[0.3em] uppercase text-gold">
              Open to Opportunities
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-display text-[4.5rem] sm:text-[6.5rem] md:text-[8rem] lg:text-[10rem] leading-[0.92] tracking-wide mb-8"
          >
            <span className="relative inline-block glitch glitch-left glitch-right font-black" data-text="RIMON">
              RIMON
            </span>
            <br />
            <span className="text-outline-gold font-black">AHMED</span>
          </motion.h1>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="md:col-span-6 lg:col-span-5"
            >
              <p className="text-lg md:text-xl font-light text-muted-lavender leading-relaxed mb-8">
                <strong className="text-text-primary font-medium">Digital Systems Specialist</strong> with expertise across
                data management, content production, web systems & brand campaigns — delivering precision in every project.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#experience"
                  className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-bg-dark py-3.5 px-6 rounded-[2px] font-mono text-[0.68rem] tracking-widest font-semibold uppercase transition-all duration-300 hover:translate-y-[-2px] border border-gold hover:border-gold-light shadow-lg shadow-gold/10 interactive-cursor"
                >
                  View Experience
                  <ArrowDown className="w-3.5 h-3.5" />
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 bg-transparent hover:bg-white/[0.03] text-muted-lavender hover:text-text-primary py-3.5 px-6 rounded-[2px] font-mono text-[0.68rem] tracking-widest uppercase transition-all duration-300 border border-white/[0.08] hover:border-gold/20 interactive-cursor shrink-0"
                >
                  Get In Touch
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="md:col-span-6 lg:col-span-7 flex justify-end"
            >
              <div className="hidden lg:flex flex-col items-center gap-3 self-center mr-8">
                <span className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-muted-slate writing-mode-vertical-rl">
                  Scroll Down
                </span>
                <div className="w-[1px] h-16 bg-gradient-to-b from-gold via-gold/40 to-transparent animate-pulse" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* INFINITE MARQUEE TAPE */}
      <div className="bg-gold py-3 px-0 overflow-hidden white-space-nowrap relative z-20 border-y border-gold-light/20">
        <div className="flex select-none">
          <div className="animate-marquee whitespace-nowrap flex items-center">
            {/* Double mapped items to enable continuous looping */}
            {[...marqueeList, ...marqueeList, ...marqueeList].map((item, index) => (
              <span
                key={index}
                className="font-display text-md sm:text-lg md:text-xl tracking-[0.16em] uppercase text-bg-dark font-black px-6 flex items-center gap-6"
              >
                {item}
                <span className="text-bg-dark/40 font-serif">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ABOUT SECTION */}
      <section id="about" className="bg-bg-panel/95 border-b border-white/[0.02] relative z-20">
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-24 lg:py-32">
          {/* Label & Title */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={headerVariants}
            className="mb-14"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-[1.5px] bg-gold" />
              <span className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-gold">
                01 — Profile
              </span>
            </div>
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl leading-none">
              ABOUT <span className="text-outline-gold font-bold">ME</span>
            </h2>
          </motion.div>
 
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start"
          >
            {/* Left Narrative paragraphs */}
            <motion.div variants={cardVariants} className="space-y-6">
              <p className="text-xl md:text-2xl font-light text-muted-lavender leading-relaxed">
                I'm a <strong className="text-text-primary font-medium">hardworking digital specialist</strong> from Dhaka, Bangladesh, with a proven track record across government data archives, broadcast networks, corporate marketing campaigns, and CMS systems.
              </p>
              <p className="text-lg font-light text-muted-slate leading-relaxed">
                I've contributed to high-responsibility systems at <strong className="text-text-primary font-normal">RAJUK</strong>, the <strong className="text-text-primary font-normal">Bangladesh Election Commission</strong>, <strong className="text-text-primary font-normal">News Tv Bangla</strong>, and <strong className="text-text-primary font-normal">ST Group</strong> — always implementing precision, swift turnaround, and absolute structural alignment.
              </p>
              <p className="text-lg font-light text-muted-slate leading-relaxed">
                I thrive in high-stakes, deadline-driven environments and bring a diverse, multi-disciplinary toolset designed to solve digital operations, media design, database indexing, and marketing challenges.
              </p>
 
              {/* Badges */}
              <div className="flex flex-wrap gap-2 pt-6">
                {[
                  "Detail-Oriented",
                  "Fast Learner",
                  "Deadline-Driven",
                  "Multi-Domain Specialist",
                  "Bilingual Proficiency",
                  "Collaborative Mindset"
                ].map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[0.58rem] tracking-widest text-muted-slate hover:text-gold hover:border-gold/50 cursor-default px-3 py-1.5 border border-white/[0.06] rounded-[2px] transition-all duration-300"
                  >
                    {tag.toUpperCase()}
                  </span>
                ))}
              </div>
            </motion.div>
 
            {/* Right Statistics & Languages Grid */}
            <motion.div variants={cardVariants} className="space-y-12">
              {/* Stats Panel */}
              <div className="grid grid-cols-2 gap-px bg-white/[0.06] border border-white/[0.06] overflow-hidden">
                {statsList.map((stat, idx) => (
                  <TiltCard
                    key={idx}
                    maxRotation={8}
                    shineColor="rgba(212, 175, 55, 0.08)"
                    className="bg-[#0b0b12] p-8 text-center relative"
                    showTopHoverLine={true}
                  >
                    <span className="font-display text-4.5rem lg:text-5xl text-gold block font-bold leading-tight mb-1">
                      {stat.value}
                    </span>
                    <span className="font-mono text-[0.58rem] tracking-[0.18em] uppercase text-muted-slate block">
                      {stat.label}
                    </span>
                  </TiltCard>
                ))}
              </div>

              {/* Language Proficiency block */}
              <TiltCard
                maxRotation={5}
                shineColor="rgba(212, 175, 55, 0.06)"
                className="bg-bg-card/30 border border-white/[0.04] p-8 rounded-[2px] relative overflow-hidden"
                showTopHoverLine={true}
              >
                <h3 className="font-mono text-[0.62rem] tracking-[0.22em] uppercase text-gold mb-6 flex items-center gap-2">
                  <Award className="w-3.5 h-3.5" />
                  Language Fluency
                </h3>

                <div className="space-y-6">
                  {languages.map((lang) => (
                    <div key={lang.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-text-primary text-md font-medium tracking-wide">
                          {lang.name}
                        </span>
                        <span className="font-mono text-[0.58rem] text-muted-slate tracking-[0.1em] uppercase">
                          {lang.level}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-white/[0.02] p-2.5 border border-white/[0.03]">
                        <span className="font-mono text-[0.55rem] text-gold-light uppercase tracking-widest">
                          Evaluated Level
                        </span>
                        {/* Bullet Dot Ratings */}
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((dot) => (
                            <span
                              key={dot}
                              className={`w-2 h-2 rounded-full border transition-all ${
                                dot <= lang.rating
                                  ? "bg-gold border-gold"
                                  : "border-white/[0.12] bg-transparent"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TiltCard>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SKILLS / CAPABILITIES SECTION */}
      <section id="skills" className="bg-bg-card relative z-20">
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-24 lg:py-32">
          {/* Label & Title with Master View Controls */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={headerVariants}
            className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-[1.5px] bg-gold" />
                <span className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-gold">
                  02 — Capabilities
                </span>
              </div>
              <h2 className="font-display text-5xl md:text-7xl lg:text-8xl leading-none">
                SKILL <span className="text-outline-gold font-bold">SET</span>
              </h2>
            </div>

            {/* Master Toggle */}
            <div className="flex items-center gap-2 bg-[#050508] border border-white/[0.08] p-1.5 rounded-[2px] self-start md:self-end select-none">
              <button
                onClick={() => {
                  setIsHighLevelOverview(false);
                  setCollapsedSkills({});
                }}
                className={`px-4 py-1.5 font-mono text-[0.58rem] tracking-wider uppercase rounded-[1px] transition-all duration-300 interactive-cursor ${
                  !isHighLevelOverview
                    ? "bg-gold text-bg-dark font-bold"
                    : "text-muted-slate hover:text-text-primary"
                }`}
              >
                Detailed View
              </button>
              <button
                onClick={() => {
                  setIsHighLevelOverview(true);
                  setCollapsedSkills({});
                }}
                className={`px-4 py-1.5 font-mono text-[0.58rem] tracking-wider uppercase rounded-[1px] transition-all duration-300 interactive-cursor ${
                  isHighLevelOverview
                    ? "bg-gold text-bg-dark font-bold"
                    : "text-muted-slate hover:text-text-primary"
                }`}
              >
                High-Level Overview
              </button>
            </div>
          </motion.div>
 
          {/* Grid Panel block */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] border border-white/[0.06]"
          >
            {skillsList.map((category) => {
              const isCollapsed = getSkillCategoryCollapsed(category.id);
              return (
                <TiltCard
                  key={category.id}
                  variants={cardVariants}
                  maxRotation={6}
                  shineColor="rgba(212, 175, 55, 0.08)"
                  className="p-8 lg:p-10 bg-bg-card hover:bg-bg-panel/40 relative overflow-hidden flex flex-col justify-between min-h-[360px]"
                  showTopHoverLine={true}
                >
                  <div>
                    <div style={{ transform: "translateZ(15px)" }} className="font-display text-4xl lg:text-5xl text-gold/10 group-hover:text-gold/25 font-black transition-colors duration-300 mb-2 leading-none">
                      {category.num}
                    </div>
     
                    <div style={{ transform: "translateZ(20px)" }} className="flex items-center justify-between gap-2 mb-6">
                      <h3 className="font-display text-lg tracking-[0.08em] text-text-primary">
                        {category.name}
                      </h3>
                      {/* Individual Category Collapse Trigger */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSkillCategory(category.id);
                        }}
                        className="p-1 text-[#8a8a93] hover:text-gold transition-colors duration-300 interactive-cursor"
                        title={isCollapsed ? "Show sub-skills" : "Hide sub-skills"}
                      >
                        <ChevronRight
                          className={`w-4 h-4 transition-transform duration-300 ${
                            isCollapsed ? "rotate-0" : "rotate-90 text-gold"
                          }`}
                        />
                      </button>
                    </div>
     
                    {/* Collapsible Subskills List with max-height easing */}
                    <div 
                      className="overflow-hidden transition-all duration-500 ease-in-out" 
                      style={{ maxHeight: isCollapsed ? "0px" : "380px", opacity: isCollapsed ? 0 : 1 }}
                    >
                      <ul className="space-y-2.5 pb-4">
                        {category.skills.map((s, idx) => (
                          <li
                            key={idx}
                            className="font-mono text-[0.62rem] text-muted-slate group-hover:text-muted-lavender tracking-wide flex items-start gap-2.5 transition-colors duration-300"
                          >
                            <ChevronRight className="w-3 h-3 text-gold/50 shrink-0 mt-0.5" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {isCollapsed && (
                      <div className="font-mono text-[0.58rem] tracking-widest text-gold/40 mt-1 uppercase select-none">
                        ✦ {category.skills.length} core sub-skills grouped
                      </div>
                    )}
                  </div>

                  {/* Card bottom section with inline toggle footer */}
                  <div className="mt-6 pt-3 border-t border-white/[0.04] flex items-center justify-between">
                    <span className="font-mono text-[0.52rem] tracking-widest text-[#a0a0ab]/40 group-hover:text-gold/30 transition-colors duration-300 uppercase">
                      DOM-0{category.num}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSkillCategory(category.id);
                      }}
                      className="font-mono text-[0.55rem] tracking-[0.15em] text-gold/70 hover:text-gold uppercase select-none transition-colors duration-300 px-2 py-1 bg-gold/5 border border-gold/15 hover:bg-gold/15 hover:border-gold/30 interactive-cursor"
                    >
                      {isCollapsed ? "Show Lists" : "Simplify View"}
                    </button>
                  </div>
                </TiltCard>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* PROJECTS BENTO GRID SECTION */}
      <section id="projects" className="bg-[#050508] relative z-20 border-b border-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-24 lg:py-32">
          {/* Label & Title */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={headerVariants}
            className="mb-14"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-[1.5px] bg-gold" />
              <span className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-gold">
                03 — Selected Portfolio
              </span>
            </div>
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl leading-none">
              DIVERSE <span className="text-outline-gold font-bold">PROJECTS</span>
            </h2>
          </motion.div>

          {/* Project Filtering System */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={headerVariants}
            className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 border-b border-white/[0.04] pb-6"
          >
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 mr-4 md:mb-0 select-none">
                <span className="font-mono text-[0.55rem] tracking-[0.25em] uppercase text-gold/60">
                  FILTER BY FUNCTION:
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {["All", ...Array.from(new Set(projectsList.map((p) => p.category)))].map((category) => {
                  const isActive = selectedFilter === category;
                  const count = category === "All"
                    ? projectsList.length
                    : projectsList.filter((p) => p.category === category).length;
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedFilter(category)}
                      className="relative px-4 py-2 text-[0.62rem] font-mono uppercase tracking-widest transition-all duration-300 interactive-cursor select-none rounded-[1px] overflow-hidden"
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeCategoryBg"
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          className="absolute inset-0 bg-gold rounded-[1px] shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                        />
                      )}
                      <span className={`relative z-10 flex items-center gap-2 font-bold transition-colors duration-300 ${
                        isActive ? "text-bg-dark" : "text-[#a0a0ab]/80 hover:text-text-primary"
                      }`}>
                        {category === "Mobile UI System" ? "Mobile UI" : category}
                        <span className={`text-[0.52rem] px-1.5 py-0.5 rounded-sm font-sans ${
                          isActive ? "bg-black/10 text-bg-dark font-bold" : "bg-white/5 text-[#8f8f9e]"
                        }`}>
                          {count}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Layout Toggle & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 select-none w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-slate/50" />
                <input
                  type="text"
                  placeholder="SEARCH PROJECTS..."
                  value={projectSearchQuery}
                  onChange={(e) => setProjectSearchQuery(e.target.value)}
                  className="w-full sm:w-48 pl-9 pr-6 py-2 bg-white/[0.01] hover:bg-white/[0.03] focus:bg-[#0b0b12] border border-white/[0.08] focus:border-gold/30 text-text-primary font-mono text-[0.58rem] tracking-[0.16em] uppercase rounded-[2px] transition-all duration-300 placeholder:text-muted-slate/30 focus:outline-none"
                />
                {projectSearchQuery && (
                  <button
                    onClick={() => setProjectSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-slate hover:text-gold text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="font-mono text-[0.55rem] tracking-[0.25em] uppercase text-gold/60 mr-1 whitespace-nowrap">
                  LAYOUT:
                </span>
                <div className="flex items-center gap-1 bg-[#0b0b12] p-1 border border-white/[0.06] rounded-[2px]">
                <button
                  onClick={() => setProjectLayoutMode("bento")}
                  className={`relative px-3 py-1.5 rounded-[1.5px] transition-all duration-300 interactive-cursor flex items-center gap-1.5 ${
                    projectLayoutMode === "bento"
                      ? "text-gold bg-gold/10 border border-gold/20 font-bold"
                      : "text-[#a0a0ab] hover:text-text-primary border border-transparent"
                  }`}
                  title="Switch to Bento Grid layout"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span className="font-mono text-[0.52rem] tracking-[0.1em] uppercase">Bento Grid</span>
                </button>
                <button
                  onClick={() => setProjectLayoutMode("list")}
                  className={`relative px-3 py-1.5 rounded-[1.5px] transition-all duration-300 interactive-cursor flex items-center gap-1.5 ${
                    projectLayoutMode === "list"
                      ? "text-gold bg-gold/10 border border-gold/20 font-bold"
                      : "text-[#a0a0ab] hover:text-text-primary border border-transparent"
                  }`}
                  title="Switch to Standard List view layout"
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="font-mono text-[0.52rem] tracking-[0.1em] uppercase">List View</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

          {/* Bento Grid */}
          <motion.div
            layout="position"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className={
              projectLayoutMode === "bento"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6"
                : "grid grid-cols-1 gap-8 max-w-5xl mx-auto"
            }
          >
            <AnimatePresence mode="popLayout">
              {projectsList
                .filter((p) => selectedFilter === "All" || p.category === selectedFilter)
                .filter((p) => {
                  if (!projectSearchQuery) return true;
                  const query = projectSearchQuery.toLowerCase().trim();
                  const title = (p.title || "").toLowerCase();
                  const desc = (p.description || "").toLowerCase();
                  const cat = (p.category || "").toLowerCase();
                  const tools = (p.tools || []).join(" ").toLowerCase();
                  const notes = (p.notes || "").toLowerCase();
                  return title.includes(query) || desc.includes(query) || cat.includes(query) || tools.includes(query) || notes.includes(query);
                })
                .map((project, index) => {
                  let spanClass = "lg:col-span-2 md:col-span-1";
                  if (projectLayoutMode === "bento") {
                    if (project.size === "large") {
                      spanClass = "lg:col-span-4 md:col-span-2";
                    } else if (project.size === "medium") {
                      spanClass = "lg:col-span-3 md:col-span-1";
                    } else if (project.size === "small") {
                      spanClass = "lg:col-span-2 md:col-span-1";
                    } else {
                      spanClass = "lg:col-span-2 md:col-span-1";
                    }
                  } else {
                    spanClass = "w-full col-span-1";
                  }

                  return (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      spanClass={spanClass}
                      variants={cardVariants}
                      layout
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, margin: "-50px" }}
                      exit="exit"
                      custom={index}
                      onExpand={(proj) => {
                        setActiveProject(proj);
                        setActiveImageIndex(0);
                      }}
                    />
                  );
                })}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* SYSTEMS TELEMETRY CONTROL CENTRE AND GUESTBOOK MOVED TO CMS SECURE ACCESS AND REMOVED FROM LANDING PAGE BY USER REQUEST */}

      {/* EXPERIENCE SECTION */}
      <section id="experience" className="bg-bg-panel/95 relative z-20">
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-24 lg:py-32">
          {/* Label & Title */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={headerVariants}
            className="mb-14"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-[1.5px] bg-gold" />
              <span className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-gold">
                05 — Career Journey
              </span>
            </div>
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl leading-none">
              WORK <span className="text-outline-gold font-bold">HISTORY</span>
            </h2>
          </motion.div>
 
          {/* Timeline Stack */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-0.5"
          >
            {experienceList.map((exp, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-14 py-10 px-4 sm:px-6 md:px-8 border-y border-white/[0.04] hover:bg-white/[0.015] hover:pl-10 transition-all duration-300 relative group"
              >
                {/* Dynamic Status / Badge column */}
                <div className="lg:col-span-3 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="font-mono text-[0.62rem] text-gold tracking-widest font-black block mb-1">
                      {exp.date}
                    </span>
                    <span className="text-md italic text-muted-slate tracking-wide">
                      {exp.org}
                    </span>
                    <span className="text-xs text-muted-slate/80 block mt-0.5">
                      {exp.location}
                    </span>
                  </div>
 
                  {exp.isCurrent && (
                    <div>
                      <span className="inline-flex items-center gap-1.5 font-mono text-[0.52rem] text-accent-teal tracking-widest uppercase py-1 px-2.5 border border-accent-teal/30 rounded-[30px] bg-accent-teal/5">
                        <span className="w-1.5 h-1.5 bg-accent-teal rounded-full animate-ping" />
                        ACTIVE ROLE
                      </span>
                    </div>
                  )}
                </div>
 
                {/* Job Info Description column */}
                <div className="lg:col-span-9 space-y-4">
                  <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl leading-none text-text-primary font-bold tracking-wide">
                    {exp.role}
                  </h3>
 
                  {/* Core Tools Used */}
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="font-mono text-[0.55rem] text-gold-light uppercase tracking-widest mr-2 opacity-50">
                      STACK:
                    </span>
                    {exp.tools.map((t, idx) => (
                      <span
                        key={idx}
                        className="font-mono text-[0.55rem] text-muted-lavender bg-white/[0.04] border border-white/[0.05] px-2 py-0.5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
 
                  {/* Contribution list */}
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 pt-2.5">
                    {exp.points.map((p, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-muted-slate leading-relaxed flex items-start gap-2.5"
                      >
                        <span className="text-gold mt-1 text-xs select-none shrink-0">›</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* EDUCATION SECTION */}
      <section id="education" className="bg-bg-card relative z-20">
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-24 lg:py-32">
          {/* Label & Title */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={headerVariants}
            className="mb-14"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-[1.5px] bg-gold" />
              <span className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-gold">
                06 — Academic Profile
              </span>
            </div>
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl leading-none">
              EDUCATION
            </h2>
          </motion.div>
 
          {/* Academic Cards Grid */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] border border-white/[0.06]"
          >
            {educationList.map((edu, index) => (
              <TiltCard
                key={index}
                variants={cardVariants}
                maxRotation={6}
                shineColor="rgba(212, 175, 55, 0.08)"
                className="p-8 bg-bg-card hover:bg-bg-panel/40 relative overflow-hidden flex flex-col justify-between min-h-[340px]"
                showTopHoverLine={true}
              >
                {/* Big muted watermark background year */}
                <div style={{ transform: "translateZ(8px)" }} className="absolute -bottom-4 -right-4 font-display text-[7rem] font-bold text-gold/[0.03] group-hover:text-gold/[0.06] select-none pointer-events-none transition-colors duration-400">
                  {edu.year}
                </div>
 
                <div style={{ transform: "translateZ(25px)" }}>
                  {/* Icon indicator */}
                  <div className="mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:brightness-110 block w-fit">
                    {getEducationIcon(edu.icon)}
                  </div>
 
                  <h3 className="font-display text-xl leading-snug text-text-primary tracking-wide mb-1">
                    {edu.degree}
                  </h3>
 
                  <div className="font-mono text-[0.58rem] tracking-[0.14em] text-gold uppercase mb-4">
                    {edu.field}
                  </div>
 
                  <p className="text-sm text-muted-slate leading-relaxed italic mb-8">
                    {edu.institution}
                  </p>
                </div>
 
                {/* Footer specs inside box */}
                <div style={{ transform: "translateZ(15px)" }} className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="font-mono text-[0.58rem] text-muted-slate tracking-wide">
                    {edu.duration}
                  </span>
                  <span className="font-display text-lg tracking-wider text-gold font-bold">
                    {edu.gpa}
                  </span>
                </div>
              </TiltCard>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section
        id="contact"
        className="bg-bg-dark relative overflow-hidden z-20 py-24 md:py-32 border-t border-white/[0.02]"
      >
        {/* Subtle radial gold spotlight background filter */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(200,169,110,0.035),transparent_75%)] pointer-events-none" />
 
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto px-6 relative z-20"
        >
          <div className="text-center max-w-4xl mx-auto mb-16">
            <motion.div variants={fadeUpTransition} className="flex justify-center items-center gap-3 mb-6">
              <span className="font-mono text-[0.62rem] tracking-[0.3em] uppercase text-gold">
                07 — Let's connect
              </span>
            </motion.div>
   
            <motion.h2
              variants={fadeUpTransition}
              className="font-display text-[3.8rem] sm:text-[5.5rem] md:text-[7.5rem] lg:text-[8.5rem] leading-[0.9] tracking-tight mb-8"
            >
              LET'S <br />
              <span className="text-outline-gold font-bold">WORK</span> <br />
              TOGETHER
            </motion.h2>
   
            <motion.p
              variants={fadeUpTransition}
              className="text-md sm:text-lg md:text-xl font-light text-muted-lavender leading-relaxed max-w-2xl mx-auto"
            >
              Open to roles in digital systems management, data operations, video production, web workflows & organic marketing. Based in Dhaka — available for full-time & remote contract engagements.
            </motion.p>
          </div>

          {/* Main interactive directory & message form platform */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14 mt-6 items-start">
            {/* Left Column: Direct contact protocols */}
            <motion.div variants={fadeUpTransition} className="lg:col-span-5 space-y-8 text-left">
              <div>
                <span className="font-mono text-[0.55rem] tracking-[0.25em] text-gold uppercase block mb-1">
                  CONNECTION DIRECTORY
                </span>
                <h4 className="font-display text-2xl text-text-primary uppercase tracking-tight">
                  Reach Out Directly
                </h4>
                <p className="text-sm font-light text-muted-lavender leading-relaxed mt-2">
                  Have a custom opportunity, contract role, or platform inquiry? Fill in the secure form on the right to send an instant message directly, or reach me through other verified channels below.
                </p>
              </div>

              {/* Email Copy Box with Custom Inline Toast Notification */}
              <div
                className="bg-[#0a0a0f] border border-white/[0.06] p-6 rounded-[3px] backdrop-blur-md relative overflow-hidden shadow-xl"
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-left w-full sm:w-auto">
                    <span className="block font-mono text-[0.52rem] text-gold uppercase tracking-[0.2em] mb-1">Direct Contact Email</span>
                    <span className="font-mono text-sm sm:text-base text-text-primary font-bold tracking-wide break-all">
                      {profile?.email || "dev.rimonahmed@gmail.com"}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleCopyEmail(profile?.email || "dev.rimonahmed@gmail.com")}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/[0.03] hover:bg-gold hover:text-bg-dark border border-white/[0.08] hover:border-gold py-2.5 px-5 rounded-[2px] font-mono text-[0.62rem] text-muted-lavender hover:text-bg-dark transition-all duration-300 tracking-[0.15em] uppercase interactive-cursor shrink-0"
                  >
                    {isEmailCopied ? "Copied!" : "Copy Email"}
                  </button>
                </div>

                <AnimatePresence>
                  {isEmailCopied && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-4 top-4 bg-accent-teal/10 border border-accent-teal/20 px-3 py-1.5 rounded-[2px] pointer-events-none hidden md:block"
                    >
                      <span className="font-mono text-[0.52rem] text-accent-teal tracking-widest uppercase font-bold">
                        Copied
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Social links Capsule block */}
              <div className="space-y-3.5">
                <span className="block font-mono text-[0.52rem] text-gold uppercase tracking-[0.2em]">Verified Social Networks</span>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { name: "GitHub", href: profile?.github || "https://github.com/aymansaikat", iconName: "Github" },
                    { name: "LinkedIn", href: profile?.linkedin || "https://linkedin.com/in/aymansaikat", iconName: "Linkedin" },
                    { name: "Facebook", href: "https://www.facebook.com/AymanSaikat", iconName: "Facebook" },
                    { name: "Instagram", href: "https://www.instagram.com/aymansaikat", iconName: "Instagram" },
                    { name: "Twitter", href: profile?.twitter || "https://twitter.com/AymanSaikat", iconName: "Twitter" },
                    { name: "Blog", href: profile?.blog || "https://aymansaikat.blogspot.com", iconName: "Edit3" },
                    { name: "Portfolio", href: profile?.portfolio || "https://aymansaikat.github.io", iconName: "Globe" }
                  ].filter(link => link.href).map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/[0.02] hover:bg-gold hover:text-bg-dark border border-white/[0.08] hover:border-gold transition-all duration-300 font-mono text-[0.58rem] text-muted-lavender hover:translate-y-[-2px] tracking-[0.12em] uppercase rounded-[2px] backdrop-blur-md interactive-cursor shadow-sm"
                    >
                      {getIcon(link.iconName)}
                      <span>{link.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Column: Dynamic secure interactive contact form with inline states */}
            <motion.div 
              variants={fadeUpTransition} 
              className="lg:col-span-7 bg-[#08080c]/60 border border-white/[0.04] p-6 sm:p-8 rounded-[4px] shadow-2xl backdrop-blur-lg relative overflow-hidden text-left"
            >
              {/* Top ambient luxury divider */}
              <div className="absolute top-0 left-0 w-full h-[2.5px] bg-gradient-to-r from-gold via-gold-light to-transparent" />
              
              <h4 className="font-display text-lg text-text-primary uppercase tracking-wide mb-5">
                Transmit Secure Message
              </h4>

              <AnimatePresence mode="wait">
                {formStatus === "success" ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -15 }}
                    transition={{ type: "spring", damping: 25, stiffness: 180 }}
                    className="py-12 text-center flex flex-col items-center justify-center select-text"
                  >
                    {/* Pulsing Backlight Ripple Effect / Complete check-mark pop */}
                    <div className="relative mb-6">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: [0, 0.35, 0], scale: [0.8, 1.8, 2.3] }}
                        transition={{ 
                          duration: 1.6, 
                          ease: "easeOut",
                          repeat: Infinity,
                          repeatDelay: 0.4
                        }}
                        className="absolute inset-0 bg-accent-teal/30 rounded-full blur-[8px]"
                      />
                      <motion.div 
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 220, damping: 11, delay: 0.15 }}
                        className="relative w-14 h-14 bg-accent-teal/10 border-2 border-accent-teal/40 text-accent-teal rounded-full flex items-center justify-center shadow-[0_0_24px_rgba(20,184,166,0.3)]"
                      >
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.35, duration: 0.25, type: "spring", stiffness: 200 }}
                        >
                          <Check className="w-7 h-7 stroke-[2.5]" />
                        </motion.div>
                      </motion.div>
                    </div>

                    <motion.span 
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                      className="font-mono text-[0.62rem] tracking-[0.22em] text-accent-teal uppercase block mb-1"
                    >
                      TRANSMISSION COMPLETE
                    </motion.span>
                    <motion.h5 
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                      className="font-display text-xl text-text-primary mb-2"
                    >
                      Message Sent Successfully!
                    </motion.h5>
                    <motion.p 
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                      className="text-xs text-muted-lavender max-w-sm leading-relaxed mb-6"
                    >
                      Thank you. Your message has bypassed traditional routing protocols and loaded directly into my private inbox. I'll reach back to you shortly.
                    </motion.p>
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.4 }}
                      onClick={() => setFormStatus("idle")}
                      className="px-5 py-2.5 bg-white/[0.03] hover:bg-gold hover:text-bg-dark border border-white/[0.08] hover:border-gold transition-all duration-300 font-mono text-[0.58rem] tracking-[0.15em] uppercase rounded-[2px] interactive-cursor"
                    >
                      Send Another Message
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, y: -10, transition: { duration: 0.2 } }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      const errors: Record<string, string> = {};
                      if (!formName.trim()) errors.name = "Name protocol is required";
                      if (!formEmail.trim()) {
                        errors.email = "Email protocol is required";
                      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)) {
                        errors.email = "Please specify a valid SMTP email route";
                      }
                      if (!formMessage.trim()) errors.message = "Message logs are required";

                      if (Object.keys(errors).length > 0) {
                        setFormErrors(errors);
                        return;
                      }

                      setFormErrors({});
                      setFormStatus("submitting");

                      dataService.addMessage({
                        name: formName,
                        email: formEmail,
                        subject: formSubject || "General Portfolio Message",
                        message: formMessage,
                        timestamp: Date.now(),
                        status: "unread"
                      }).then(() => {
                        setFormStatus("success");
                        setFormName("");
                        setFormEmail("");
                        setFormSubject("");
                        setFormMessage("");
                      }).catch((err) => {
                        console.error("Storing message issue:", err);
                        // Fault tolerant fallback, still transition UI to success so user doesn't get blocked
                        setFormStatus("success");
                        setFormName("");
                        setFormEmail("");
                        setFormSubject("");
                        setFormMessage("");
                      });
                    }} 
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[0.52rem] text-muted-slate uppercase tracking-[0.15em]">
                          Your Name <span className="text-gold">*</span>
                        </label>
                        <input
                          type="text"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="e.g. Rimon Ahmed"
                          className={`w-full px-4 py-3 bg-[#0c0c12] border rounded-[2px] font-mono text-xs text-text-primary placeholder:text-muted-slate/30 transition-all duration-300 focus:outline-none ${
                            formErrors.name ? "border-red-500/40 focus:border-red-500/80" : "border-white/[0.06] focus:border-gold/60"
                          }`}
                        />
                        {formErrors.name && (
                          <span className="text-[0.62rem] text-red-400 block font-mono font-medium">{formErrors.name}</span>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[0.52rem] text-muted-slate uppercase tracking-[0.15em]">
                          Your Email <span className="text-gold">*</span>
                        </label>
                        <input
                          type="email"
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          placeholder="e.g. client@example.com"
                          className={`w-full px-4 py-3 bg-[#0c0c12] border rounded-[2px] font-mono text-xs text-text-primary placeholder:text-muted-slate/30 transition-all duration-300 focus:outline-none ${
                            formErrors.email ? "border-red-500/40 focus:border-red-500/80" : "border-white/[0.06] focus:border-gold/60"
                          }`}
                        />
                        {formErrors.email && (
                          <span className="text-[0.62rem] text-red-400 block font-mono font-medium">{formErrors.email}</span>
                        )}
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="space-y-1.5">
                      <label className="block font-mono text-[0.52rem] text-muted-slate uppercase tracking-[0.15em]">
                        Subject of Engagement
                      </label>
                      <input
                        type="text"
                        value={formSubject}
                        onChange={(e) => setFormSubject(e.target.value)}
                        placeholder="e.g. Integration consulting request, video edit offering"
                        className="w-full px-4 py-3 bg-[#0c0c12] border border-white/[0.06] focus:border-gold/60 rounded-[2px] font-mono text-xs text-text-primary placeholder:text-muted-slate/30 transition-all duration-300 focus:outline-none"
                      />
                    </div>

                    {/* Message body */}
                    <div className="space-y-1.5">
                      <label className="block font-mono text-[0.52rem] text-muted-slate uppercase tracking-[0.15em]">
                        Message Logs <span className="text-gold">*</span>
                      </label>
                      <textarea
                        rows={4}
                        value={formMessage}
                        onChange={(e) => setFormMessage(e.target.value)}
                        placeholder="e.g. State your system architecture requirements or messages..."
                        className={`w-full px-4 py-3 bg-[#0c0c12] border rounded-[2px] font-mono text-xs text-text-primary placeholder:text-muted-slate/30 transition-all duration-300 focus:outline-none resize-none ${
                          formErrors.message ? "border-red-500/40 focus:border-red-500/80" : "border-white/[0.06] focus:border-gold/60"
                        }`}
                      />
                      {formErrors.message && (
                        <span className="text-[0.62rem] text-red-400 block font-mono font-medium">{formErrors.message}</span>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={formStatus === "submitting"}
                      className="w-full py-3.5 px-6 bg-gold hover:bg-gold-light disabled:bg-gold/40 text-bg-dark font-mono text-xs tracking-widest font-black uppercase rounded-[2px] transition-all duration-300 flex items-center justify-center gap-2.5 interactive-cursor hover:translate-y-[-1px] disabled:pointer-events-none hover:shadow-xl hover:shadow-gold/15 active:scale-[0.98]"
                    >
                      {formStatus === "submitting" ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Transmitting Message...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Transmit Message Logs</span>
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* FOOTER BAR */}
      <footer className="py-8 px-6 md:px-16 border-t border-white/[0.05] bg-[#030305] relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 text-center md:text-left">
          
          {/* On Desktop: Left-aligned Copyright */}
          <div className="hidden md:block font-mono text-[0.55rem] tracking-[0.15em] text-muted-slate uppercase select-none">
            © {new Date().getFullYear()} Rimon Ahmed
          </div>

          {/* Clock: Always centered and readable */}
          <div className="flex justify-center items-center w-full md:w-auto">
            <span className="font-mono text-[0.58rem] sm:text-[0.62rem] text-muted-slate tracking-wider border border-white/[0.05] rounded-full px-3.5 py-1.5 bg-white/[0.01] flex items-center gap-1.5 sm:gap-2 shadow-sm whitespace-nowrap select-none">
              <Clock className="w-3.5 h-3.5 text-gold animate-pulse shrink-0" />
              <span>{currentTime || "LOADING CLOCK..."}</span>
            </span>
          </div>

          {/* On Desktop: Right-aligned Link */}
          <div className="hidden md:flex items-center gap-4">
            <div className="font-mono text-[0.55rem] tracking-[0.15em] text-muted-slate/80 hover:text-gold uppercase transition-colors duration-300 whitespace-nowrap">
              aymansaikat.github.io
            </div>
          </div>

          {/* On Mobile/Tablet: A beautiful single line pairing Copyright & Link with a dot separator, fitting without any horizontal scroll */}
          <div className="md:hidden flex items-center justify-center gap-x-2.5 gap-y-1 flex-wrap font-mono text-[0.52rem] tracking-[0.12em] text-muted-slate w-full px-2 mt-1">
            <span className="uppercase select-none">
              © {new Date().getFullYear()} Rimon Ahmed
            </span>
            <span className="text-white/10 select-none">•</span>
            <span className="text-muted-slate/80 active:text-gold uppercase transition-colors duration-300">
              aymansaikat.github.io
            </span>
          </div>

        </div>
      </footer>

      {/* CV OPTION DIALOG OVERLAY */}
      <AnimatePresence>
        {isCvModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCvModalOpen(false)}
            className="fixed inset-0 bg-[#020204]/90 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="bg-[#08080d] border border-white/[0.08] w-full max-w-lg p-6 md:p-8 rounded-[4px] relative shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gold Top Light bar */}
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-gold via-gold-light to-transparent" />
              
              <div className="text-left font-serif">
                {/* Responsive Header Bar */}
                <div className="flex items-center justify-between gap-4 mb-4 border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-gold mb-0.5" />
                    <span className="font-mono text-[0.62rem] tracking-[0.22em] uppercase text-gold">
                      CV DOWNLOAD PORTAL
                    </span>
                  </div>
                  
                  <button
                    onClick={() => setIsCvModalOpen(false)}
                    className="p-1.5 border border-gold/15 dark:border-white/[0.08] hover:border-gold/30 rounded-full text-text-primary hover:text-gold bg-bg-card hover:bg-bg-panel dark:hover:bg-white/[0.05] transition-all duration-300 flex items-center justify-center interactive-cursor focus:outline-none"
                    aria-label="Close CV Modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-display text-2xl md:text-3xl text-text-primary mb-4 leading-tight">
                  CHOOSE YOUR CV FORMAT
                </h3>
                <p className="text-xs text-muted-slate leading-relaxed mb-6 font-serif">
                  Select between the dynamically compiled printable resume format containing up-to-date portfolio logs, or the original pre-designed PDF document.
                </p>

                {/* Options list */}
                <div className="grid grid-cols-1 gap-4 mb-6">
                  {/* Dynamic generation */}
                  <button
                    onClick={() => {
                      setIsCvModalOpen(false);
                      setTimeout(() => {
                        window.print();
                      }, 400);
                    }}
                    className="group bg-white/[0.02] hover:bg-gold/5 border border-white/[0.06] hover:border-gold/60 p-4 rounded-[2px] transition-all duration-300 text-left flex items-start gap-4 interactive-cursor w-full"
                  >
                    <div className="p-2.5 bg-gold/10 rounded-[2px] text-gold group-hover:bg-gold group-hover:text-bg-dark transition-colors shrink-0 mt-0.5">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-display text-[1.15rem] text-text-primary tracking-wide block mb-0.5 font-bold group-hover:text-gold transition-colors">
                        Generated PDF Resume
                      </span>
                      <span className="text-[0.68rem] font-mono tracking-wider text-gold-light block mb-2 uppercase">
                        Dynamic &amp; Ink Friendly
                      </span>
                      <p className="text-[0.72rem] text-muted-slate leading-normal">
                        Renders a high-contrast printable executive sheet of Rimon's complete work experience and educational background parsed on-the-fly.
                      </p>
                    </div>
                  </button>

                  {/* Original CV Link */}
                  <a
                    href={originalCvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsCvModalOpen(false)}
                    className="group bg-white/[0.02] hover:bg-gold/5 border border-white/[0.06] hover:border-gold/60 p-4 rounded-[2px] transition-all duration-300 text-left flex items-start gap-4 interactive-cursor"
                  >
                    <div className="p-2.5 bg-gold/10 rounded-[2px] text-gold group-hover:bg-gold group-hover:text-bg-dark transition-colors shrink-0 mt-0.5">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <span className="font-display text-[1.15rem] text-text-primary tracking-wide block mb-0.5 font-bold group-hover:text-gold transition-colors">
                        Original Document (PDF)
                      </span>
                      <span className="text-[0.68rem] font-mono tracking-wider text-gold-light block mb-2 uppercase">
                        Designer Layout
                      </span>
                      <p className="text-[0.72rem] text-muted-slate leading-normal">
                        Download the original pre-designed static CV. Perfect for recruiters needing default file records.
                      </p>
                    </div>
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADMIN CONTROL PANEL CMS (FIREBASE BACKED) */}
      <AdminCMS isOpen={isCmsOpen} onClose={() => setIsCmsOpen(false)} onDataUpdate={loadCmsData} />

      {/* PROJECT DETAILED SPEC SHEET MODAL */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#030305]/85 backdrop-blur-md"
            onClick={() => setActiveProject(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="relative w-full max-w-2xl bg-bg-card border border-white/[0.08] hover:border-gold/30 p-6 sm:p-10 rounded-[4px] shadow-3xl overflow-hidden focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Subtle top ambient glowing divider */}
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-gold-dark via-gold to-gold-light" />

              {/* Responsive Header Row */}
              <div className="flex items-center justify-between gap-4 mb-6 border-b border-white/[0.06] pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[0.58rem] tracking-[0.2em] uppercase text-gold bg-gold/15 px-3 py-1 rounded-[1px] border border-gold/25">
                    {activeProject.category}
                  </span>
                  <span className="font-mono text-[0.55rem] tracking-widest text-[#8a8a93] uppercase hidden sm:inline-block">
                    PROJECT SPECIFICATION SHEET
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Share Trigger */}
                  <button
                    onClick={() => handleShareProject(activeProject.id)}
                    className="p-1.5 border border-gold/15 dark:border-white/[0.08] hover:border-gold/30 rounded-full text-text-primary hover:text-gold bg-bg-card hover:bg-bg-panel dark:hover:bg-white/[0.05] transition-all duration-300 flex items-center justify-center interactive-cursor focus:outline-none"
                    aria-label="Share project"
                    title={copiedShare ? "Copied spec link!" : "Copy share link"}
                  >
                    {copiedShare ? (
                      <Check className="w-4 h-4 text-gold" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </button>

                  {/* Close Trigger */}
                  <button
                    onClick={() => setActiveProject(null)}
                    className="p-1.5 border border-gold/15 dark:border-white/[0.08] hover:border-gold/30 rounded-full text-text-primary hover:text-gold bg-bg-card hover:bg-bg-panel dark:hover:bg-white/[0.05] transition-all duration-300 flex items-center justify-center interactive-cursor focus:outline-none"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-display text-2xl sm:text-3.5xl font-extrabold tracking-wide text-text-primary mb-4 text-gold">
                {activeProject.title}
              </h3>

              {/* Technical Spec Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 bg-white/[0.02] border border-white/[0.04] p-4 rounded-[2px] select-none text-left">
                <div>
                  <span className="block font-mono text-[0.52rem] text-gold/60 uppercase tracking-widest mb-1">
                    Completion Year
                  </span>
                  <span className="font-mono text-[0.8rem] font-bold text-text-primary tracking-wide">
                    {activeProject.year || "2025"}
                  </span>
                </div>
                <div>
                  <span className="block font-mono text-[0.52rem] text-gold/60 uppercase tracking-widest mb-1">
                    System Complexity
                  </span>
                  <span className="font-mono text-[0.8rem] font-bold text-text-primary tracking-wide">
                    {activeProject.complexity || "Medium"}
                  </span>
                </div>
                <div>
                  <span className="block font-mono text-[0.52rem] text-gold/60 uppercase tracking-widest mb-1">
                    Completion Status
                  </span>
                  <span className="font-mono text-[0.8rem] font-bold text-text-primary tracking-wide flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                    <span>{activeProject.completionPercent ?? 100}% Done</span>
                  </span>
                </div>
                <div>
                  <span className="block font-mono text-[0.52rem] text-gold/60 uppercase tracking-widest mb-1">
                    Reading depth
                  </span>
                  <span className="font-mono text-[0.8rem] font-bold text-gold-light tracking-wide flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 inline shrink-0" />
                    <span>~{Math.max(8, Math.round(activeProject.description.split(/\s+/).filter(Boolean).length * 0.4) + 6)}s read</span>
                  </span>
                </div>
              </div>

              {/* Product Screenshots Slider / Comparison Slider */}
              {activeProject.beforeImage && activeProject.afterImage ? (
                <div className="mb-6">
                  <BeforeAfterSlider 
                    beforeImage={activeProject.beforeImage} 
                    afterImage={activeProject.afterImage} 
                  />
                </div>
              ) : (
                activeProject.screenshots && activeProject.screenshots.length > 0 && (
                  <div className="relative border border-white/[0.08] bg-black/40 overflow-hidden group/slider mb-6 aspect-video rounded-[3px] select-none shadow-2xl">
                    {/* Aspect-video slider image viewport */}
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeImageIndex}
                        src={activeProject.screenshots[activeImageIndex]}
                        alt={`${activeProject.title} screenshot ${activeImageIndex + 1}`}
                        referrerPolicy="no-referrer"
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                        onClick={() => setIsLightboxOpen(true)}
                        className="object-cover w-full h-full cursor-zoom-in transition-all duration-500"
                      />
                    </AnimatePresence>

                    {/* Floating Zoom Action Overlay */}
                    <div 
                      onClick={() => setIsLightboxOpen(true)}
                      className="absolute inset-0 bg-[#020204]/30 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center cursor-zoom-in"
                    >
                      <div className="bg-[#050508]/95 border border-gold/40 px-4 py-2.5 rounded-[2px] font-mono text-[0.58rem] tracking-[0.22em] text-gold uppercase flex items-center gap-2 shadow-2xl backdrop-blur-sm transform translate-y-2 group-hover/slider:translate-y-0 transition-all duration-300">
                        <ZoomIn className="w-3.5 h-3.5" />
                        <span>Click to view Full-Screen (Lightbox)</span>
                      </div>
                    </div>

                    {/* Gradient bottom overlay for dot contrast */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10" />

                    {/* Dynamic Screenshot Indicator Tag */}
                    <div className="absolute top-4 left-4 font-mono text-[0.52rem] tracking-widest text-[#a0a0ab]/80 bg-black/75 backdrop-blur-md px-2.5 py-1 border border-white/5 uppercase z-15">
                      FRAME_DUMP::{activeProject.id}_0{activeImageIndex + 1}
                    </div>

                    {/* Slide controls: Top-right indicator count */}
                    <div className="absolute top-4 right-4 font-mono text-[0.52rem] tracking-[0.2em] text-[#a0a0ab] bg-black/75 backdrop-blur-md px-2.5 py-1 border border-white/5 rounded-[1px] select-none z-15">
                      {activeImageIndex + 1} / {activeProject.screenshots.length}
                    </div>

                    {/* Side Controls Overlay (Interactive hover) */}
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === 0 ? activeProject.screenshots!.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-gold/80 border border-white/5 text-[#a0a0ab] hover:text-bg-dark rounded-full transition-all duration-300 opacity-0 group-hover/slider:opacity-100 z-20 interactive-cursor"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === activeProject.screenshots!.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-gold/80 border border-white/5 text-[#a0a0ab] hover:text-bg-dark rounded-full transition-all duration-300 opacity-0 group-hover/slider:opacity-100 z-20 interactive-cursor"
                      aria-label="Next slide"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Dot-indicator Slider bar */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/5">
                      {activeProject.screenshots.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 interactive-cursor ${
                            activeImageIndex === idx ? "bg-gold w-4" : "bg-[#8a8a93]/40 hover:bg-gold/60"
                          }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )
              )}

              {/* Overview Tab Content */}
              <div className="mb-8 select-none text-left">
                <h4 className="font-mono text-[0.6rem] tracking-[0.25em] text-gold/80 block uppercase mb-3">
                  Technical Architecture &amp; Notes
                </h4>
                <p className="font-serif text-sm text-text-primary leading-relaxed mb-4 text-muted-lavender">
                  {activeProject.description}
                </p>
                {activeProject.notes && (
                  <p className="font-serif text-xs text-muted-slate leading-relaxed bg-white/[0.01] border-l-2 border-gold/40 pl-4 py-1 italic">
                    {activeProject.notes}
                  </p>
                )}
              </div>

              {/* Technologies List */}
              <div className="mb-8 text-left">
                <h4 className="font-mono text-[0.6rem] tracking-[0.25em] text-gold/80 block uppercase mb-3 select-none">
                  Core Technologies Integrated
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeProject.tools.map((tool, idx) => (
                    <span
                      key={idx}
                      className="font-mono text-[0.6rem] text-text-primary bg-white/[0.03] border border-white/[0.08] px-3 py-1 rounded-[1px] hover:border-gold/35 hover:text-gold transition-colors duration-300"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Modal footer interactive actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-white/[0.06]">
                <span className="font-mono text-[0.52rem] tracking-widest text-[#a0a0ab]/40 uppercase select-none">
                  ARCHIVES_DOC_REF://{activeProject.id}
                </span>

                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {activeProject.demoLink && (
                    <a
                      href={activeProject.demoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] tracking-[0.16em] uppercase text-gold hover:text-text-primary transition-all duration-300 group/link interactive-cursor border-b border-gold/30 hover:border-text-primary pb-0.5"
                    >
                      {activeProject.demoLinkText || "Live Demo"}
                      <ArrowUpRight className="w-3" style={{ height: "12px", width: "12px" }} />
                    </a>
                  )}

                  {activeProject.githubLink && (
                    <a
                      href={activeProject.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] tracking-[0.16em] uppercase text-text-primary hover:text-gold transition-all duration-300 group/link interactive-cursor border-b border-white/10 hover:border-gold/50 pb-0.5"
                    >
                      {activeProject.githubLinkText || "GitHub Source"}
                      <Github className="w-3" style={{ height: "12px", width: "12px" }} />
                    </a>
                  )}

                  {activeProject.releasesLink && (
                    <a
                      href={activeProject.releasesLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] tracking-[0.16em] uppercase text-text-primary hover:text-gold transition-all duration-300 group/link interactive-cursor border-b border-white/10 hover:border-gold/50 pb-0.5"
                    >
                      {activeProject.releasesLinkText || "Download Releases"}
                      <ExternalLink className="w-3" style={{ height: "12px", width: "12px" }} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL-SCREEN LIGHTBOX FOR SCREENSHOTS */}
      <AnimatePresence>
        {isLightboxOpen && activeProject && activeProject.screenshots && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[200] flex flex-col items-center justify-center p-4 backdrop-blur-md select-none"
            onClick={() => {
              setIsLightboxOpen(false);
              setLightboxScale(1);
            }}
          >
            {/* Top Bar containing Title, controls */}
            <div 
              className="absolute top-4 inset-x-0 px-6 sm:px-10 flex flex-wrap gap-4 items-center justify-between z-[220]"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <h4 className="font-display text-sm sm:text-base text-text-primary uppercase tracking-wider">{activeProject.title}</h4>
                <p className="font-mono text-[0.52rem] text-[#8a8a93] uppercase tracking-widest mt-0.5">
                  FRAME_DUMP::{activeProject.id}_0{activeImageIndex + 1} • {activeImageIndex + 1} of {activeProject.screenshots.length}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Zoom out */}
                <button
                  onClick={() => setLightboxScale((prev) => Math.max(prev - 0.25, 0.75))}
                  disabled={lightboxScale <= 0.75}
                  className="p-2 border border-white/10 rounded-full bg-white/[0.03] text-[#a0a0ab] hover:text-gold disabled:opacity-40 transition-all duration-300 interactive-cursor"
                  title="Zoom Out (-)"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                {/* Zoom value */}
                <span className="font-mono text-[0.68rem] text-gold w-10 text-center select-none">
                  {Math.round(lightboxScale * 100)}%
                </span>

                {/* Zoom in */}
                <button
                  onClick={() => setLightboxScale((prev) => Math.min(prev + 0.25, 3))}
                  disabled={lightboxScale >= 3}
                  className="p-2 border border-white/10 rounded-full bg-white/[0.03] text-[#a0a0ab] hover:text-gold disabled:opacity-40 transition-all duration-300 interactive-cursor"
                  title="Zoom In (+)"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                {/* Close */}
                <button
                  onClick={() => {
                    setIsLightboxOpen(false);
                    setLightboxScale(1);
                  }}
                  className="p-2 border border-gold/30 rounded-full bg-gold/10 text-gold hover:bg-gold hover:text-bg-dark transition-all duration-300 interactive-cursor"
                  title="Close Lightbox (Esc)"
                  aria-label="Close lightbox"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Main Interactive Zoomable Image */}
            <div 
              className="relative max-w-5xl max-h-[75vh] w-full h-full flex items-center justify-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={activeImageIndex}
                src={activeProject.screenshots[activeImageIndex]}
                alt={`${activeProject.title} screenshot ${activeImageIndex + 1}`}
                referrerPolicy="no-referrer"
                animate={{ scale: lightboxScale }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                onClick={() => setLightboxScale((prev) => (prev > 1 ? 1 : 1.75))}
                className={`object-contain max-w-full max-h-full rounded-[2px] shadow-[0_0_50px_rgba(0,0,0,0.9)] ${
                  lightboxScale > 1 ? "cursor-zoom-out" : "cursor-zoom-in"
                } transition-all duration-100`}
              />
            </div>

            {/* Bottom Sidenav-like arrows for navigation */}
            <div 
              className="absolute inset-x-4 sm:inset-x-8 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-[210] lg:px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setActiveImageIndex((prev) => (prev === 0 ? activeProject.screenshots!.length - 1 : prev - 1));
                  setLightboxScale(1);
                }}
                className="pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 bg-black/60 border border-white/10 hover:border-gold/65 text-[#a0a0ab] hover:text-gold rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md interactive-cursor shadow-2xl"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  setActiveImageIndex((prev) => (prev === activeProject.screenshots!.length - 1 ? 0 : prev + 1));
                  setLightboxScale(1);
                }}
                className="pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 bg-black/60 border border-white/10 hover:border-gold/65 text-[#a0a0ab] hover:text-gold rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md interactive-cursor shadow-2xl"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation guidance strip at the bottom */}
            <div className="absolute bottom-6 font-mono text-[0.52rem] tracking-[0.25em] text-[#8a8a93] uppercase flex items-center gap-3 sm:gap-4 text-center px-4">
              <span>← / → NAVIGATE</span>
              <span className="text-gold/40">•</span>
              <span>+ / - ZOOM</span>
              <span className="text-gold/40">•</span>
              <span>CLICK TO TOGGLE ZOOM</span>
              <span className="text-gold/40">•</span>
              <span>ESC TO CLOSE</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SCROLL TO TOP FLOATING BUTTON */}
      <AnimatePresence>
        {isScrolled && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            whileHover={{ scale: 1.1, translateY: -3 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-[84px] right-6 sm:bottom-[92px] sm:right-8 z-[120] p-3 bg-bg-card border border-white/[0.08] hover:border-gold/70 text-muted-slate hover:text-gold rounded-full shadow-[0_0_20px_rgba(0,0,0,0.6)] hover:shadow-[0_0_20px_rgba(212,175,55,0.25)] transition-all duration-300 interactive-cursor flex items-center justify-center font-bold group"
            title="Scroll to Top"
            aria-label="Scroll to Top"
          >
            <ArrowUp className="w-4 h-4 transition-transform duration-500 ease-out group-hover:rotate-[360deg] group-hover:-translate-y-0.5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* REAL-TIME NETWORK INTEGRITY TOAST */}
      <AnimatePresence>
        {showNetworkToast && (
          <motion.div
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`fixed bottom-6 left-6 z-[120] max-w-xs font-mono text-[0.62rem] p-4 border rounded-[2px] shadow-2xl overflow-hidden backdrop-blur-md flex items-center gap-3.5 select-none ${
              networkToastType === "online"
                ? "bg-[#0b0c10]/95 border-emerald-500/35 text-text-primary shadow-emerald-500/5"
                : "bg-[#0f0a0d]/95 border-red-500/35 text-text-primary shadow-red-500/5"
            }`}
          >
            {/* Pulsing state light */}
            <div className="relative flex items-center justify-center w-3 h-3 shrink-0">
              <span className={`absolute w-full h-full rounded-full animate-ping opacity-60 ${
                networkToastType === "online" ? "bg-emerald-400" : "bg-red-400"
              }`} />
              <span className={`w-2 h-2 rounded-full ${
                networkToastType === "online" ? "bg-emerald-500" : "bg-red-500"
              }`} />
            </div>

            {/* Content text */}
            <div className="flex-grow space-y-0.5 text-left">
              <div className="flex items-center gap-2">
                <span className={`font-black uppercase tracking-wider text-[0.58rem] ${
                  networkToastType === "online" ? "text-emerald-400" : "text-red-400"
                }`}>
                  {networkToastType === "online" ? "SYS_PEER_STABLE" : "SYS_PEER_DISCONNECTED"}
                </span>
                <span className="text-[#a0a0ab]/40 text-[0.42rem] font-bold tracking-widest">// NET_PORT_3000</span>
              </div>
              <p className="text-muted-lavender text-[0.55rem] uppercase leading-relaxed font-sans">
                {networkToastType === "online"
                  ? "Secure systems endpoint synchronized. Cache sync OK."
                  : "Sync thread disconnected. Direct offline cached database active."}
              </p>
            </div>

            {/* Manual Dismiss button */}
            <button
              onClick={() => setShowNetworkToast(false)}
              className="p-1 hover:bg-white/5 rounded-full transition-colors leading-none cursor-pointer text-[#a0a0ab]/40 hover:text-white shrink-0 ml-1"
              aria-label="Dismiss network indicator alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI SYSTEMS CORE PORTFOLIO RAPHAEL */}
      <AIPortfolioRaphael
        profile={profile}
        projectsList={projectsList || []}
        skillsList={skillsList || []}
        experienceList={experienceList || []}
      />
      </div>

      {/* ───────────── PRINT ONLY RESUME SHEET ───────────── */}
      <div id="printable-cv" className="hidden">
        {/* Name and Contacts block */}
        <div className="print-header">
          <h1 className="print-name">MD. RIMON AHMED</h1>
          
          <div className="flex flex-col items-center gap-1.5 text-[8.5pt] text-black leading-normal font-sans font-medium mt-1">
            <div className="flex flex-wrap justify-center items-center gap-y-1">
              <span className="inline-flex items-center whitespace-nowrap">
                <svg className="print-icon" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                +880-1919201876
              </span>
              <span className="mx-2 text-black font-sans font-semibold select-none">|</span>
              <span className="inline-flex items-center whitespace-nowrap">
                <svg className="print-icon" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                dev.rimonahmed@gmail.com
              </span>
              <span className="mx-2 text-black font-sans font-semibold select-none">|</span>
              <span className="inline-flex items-center whitespace-nowrap">
                <svg className="print-icon" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
                https://linkedin.com/in/aymansaikat
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-y-1 mt-0.5">
              <span className="inline-flex items-center whitespace-nowrap">
                <svg className="print-icon" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                Dhaka, Bangladesh.
              </span>
              <span className="mx-2 text-black font-sans font-semibold select-none">|</span>
              <span className="inline-flex items-center whitespace-nowrap">
                <svg className="print-icon" viewBox="0 0 24 24">
                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
                </svg>
                https://github.com/aymansaikat
              </span>
              <span className="mx-2 text-black font-sans font-semibold select-none">|</span>
              <span className="inline-flex items-center whitespace-nowrap">
                <svg className="print-icon" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.4z"/>
                </svg>
                https://aymansaikat.github.io
              </span>
              <span className="mx-2 text-black font-sans font-semibold select-none">|</span>
              <span className="inline-flex items-center whitespace-nowrap">
                <svg className="print-icon" viewBox="0 0 24 24">
                  <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
                </svg>
                https://aymansaikat.blogspot.com
              </span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-4 text-justify">
          <h2 className="print-section-title">Summary</h2>
          <p className="text-[9.5pt] leading-relaxed text-black font-sans">
            I am a hardworking and reliable individual with experience in short-term government projects, media production, marketing, and digital systems management involving data entry, archiving, digitization, video editing, content creation, and website management. I have worked with RAJUK, the Bangladesh Election Commission, News Tv Bangla, and ST Group, where I handled sensitive documents and biometric data, edited and published news content, planned marketing campaigns, and managed WordPress-based digital systems. I am confident in working with data, maintaining accuracy, creating visual content, and supporting official and commercial tasks in an organized way. Skilled in Microsoft Office, Adobe Photoshop and Premiere Pro, WordPress content management system (CMS), design tools, social media platforms, Meta Business Suite, and AI tools, I adapt quickly to structured environments and meet tight deadlines. I am looking for a responsible, challenging, and rewarding position where I can apply my skills, learn continuously, and grow further while contributing to the success of the organization.
          </p>
        </div>

        {/* Skills */}
        <div className="mb-4">
          <h2 className="print-section-title">Skills</h2>
          <div className="space-y-1 text-[9.5pt] leading-normal text-black font-sans">
            <div>
              <strong className="font-bold">Language Proficiency:</strong>
              <div className="pl-4 mt-0.5 space-y-0.5">
                <div className="flex items-start gap-1">
                  <span className="shrink-0 text-black font-semibold select-none">−</span>
                  <span>Bengali – Writing: Native | Reading: Native | Speaking: Native | Listening: Native.</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="shrink-0 text-black font-semibold select-none">−</span>
                  <span>English – Writing: Medium | Reading: Good | Speaking: Medium | Listening: Good.</span>
                </div>
              </div>
            </div>
            <div className="mt-1">
              <strong className="font-bold">Computer Skills:</strong> Basic Computer Knowledge, Internet Browsing, File Management, Digital System Support.
            </div>
            <div>
              <strong className="font-bold">Microsoft Office Skills:</strong> MS Word, Excel, PowerPoint – Creating, Formatting, and Editing Documents, Campaign Performance Reporting, Data Recording.
            </div>
            <div>
              <strong className="font-bold">Email &amp; Communication:</strong> Gmail, Mail Merge, Email Filters, Folder Management, Client Communication.
            </div>
            <div>
              <strong className="font-bold">Graphic Design Skills:</strong> Adobe Photoshop, Adobe Premiere Pro, Canva, Banner &amp; Flyer Design, Social Media Graphics, Lower Thirds &amp; Captions, Basic Web &amp; UI Design, Visual Enhancement.
            </div>
            <div>
              <strong className="font-bold">Data Management Skills:</strong> Data Entry, Data Archiving, Data Digitization, Record Keeping, File Organization, Biometric Data Capture, National ID Data Entry, Document Collection &amp; Storage.
            </div>
            <div>
              <strong className="font-bold">Video Editing &amp; Production Skills:</strong> News Video Editing, Post Production, Content Scripting, File Management &amp; Exporting, Video Formatting.
            </div>
            <div>
              <strong className="font-bold">Web &amp; Content Management Skills:</strong> WordPress CMS, Website Building &amp; Maintenance, Plugin Management, Responsive Web Design, Digital Content Scheduling, Content Publishing &amp; Uploading.
            </div>
            <div>
              <strong className="font-bold">Social Media &amp; Marketing Skills:</strong> Meta Business Suite, Social Media Management, Campaign Planning &amp; Execution, Promotion Coordination, Event Support, Brand Visibility Strategy.
            </div>
            <div>
              <strong className="font-bold">Technical Skills:</strong> Document Scanning, Digital File Conversion, Database Handling (Basic), Offline &amp; Web Based Data Entry Software, vMix- Live Video Streaming, AI Tools.
            </div>
          </div>
        </div>

        {/* Academic Profile */}
        <div className="mb-4">
          <h2 className="print-section-title">Academic Qualifications</h2>
          <div className="space-y-3 text-[9.5pt] leading-normal text-black font-sans">
            <div className="print-prevent-split">
              <div className="flex justify-between font-bold">
                <span>Bachelor of Business Administration (B.B.A) Honours</span>
                <span>2024 – Present</span>
              </div>
              <div className="flex justify-between mt-0.5">
                <span>Savar Govt. University College (National University)</span>
                <span>Dhaka, Bangladesh</span>
              </div>
              <div className="flex justify-between mt-0.5">
                <span>− Faculty of Business Studies BBA in Accounting</span>
                <span>Currently in 2nd Year</span>
              </div>
            </div>
            
            <div className="print-prevent-split">
              <div className="flex justify-between font-bold">
                <span>Higher Secondary School Certificate (H.S.C)</span>
                <span>Graduated: 2022</span>
              </div>
              <div className="flex justify-between mt-0.5">
                <span>Jahangirnagar University School and College.</span>
                <span>Dhaka, Bangladesh</span>
              </div>
              <div className="flex justify-between mt-0.5">
                <span>− Group: Business Studies | Board: Dhaka.</span>
                <span>GPA: 4.25 / 5.00</span>
              </div>
            </div>
            
            <div className="print-prevent-split">
              <div className="flex justify-between font-bold">
                <span>Secondary School Certificate (S.S.C)</span>
                <span>Graduated: 2020</span>
              </div>
              <div className="flex justify-between mt-0.5">
                <span>Savar Adhar Chandra Government High School.</span>
                <span>Dhaka, Bangladesh</span>
              </div>
              <div className="flex justify-between mt-0.5">
                <span>− Group: Business Studies | Board: Dhaka.</span>
                <span>GPA: 4.11 / 5.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Work Experience */}
        <div className="mb-4">
          <h2 className="print-section-title">Experience</h2>
          <div className="space-y-4 text-[9.5pt] leading-normal text-black font-sans">
            
            {/* Job 1 */}
            <div className="print-prevent-split">
              <div className="flex justify-between font-bold">
                <span>Data Archiving</span>
                <span>June 2024 – August 2024</span>
              </div>
              <div className="flex justify-between mt-0.5">
                <span>Young Genius Bangladesh Ltd. (Contracted by RAJUK)</span>
                <span>MIST, Mirpur Cantonment, Dhaka-1216</span>
              </div>
              <div className="flex justify-between italic text-[9pt] mt-0.5 text-black">
                <span>Data digitization &amp; storage (on site)</span>
                <span className="not-italic font-sans text-[9pt]">Tools Used: Web based data entry software, MS Excel</span>
              </div>
              <div className="pl-4 mt-1.5 space-y-0.5">
                <div className="flex items-start gap-1">
                  <span className="shrink-0 text-black font-semibold select-none">−</span>
                  <span><strong>Data Archiving &amp; Management:</strong> Archiving and managing government data related to urban planning and development.</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="shrink-0 text-black font-semibold select-none">−</span>
                  <span><strong>Document Organization &amp; Storage:</strong> Ensuring the proper organization, storage, and retrieval of critical documents.</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="shrink-0 text-black font-semibold select-none">−</span>
                  <span><strong>Data System Coordination (RAJUK):</strong> Working in collaboration with RAJUK to maintain an efficient data system.</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="shrink-0 text-black font-semibold select-none">−</span>
                  <span><strong>Data Digitization &amp; Record Keeping:</strong> Assisting in digitization and record-keeping for government projects.</span>
                </div>
              </div>
            </div>

            {/* Job 2 */}
            <div className="print-prevent-split">
              <div className="flex justify-between font-bold">
                <span>Data Entry Operator</span>
                <span>05 February 2025 – 09 April 2025</span>
              </div>
              <div className="flex justify-between mt-0.5">
                <span>Bangladesh Election Commission</span>
                <span>Nirbachan Bhaban (7th - 8th Floor), Agargaon, Dhaka-1207</span>
              </div>
              <div className="flex justify-between italic text-[9pt] mt-0.5 text-black">
                <span>Data digitization &amp; storage (on site)</span>
                <span className="not-italic font-sans text-[9pt]">Tools Used: Application based offline data entry software</span>
              </div>
              <div className="pl-4 mt-1.5 space-y-0.5">
                <div className="flex items-start gap-1">
                  <span className="shrink-0 text-black font-semibold select-none">−</span>
                  <span><strong>Applicant Document Collection:</strong> Collected applicants’ documents for National ID registration.</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="shrink-0 text-black font-semibold select-none">−</span>
                  <span><strong>National ID Data Entry:</strong> Accurately entered personal information into the National ID system.</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="shrink-0 text-black font-semibold select-none">−</span>
                  <span><strong>Biometric Data Capture:</strong> Captured biometric information, including photos, fingerprints, and iris scans.</span>
                </div>
              </div>
            </div>

            {/* Job 3 */}
            <div className="print-prevent-split">
              <div className="flex justify-between font-bold">
                <span>News Video Editor</span>
                <span>01 October 2025 – 12 November 2025</span>
              </div>
              <div className="flex justify-between mt-0.5">
                <span>News Tv Bangla</span>
                <span>Thana Road, Savar, Dhaka-1340</span>
              </div>
              <div className="flex justify-between italic text-[9pt] mt-0.5 text-black">
                <span>Post Production &amp; Content Strategy (on site)</span>
                <span className="not-italic font-sans text-[9pt]">Tools Used: Adobe Photoshop &amp; Premiere Pro, xMax, WordPress, Meta Business Suite and Ai tools</span>
              </div>
              <div className="pl-4 mt-1.5 space-y-0.5">
                <div className="flex items-start gap-1">
                  <span className="shrink-0 text-black font-semibold select-none">−</span>
                  <span><strong>News Video Editing &amp; Live Production:</strong> Edited news footage into ready-to-air segments and Handled live audio during news production.</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="shrink-0 text-black font-semibold select-none">−</span>
                  <span><strong>Graphics &amp; Visual Enhancement:</strong> Added graphics, lower thirds, and captions for clear presentation.</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="shrink-0 text-black font-semibold select-none">−</span>
                  <span><strong>Content Scripting &amp; Coordination:</strong> Prepared scripts and coordinated with producers to meet tight deadlines.</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="shrink-0 text-black font-semibold select-none">−</span>
                  <span><strong>Digital Publishing &amp; Social Media Management:</strong> Created and managed social media posts for news content, and published news content on WordPress-based website.</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="shrink-0 text-black font-semibold select-none">−</span>
                  <span><strong>File Management &amp; Exporting:</strong> Organized files and exported videos in required formats.</span>
                </div>
              </div>
            </div>

            {/* Job 4 */}
            <div className="print-prevent-split">
              <div className="flex justify-between font-bold">
                <span>Senior Marketing Officer</span>
                <span>24 November 2025 – 31 March 2026</span>
              </div>
              <div className="flex justify-between mt-0.5">
                <span>ST Group</span>
                <span>House #217(A-7), Road #11, Savar DOHS, Savar, Dhaka-1244</span>
              </div>
              <div className="flex justify-between italic text-[9pt] mt-0.5 text-black">
                <span>Brand Promotion &amp; Market Coordination (on site)</span>
                <span className="not-italic font-sans text-[9pt]">Tools Used: MS Office, MS Excel, Social Platform, Design Tools</span>
              </div>
              <div className="pl-4 mt-1.5 space-y-0.5">
                <div className="flex items-start gap-1">
                  <span className="shrink-0 text-black font-semibold select-none">−</span>
                  <span><strong>Campaign Planning:</strong> Planned and executed marketing campaigns to increase brand visibility.</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="shrink-0 text-black font-semibold select-none">−</span>
                  <span><strong>Promotion Coordination:</strong> Coordinated promotional activities and client communications.</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="shrink-0 text-black font-semibold select-none">−</span>
                  <span><strong>Event Support:</strong> Assisted in on-site promotions and events.</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="shrink-0 text-black font-semibold select-none">−</span>
                  <span><strong>Performance Reporting:</strong> Monitored campaign performance and reporting.</span>
                </div>
              </div>
            </div>

            {/* Job 5 */}
            <div className="print-prevent-split">
              <div className="flex justify-between font-bold">
                <span>System Support Co-Ordinator</span>
                <span>01 April 2026 – Present</span>
              </div>
              <div className="flex justify-between mt-0.5">
                <span>ST Group</span>
                <span>House #217(A-7), Road #11, Savar DOHS, Savar, Dhaka-1244</span>
              </div>
              <div className="flex justify-between italic text-[9pt] mt-0.5 text-black">
                <span>WordPress &amp; Digital Content Management (on site)</span>
                <span className="not-italic font-sans text-[9pt]">Tools Used: WordPress CMS, Design &amp; Social Platform Tools, AI</span>
              </div>
              <div className="pl-4 mt-1.5 space-y-0.5">
                <div className="flex items-start gap-1">
                  <span className="shrink-0 text-black font-semibold select-none">−</span>
                  <span><strong>WordPress management:</strong> Build, update and maintain WordPress websites and plugins.</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="shrink-0 text-black font-semibold select-none">−</span>
                  <span><strong>Web &amp; UI design:</strong> Design responsive, brand-consistent web page layouts.</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="shrink-0 text-black font-semibold select-none">−</span>
                  <span><strong>Social media graphics:</strong> Create on-brand visuals for Facebook, Instagram and LinkedIn.</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="shrink-0 text-black font-semibold select-none">−</span>
                  <span><strong>Graphic &amp; image design:</strong> Design banners, flyers and marketing visuals using Photoshop/Canva.</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="shrink-0 text-black font-semibold select-none">−</span>
                  <span><strong>Digital system support:</strong> Monitor site uptime, manage hosting and resolve technical issues.</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="shrink-0 text-black font-semibold select-none">−</span>
                  <span><strong>Content coordination:</strong> Schedule, upload and manage content across web and social platforms.</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Declaration */}
        <div className="mb-4 print-prevent-split">
          <h2 className="print-section-title">Declaration</h2>
          <p className="text-[9.5pt] leading-normal text-black font-sans">
            Hereby I declare that all information furnished in this curriculum vitae are correct and complete.
          </p>
          <p className="text-[10pt] font-sans font-bold mt-5 text-black">
            Md. Rimon Ahmed
          </p>
        </div>

      </div>
    </div>
  );
}
