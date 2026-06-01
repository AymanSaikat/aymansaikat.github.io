import React, { useState, useEffect } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Edit, 
  Lock, 
  Key, 
  LogOut, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Mail, 
  Inbox, 
  FolderGit2, 
  Award, 
  GraduationCap, 
  FileText, 
  Sparkles, 
  ChevronRight, 
  Check, 
  Copy, 
  User, 
  LayoutDashboard,
  Clock,
  Eye,
  Settings
} from "lucide-react";
import { dataService, Profile, ContactMessage } from "../dataService";
import { isFirebaseConfigured, auth, googleProvider } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";

interface AdminCMSProps {
  isOpen: boolean;
  onClose: () => void;
  onDataUpdate: () => void; // Trigger Main page reload
}

export default function AdminCMS({ isOpen, onClose, onDataUpdate }: AdminCMSProps) {
  // Secret Master Passcode gateway for local offline editing
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("ayman_portfolio_logged_in") === "true";
  });
  const [authError, setAuthError] = useState("");

  // DB States
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [skillCategories, setSkillCategories] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [marquee, setMarquee] = useState<string[]>([]);

  // CMS Tabs
  const [activeTab, setActiveTab] = useState<"profile" | "projects" | "skills" | "experience" | "education" | "inbox" | "settings">("profile");

  // Selected action states / modals
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [editingExperience, setEditingExperience] = useState<any | null>(null);
  const [editingEducation, setEditingEducation] = useState<any | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // Gemini State
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem("ayman_portfolio_gemini_key") || "";
  });
  const [aiDraftReply, setAiDraftReply] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiCopied, setAiCopied] = useState(false);

  // Operation notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load all DB elements on authentication or initialization
  const loadStats = async () => {
    try {
      const uProfile = await dataService.getProfile();
      const uProjects = await dataService.getProjects();
      const uSkills = await dataService.getSkillCategories();
      const uExperience = await dataService.getExperiences();
      const uEducation = await dataService.getEducation();
      const uMessages = await dataService.getMessages();
      const uStats = await dataService.getStats();
      const uMarquee = await dataService.getMarquee();

      setProfile(uProfile);
      setProjects(uProjects);
      setSkillCategories(uSkills);
      setExperiences(uExperience);
      setEducation(uEducation);
      setMessages(uMessages);
      setStats(uStats);
      setMarquee(uMarquee);
    } catch (err) {
      console.error("CMS failed to read system models:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
    }
  }, [isAuthenticated]);

  // Handle credentials login
  const handlePasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Support "admin" or custom secret key setup for rapid management
    if (passcode.toLowerCase() === "admin" || passcode === "ayman987") {
      setIsAuthenticated(true);
      localStorage.setItem("ayman_portfolio_logged_in", "true");
      setAuthError("");
      setPasscode("");
      showToast("Access protocol granted. System online.", "success");
    } else {
      setAuthError("Invalid access token code.");
    }
  };

  // Handle Firebase Google Auth if configured
  const handleGoogleLogin = async () => {
    if (!isFirebaseConfigured() || !auth || !googleProvider) {
      showToast("Firebase is not fully provisioned yet. Use the local PIN (admin).", "error");
      return;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user?.email || "";
      // Validate that only the designated core emails can logs in
      if (email === "rimon.newpagla@gmail.com" || email === "dev.rimonahmed@gmail.com") {
        setIsAuthenticated(true);
        localStorage.setItem("ayman_portfolio_logged_in", "true");
        showToast(`Logged in successfully as admin (${email})`, "success");
      } else {
        await signOut(auth);
        showToast("Access Denied: Your email is not whitelisted.", "error");
      }
    } catch (err: any) {
      showToast(`Google login failed: ${err.message}`, "error");
    }
  };

  const handleLogout = async () => {
    if (isFirebaseConfigured() && auth) {
      try {
        await signOut(auth);
      } catch {}
    }
    setIsAuthenticated(false);
    localStorage.removeItem("ayman_portfolio_logged_in");
    showToast("Session terminal logged out.", "success");
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  // ─── PROFILE UPDATE HANDLER ───
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      await dataService.updateProfile(profile);
      await dataService.saveStats(stats);
      await dataService.saveMarquee(marquee);
      showToast("Global details successfully deployed.", "success");
      onDataUpdate();
    } catch (err) {
      showToast("Save operation fault.", "error");
    }
  };

  // ─── PROJECTS MANAGER ───
  const [newProject, setNewProject] = useState({
    title: "",
    category: "",
    description: "",
    tools: "",
    demoLink: "",
    demoLinkText: "",
    githubLink: "",
    githubLinkText: "",
    size: "medium",
    year: "",
    complexity: "",
    notes: "",
    screenshots: "",
    completionPercent: 100
  });

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title || !newProject.description) {
      showToast("Required details are missing.", "error");
      return;
    }
    const id = "project-" + Date.now();
    const formatted = {
      ...newProject,
      id,
      tools: newProject.tools.split(",").map(t => t.trim()).filter(Boolean),
      screenshots: newProject.screenshots ? newProject.screenshots.split(",").map(s => s.trim()).filter(Boolean) : [
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80"
      ],
      completionPercent: Number(newProject.completionPercent)
    };

    try {
      await dataService.addProject(formatted);
      showToast("Project successfully added.", "success");
      setProjects([...projects, formatted]);
      // clear
      setNewProject({
        title: "",
        category: "",
        description: "",
        tools: "",
        demoLink: "",
        demoLinkText: "Launch Tool",
        githubLink: "",
        githubLinkText: "View GitHub",
        size: "medium",
        year: new Date().getFullYear().toString(),
        complexity: "Intermediate",
        notes: "",
        screenshots: "",
        completionPercent: 100
      });
      onDataUpdate();
    } catch (err) {
      showToast("Failed to write project record.", "error");
    }
  };

  const handleUpdateProject = async (id: string, updatedParams: any) => {
    try {
      const payload = {
        ...updatedParams,
        tools: typeof updatedParams.tools === "string" ? updatedParams.tools.split(",").map((t: string) => t.trim()).filter(Boolean) : updatedParams.tools,
        screenshots: typeof updatedParams.screenshots === "string" ? updatedParams.screenshots.split(",").map((s: string) => s.trim()).filter(Boolean) : updatedParams.screenshots
      };
      await dataService.updateProject(id, payload);
      showToast("Project successfully sync.", "success");
      setProjects(projects.map(p => p.id === id ? { ...payload, id } : p));
      setEditingProject(null);
      onDataUpdate();
    } catch (err) {
      showToast("Update operation failed.", "error");
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm("Are you sure you want to scrub this project record permanently?")) return;
    try {
      await dataService.deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
      showToast("Project successfully deleted.", "success");
      onDataUpdate();
    } catch (err) {
      showToast("Deletion failed.", "error");
    }
  };

  // ─── SKILLS MANAGER ───
  const [newSkillName, setNewSkillName] = useState("");
  const [selectedSkillCat, setSelectedSkillCat] = useState("");

  const handleAddSkillToCategory = async () => {
    if (!newSkillName.trim() || !selectedSkillCat) {
      showToast("Provide both skill name and target list.", "error");
      return;
    }
    const updated = skillCategories.map(cat => {
      if (cat.id === selectedSkillCat) {
        return {
          ...cat,
          skills: [...cat.skills, newSkillName.trim()]
        };
      }
      return cat;
    });

    try {
      await dataService.updateSkillCategories(updated);
      setSkillCategories(updated);
      setNewSkillName("");
      showToast("Skill added successfully.", "success");
      onDataUpdate();
    } catch (err) {
      showToast("Skill addition failed.", "error");
    }
  };

  const handleRemoveSkill = async (catId: string, skillIdx: number) => {
    const updated = skillCategories.map(cat => {
      if (cat.id === catId) {
        const skillsCopy = [...cat.skills];
        skillsCopy.splice(skillIdx, 1);
        return { ...cat, skills: skillsCopy };
      }
      return cat;
    });

    try {
      await dataService.updateSkillCategories(updated);
      setSkillCategories(updated);
      showToast("Skill removed.", "success");
      onDataUpdate();
    } catch (err) {
      showToast("Operation failed.", "error");
    }
  };

  // ─── EXPERIENCES MANAGER ───
  const [newExperience, setNewExperience] = useState({
    date: "",
    org: "",
    location: "",
    role: "",
    tools: "",
    points: "",
    isCurrent: false
  });

  const handleCreateExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExperience.org || !newExperience.role || !newExperience.date) {
      showToast("Missing basic career details.", "error");
      return;
    }
    const formatted = {
      ...newExperience,
      docId: "exp-" + Date.now(),
      tools: newExperience.tools.split(",").map(t => t.trim()).filter(Boolean),
      points: newExperience.points.split("\n").map(p => p.trim()).filter(Boolean)
    };

    const updated = [formatted, ...experiences];
    try {
      await dataService.saveExperiences(updated);
      setExperiences(updated);
      setNewExperience({
        date: "",
        org: "",
        location: "",
        role: "",
        tools: "",
        points: "",
        isCurrent: false
      });
      showToast("Experience logs deployed successfully.", "success");
      onDataUpdate();
    } catch (err) {
      showToast("Failed to register experience.", "error");
    }
  };

  const handleDeleteExperience = async (docId: string | undefined, index: number) => {
    if (!window.confirm("Verify permanence scrub?")) return;
    const updated = experiences.filter((_, i) => i !== index);
    try {
      await dataService.saveExperiences(updated);
      setExperiences(updated);
      showToast("Scrub complete.", "success");
      onDataUpdate();
    } catch (err) {
      showToast("Operation fault.", "error");
    }
  };

  // ─── EDUCATION MANAGER ───
  const [newEdu, setNewEdu] = useState({
    degree: "",
    field: "",
    institution: "",
    duration: "",
    gpa: "",
    icon: "GraduationCap",
    year: ""
  });

  const handleCreateEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEdu.degree || !newEdu.institution || !newEdu.duration) {
      showToast("Required academic fields missing.", "error");
      return;
    }
    const formatted = {
      ...newEdu,
      docId: "edu-" + Date.now()
    };
    const updated = [formatted, ...education];
    try {
      await dataService.saveEducation(updated);
      setEducation(updated);
      setNewEdu({
        degree: "",
        field: "",
        institution: "",
        duration: "",
        gpa: "",
        icon: "GraduationCap",
        year: ""
      });
      showToast("Academic entry completed.", "success");
      onDataUpdate();
    } catch (err) {
      showToast("Database rejected log.", "error");
    }
  };

  const handleDeleteEducation = async (docId: string | undefined, index: number) => {
    if (!window.confirm("Confirm scrubbing education record?")) return;
    const updated = education.filter((_, i) => i !== index);
    try {
      await dataService.saveEducation(updated);
      setEducation(updated);
      showToast("Scrubbed.", "success");
      onDataUpdate();
    } catch (err) {
      showToast("Delete operation faulted.", "error");
    }
  };

  // ─── INBOX & AI REPLY ───
  const handleUpdateMsgStatus = async (id: string, status: "unread" | "read" | "archived") => {
    try {
      await dataService.updateMessageStatus(id, status);
      setMessages(messages.map(m => m.id === id ? { ...m, status } : m));
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage({ ...selectedMessage, status });
      }
      showToast(`Inbox record updated.`, "success");
    } catch (err) {
      showToast("Could not modify state.", "error");
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm("Purge received message record permanently?")) return;
    try {
      await dataService.deleteMessage(id);
      setMessages(messages.filter(m => m.id !== id));
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage(null);
      }
      showToast("Record deleted from inbox logs.", "success");
    } catch (err) {
      showToast("Purging faulted.", "error");
    }
  };

  // ─── GEMINI AI EMAIL DRAFT GENERATOR ───
  const handleGenerateAiReply = async () => {
    if (!selectedMessage) return;
    setIsAiGenerating(true);
    setAiDraftReply("");

    try {
      // Import SDK dynamically as requested to reduce first load
      const { GoogleGenAI } = await import("@google/genai");
      
      const keyToUse = geminiApiKey || process.env.GEMINI_API_KEY || "";
      if (!keyToUse) {
        // Fallback to static smart template is highly robust and beautiful if no key is loaded yet
        setIsAiGenerating(false);
        const autoTemplate = `Dear ${selectedMessage.name},

Thank you very much for reaching out regarding "${selectedMessage.subject || "Collaboration opportunity"}".

I have parsed your inquiry log: "${selectedMessage.message}" and would love to coordinate further. With my active experience in systems support, WordPress engineering, and graphic production, I am confident I can align perfectly with ST Group or any targeted digital projects you have in mind.

Could we schedule a brief correspondence this week?

Kindest Regards,
Ayman Saikat
System Support Co-Ordinator
${profile?.email || "dev.rimonahmed@gmail.com"}`;
        setAiDraftReply(autoTemplate);
        showToast("Dynamic Smart Template generated (Add your Gemini API Key in Settings for live AI).", "success");
        return;
      }

      const ai = new GoogleGenAI({ apiKey: keyToUse });
      const promptText = `
        You are Ayman Saikat, a professional System Support Co-Ordinator and Web Administrator.
        Here is your profile information: 
        Name: ${profile?.name}
        Title: ${profile?.title}
        Bio: ${profile?.bio}
        Email: ${profile?.email}
        Location: ${profile?.location}

        You received an inquiry message on your personal portfolio website with the following details:
        Sender Name: ${selectedMessage.name}
        Sender Email: ${selectedMessage.email}
        Subject: ${selectedMessage.subject || "Inquiry/Contact Request"}
        Message: "${selectedMessage.message}"

        Write a professional, sleek, and highly contextual email response addressing the sender's inquiry. Make sure the tone matches the elegant "Cosmic Slate" standard of your website. Keep it polite, scannable, and direct. Standard signature included.
      `;

      // Use modern Gemini 2.5 flash as optimal model
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptText,
      });

      if (response && response.text) {
        setAiDraftReply(response.text);
        showToast("Gemini AI draft successfully compiled.", "success");
      } else {
        throw new Error("Empty model response.");
      }
    } catch (err: any) {
      console.error("AI client error:", err);
      showToast("AI synthesis faulted. Reverted to smart draft.", "error");
      // Fallback
      setAiDraftReply(`Dear ${selectedMessage.name},

Thank you for your contact message. I received your inquiry: "${selectedMessage.message}".

I will review the requirements and contact you via SMTP route: ${selectedMessage.email} shortly.

Best Regards,
Ayman Saikat`);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const saveApiKey = (key: string) => {
    setGeminiApiKey(key);
    localStorage.setItem("ayman_portfolio_gemini_key", key);
    showToast("Gemini token updated locally on this device.", "success");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] overflow-hidden bg-[#020204]/96 backdrop-blur-xl flex justify-center items-center p-0 md:p-6 select-none font-sans">
      
      {/* Toast Panel */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-[3px] border text-[0.62rem] font-mono tracking-widest uppercase flex items-center gap-2 z-[200] shadow-[0_0_30px_rgba(0,0,0,0.8)] ${
              toast.type === "success" 
                ? "bg-black/90 text-gold border-gold/40" 
                : "bg-red-950/85 text-red-400 border-red-500/30"
            }`}
          >
            {toast.type === "success" ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECURE PASSWORD / LOGIN GATEWAY */}
      {!isAuthenticated ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm mx-4 bg-bg-card border border-white/[0.06] rounded-[2px] p-6 text-center shadow-2xl relative"
        >
          <div className="absolute right-4 top-4">
            <button 
              onClick={onClose} 
              className="p-1 text-muted-slate hover:text-gold transition-colors duration-300"
              aria-label="Close Guard"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gold/10 rounded-full border border-gold/25 text-gold">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-text-primary mb-1">
            PORTFOLIO CONTROLLER
          </h3>
          <p className="font-mono text-[0.55rem] tracking-widest text-[#8a8a93] uppercase mb-6">
            Input administrator validation protocol to manage site.
          </p>

          <form onSubmit={handlePasscodeLogin} className="space-y-4">
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-slate" />
              <input 
                type="password"
                placeholder="PROMPT AUTH PIN"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full py-2.5 pl-9 pr-4 bg-white/[0.02] border border-white/[0.08] focus:border-gold/40 text-text-primary font-mono text-[0.62rem] tracking-[0.2em] uppercase rounded-[2px] focus:outline-none transition-all duration-300 placeholder:text-muted-slate/30"
                autoFocus
              />
            </div>

            {authError && (
              <p className="font-mono text-[0.52rem] text-red-400 uppercase tracking-wider">
                {authError}
              </p>
            )}

            <button 
              type="submit"
              className="w-full py-2.5 bg-gold hover:bg-gold-light text-bg-dark font-mono text-[0.62rem] tracking-[0.25em] font-black uppercase rounded-[2px] transition-all duration-300"
            >
              System Online
            </button>
          </form>

          {isFirebaseConfigured() && (
            <div className="mt-6 pt-5 border-t border-white/[0.05]">
              <span className="block font-mono text-[0.52rem] text-muted-slate/40 uppercase tracking-widest mb-3">
                or authenticate through
              </span>
              <button
                onClick={handleGoogleLogin}
                className="w-full inline-flex items-center justify-center gap-2 py-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-white/25 text-text-primary rounded-[2px] font-mono text-[0.58rem] tracking-widest uppercase transition-all duration-300"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white text-[0.5rem]">G</div>
                Google Security Auth
              </button>
            </div>
          )}
        </motion.div>
      ) : (
        /* CORE DYNAMIC SYSTEM EXECUTIVE PANEL */
        <motion.div 
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full h-full md:max-w-7xl md:h-[88vh] bg-[#050508] border border-white/[0.06] rounded-none md:rounded-[4px] flex flex-col md:flex-row shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden"
        >
          {/* SIDE RAIL / NAVIGATION */}
          <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-white/[0.05] bg-[#030305] p-4 sm:p-5 flex flex-col justify-between shrink-0">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-gold shrink-0 animate-pulse" />
                  <div>
                    <h4 className="font-mono text-[0.65rem] tracking-[0.16em] uppercase text-text-primary font-black">
                      CMS PANEL
                    </h4>
                    <span className="block font-mono text-[0.45rem] tracking-widest text-[#8a8a93] uppercase">
                      SYSTEM CONTROL
                    </span>
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="md:hidden p-1.5 border border-white/[0.06] rounded-[2px] hover:border-gold/30 text-muted-slate hover:text-gold transition-all duration-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5">
                {[
                  { id: "profile", label: "SITE PROFILE", icon: User },
                  { id: "projects", label: "PROJECTS PORT", icon: FolderGit2 },
                  { id: "skills", label: "SKILLS BANK", icon: Award },
                  { id: "experience", label: "CAREER LOG", icon: Clock },
                  { id: "education", label: "ACADEMICS", icon: GraduationCap },
                  { id: "inbox", label: "INBOX MESSAGES", icon: Inbox, count: messages.filter(m => m.status === "unread").length },
                  { id: "settings", label: "AI & INTEGRATION", icon: Settings }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center justify-between py-2 px-3 text-[0.58rem] font-mono tracking-widest uppercase transition-all duration-200 border rounded-[2px] ${
                        activeTab === item.id
                          ? "bg-gold/15 border-gold/30 text-gold"
                          : "bg-transparent border-transparent text-muted-slate hover:text-text-primary hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.count && item.count > 0 ? (
                        <span className="px-1.5 py-0.5 bg-gold text-bg-dark rounded-[2px] font-black font-mono text-[0.48rem] animate-bounce">
                          {item.count}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.05] hidden md:flex items-center justify-between">
              <span className="font-mono text-[0.5rem] text-[#8a8a93] uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Online
              </span>
              <button 
                onClick={handleLogout}
                className="p-1 px-2 border border-white/[0.08] hover:border-red-500/30 text-muted-slate hover:text-red-400 hover:bg-red-950/20 rounded-[2px] font-mono text-[0.48rem] uppercase tracking-widest transition-all duration-300 flex items-center gap-1"
                title="Log Out Session"
              >
                <LogOut className="w-3 h-3" />
                Exit
              </button>
            </div>
          </div>

          {/* MAIN DYNAMIC CONTENT CONTAINER */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto w-full md:max-w-none">
            
            {/* Header top banner in Desktop */}
            <div className="hidden md:flex items-center justify-between border-b border-white/[0.05] pb-4 mb-6">
              <div>
                <h3 className="font-mono text-xs tracking-[0.2em] text-text-primary uppercase">
                  {activeTab} management console
                </h3>
                <p className="font-mono text-[0.52rem] text-muted-slate uppercase tracking-widest">
                  Live connection: {isFirebaseConfigured() ? "Firestore cloud active" : "local isolated caching"}
                </p>
              </div>
              <button 
                onClick={onClose} 
                className="p-1 text-muted-slate hover:text-gold transition-colors duration-300"
                aria-label="Close CMS Control"
              >
                <X className="w-4 h-4 text-muted-slate hover:text-gold" />
              </button>
            </div>

            {/* TAB PORTALS */}
            {activeTab === "profile" && profile && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[0.52rem] text-[#8a8a93] uppercase tracking-wider">FULL NAME</label>
                    <input 
                      type="text" 
                      value={profile.name} 
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full p-2.5 bg-white/[0.01] border border-white/[0.08] text-text-primary font-mono text-xs tracking-wider rounded-[1px] focus:outline-none focus:border-gold/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[0.52rem] text-[#8a8a93] uppercase tracking-wider">ROLE TITLE</label>
                    <input 
                      type="text" 
                      value={profile.title} 
                      onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                      className="w-full p-2.5 bg-white/[0.01] border border-white/[0.08] text-text-primary font-mono text-xs tracking-wider rounded-[1px] focus:outline-none focus:border-gold/30"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block font-mono text-[0.52rem] text-[#8a8a93] uppercase tracking-wider">ROLE BIOGRAPHY</label>
                    <textarea 
                      rows={4}
                      value={profile.bio} 
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="w-full p-2.5 bg-white/[0.01] border border-white/[0.08] text-text-primary font-mono text-xs tracking-wider rounded-[1px] focus:outline-none focus:border-gold/30 resize-none font-sans leading-relaxed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[0.52rem] text-[#8a8a93] uppercase tracking-wider">SMTP EMAIL ROUTE</label>
                    <input 
                      type="email" 
                      value={profile.email} 
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full p-2.5 bg-white/[0.01] border border-white/[0.08] text-text-primary font-mono text-xs tracking-wider rounded-[1px] focus:outline-none focus:border-gold/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[0.52rem] text-[#8a8a93] uppercase tracking-wider">LOCATION</label>
                    <input 
                      type="text" 
                      value={profile.location} 
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="w-full p-2.5 bg-white/[0.01] border border-white/[0.08] text-text-primary font-mono text-xs tracking-wider rounded-[1px] focus:outline-none focus:border-gold/30"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block font-mono text-[0.52rem] text-[#8a8a93] uppercase tracking-wider">ORIGINAL CV FILE URL</label>
                    <input 
                      type="text" 
                      value={profile.cvUrl} 
                      onChange={(e) => setProfile({ ...profile, cvUrl: e.target.value })}
                      className="w-full p-2.5 bg-white/[0.01] border border-white/[0.08] text-text-primary font-mono text-xs tracking-wider rounded-[1px] focus:outline-none focus:border-gold/30"
                    />
                  </div>
                </div>

                {/* Sub Social link mappings */}
                <div className="border-t border-white/[0.05] pt-6">
                  <h4 className="font-mono text-[0.62rem] tracking-[0.15em] text-gold uppercase mb-3">SOCIAL LINK ARRAYS</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {["github", "linkedin", "twitter", "blog", "portfolio"].map((soc) => (
                      <div className="space-y-1" key={soc}>
                        <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase tracking-wider">{soc}</label>
                        <input 
                          type="text"
                          value={(profile as any)[soc] || ""}
                          onChange={(e) => setProfile({ ...profile, [soc]: e.target.value })}
                          className="w-full p-1.5 bg-white/[0.01] border border-white/[0.06] text-text-primary font-mono text-[0.58rem] tracking-wider rounded-[1px] focus:outline-none focus:border-gold/30"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats parameters */}
                <div className="border-t border-white/[0.05] pt-6">
                  <h4 className="font-mono text-[0.62rem] tracking-[0.15em] text-gold uppercase mb-3">METADATA STATS</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {stats.map((stat, idx) => (
                      <div className="p-3 bg-white/[0.01] border border-white/[0.05] rounded-[1px] space-y-1.5" key={idx}>
                        <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase tracking-wider"> {stat.label || "STAT"}</label>
                        <input 
                          type="text"
                          value={stat.value}
                          onChange={(e) => {
                            const copy = [...stats];
                            copy[idx].value = e.target.value;
                            setStats(copy);
                          }}
                          className="w-full p-1 bg-transparent border-b border-white/10 hover:border-gold/35 focus:border-gold text-text-primary font-mono text-xs text-center focus:outline-none"
                        />
                        <input 
                          type="text"
                          value={stat.label}
                          onChange={(e) => {
                            const copy = [...stats];
                            copy[idx].label = e.target.value;
                            setStats(copy);
                          }}
                          className="w-full p-0.5 bg-transparent border-0 text-center text-[#8a8a93] font-mono text-[0.45rem] uppercase focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-bg-dark font-mono text-[0.58rem] tracking-widest font-black uppercase px-6 py-2.5 rounded-[1.5px] transition-all duration-300"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Deploy Changes
                  </button>
                </div>
              </form>
            )}

            {activeTab === "projects" && (
              <div className="space-y-8">
                {/* Create design form */}
                <div className="bg-white/[0.01] border border-white/[0.05] p-4 rounded-[2px]">
                  <h4 className="font-mono text-[0.65rem] tracking-[0.16em] text-gold uppercase mb-4 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    ADD NEW PROJECT LOG
                  </h4>

                  <form onSubmit={handleCreateProject} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase tracking-widest">TITLE</label>
                        <input 
                          type="text"
                          placeholder="Direct Search"
                          value={newProject.title}
                          onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                          className="w-full p-2 bg-white/[0.01] border border-white/[0.08] text-text-primary font-mono text-xs rounded-[1px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase tracking-widest">CATEGORY</label>
                        <input 
                          type="text"
                          placeholder="Search Utility"
                          value={newProject.category}
                          onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                          className="w-full p-2 bg-white/[0.01] border border-white/[0.08] text-text-primary font-mono text-xs rounded-[1px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase tracking-widest">GRID BENTO SIZE</label>
                        <select 
                          value={newProject.size}
                          onChange={(e) => setNewProject({ ...newProject, size: e.target.value as any })}
                          className="w-full p-2 bg-black border border-white/[0.08] text-text-primary font-mono text-xs rounded-[1px] focus:outline-none"
                        >
                          <option value="small">Small (33% Width)</option>
                          <option value="medium">Medium (50% Width)</option>
                          <option value="large">Large (100% Width)</option>
                        </select>
                      </div>
                      <div className="sm:col-span-3 space-y-1">
                        <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase tracking-widest">DESCRIPTION SUMMARY</label>
                        <input 
                          type="text"
                          placeholder="A brief high level outline of the system utility..."
                          value={newProject.description}
                          onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                          className="w-full p-2 bg-white/[0.01] border border-white/[0.08] text-text-primary font-mono text-xs rounded-[1px] focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase tracking-widest">TOOLS / STACK (COMMA SEPARATED)</label>
                        <input 
                          type="text"
                          placeholder="React, Canvas, Tailwind, Firestore"
                          value={newProject.tools}
                          onChange={(e) => setNewProject({ ...newProject, tools: e.target.value })}
                          className="w-full p-2 bg-white/[0.01] border border-white/[0.08] text-text-primary font-mono text-xs rounded-[1px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase tracking-widest">COMPLETION STATUS %</label>
                        <input 
                          type="number"
                          value={newProject.completionPercent}
                          onChange={(e) => setNewProject({ ...newProject, completionPercent: Number(e.target.value) })}
                          className="w-full p-2 bg-white/[0.01] border border-white/[0.08] text-text-primary font-mono text-xs rounded-[1px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase tracking-widest">DEMO LINK</label>
                        <input 
                          type="text"
                          placeholder="https://..."
                          value={newProject.demoLink}
                          onChange={(e) => setNewProject({ ...newProject, demoLink: e.target.value })}
                          className="w-full p-2 bg-white/[0.01] border border-white/[0.08] text-text-primary font-mono text-xs rounded-[1px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase tracking-widest">GITHUB RESOURCE link</label>
                        <input 
                          type="text"
                          placeholder="https://github.com/..."
                          value={newProject.githubLink}
                          onChange={(e) => setNewProject({ ...newProject, githubLink: e.target.value })}
                          className="w-full p-2 bg-white/[0.01] border border-white/[0.08] text-text-primary font-mono text-xs rounded-[1px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase tracking-widest">YEAR</label>
                        <input 
                          type="text"
                          placeholder="2026"
                          value={newProject.year}
                          onChange={(e) => setNewProject({ ...newProject, year: e.target.value })}
                          className="w-full p-2 bg-white/[0.01] border border-white/[0.08] text-text-primary font-mono text-xs rounded-[1px] focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-3 space-y-1">
                        <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase tracking-widest">SCREENSHOT ATTACHMENTS (COMMA SEPARATED PICTURE URLS)</label>
                        <input 
                          type="text"
                          placeholder="https://images.unsplash.com/..., url2"
                          value={newProject.screenshots}
                          onChange={(e) => setNewProject({ ...newProject, screenshots: e.target.value })}
                          className="w-full p-2 bg-white/[0.01] border border-white/[0.08] text-text-primary font-mono text-xs rounded-[1px] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="bg-gold hover:bg-gold-light text-bg-dark font-mono text-[0.55rem] tracking-[0.16em] uppercase px-4 py-2 text-xs font-bold rounded-[1.5px] transition-all duration-300 cursor-pointer"
                      >
                        add project record
                      </button>
                    </div>
                  </form>
                </div>

                {/* List Table of active items */}
                <div className="space-y-2">
                  <h4 className="font-mono text-[0.62rem] tracking-[0.15em] text-[#8a8a93] uppercase">ACTIVE SYSTEM PROJECTS</h4>
                  <div className="border border-white/[0.05] rounded-[1px] divide-y divide-white/[0.05]">
                    {projects.map((proj) => (
                      <div key={proj.id} className="p-3 bg-white/[0.01] flex items-center justify-between gap-4 flex-wrap">
                        <div className="min-w-[150px]">
                          <span className="font-mono text-[0.52rem] text-gold uppercase tracking-widest bg-gold/5 border border-gold/15 px-2 py-0.5 rounded-[1px] mr-2">
                            {proj.category || "GENERAL"}
                          </span>
                          <span className="font-mono text-[0.62rem] text-text-primary tracking-wider font-extrabold uppercase">{proj.title}</span>
                          <p className="font-mono text-[0.5rem] text-muted-slate truncate max-w-[320px] mt-1">{proj.description}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingProject(proj)}
                            className="p-1.5 border border-white/5 hover:border-gold/30 rounded-[1.5px] hover:bg-gold/5 text-muted-slate hover:text-gold transition-all duration-300"
                            title="Edit project specs"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(proj.id)}
                            className="p-1.5 border border-white/5 hover:border-red-500/20 rounded-[1.5px] hover:bg-red-950/20 text-muted-slate hover:text-red-400 transition-all duration-300"
                            title="Wipe record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dynamic Inline Project Editor Modal */}
                {editingProject && (
                  <div className="fixed inset-0 z-[160] bg-[#020204]/94 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#08080f] border border-white/[0.08] p-5 rounded-[2px] w-full max-w-xl shadow-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-mono text-xs text-gold uppercase tracking-[0.16em]">EDIT PROJECT: {editingProject.title}</h4>
                        <button onClick={() => setEditingProject(null)} className="text-muted-slate hover:text-white"><X className="w-4 h-4" /></button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 font-mono text-[0.58rem]">
                        <div className="col-span-2">
                          <label className="text-muted-slate">TITLE</label>
                          <input type="text" value={editingProject.title} onChange={(e) => setEditingProject({...editingProject, title: e.target.value})} className="w-full p-2 bg-white/[0.02] border border-white/10 text-text-primary rounded-[1px] mt-1 focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-muted-slate">CATEGORY</label>
                          <input type="text" value={editingProject.category} onChange={(e) => setEditingProject({...editingProject, category: e.target.value})} className="w-full p-2 bg-white/[0.02] border border-white/10 text-text-primary rounded-[1px] mt-1 focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-muted-slate">COMPLETION %</label>
                          <input type="number" value={editingProject.completionPercent} onChange={(e) => setEditingProject({...editingProject, completionPercent: Number(e.target.value)})} className="w-full p-2 bg-white/[0.02] border border-white/10 text-text-primary rounded-[1px] mt-1 focus:outline-none" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-muted-slate">DESCRIPTION</label>
                          <textarea rows={3} value={editingProject.description} onChange={(e) => setEditingProject({...editingProject, description: e.target.value})} className="w-full p-2 bg-white/[0.02] border border-white/10 text-text-primary rounded-[1px] mt-1 focus:outline-none resize-none font-sans text-xs" />
                        </div>
                        <div>
                          <label className="text-muted-slate">DEMO URL</label>
                          <input type="text" value={editingProject.demoLink} onChange={(e) => setEditingProject({...editingProject, demoLink: e.target.value})} className="w-full p-2 bg-white/[0.02] border border-white/10 text-text-primary rounded-[1px] mt-1 focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-muted-slate">GITHUB URL</label>
                          <input type="text" value={editingProject.githubLink} onChange={(e) => setEditingProject({...editingProject, githubLink: e.target.value})} className="w-full p-2 bg-white/[0.02] border border-white/10 text-text-primary rounded-[1px] mt-1 focus:outline-none" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-muted-slate">TOOLS (COMMA SEPARATED)</label>
                          <input type="text" value={Array.isArray(editingProject.tools) ? editingProject.tools.join(", ") : editingProject.tools} onChange={(e) => setEditingProject({...editingProject, tools: e.target.value})} className="w-full p-2 bg-white/[0.02] border border-white/10 text-text-primary rounded-[1px] mt-1 focus:outline-none" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-muted-slate">SCREENSHOTS (COMMA SEPARATED)</label>
                          <input type="text" value={Array.isArray(editingProject.screenshots) ? editingProject.screenshots.join(", ") : editingProject.screenshots} onChange={(e) => setEditingProject({...editingProject, screenshots: e.target.value})} className="w-full p-2 bg-white/[0.02] border border-white/10 text-text-primary rounded-[1px] mt-1 focus:outline-none" />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-3">
                        <button onClick={() => setEditingProject(null)} className="px-3 py-1.5 border border-white/10 text-muted-slate font-mono text-[0.55rem] uppercase rounded-[2px]" >Cancel</button>
                        <button onClick={() => handleUpdateProject(editingProject.id, editingProject)} className="px-4 py-1.5 bg-gold text-bg-dark font-mono text-[0.55rem] uppercase font-black rounded-[2px]" >Save Changes</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "skills" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Append tool to structural category */}
                  <div className="bg-white/[0.01] border border-white/[0.05] p-4 rounded-[2px] space-y-4">
                    <h4 className="font-mono text-[0.62rem] tracking-[0.15em] text-gold uppercase">APPEND DYNAMIC TOKENS</h4>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase">TARGET DOMAIN CATEGORY</label>
                        <select 
                          value={selectedSkillCat}
                          onChange={(e) => setSelectedSkillCat(e.target.value)}
                          className="w-full p-2 bg-black border border-white/[0.08] text-text-primary font-mono text-xs rounded-[1px] focus:outline-none"
                        >
                          <option value="">SELECT TARGET...</option>
                          {skillCategories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase">NEW ITEM NAME (E.G. NEXT.JS)</label>
                        <input 
                          type="text"
                          placeholder="Laravel"
                          value={newSkillName}
                          onChange={(e) => setNewSkillName(e.target.value)}
                          className="w-full p-2 bg-[#020203] border border-white/[0.08] text-text-primary font-mono text-xs rounded-[1px] focus:outline-none"
                        />
                      </div>

                      <button
                        onClick={handleAddSkillToCategory}
                        className="w-full py-2 bg-gold text-bg-dark font-mono text-[0.55rem] tracking-widest font-black uppercase rounded-[1.5px] cursor-pointer"
                      >
                        inject tool token
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/[0.01] border border-white/[0.05] p-4 rounded-[2px] flex flex-col justify-center text-center">
                    <Award className="w-8 h-8 text-gold/40 mx-auto mb-2 animate-bounce" />
                    <span className="block font-mono text-[0.6rem] text-muted-slate uppercase tracking-widest">
                      SYSTEM METADATA MAP
                    </span>
                    <p className="font-mono text-[0.48,rem] text-[#8a8a93]/50 uppercase mt-1">
                      Wipe dynamic items by directly tapping on cross indexes.
                    </p>
                  </div>
                </div>

                {/* Render categories & their direct tools with delete actions */}
                <div className="space-y-3">
                  <h4 className="font-mono text-[0.62rem] tracking-[0.15em] text-[#8a8a93] uppercase">DEPLOYED SKILL DOMAINS</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {skillCategories.map((cat) => (
                      <div key={cat.id} className="p-4 bg-white/[0.01] border border-white/[0.05] rounded-[1px] space-y-3">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="font-mono text-[0.48rem] text-gold/70">{cat.num}</span>
                          <span className="font-mono text-[0.58rem] text-text-primary tracking-widest uppercase font-extrabold">{cat.name}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {cat.skills.map((sk: string, idx: number) => (
                            <span 
                              key={idx} 
                              className="font-mono text-[0.52rem] bg-white/[0.02] border border-white/[0.06] hover:border-red-500/20 text-muted-slate hover:text-red-400 px-2 py-1 rounded-[1px] transition-all duration-300 flex items-center gap-1 group cursor-pointer"
                              onClick={() => handleRemoveSkill(cat.id, idx)}
                            >
                              {sk}
                              <X className="w-2.5 h-2.5 text-muted-slate/30 group-hover:text-red-400 shrink-0" />
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "experience" && (
              <div className="space-y-6">
                <div className="bg-white/[0.01] border border-white/[0.05] p-4 rounded-[2px]">
                  <h4 className="font-mono text-[0.65rem] tracking-[0.16em] text-gold uppercase mb-4 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    REGISTER CAREER LOG
                  </h4>

                  <form onSubmit={handleCreateExperience} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase">COMPANY / ORG</label>
                        <input 
                          type="text"
                          placeholder="News Tv Bangla"
                          value={newExperience.org}
                          onChange={(e) => setNewExperience({ ...newExperience, org: e.target.value })}
                          className="w-full p-2 bg-white/[0.01] border border-white/[0.08] text-text-primary font-mono text-xs rounded-[1px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase">ROLE</label>
                        <input 
                          type="text"
                          placeholder="News Video Editor"
                          value={newExperience.role}
                          onChange={(e) => setNewExperience({ ...newExperience, role: e.target.value })}
                          className="w-full p-2 bg-white/[0.01] border border-white/[0.08] text-text-primary font-mono text-xs rounded-[1px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase">DATE TERM</label>
                        <input 
                          type="text"
                          placeholder="APR 2026 — PRESENT"
                          value={newExperience.date}
                          onChange={(e) => setNewExperience({ ...newExperience, date: e.target.value })}
                          className="w-full p-2 bg-white/[0.01] border border-white/[0.08] text-text-primary font-mono text-xs rounded-[1px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase">OFFICE ROAD / LOCATION</label>
                        <input 
                          type="text"
                          placeholder="Savar DOHS, Dhaka"
                          value={newExperience.location}
                          onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
                          className="w-full p-2 bg-white/[0.01] border border-white/[0.08] text-text-primary font-mono text-xs rounded-[1px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase">TOOLS USED (COMMA SEPARATED)</label>
                        <input 
                          type="text"
                          placeholder="WordPress, Premiere Pro, Photoshop"
                          value={newExperience.tools}
                          onChange={(e) => setNewExperience({ ...newExperience, tools: e.target.value })}
                          className="w-full p-2 bg-white/[0.01] border border-white/[0.08] text-text-primary font-mono text-xs rounded-[1px] focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase">ROLE LOGS & BULLET POINTS (ONE PER LINE)</label>
                        <textarea 
                          rows={3}
                          placeholder="- Schedule and manage content across multiple handles"
                          value={newExperience.points}
                          onChange={(e) => setNewExperience({ ...newExperience, points: e.target.value })}
                          className="w-full p-2 bg-white/[0.01] border border-white/[0.08] text-text-primary font-mono text-xs rounded-[1px] focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          id="isCurrent"
                          checked={newExperience.isCurrent}
                          onChange={(e) => setNewExperience({ ...newExperience, isCurrent: e.target.checked })}
                          className="rounded-[1px] bg-black border-white/20 select-none text-gold focus:ring-0"
                        />
                        <label htmlFor="isCurrent" className="font-mono text-[0.52rem] text-[#8a8a93] uppercase">CURRENT POSITION</label>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="bg-gold hover:bg-gold-light text-bg-dark font-mono text-[0.55rem] tracking-widest uppercase px-4 py-2 text-xs font-bold rounded-[1.5px] cursor-pointer"
                      >
                        LOG position
                      </button>
                    </div>
                  </form>
                </div>

                <div className="space-y-2">
                  <h4 className="font-mono text-[0.62rem] tracking-[0.15em] text-[#8a8a93] uppercase">DEPLOYED LOGS</h4>
                  <div className="border border-white/[0.05] rounded-[1px] divide-y divide-white/[0.05]">
                    {experiences.map((exp, idx) => (
                      <div key={idx} className="p-3 bg-white/[0.01] flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <span className="font-mono text-[0.52rem] text-[#8a8a93] mr-2">{exp.date}</span>
                          <span className="font-mono text-[0.6rem] text-text-primary uppercase font-bold">{exp.role} @ {exp.org}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteExperience(exp.docId, idx)}
                          className="p-1 px-2 border border-white/5 hover:border-red-500/20 hover:bg-red-950/20 rounded-[1.5px] text-muted-slate hover:text-red-400 transition-all font-mono text-[0.48em] uppercase tracking-widest shrink-0"
                        >
                          Scrub
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "education" && (
              <div className="space-y-6">
                <div className="bg-white/[0.01] border border-white/[0.05] p-4 rounded-[2px]">
                  <h4 className="font-mono text-[0.65rem] tracking-[0.16em] text-gold uppercase mb-4 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    LOG ACADEMIC LOG
                  </h4>

                  <form onSubmit={handleCreateEducation} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase">DEGREE / CREDENTIAL</label>
                        <input 
                          type="text"
                          placeholder="BBA Honours / H.S.C"
                          value={newEdu.degree}
                          onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                          className="w-full p-2 bg-white/[0.01] border border-white/[0.08] text-text-primary font-mono text-xs rounded-[1px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase">FIELD / DISCIPLINE</label>
                        <input 
                          type="text"
                          placeholder="Accounting · Business"
                          value={newEdu.field}
                          onChange={(e) => setNewEdu({ ...newEdu, field: e.target.value })}
                          className="w-full p-2 bg-white/[0.01] border border-white/[0.08] text-text-primary font-mono text-xs rounded-[1px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase">INSTITUTION</label>
                        <input 
                          type="text"
                          placeholder="Jahangirnagar University"
                          value={newEdu.institution}
                          onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })}
                          className="w-full p-2 bg-white/[0.01] border border-white/[0.08] text-text-primary font-mono text-xs rounded-[1px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase">DURATION / EXAM YEAR</label>
                        <input 
                          type="text"
                          placeholder="2024 — Present / Graduated 2022"
                          value={newEdu.duration}
                          onChange={(e) => setNewEdu({ ...newEdu, duration: e.target.value })}
                          className="w-full p-2 bg-white/[0.01] border border-white/[0.08] text-text-primary font-mono text-xs rounded-[1px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase">GPA SCORE</label>
                        <input 
                          type="text"
                          placeholder="4.25 / IN PROGRESS"
                          value={newEdu.gpa}
                          onChange={(e) => setNewEdu({ ...newEdu, gpa: e.target.value })}
                          className="w-full p-2 bg-white/[0.01] border border-white/[0.08] text-text-primary font-mono text-xs rounded-[1px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase">DECORATIVE ICON</label>
                        <select 
                          value={newEdu.icon}
                          onChange={(e) => setNewEdu({ ...newEdu, icon: e.target.value })}
                          className="w-full p-2 bg-black border border-white/[0.08] text-text-primary font-mono text-xs rounded-[1px] focus:outline-none"
                        >
                          <option value="GraduationCap">Graduation Cap</option>
                          <option value="BookOpen">Book Open</option>
                          <option value="Award">Medal/Award</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="bg-gold hover:bg-gold-light text-bg-dark font-mono text-[0.55rem] tracking-widest uppercase px-4 py-2 text-xs font-bold rounded-[1.5px] cursor-pointer"
                      >
                        LOG credential
                      </button>
                    </div>
                  </form>
                </div>

                <div className="space-y-2">
                  <h4 className="font-mono text-[0.62rem] tracking-[0.15em] text-[#8a8a93] uppercase">ACADEMIC MAPS</h4>
                  <div className="border border-white/[0.05] rounded-[1px] divide-y divide-white/[0.05]">
                    {education.map((edu, idx) => (
                      <div key={idx} className="p-3 bg-white/[0.01] flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <span className="font-mono text-[0.52rem] text-gold mr-2">{edu.duration}</span>
                          <span className="font-mono text-[0.6rem] text-text-primary font-bold uppercase">{edu.degree} inside {edu.field} • {edu.institution}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteEducation(edu.docId, idx)}
                          className="p-1 px-2 border border-white/5 hover:border-red-500/20 hover:bg-red-950/20 rounded-[1.5px] text-muted-slate hover:text-red-400 transition-all font-mono text-[0.48em] uppercase tracking-widest shrink-0"
                        >
                          Scrub
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "inbox" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100%-20px)]">
                {/* Inbox Left list */}
                <div className="lg:col-span-5 border border-white/[0.05] bg-[#030305] p-3 rounded-[1px] space-y-3 flex flex-col h-[400px] lg:h-full overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="font-mono text-[0.65rem] tracking-[0.18em] text-[#8a8a93] uppercase font-black">
                      INCOMING INQUIRIES
                    </span>
                    <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full font-mono text-[0.5rem] text-[#8a8a93] select-none">
                      {messages.length} total
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <Mail className="w-6 h-6 text-white/10 mb-2 animate-bounce" />
                        <span className="block font-mono text-[0.6rem] text-[#8a8a93]/40 uppercase tracking-widest">
                          Inbox clear
                        </span>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <button
                          key={msg.id}
                          onClick={() => {
                            setSelectedMessage(msg);
                            if (msg.status === "unread") {
                              handleUpdateMsgStatus(msg.id, "read");
                            }
                          }}
                          className={`w-full p-2.5 rounded-[1px] text-left border transition-all duration-300 block select-none cursor-pointer ${
                            selectedMessage?.id === msg.id
                              ? "bg-gold/10 border-gold/45"
                              : msg.status === "unread"
                              ? "bg-white/[0.03] border-white/[0.09]"
                              : "bg-[#020202] border-white/[0.03]"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-[0.6rem] text-text-primary capitalize font-black truncate max-w-[120px]">
                              {msg.name}
                            </span>
                            <span className="font-mono text-[0.45rem] text-muted-slate/50">
                              {new Date(msg.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                            </span>
                          </div>
                          <span className="block font-mono text-[0.48rem] text-gold uppercase tracking-wider truncate mb-1">
                            {msg.subject || "No Subject"}
                          </span>
                          <span className="block font-mono text-[0.52rem] text-muted-slate truncate">
                            {msg.message}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Inbox Detail Right Side */}
                <div className="lg:col-span-7 border border-white/[0.05] bg-[#020204]/60 p-4 rounded-[1px] flex flex-col justify-between h-[450px] lg:h-full overflow-hidden">
                  {selectedMessage ? (
                    <div className="flex flex-col h-full justify-between gap-4 overflow-hidden">
                      <div className="space-y-4 overflow-y-auto pr-1 flex-1">
                        {/* Header details */}
                        <div className="border-b border-white/[0.05] pb-3">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-mono text-[0.68rem] tracking-wider text-text-primary uppercase font-extrabold">{selectedMessage.name}</h4>
                              <span className="font-mono text-[0.5rem] text-muted-slate hover:text-gold block transition-colors">{selectedMessage.email}</span>
                            </div>
                            <span className="font-mono text-[0.45rem] text-muted-slate uppercase tracking-widest border border-white/10 px-2 py-0.5 select-none rounded-[1px]">
                              STATUS: {selectedMessage.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-3 font-mono text-[0.52rem] tracking-widest text-gold uppercase">
                            <span className="text-[#8a8a93]">SUBJECT:</span>
                            {selectedMessage.subject || "GENERAL PROMPT"}
                          </div>
                        </div>

                        {/* Text message */}
                        <div className="bg-white/[0.01] border border-white/[0.03] p-4 text-xs font-mono text-[#a0a0ab] rounded-[1px] leading-relaxed whitespace-pre-wrap font-sans">
                          {selectedMessage.message}
                        </div>

                        {/* AI Reply Builder */}
                        <div className="border-t border-white/[0.05] pt-4 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[0.52rem] tracking-widest text-gold uppercase flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 animate-bounce" />
                              GEMINI AI REPLY ASSISTANT
                            </span>
                            <button
                              onClick={handleGenerateAiReply}
                              disabled={isAiGenerating}
                              className="px-2 py-1 bg-gold/10 hover:bg-gold hover:text-bg-dark border border-gold/25 transition-all text-[0.48rem] font-mono uppercase tracking-widest rounded-[1.5px] cursor-pointer"
                            >
                              {isAiGenerating ? "Synthesizing..." : "Draft Reply Response"}
                            </button>
                          </div>

                          {aiDraftReply && (
                            <div className="relative bg-gold/5 border border-gold/15 p-3 rounded-[1px] font-mono text-[0.58rem] text-muted-slate space-y-2 leading-relaxed">
                              <p className="whitespace-pre-wrap leading-relaxed select-text font-sans">{aiDraftReply}</p>
                              
                              <div className="flex justify-end gap-1.5 pt-1.5 border-t border-gold/10">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(aiDraftReply);
                                    setAiCopied(true);
                                    setTimeout(() => setAiCopied(false), 2000);
                                  }}
                                  className="p-1 px-2 border border-gold/20 hover:bg-gold/15 transition-all flex items-center gap-1 hover:text-gold rounded-[1.5px] uppercase text-[0.45rem] tracking-widest"
                                  title="Copy response payload"
                                >
                                  {aiCopied ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                                  {aiCopied ? "Payload Copied" : "Copy Reply"}
                                </button>
                                <a 
                                  href={`mailto:${selectedMessage.email}?subject=RE: ${encodeURIComponent(selectedMessage.subject || "Your Inquiry")}&body=${encodeURIComponent(aiDraftReply)}`}
                                  className="p-1 px-2 bg-gold hover:bg-gold-light text-bg-dark font-black tracking-widest transition-all rounded-[1.5px] uppercase text-[0.45rem]"
                                >
                                  Mail Client
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="border-t border-white/[0.05] pt-3 flex justify-between items-center bg-[#020204]/90 p-2 rounded-[1.5px]">
                        <div className="flex gap-2">
                          {selectedMessage.status !== "archived" && (
                            <button
                              onClick={() => handleUpdateMsgStatus(selectedMessage.id, "archived")}
                              className="px-2.5 py-1.5 border border-white/5 hover:border-white/20 text-muted-slate hover:text-white font-mono text-[0.5rem] uppercase tracking-widest rounded-[1.5px] cursor-pointer"
                            >
                              Archive
                            </button>
                          )}
                          {selectedMessage.status !== "read" && (
                            <button
                              onClick={() => handleUpdateMsgStatus(selectedMessage.id, "read")}
                              className="px-2.5 py-1.5 border border-white/5 hover:border-gold/30 text-muted-slate hover:text-gold font-mono text-[0.5rem] uppercase tracking-widest rounded-[1.5px] cursor-pointer"
                            >
                              Mark Read
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteMessage(selectedMessage.id)}
                          className="px-2.5 py-1.5 border border-red-500/10 hover:border-red-500/30 text-muted-slate hover:text-red-400 font-mono text-[0.5rem] uppercase tracking-widest rounded-[1.5px] cursor-pointer bg-red-950/10"
                        >
                          Scrub Record
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <Mail className="w-8 h-8 text-white/5 mb-3 animate-pulse" />
                      <span className="block font-mono text-[0.62rem] text-muted-slate/30 uppercase tracking-[0.16em]">
                        no query selected
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6 max-w-xl">
                <div className="bg-white/[0.01] border border-white/[0.05] p-5 rounded-[2px] space-y-4">
                  <h4 className="font-mono text-[0.65rem] tracking-[0.16em] text-gold uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    GEMINI AI CREDENTIAL PORT
                  </h4>
                  <p className="font-mono text-[0.55rem] text-muted-slate uppercase tracking-widest leading-relaxed">
                    By saving a custom Gemini API token inside your browser, the site CMS unlocks actual model correspondence to formulate high-fidelity client replies. No data is shared.
                  </p>

                  <div className="space-y-2">
                    <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase tracking-widest">GEMINI API KEY TOKEN</label>
                    <div className="flex gap-2">
                      <input 
                        type="password"
                        placeholder="AIzaSy..."
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value)}
                        className="flex-1 p-2 bg-black border border-white/[0.08] text-text-primary font-mono text-xs rounded-[1px] focus:outline-none"
                      />
                      <button
                        onClick={() => saveApiKey(geminiApiKey)}
                        className="px-4 py-2 bg-gold hover:bg-gold-light text-bg-dark font-mono text-[0.52rem] font-bold tracking-widest uppercase rounded-[1px]"
                      >
                        Commit Token
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.01] border border-white/[0.05] p-5 rounded-[2px] space-y-4">
                  <h4 className="font-mono text-[0.65rem] tracking-[0.16em] text-gold uppercase flex items-center gap-1.5 font-black">
                    <Database className="w-3.5 h-3.5" />
                    BACKEND CLOUD SYNCHRONIZATION
                  </h4>
                  <p className="font-mono text-[0.55rem] text-muted-slate uppercase tracking-widest leading-relaxed">
                    This browser is currently running out of {isFirebaseConfigured() ? "Firestore Live Database storage" : "device isolated LocalStorage storage"}. To deploy standard multi-device Firestore storage, finalize Firebase installation from AI Studio settings or accept Terms.
                  </p>

                  <div className="pt-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.02] border border-white/[0.05] rounded-full font-mono text-[0.52rem] text-muted-slate select-none">
                      <span className={`w-2 h-2 rounded-full ${isFirebaseConfigured() ? "bg-emerald-500" : "bg-amber-400"}`} />
                      DB MODE: {isFirebaseConfigured() ? "FIRESTORE ACTIVE" : "LOCAL CACHE ISOLATION"}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </motion.div>
      )}

    </div>
  );
}
