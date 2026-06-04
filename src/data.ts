export interface NavLink {
  label: string;
  href: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface LanguageProficiency {
  name: string;
  rating: number; // 1 to 5 scale
  level: string;
}

export interface SkillCategory {
  id: string;
  num: string;
  name: string;
  skills: string[];
}

export interface ExperienceItem {
  date: string;
  org: string;
  location: string;
  role: string;
  tools: string[];
  points: string[];
  isCurrent?: boolean;
}

export interface EducationItem {
  degree: string;
  field: string;
  institution: string;
  duration: string;
  gpa: string;
  icon: string;
  year: string;
}

export interface SocialLink {
  name: string;
  href: string;
  iconName: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  description: string;
  tools: string[];
  link?: string;
  linkText?: string;
  demoLink?: string;
  demoLinkText?: string;
  githubLink?: string;
  githubLinkText?: string;
  releasesLink?: string;
  releasesLinkText?: string;
  size: "large" | "medium" | "small"; // Bento grid weighting
  year?: string;
  complexity?: string;
  notes?: string;
  screenshots?: string[];
  completionPercent?: number;
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  organization: string;
}

export const navLinks: NavLink[] = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Education", href: "#education" },
  { label: "Contact", href: "#contact" }
];

export const marqueeItems: string[] = [
  "Data Management",
  "WordPress CMS",
  "Video Editing",
  "Graphic Design",
  "Marketing Campaigns",
  "Social Media",
  "Adobe Premiere Pro",
  "Adobe Photoshop",
  "Data Archiving",
  "Biometric Capture"
];

export const stats: StatItem[] = [
  { value: "4+", label: "Organizations" },
  { value: "2+", label: "Yrs Experience" },
  { value: "5", label: "Skill Domains" },
  { value: "10+", label: "Core Tools" }
];

export const languages: LanguageProficiency[] = [
  { name: "Bengali", rating: 5, level: "Native" },
  { name: "English", rating: 3, level: "Intermediate" }
];

export const skillCategories: SkillCategory[] = [
  {
    id: "data-management",
    num: "01",
    name: "DATA MANAGEMENT",
    skills: [
      "Data Entry & Archiving",
      "Digitization & Record Keeping",
      "Biometric Data Capture",
      "National ID System Entry",
      "Document Collection & Storage",
      "MS Excel Reporting"
    ]
  },
  {
    id: "web-cms",
    num: "02",
    name: "WEB & CMS",
    skills: [
      "WordPress CMS",
      "Plugin Management",
      "Responsive Web Design",
      "Content Scheduling",
      "Site Maintenance & Hosting",
      "Basic UI Design"
    ]
  },
  {
    id: "video-production",
    num: "03",
    name: "VIDEO PRODUCTION",
    skills: [
      "Adobe Premiere Pro",
      "News Video Editing",
      "Live Production (vMix)",
      "Lower Thirds & Captions",
      "Post Production Workflow",
      "Content Scripting"
    ]
  },
  {
    id: "graphic-design",
    num: "04",
    name: "GRAPHIC DESIGN",
    skills: [
      "Adobe Photoshop",
      "Canva",
      "Banner & Flyer Design",
      "Social Media Graphics",
      "Brand Visual Creation",
      "Visual Enhancement"
    ]
  },
  {
    id: "marketing-social",
    num: "05",
    name: "MARKETING & SOCIAL",
    skills: [
      "Meta Business Suite",
      "Campaign Planning",
      "Promotion Coordination",
      "Performance Reporting",
      "Event Support",
      "Brand Visibility Strategy"
    ]
  },
  {
    id: "office-tools",
    num: "06",
    name: "OFFICE & TOOLS",
    skills: [
      "MS Word / Excel / PowerPoint",
      "Gmail & Mail Merge",
      "Document Scanning",
      "File Management",
      "AI Tools",
      "Internet & Web Research"
    ]
  }
];

export const experienceData: ExperienceItem[] = [
  {
    date: "APR 2026 — PRESENT",
    org: "ST Group",
    location: "Savar DOHS, Dhaka",
    isCurrent: true,
    role: "System Support Co-Ordinator",
    tools: ["WordPress", "Photoshop", "Canva", "AI Tools", "Social Platforms"],
    points: [
      "Build, update & maintain WordPress websites and plugins",
      "Design responsive, brand-consistent web page layouts",
      "Create on-brand visuals for Facebook, Instagram & LinkedIn",
      "Design banners, flyers & marketing visuals",
      "Monitor site uptime, manage hosting & resolve issues",
      "Schedule & manage content across platforms"
    ]
  },
  {
    date: "NOV 2025 — MAR 2026",
    org: "ST Group",
    location: "Savar DOHS, Dhaka",
    role: "Senior Marketing Officer",
    tools: ["MS Office", "Excel", "Social Platforms", "Design Tools"],
    points: [
      "Planned & executed brand visibility campaigns",
      "Coordinated promotions & client communications",
      "Assisted in on-site events & activations",
      "Monitored campaign performance & produced reports"
    ]
  },
  {
    date: "OCT 2025 — NOV 2025",
    org: "News Tv Bangla",
    location: "Savar, Dhaka",
    role: "News Video Editor",
    tools: ["Premiere Pro", "Photoshop", "WordPress", "Meta Business Suite", "AI Tools"],
    points: [
      "Edited news footage into broadcast-ready segments",
      "Handled live audio during news production",
      "Added graphics, lower thirds & captions",
      "Prepared scripts; coordinated with producers",
      "Published content on WordPress-based news website",
      "Managed social media channels for news distribution"
    ]
  },
  {
    date: "FEB 2025 — APR 2025",
    org: "Bangladesh Election Commission",
    location: "Agargaon, Dhaka",
    role: "Data Entry Operator",
    tools: ["Offline Data Entry Software"],
    points: [
      "Collected applicant documents for National ID registration",
      "Accurately entered personal info into the NID system",
      "Captured biometric data: photos, fingerprints & iris scans"
    ]
  },
  {
    date: "JUN 2024 — AUG 2024",
    org: "Young Genius BD Ltd.",
    location: "Contracted by RAJUK · MIST, Dhaka",
    role: "Data Archiving Officer",
    tools: ["Web-based Data Entry Software", "MS Excel"],
    points: [
      "Archived government data for urban planning projects",
      "Organized & ensured retrieval of critical documents",
      "Collaborated with RAJUK to maintain efficient data systems"
    ]
  }
];

export const educationData: EducationItem[] = [
  {
    degree: "BBA Honours",
    field: "Accounting · Business Studies",
    institution: "Savar Govt. University College (National University, Dhaka)",
    duration: "2024 – Present · 2nd Year",
    gpa: "IN PROGRESS",
    icon: "GraduationCap",
    year: "2024"
  },
  {
    degree: "H.S.C",
    field: "Business Studies · Dhaka Board",
    institution: "Jahangirnagar University School and College, Dhaka",
    duration: "Graduated 2022",
    gpa: "4.25",
    icon: "BookOpen",
    year: "2022"
  },
  {
    degree: "S.S.C",
    field: "Business Studies · Dhaka Board",
    institution: "Savar Adhar Chandra Govt. High School, Dhaka",
    duration: "Graduated 2020",
    gpa: "4.11",
    icon: "Award",
    year: "2020"
  }
];

export const socialLinks: SocialLink[] = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/AymanSaikat",
    iconName: "Facebook"
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/aymansaikat",
    iconName: "Instagram"
  },
  {
    name: "Email",
    href: "mailto:dev.rimonahmed@gmail.com",
    iconName: "Mail"
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/aymansaikat",
    iconName: "Linkedin"
  },
  {
    name: "GitHub",
    href: "https://github.com/aymansaikat",
    iconName: "Github"
  },
  {
    name: "Portfolio",
    href: "https://aymansaikat.github.io",
    iconName: "Globe"
  },
  {
    name: "Blog",
    href: "https://aymansaikat.blogspot.com",
    iconName: "Edit3"
  }
];

export const projectsData: ProjectItem[] = [
  {
    id: "project-1",
    title: "Direct Download Search (DDS)",
    category: "Search Tool",
    description: "A simple browser based tool named has been created using Google Dork queries to search through open directory servers for publicly accessible files.",
    tools: ["Google Dorks", "JavaScript", "HTML", "CSS"],
    demoLink: "https://aymansaikat.github.io/dds/",
    demoLinkText: "Launch DDS Tool",
    githubLink: "https://github.com/AymanSaikat/dds",
    githubLinkText: "View GitHub Source",
    size: "large",
    year: "2024",
    complexity: "High Utility",
    notes: "DDS leverages advanced Google Dork operators in real-time to locate publicly indexed server files instantly. It acts as an automated sandbox utility that compiles complex dork constructs under a fluid, intuitive interface, eliminating the need to construct multi-operator Google searches manually. Includes modular filter states for multi-format grouping (PDFs, archives, media files) and is entirely client-side, ensuring fast and zero-latency searches.",
    screenshots: [
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80"
    ],
    completionPercent: 100
  },
  {
    id: "project-2",
    title: "whisperingwave",
    category: "Audio Viz",
    description: "An expressive, atmospheric sound wave & audio visualizer designed with high-fidelity canvas rendering waves.",
    tools: ["React", "JavaScript", "HTML5 Canvas", "Tailwind CSS"],
    demoLink: "https://aymansaikat.github.io/whisperingwave/",
    demoLinkText: "Open Wave App",
    githubLink: "https://github.com/AymanSaikat/whisperingwave",
    githubLinkText: "View GitHub Source",
    size: "small",
    year: "2025",
    complexity: "Intermediate",
    notes: "An immersive audio exploration tool. Whisperingwave harnesses the HTML5 Web Audio API to process raw audio input into an elegant set of frequencies. It runs high-refresh rendering loops that feed signal waveforms through custom Bezier pathing algorithms, rendering incredibly smooth fluid motion. Beautiful, minimal aesthetics meet low-CPU execution, providing customizable gradient colors and visual speeds.",
    screenshots: [
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1614149162883-504ce4d13909?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80"
    ],
    completionPercent: 85
  },
  {
    id: "project-3",
    title: "Mobile Bottom Tab Bar",
    category: "Mobile UI System",
    description: "A fully custom, native app-style floating bottom tab bar for WordPress + WooCommerce, built with pure HTML, CSS, and JavaScript. No plugins, no jQuery, no external libraries required. A lightweight, plugin-free mobile navigation solution for WordPress & WooCommerce websites.",
    tools: ["HTML5", "CSS", "JavaScript", "WooCommerce"],
    demoLink: "https://aymansaikat.github.io/Mobile-Bottom-Tab-Bar/",
    demoLinkText: "Live Mobile Demo",
    githubLink: "https://github.com/AymanSaikat/Mobile-Bottom-Tab-Bar",
    githubLinkText: "View GitHub Source",
    size: "medium",
    year: "2026",
    complexity: "Medium",
    notes: "A highly engineered asset designed for mobile web traffic. This navigation widget resolves WordPress plugin bloat by offering a clean, plug-and-play UI system. It is written in pure, standards-compliant CSS and JavaScript, taking advantage of CSS Variables for real-time customizable branding, modern flex layouts, safe-area overlay corrections for modern notch/bezel display units, and an exceptionally tiny filesystem footprint.",
    screenshots: [
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80"
    ],
    completionPercent: 100
  },
  {
    id: "project-4",
    title: "Gemini Counter",
    category: "Browser Extension",
    description: "A minimal browser extension that shows token count and context usage bar on gemini.google.com. Integrates support for prompt, cached, thinking, and candidate tokens.",
    tools: ["Chrome Extension", "Manifest V3", "DOM API", "JavaScript"],
    githubLink: "https://github.com/AymanSaikat/Gemini-Counter",
    githubLinkText: "View GitHub Source",
    releasesLink: "https://github.com/AymanSaikat/Gemini-Counter/releases",
    releasesLinkText: "Download Releases",
    size: "medium",
    year: "2025",
    complexity: "Advanced",
    notes: "Built to overcome standard context constraints, Gemini Counter is a browser extension integrating directly with Google's Gemini UI. By observing target element streams via MutationObservers and custom scraping adapters, it extracts and sums token breakdowns. It builds a beautiful, inline progress meter visualizing active context depth limits instantly, completely offline and privacy-focused.",
    screenshots: [
      "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"
    ],
    completionPercent: 95
  }
];
