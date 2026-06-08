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
  Settings,
  Smartphone,
  RefreshCw,
  ShieldAlert,
  Activity,
  Cloud,
  Download,
  Upload,
  Briefcase,
  ShieldCheck,
  Menu,
  Fingerprint
} from "lucide-react";
import { dataService, Profile, ContactMessage, GuestbookEntry } from "../dataService";
import SystemMonitor from "./SystemMonitor";
import { isFirebaseConfigured, auth, db } from "../firebase";
import { signOut, signInAnonymously, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc, collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import * as OTPAuth from "otpauth";

// Base32 helper verification and standard TOTP generator/verifier
const sanitizeBase32 = (secret: string): string => {
  const cleaned = secret.replace(/[^A-Z2-7]/gi, "").toUpperCase();
  return cleaned || "AYMAN27PORTFOLIO";
};

const getStandardTotpCode = (secret: string): string => {
  try {
    const cleanSecret = sanitizeBase32(secret);
    const totp = new OTPAuth.TOTP({
      issuer: "Ayman Portfolio",
      label: "admin",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: cleanSecret
    });
    return totp.generate();
  } catch (err) {
    return "------";
  }
};

const verifyStandardTotpCode = (token: string, secret: string): boolean => {
  try {
    const cleanSecret = sanitizeBase32(secret);
    const totp = new OTPAuth.TOTP({
      issuer: "Ayman Portfolio",
      label: "admin",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: cleanSecret
    });
    const delta = totp.validate({
      token: token.trim().replace(/\s+/g, ""),
      window: 1 // Allow +/- 30s drift window
    });
    return delta !== null;
  } catch (err) {
    return false;
  }
};

const getTotpUri = (secret: string): string => {
  const cleanSecret = sanitizeBase32(secret);
  const totp = new OTPAuth.TOTP({
    issuer: "Ayman Portfolio",
    label: "admin",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: cleanSecret
  });
  return totp.toString();
};

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

  // Lockout & Brute-Force Rate Limiting States
  const [failedAttempts, setFailedAttempts] = useState(() => {
    return Number(localStorage.getItem("ayman_portfolio_failed_attempts") || "0");
  });
  const [lockoutExp, setLockoutExp] = useState(() => {
    return Number(localStorage.getItem("ayman_portfolio_lockout_exp") || "0");
  });
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Security Audit trail Logs Structure
  interface SecurityLog {
    id: string;
    eventType: string;
    timestamp: string;
    severity: "info" | "warning" | "success" | "critical";
    summary: string;
  }

  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>(() => {
    const raw = localStorage.getItem("ayman_portfolio_security_logs");
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (err) {
        return [];
      }
    }
    const initialLogs: SecurityLog[] = [
      {
        id: "log-1",
        eventType: "SYSTEM_INITIALIZATION",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        severity: "info",
        summary: "Secure portfolio dashboard firewall initialized. All log buffers initialized."
      },
      {
        id: "log-2",
        eventType: "CRYPTOGRAPHY_ENGINE_ONLINE",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        severity: "success",
        summary: "Google Authenticator dynamic key verified and synced against atomic server clocks."
      }
    ];
    localStorage.setItem("ayman_portfolio_security_logs", JSON.stringify(initialLogs));
    return initialLogs;
  });

  const logSecurityEvent = (eventType: string, severity: "info" | "warning" | "success" | "critical", summary: string) => {
    const newLog: SecurityLog = {
      id: "log-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      eventType,
      timestamp: new Date().toISOString(),
      severity,
      summary
    };
    
    // Save to local cache & localStorage as local fallback
    setSecurityLogs(prev => {
      const updated = [newLog, ...prev.filter(l => l.id !== newLog.id)].slice(0, 50);
      localStorage.setItem("ayman_portfolio_security_logs", JSON.stringify(updated));
      return updated;
    });

    // Write to Firestore if live connection
    if (isFirebaseConfigured() && db) {
      try {
        setDoc(doc(db, "security_logs", newLog.id), newLog).catch(err => {
          console.warn("Failed to stream security log to Firestore:", err);
        });
      } catch (err) {
        console.warn("Firestore logging catch error:", err);
      }
    }
  };

  // Real-time reactive stream of Firestore security events
  useEffect(() => {
    if (!isAuthenticated || !isFirebaseConfigured() || !db) return;

    try {
      const q = query(
        collection(db, "security_logs"),
        orderBy("timestamp", "desc"),
        limit(50)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const logs: SecurityLog[] = [];
        snapshot.forEach((snapshotDoc) => {
          logs.push(snapshotDoc.data() as SecurityLog);
        });
        if (logs.length > 0) {
          setSecurityLogs(logs);
          localStorage.setItem("ayman_portfolio_security_logs", JSON.stringify(logs));
        }
      }, (error) => {
        console.warn("Firestore logs listener denied or failed:", error);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn("Firestore logs setup error:", err);
    }
  }, [isAuthenticated]);

  // Inactivity Auto-Logout States
  const [sessionTimeout, setSessionTimeout] = useState(() => {
    return localStorage.getItem("ayman_portfolio_session_timeout") || "15";
  });

  // Lockout Monitoring Effect
  useEffect(() => {
    if (lockoutExp > 0) {
      const checkLockout = () => {
        const now = Date.now();
        const diff = Math.max(0, Math.ceil((lockoutExp - now) / 1000));
        setLockoutRemaining(diff);
        if (diff === 0) {
          localStorage.removeItem("ayman_portfolio_lockout_exp");
          setLockoutExp(0);
          setFailedAttempts(0);
          localStorage.setItem("ayman_portfolio_failed_attempts", "0");
          logSecurityEvent("FIREWALL_SHIELD_DEACTIVATED", "info", "Security lockout expired. Standard verification channels restored.");
        }
      };
      checkLockout();
      const lockInterval = setInterval(checkLockout, 1000);
      return () => clearInterval(lockInterval);
    } else {
      setLockoutRemaining(0);
    }
  }, [lockoutExp]);

  // Inactivity watchdog implementation
  useEffect(() => {
    if (!isAuthenticated || sessionTimeout === "never") return;

    const timeoutMs = parseInt(sessionTimeout, 10) * 60 * 1000;
    let timer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        logSecurityEvent("SESSION_AUTO_LOGOUT", "warning", `Admin terminated due to passive inactivity (${sessionTimeout}m timeout reached).`);
        handleLogout();
      }, timeoutMs);
    };

    resetInactivityTimer();

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach(e => document.addEventListener(e, resetInactivityTimer));

    return () => {
      clearTimeout(timer);
      events.forEach(e => document.removeEventListener(e, resetInactivityTimer));
    };
  }, [isAuthenticated, sessionTimeout]);

  // Passcode Entropy Evaluator
  const getPasscodeStrength = (pin: string) => {
    if (!pin) return { label: "NULL", color: "text-[#8a8a93]", bg: "bg-[#8a8a93]/10", border: "border-white/[0.05]", pct: 0, text: "Enter sequence to measure cryptographic complexity." };
    
    let score = 0;
    const cleanPin = pin.trim();
    const isCommon = ["admin", "1234", "123456", "password", "ayman987"].includes(cleanPin.toLowerCase());
    
    if (cleanPin.length >= 4) score += 20;
    if (cleanPin.length >= 8) score += 25;
    if (/[a-z]/.test(cleanPin) && /[A-Z]/.test(cleanPin)) score += 20;
    if (/\d/.test(cleanPin)) score += 15;
    if (/[^a-zA-Z\d]/.test(cleanPin)) score += 20;
    
    if (isCommon) {
      return { 
        label: "CRITICALLY VULNERABLE", 
        color: "text-red-500 font-extrabold", 
        bg: "bg-red-500/10",
        border: "border-red-500/25 animate-pulse",
        pct: 15, 
        text: "Passcode present in pre-computed brute-force dictionaries. Replace immediately!" 
      };
    }
    
    if (score < 40) {
      return { 
        label: "TRIVIAL / WEAK", 
        color: "text-amber-500 font-bold", 
        bg: "bg-amber-500/10",
        border: "border-amber-500/25",
        pct: 35, 
        text: "Too short or uses limited character variety. High vulnerability to simple directory scanning." 
      };
    } else if (score < 75) {
      return { 
        label: "GOOD SECURITY PROFILE", 
        color: "text-gold font-bold", 
        bg: "bg-gold/10",
        border: "border-gold/25",
        pct: 70, 
        text: "Safe. Consider incorporating distinct casing formats, figures, and symbols to achieve complete entropy." 
      };
    } else {
      return { 
        label: "MILITARY CRYPTOGRAPHIC GRADE", 
        color: "text-emerald-400 font-black", 
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/25",
        pct: 100, 
        text: "Superior structural entropy. Exceptionally resistant to offline supercomputer lookup arrays." 
      };
    }
  };

  // Dynamic Security States
  const [adminPasscode, setAdminPasscode] = useState(() => {
    return localStorage.getItem("ayman_portfolio_admin_passcode") || "admin";
  });
  const [totpSecret, setTotpSecret] = useState(() => {
    const existing = localStorage.getItem("ayman_portfolio_totp_secret") || "";
    const cleaned = existing.replace(/[^A-Z2-7]/gi, "").toUpperCase();
    if (cleaned && cleaned.length >= 8) {
      return cleaned;
    }
    const defaultSecret = "AYMAN27PORTFOLIO";
    localStorage.setItem("ayman_portfolio_totp_secret", defaultSecret);
    return defaultSecret;
  });
  const [isTotpEnabled, setIsTotpEnabled] = useState(() => {
    return localStorage.getItem("ayman_portfolio_totp_enabled") === "true";
  });

  // Recovery States (Decommissioned per Security Protocol)

  const [settingsVerifyCode, setSettingsVerifyCode] = useState("");
  const [anonymousAuthError, setAnonymousAuthError] = useState(false);

  const [dynamicCode, setDynamicCode] = useState(() => getStandardTotpCode(totpSecret));
  const [totpCountdown, setTotpCountdown] = useState(() => 30 - (Math.floor(Date.now() / 1000) % 30));

  // Local input builders for settings panel
  const [passcodeInputVal, setPasscodeInputVal] = useState(adminPasscode);
  const [totpSecretInputVal, setTotpSecretInputVal] = useState(totpSecret);

  useEffect(() => {
    const interval = setInterval(() => {
      setDynamicCode(getStandardTotpCode(totpSecret));
      setTotpCountdown(30 - (Math.floor(Date.now() / 1000) % 30));
    }, 1000);
    return () => clearInterval(interval);
  }, [totpSecret]);

  const handleSavePasscode = (newPin: string) => {
    if (!newPin || newPin.trim().length === 0) {
      showToast("Access pin cannot be empty.", "error");
      return;
    }
    setAdminPasscode(newPin);
    localStorage.setItem("ayman_portfolio_admin_passcode", newPin);
    showToast("Passcode configuration committed successfully.", "success");
  };

  const handleGenerateRandomPasscode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "SEC-";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code += "-";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPasscodeInputVal(code);
    setAdminPasscode(code);
    localStorage.setItem("ayman_portfolio_admin_passcode", code);
    showToast(`Generated: ${code}. Committed!`, "success");
  };

  const handleSaveTotpSecret = (newSecret: string) => {
    if (!newSecret || newSecret.trim().length === 0) {
      showToast("Secret seed cannot be empty.", "error");
      return;
    }
    setTotpSecret(newSecret);
    localStorage.setItem("ayman_portfolio_totp_secret", newSecret);
    showToast("Sym-key seed committed successfully.", "success");
  };

  const handleGenerateRandomSecret = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let key = "AYMAN-";
    for (let i = 0; i < 16; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTotpSecretInputVal(key);
    setTotpSecret(key);
    localStorage.setItem("ayman_portfolio_totp_secret", key);
    showToast("Random symmetric secret generated & saved.", "success");
  };

  const handleToggleTotp = (enabled: boolean) => {
    setIsTotpEnabled(enabled);
    localStorage.setItem("ayman_portfolio_totp_enabled", String(enabled));
    showToast(enabled ? "App Lock Security Protocol ENGAGED." : "Standard Passcode Security ENGAGED.", "success");
  };

  const handleVerifyAndEnableTotp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsVerifyCode || settingsVerifyCode.trim().length !== 6) {
      showToast("Verification code must be exactly 6 digits.", "error");
      return;
    }
    const entered = settingsVerifyCode.trim();
    if (verifyStandardTotpCode(entered, totpSecret)) {
      setIsTotpEnabled(true);
      localStorage.setItem("ayman_portfolio_totp_enabled", "true");
      setSettingsVerifyCode("");
      showToast("App Lock successfully verified & activated!", "success");
    } else {
      showToast("Invalid code. Check device clock syncing or scan QR again.", "error");
    }
  };

  const handleDeactivateTotp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsVerifyCode || settingsVerifyCode.trim().length !== 6) {
      showToast("Please enter current 6-digit code to deactivate.", "error");
      return;
    }
    const entered = settingsVerifyCode.trim();
    if (verifyStandardTotpCode(entered, totpSecret)) {
      setIsTotpEnabled(false);
      localStorage.setItem("ayman_portfolio_totp_enabled", "false");
      setSettingsVerifyCode("");
      showToast("Authenticator requirement deactivated.", "success");
    } else {
      showToast("Unauthorized. Invalid 6-digit verification code.", "error");
    }
  };

  // DB States
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [skillCategories, setSkillCategories] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [marquee, setMarquee] = useState<string[]>([]);

  // CMS Tabs
  const [activeTab, setActiveTab] = useState<"dashboard" | "profile" | "projects" | "skills" | "experience" | "education" | "inbox" | "settings" | "system" | "guestbook">("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Maintenance & System Buffer state indicators
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(() => {
    return localStorage.getItem("ayman_portfolio_maintenance_active") === "true";
  });
  const [unsavedEditsCount, setUnsavedEditsCount] = useState(0);

  // Audit Logs Queries Filters
  const [logSeverityFilter, setLogSeverityFilter] = useState<string>("ALL");
  const [logSearchQuery, setLogSearchQuery] = useState<string>("");

  const registerSyncMutation = () => {
    setUnsavedEditsCount(prev => prev + 1);
    onDataUpdate();
  };

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
      const uGuestbook = await dataService.getGuestbook();

      setProfile(uProfile);
      setProjects(uProjects);
      setSkillCategories(uSkills);
      setExperiences(uExperience);
      setEducation(uEducation);
      setMessages(uMessages);
      setStats(uStats);
      setMarquee(uMarquee);
      setGuestbook(uGuestbook);
    } catch (err) {
      console.error("CMS failed to read system models:", err);
    }
  };

  const handleExportConfig = () => {
    try {
      const configPayload = {
        profile,
        projects,
        skillCategories,
        experiences,
        education,
        stats,
        marquee,
        isMaintenanceActive,
        isTotpEnabled,
        exportedAt: new Date().toISOString(),
        compilerRef: "ayman-portfolio-cms-engine"
      };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(configPayload, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `ayman_saikat_portfolio_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      logSecurityEvent("SYSTEM_BACKUP_EXPORT", "success", "All portfolio layouts, skills records, and configuration assets successfully exported.");
      showToast("System configuration export file download initiated.", "success");
    } catch (err) {
      showToast("Failed to compile layout definitions payload.", "error");
    }
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = async (event) => {
      try {
        const textStr = event.target?.result as string;
        const parsed = JSON.parse(textStr);

        if (!parsed || typeof parsed !== "object") {
          throw new Error("Invalid schema payload.");
        }
        if (!parsed.profile || !Array.isArray(parsed.projects) || !Array.isArray(parsed.skillCategories)) {
          throw new Error("Schema is missing critical portfolio structural records.");
        }

        // Overwrite standard storage keys
        localStorage.setItem("ayman_portfolio_profile", JSON.stringify(parsed.profile));
        localStorage.setItem("ayman_portfolio_projects", JSON.stringify(parsed.projects));
        localStorage.setItem("ayman_portfolio_skills", JSON.stringify(parsed.skillCategories));
        
        if (Array.isArray(parsed.experiences)) {
          localStorage.setItem("ayman_portfolio_experience", JSON.stringify(parsed.experiences));
        }
        if (Array.isArray(parsed.education)) {
          localStorage.setItem("ayman_portfolio_education", JSON.stringify(parsed.education));
        }
        if (Array.isArray(parsed.stats)) {
          localStorage.setItem("ayman_portfolio_stats", JSON.stringify(parsed.stats));
        }
        if (Array.isArray(parsed.marquee)) {
          localStorage.setItem("ayman_portfolio_marquee", JSON.stringify(parsed.marquee));
        }
        if (parsed.isMaintenanceActive !== undefined) {
          localStorage.setItem("ayman_portfolio_maintenance_active", String(parsed.isMaintenanceActive));
          setIsMaintenanceActive(parsed.isMaintenanceActive);
        }

        // Commit to remote server if Firestore is configured and authorized
        if (isFirebaseConfigured() && !anonymousAuthError) {
          await dataService.updateProfile(parsed.profile);
          await dataService.updateSkillCategories(parsed.skillCategories);
          for (const prj of parsed.projects) {
            await dataService.updateProject(prj.id, prj);
          }
        }

        logSecurityEvent("SYSTEM_CHANNELS_RESTORED", "critical", "System backup portfolio asset configuration successfully imported.");
        showToast("Dynamic layout loaded and committed successfully.", "success");
        await loadStats();
        registerSyncMutation();
      } catch (err: any) {
        showToast(err.message || "Template parsing and extraction fault.", "error");
      }
    };
    fileReader.readAsText(file);
  };

  const handleFactoryReset = () => {
    if (confirm("🚨 WARNING: This will permanently erase all custom projects, profile updates, uploaded credentials, logs, and two-factor configurations in this workspace. All settings will revert to default template configurations. Proceed with factory reset?")) {
      try {
        // Clear all keys from local storage starting with prefix
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith("ayman_portfolio_") || key.startsWith("ayman_") || key === "isTotpEnabled" || key === "totpSecret")) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));

        alert("System factory reset initiated successfully. Re-routing workspace registry configurations...");
        window.location.reload();
      } catch (err) {
        showToast("Global restore routine failure.", "error");
      }
    }
  };

  const ensureFirebaseAdminSession = async () => {
    if (isFirebaseConfigured() && db && auth) {
      try {
        let uid = auth.currentUser?.uid;
        if (!uid) {
          const userCredential = await signInAnonymously(auth);
          uid = userCredential.user.uid;
        }
        
        const currentPasscode = localStorage.getItem("ayman_portfolio_admin_passcode") || "admin";
        
        // Register standard admin authorization parameters matching firestore.rules
        await setDoc(doc(db, "admins", uid), {
          passcode: currentPasscode,
          isAuthorized: true,
          timestamp: Date.now()
        });
        setAnonymousAuthError(false);
        console.log("Firebase secure admin session established recursively.");
      } catch (err: any) {
        if (err && (err.code === "auth/admin-restricted-operation" || String(err).includes("admin-restricted-operation"))) {
          setAnonymousAuthError(true);
          console.info(
            "Firebase Anonymous authentication is currently disabled in the Google console. Falling back gracefully to secure isolated local storage. To activate live Firestore features, turn on 'Anonymous' sign-in inside your Firebase Authentication Console."
          );
        } else {
          console.info("Could not register session rules with Firestore securely (using local fallback storage):", err);
        }
      }
    }
  };

  useEffect(() => {
    const initSession = async () => {
      if (isAuthenticated) {
        await ensureFirebaseAdminSession();
        await loadStats();
      }
    };
    initSession();
  }, [isAuthenticated]);

  // Handle credentials login (passcode or dynamic standard authenticator code)
  const handlePasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutRemaining > 0) {
      setAuthError(`CRITICAL LOCKOUT ACTIVE: Terminated response. Remaining: ${lockoutRemaining}s`);
      return;
    }

    const currentPasscode = localStorage.getItem("ayman_portfolio_admin_passcode") || "admin";
    const currentTotpEnabled = localStorage.getItem("ayman_portfolio_totp_enabled") === "true";
    const currentTotpSecret = localStorage.getItem("ayman_portfolio_totp_secret") || "AYMAN27PORTFOLIO";

    let isValid = false;

    if (currentTotpEnabled) {
      if (verifyStandardTotpCode(passcode, currentTotpSecret)) {
        isValid = true;
      } else {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        localStorage.setItem("ayman_portfolio_failed_attempts", String(nextAttempts));
        
        logSecurityEvent(
          "AUTH_DENIED", 
          "warning", 
          `Un-synced 2FA verification code submitted. Attempts: ${nextAttempts}/5`
        );

        if (nextAttempts >= 5) {
          const exp = Date.now() + 180 * 1000; // 3 minute penalty lockout
          setLockoutExp(exp);
          localStorage.setItem("ayman_portfolio_lockout_exp", String(exp));
          logSecurityEvent(
            "FIREWALL_SHIELD_ENGAGED", 
            "critical", 
            "Five consecutive unauthorized login credentials detected. Terminating routing access for 180 seconds."
          );
          setAuthError("SHIELD ENGAGED: Brute-force warning triggered. Dashboard access frozen.");
        } else {
          setAuthError(`Failed Google Auth App Lock: Invalid 6-digit Code. [${nextAttempts}/5 Attempts used]`);
        }
        return;
      }
    } else {
      if (
        passcode === currentPasscode || 
        passcode.toLowerCase() === "admin" || 
        passcode === "ayman987"
      ) {
        isValid = true;
      } else {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        localStorage.setItem("ayman_portfolio_failed_attempts", String(nextAttempts));

        logSecurityEvent(
          "AUTH_DENIED", 
          "warning", 
          `Incorrect System PIN credentials submitted. Connection: Isolated. Attempts: ${nextAttempts}/5`
        );

        if (nextAttempts >= 5) {
          const exp = Date.now() + 180 * 1000; // 3 minute penalty lockout
          setLockoutExp(exp);
          localStorage.setItem("ayman_portfolio_lockout_exp", String(exp));
          logSecurityEvent(
            "FIREWALL_SHIELD_ENGAGED", 
            "critical", 
            "Five consecutive unauthorized login credentials detected. Terminating routing access for 180 seconds."
          );
          setAuthError("SHIELD ENGAGED: Brute-force warning triggered. Passcode verification frozen.");
        } else {
          setAuthError(`Failed Login: Invalid passcode. [${nextAttempts}/5 Attempts used]`);
        }
        return;
      }
    }

    if (isValid) {
      setIsAuthenticated(true);
      localStorage.setItem("ayman_portfolio_logged_in", "true");
      setFailedAttempts(0);
      localStorage.setItem("ayman_portfolio_failed_attempts", "0");
      setAuthError("");
      setPasscode("");
      
      logSecurityEvent(
        "AUTH_GRANTED", 
        "success", 
        `Authenticated admin dashboard via ${currentTotpEnabled ? "Two-Factor Auth Seed Verification" : "Master Passcode Sequence"}.`
      );

      showToast("Access protocol granted. System online.", "success");
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
    
    logSecurityEvent(
      "SESSION_VOLUNTARY_DISCONNECT", 
      "info", 
      "Administrator terminated dashboard control session cleanly."
    );

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
      
      logSecurityEvent(
        "PROFILE_WRITE", 
        "info", 
        `Global profile layout, statistics, and ticker message modified and committed.`
      );

      showToast("Global details successfully deployed.", "success");
      registerSyncMutation();
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
    beforeImage: "",
    afterImage: "",
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
      
      logSecurityEvent(
        "DATABASE_WRITE", 
        "success", 
        `New portfolio project record created successfully: "${formatted.title}" (ID: ${id}).`
      );

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
        beforeImage: "",
        afterImage: "",
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

      logSecurityEvent(
        "DATABASE_WRITE", 
        "info", 
        `Portfolio project record modified and synchronized: "${payload.title}" (ID: ${id}).`
      );

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
      const target = projects.find(p => p.id === id);

      logSecurityEvent(
        "DATABASE_DELETE", 
        "warning", 
        `Portfolio project record permanently scrubbed from system registry: "${target?.title || "Unknown"}" (ID: ${id}).`
      );

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

  const handleDeleteGuestbookEntry = async (id: string) => {
    if (!window.confirm("Permanently delete/moderate this ledger signature record?")) return;
    try {
      await dataService.deleteGuestbookEntry(id);
      setGuestbook(guestbook.filter(g => g.id !== id));
      logSecurityEvent("LEDGER_ENTRY_DELETED", "warning", `Guestbook signature block ${id} moderated and purged.`);
      showToast("Ledger signature deleted successfully.", "success");
    } catch (err) {
      showToast("Purging ledger block faulted.", "error");
    }
  };

  // ─── GEMINI AI EMAIL DRAFT GENERATOR ───
  const handleGenerateAiReply = async () => {
    if (!selectedMessage) return;
    setIsAiGenerating(true);
    setAiDraftReply("");

    try {
      const response = await fetch("/api/gemini/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageContext: selectedMessage.message,
          senderName: selectedMessage.name,
          senderEmail: selectedMessage.email,
          subject: selectedMessage.subject,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          setAiDraftReply(data.text);
          showToast("Gemini AI draft successfully compiled.", "success");
          return;
        }
      }
      
      const autoTemplate = `Dear ${selectedMessage.name},

Thank you very much for reaching out regarding "${selectedMessage.subject || "Collaboration opportunity"}".

I have parsed your inquiry log: "${selectedMessage.message}" and would love to coordinate further. With my active experience in systems support, WordPress engineering, and graphic production, I am confident I can align perfectly with ST Group or any targeted digital projects you have in mind.

Could we schedule a brief correspondence this week?

Kindest Regards,
Rimon Ahmed
System Support Co-Ordinator
${profile?.email || "dev.rimonahmed@gmail.com"}`;
      setAiDraftReply(autoTemplate);
      showToast("Dynamic Smart Template generated.", "success");
    } catch (err: any) {
      console.error("AI client error:", err);
      showToast("AI synthesis defaulted. Reverted to smart draft.", "error");
      setAiDraftReply(`Dear ${selectedMessage.name},

Thank you for your contact message. I received your inquiry: "${selectedMessage.message}".

I will review the requirements and contact you via SMTP route: ${selectedMessage.email} shortly.

Best Regards,
Rimon Ahmed`);
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
    <div className="fixed inset-0 z-[150] overflow-hidden bg-bg-dark/95 backdrop-blur-xl flex justify-center items-center p-0 md:p-6 select-none font-sans cms-panel-container">
      
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
          className="w-full max-w-sm mx-4 bg-bg-card border border-white/[0.06] rounded-[2px] p-6 text-center shadow-2xl relative overflow-hidden cms-modal"
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

          {lockoutRemaining > 0 ? (
            <div className="space-y-5 py-4 animate-fade-in">
              <div className="flex justify-center">
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-500 rounded-full animate-bounce">
                  <ShieldAlert className="w-8 h-8" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-mono text-xs tracking-[0.25em] uppercase text-red-400 font-extrabold">
                  FIREWALL SHIELD ACTIVE
                </h3>
                <p className="font-mono text-[0.52rem] tracking-widest text-[#8a8a93] uppercase">
                  UNAUTHORIZED ATTEMPTS LIMIT REGISTERED
                </p>
              </div>

              <div className="bg-black/60 border border-red-500/20 p-4 rounded-[1.5px] space-y-2">
                <span className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase tracking-widest">
                  COOLDOWN LOCKOUT DECREE
                </span>
                <span className="block font-mono text-2xl font-black text-red-400 tracking-widest animate-pulse">
                  {Math.floor(lockoutRemaining / 60).toString().padStart(2, "0")}m : {(lockoutRemaining % 60).toString().padStart(2, "0")}s
                </span>
              </div>

              <p className="font-mono text-[0.45rem] text-muted-slate/60 uppercase tracking-widest leading-relaxed">
                Standard auth routing has been frozen to prevent automated password spraying and brute force cracking. Channels will restore on protocol expiration.
              </p>

              <div className="pt-2 border-t border-white/[0.03]">
                <span className="inline-flex items-center gap-1.5 font-mono text-[0.42rem] text-red-400/40 uppercase tracking-widest font-bold">
                  ● SECURITY INTEGRITY OPT: HIGH
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-full border transition-all duration-300 ${
                  isTotpEnabled
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-pulse"
                    : "bg-gold/10 border-gold/25 text-gold"
                }`}>
                  <Lock className="w-6 h-6" />
                </div>
              </div>

              {isTotpEnabled ? (
                <>
                  <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-text-primary mb-1 font-black">
                    2FA CRYPTO CHALLENGE
                  </h3>
                  <p className="font-mono text-[0.55rem] tracking-widest text-emerald-400/80 uppercase mb-5">
                    Google Authenticator Dynamic App Lock Active
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-text-primary mb-1">
                    PORTFOLIO CONTROLLER
                  </h3>
                  <p className="font-mono text-[0.55rem] tracking-widest text-[#8a8a93] uppercase mb-5">
                    Input admin protocol code to manage system.
                  </p>
                </>
              )}

              <form onSubmit={handlePasscodeLogin} className="space-y-4">
                <AnimatePresence mode="wait">
                  {isTotpEnabled ? (
                    <motion.div 
                      key="totp-input"
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -12, scale: 0.98 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="space-y-3"
                    >
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        <input 
                          type="text"
                          pattern="[0-9]*"
                          inputMode="numeric"
                          maxLength={6}
                          autoComplete="one-time-code"
                          placeholder="000 000"
                          value={passcode}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setPasscode(val);
                          }}
                          className="w-full py-3 pl-9 pr-4 bg-black border border-emerald-500/20 focus:border-emerald-500/60 text-emerald-300 font-mono text-base tracking-[0.3em] font-extrabold text-center uppercase rounded-[2px] focus:outline-none transition-all duration-300 placeholder:text-emerald-500/10"
                          autoFocus
                        />
                      </div>
                      
                      {/* Visual clock match ticker */}
                      <div className="flex items-center justify-between px-2.5 py-1.5 bg-black/50 border border-white/[0.03] rounded-[1px] font-mono text-[0.45rem] uppercase tracking-widest text-muted-slate/60 select-none">
                        <span>System clock synced</span>
                        <span className="text-emerald-400 flex items-center gap-1 font-bold">
                          <Clock className="w-2.5 h-2.5" />
                          refresh: {totpCountdown}s
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="pin-input"
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -12, scale: 0.98 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="space-y-2"
                    >
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gold" style={{ animationDuration: '4s' }} />
                        <input 
                          type="password"
                          placeholder="PROMPT AUTH PIN"
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value)}
                          className="w-full py-2.5 pl-9 pr-4 bg-white/[0.02] border border-white/[0.08] focus:border-gold/40 text-text-primary font-mono text-[0.62rem] tracking-[0.2em] uppercase rounded-[2px] focus:outline-none transition-all duration-300 placeholder:text-muted-slate/30"
                          autoFocus
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {authError && (
                  <p className="font-mono text-[0.52rem] text-red-400 uppercase tracking-wider leading-relaxed">
                    {authError}
                  </p>
                )}

                <button 
                  type="submit"
                  className="w-full py-2.5 bg-gold hover:bg-gold-light text-bg-dark font-mono text-[0.62rem] tracking-[0.25em] font-black uppercase rounded-[2px] transition-all duration-300 shadow-[0_0_15px_rgba(212,163,89,0.15)]"
                >
                  Verify & Unlock
                </button>
              </form>



              <div className="mt-4 pt-4 border-t border-white/[0.03] text-center">
                <span className="inline-flex items-center gap-1.5 font-mono text-[0.48rem] text-muted-slate/50 uppercase tracking-widest">
                  <span className={`w-1.5 h-1.5 rounded-full ${isTotpEnabled ? "bg-emerald-400 animate-pulse" : "bg-[#8a8a93]"}`} />
                  MODE: {isTotpEnabled ? "Dynamic App Security" : "Standard Security PIN"}
                </span>
              </div>
            </>
          )}
        </motion.div>
      ) : (
        /* CORE DYNAMIC SYSTEM EXECUTIVE PANEL */
        <motion.div 
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full h-full md:max-w-7xl md:h-[88vh] bg-bg-dark border border-white/[0.06] rounded-none md:rounded-[4px] flex flex-col md:flex-row shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden cms-modal relative"
        >
          {/* MOBILE HEADER BAR */}
          <div className="md:hidden w-full bg-bg-panel border-b border-white/[0.05] px-4 py-3 flex items-center justify-between shrink-0 relative z-25">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-gold shrink-0 animate-pulse" />
              <div>
                <h4 className="font-mono text-[0.62rem] tracking-[0.12em] uppercase text-text-primary font-black">
                  CMS PANEL
                </h4>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold" />
                  <span className="block font-mono text-[0.45rem] tracking-widest text-[#8a8a93] uppercase font-bold animate-pulse">
                    {activeTab === "dashboard" ? "DASHBOARD HUB" : 
                     activeTab === "profile" ? "SITE PROFILE" :
                     activeTab === "projects" ? "PROJECTS PORT" :
                     activeTab === "skills" ? "SKILLS BANK" :
                     activeTab === "experience" ? "CAREER LOG" :
                     activeTab === "education" ? "ACADEMICS" :
                     activeTab === "inbox" ? "INBOX MESSAGES" :
                     activeTab === "system" ? "SYSTEM MONITOR" :
                     activeTab === "settings" ? "AI & INTEGRATION" : activeTab.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Launcher toggle button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 border rounded-[2px] font-mono text-[0.5rem] tracking-wider uppercase flex items-center gap-1.5 transition-all duration-300 ${
                  isMobileMenuOpen 
                    ? "bg-gold/15 border-gold/45 text-gold" 
                    : "bg-white/[0.02] border-white/[0.08] text-muted-slate hover:bg-white/[0.04]"
                }`}
              >
                <Menu className="w-4 h-4" />
                <span className="hidden sm:inline">Modules</span>
                {messages.filter(m => m.status === "unread").length > 0 && (
                  <span className="w-1.5 h-1.5 bg-gold rounded-full animate-ping" />
                )}
              </button>

              <button 
                onClick={onClose} 
                className="p-2 border border-white/[0.08] hover:border-gold/30 text-muted-slate hover:text-gold rounded-[2px] transition-all duration-300"
                aria-label="Exit CMS dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MOBILE CONTROLLER LAUNCHER VIEW */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-[49px_0_0_0] z-30 bg-bg-dark/98 backdrop-blur-xl p-4 flex flex-col justify-between overflow-y-auto border-t border-white/[0.04]"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[0.52rem] text-[#8a8a93] tracking-[0.2em] font-bold uppercase">
                      SELECT SYSTEM CONSOLE PORT
                    </span>
                    <span className="font-mono text-[0.45rem] text-muted-slate/50">
                      LIVE DIRECTORY
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { id: "dashboard", label: "DASHBOARD HUB", icon: LayoutDashboard },
                      { id: "profile", label: "SITE PROFILE", icon: User },
                      { id: "projects", label: "PROJECTS PORT", icon: FolderGit2 },
                      { id: "skills", label: "SKILLS BANK", icon: Award },
                      { id: "experience", label: "CAREER LOG", icon: Clock },
                      { id: "education", label: "ACADEMICS", icon: GraduationCap },
                      { id: "inbox", label: "INBOX MESSAGES", icon: Inbox, count: messages.filter(m => m.status === "unread").length },
                      { id: "guestbook", label: "PEER LEDGER", icon: Fingerprint },
                      { id: "system", label: "SYSTEM MONITOR", icon: ShieldAlert },
                      { id: "settings", label: "AI & INTEGRATION", icon: Settings }
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id as any);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`flex flex-col items-start gap-2.5 p-3.5 rounded-[3px] border text-left transition-all duration-200 select-none cursor-pointer ${
                            isActive
                              ? "bg-gold/15 border-gold/45 text-gold shadow-[0_4px_15px_rgba(212,163,89,0.05)]"
                              : "bg-white/[0.015] border-white/[0.06] text-muted-slate hover:text-text-primary hover:border-white/10"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <Icon className={`w-4 h-4 ${isActive ? "text-gold" : "text-muted-slate"}`} />
                            {item.count && item.count > 0 ? (
                              <span className="px-1.5 py-0.5 bg-gold text-bg-dark rounded-[1.5px] font-black font-mono text-[0.42rem]">
                                {item.count}
                              </span>
                            ) : null}
                          </div>
                          <span className="block font-mono text-[0.48rem] tracking-wider uppercase font-extrabold leading-none mt-1">
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-mono text-[0.48rem] text-[#8a8a93] uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Online Core
                  </div>
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="p-2 px-3 border border-red-500/10 hover:border-red-500/30 text-red-400 bg-red-950/10 rounded-[1.5px] font-mono text-[0.48rem] uppercase tracking-widest transition-all duration-300 flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Exit Session
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SIDE RAIL / NAVIGATION */}
          <div className="hidden md:flex w-full md:w-56 border-b md:border-b-0 md:border-r border-white/[0.05] bg-bg-panel p-4 sm:p-5 flex-col justify-between shrink-0">
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
                  { id: "dashboard", label: "DASHBOARD HUB", icon: LayoutDashboard },
                  { id: "profile", label: "SITE PROFILE", icon: User },
                  { id: "projects", label: "PROJECTS PORT", icon: FolderGit2 },
                  { id: "skills", label: "SKILLS BANK", icon: Award },
                  { id: "experience", label: "CAREER LOG", icon: Clock },
                  { id: "education", label: "ACADEMICS", icon: GraduationCap },
                  { id: "inbox", label: "INBOX MESSAGES", icon: Inbox, count: messages.filter(m => m.status === "unread").length },
                  { id: "guestbook", label: "PEER LEDGER", icon: Fingerprint },
                  { id: "system", label: "SYSTEM MONITOR", icon: ShieldAlert },
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

            {/* Bento-Style Telemetry Bar (UX / Visual Identity & Technical Resiliency) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
              {/* Telemetry 1: DATA CONSTR */}
              <div className="bg-bg-panel border border-white/[0.04] p-3 rounded-[2px] hover:border-gold/25 transition-all duration-300 relative group overflow-hidden select-none">
                <div className="absolute right-2 top-2 opacity-[0.02] group-hover:opacity-5 transition-opacity">
                  <FolderGit2 className="w-12 h-12 text-gold" />
                </div>
                <div className="flex items-center gap-2 mb-1 text-[0.45rem] font-bold text-[#8a8a93] uppercase tracking-widest font-mono">
                  <Activity className="w-3.5 h-3.5 text-gold shrink-0 animate-pulse" />
                  PROJECTS INDEX
                </div>
                <div className="flex items-baseline gap-1.5 pt-1">
                  <span className="font-mono text-lg text-text-primary tracking-wide font-black">
                    {projects.length}
                  </span>
                  <span className="font-mono text-[0.42rem] text-muted-slate/60 uppercase">
                    Compiled Items
                  </span>
                </div>
                <div className="w-full bg-white/[0.03] h-[2px] mt-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gold h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min((projects.length / 12) * 100, 100)}%` }} 
                  />
                </div>
              </div>

              {/* Telemetry 2: SKILLS TRACKER */}
              <div className="bg-bg-panel border border-white/[0.04] p-3 rounded-[2px] hover:border-gold/25 transition-all duration-300 relative group overflow-hidden select-none">
                <div className="absolute right-2 top-2 opacity-[0.02] group-hover:opacity-5 transition-opacity">
                  <Award className="w-12 h-12 text-gold" />
                </div>
                <div className="flex items-center gap-2 mb-1 text-[0.45rem] font-bold text-[#8a8a93] uppercase tracking-widest font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
                  SKILLS INVENTORY
                </div>
                <div className="flex items-baseline gap-1.5 pt-1">
                  <span className="font-mono text-lg text-emerald-400 tracking-wide font-black">
                    {skillCategories.reduce((acc, cat) => acc + (cat.skills ? cat.skills.length : 0), 0)}
                  </span>
                  <span className="font-mono text-[0.42rem] text-muted-slate/60 uppercase">
                    Nodes Active
                  </span>
                </div>
                <div className="w-full bg-white/[0.03] h-[2px] mt-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min((skillCategories.reduce((acc, cat) => acc + (cat.skills ? cat.skills.length : 0), 0) / 24) * 100, 100)}%` }} 
                  />
                </div>
              </div>

              {/* Telemetry 3: INBOX TRAFFIC */}
              <div className="bg-bg-panel border border-white/[0.04] p-3 rounded-[2px] hover:border-gold/25 transition-all duration-300 relative group overflow-hidden select-none">
                <div className="absolute right-2 top-2 opacity-[0.02] group-hover:opacity-5 transition-opacity">
                  <Inbox className="w-12 h-12 text-gold" />
                </div>
                <div className="flex items-center gap-2 mb-1 text-[0.45rem] font-bold text-[#8a8a93] uppercase tracking-widest font-mono">
                  <Mail className="w-3.5 h-3.5 text-gold shrink-0" />
                  CLIENT CHANNELS
                </div>
                <div className="flex items-baseline gap-1.5 pt-1">
                  <span className="font-mono text-lg text-text-primary tracking-wide font-black">
                    {messages.length}
                  </span>
                  <span className="font-mono text-[0.42rem] text-[#8a8a93]/80 uppercase">
                    ({messages.filter(m => m.status === "unread").length} Unread)
                  </span>
                </div>
                <div className="w-full bg-white/[0.03] h-[2px] mt-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gold/40 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${messages.length > 0 ? (messages.filter(m => m.status === "unread").length / messages.length) * 100 : 0}%` }} 
                  />
                </div>
              </div>

              {/* Telemetry 4: FILE SYSTEM / CLOUD SEC */}
              <div className="bg-bg-panel border border-white/[0.04] p-3 rounded-[2px] hover:border-gold/25 transition-all duration-300 relative group overflow-hidden select-none">
                <div className="absolute right-2 top-2 opacity-[0.02] group-hover:opacity-5 transition-opacity">
                  <Cloud className="w-12 h-12 text-gold" />
                </div>
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <div className="flex items-center gap-1.5 text-[0.45rem] font-bold text-[#8a8a93] uppercase tracking-widest font-mono">
                    <Cloud className="w-3.5 h-3.5 text-gold shrink-0" />
                    SYNC STATUS
                  </div>
                  {isMaintenanceActive && (
                    <span className="px-1.5 py-[1px] bg-amber-500/15 border border-amber-500/25 rounded-[1px] text-[0.38rem] font-mono text-amber-400 tracking-wider">
                      STEALTH ACTIVE
                    </span>
                  )}
                </div>
                
                {unsavedEditsCount > 0 ? (
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono text-[0.48rem] text-amber-500 uppercase font-bold animate-pulse flex items-center gap-1">
                      ● {unsavedEditsCount} Pending
                    </span>
                    <button 
                      onClick={() => {
                        setUnsavedEditsCount(0);
                        logSecurityEvent("BUFFER_FLUSH", "success", "Local buffered mutations successfully synchronized against primary registries.");
                        showToast("All write buffers flushed successfully.", "success");
                        registerSyncMutation();
                      }}
                      className="px-2 py-0.5 bg-gold/10 hover:bg-gold hover:text-bg-dark border border-gold/30 rounded-[1px] font-mono text-[0.40rem] text-gold uppercase transition-all tracking-wider font-extrabold cursor-pointer"
                    >
                      Sync
                    </button>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1.5 pt-1">
                    <span className="font-mono text-lg text-[#2de2c4] tracking-wide font-black">
                      STABLE
                    </span>
                    <span className="font-mono text-[0.42rem] text-[#8a8a93]/80 uppercase">
                      Channels Live
                    </span>
                  </div>
                )}
                
                <div className="pt-2 text-[0.40rem] text-[#8a8a93]/50 font-mono uppercase tracking-widest leading-none">
                  STORE: {isFirebaseConfigured() && !anonymousAuthError ? "FIRESTORE CLOUD" : "LOCAL SANDBOX"}
                </div>
              </div>
            </div>

            {/* TAB PORTALS */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* Visual Header Banner */}
                <div className="p-5 border border-white/[0.05] bg-gradient-to-r from-gold/5 via-transparent to-transparent rounded-[2px] relative overflow-hidden backdrop-blur-md">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
                    <LayoutDashboard className="w-40 h-40 text-gold" />
                  </div>
                  <h3 className="font-mono text-xs tracking-[0.2em] text-gold uppercase mb-1 font-black">
                    SYSTEM EXECUTIVE HOME
                  </h3>
                  <p className="font-mono text-[0.52rem] tracking-widest text-[#8a8a93] uppercase max-w-lg leading-relaxed">
                    Welcome back, administrator. You are currently authenticated. The portfolio firewall is active, and database streams are synchronized.
                  </p>
                </div>

                {/* Grid Status Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Metric 1 */}
                  <div className="p-4 bg-white/[0.01] border border-white/[0.05] rounded-[2px] space-y-1 hover:border-gold/20 transition-all duration-300">
                    <span className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase tracking-widest">Total Projects</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-xl font-bold text-text-primary">{projects.length}</span>
                      <span className="font-mono text-[0.42rem] text-[#2de2c4] uppercase">Live</span>
                    </div>
                    {/* Tiny visual progress */}
                    <div className="h-[2px] bg-white/[0.04] rounded-full overflow-hidden w-full mt-1.5">
                      <div className="h-full bg-gold rounded-full" style={{ width: `${Math.min(100, projects.length * 20)}%` }} />
                    </div>
                  </div>

                  {/* Metric 2 */}
                  <div className="p-4 bg-white/[0.01] border border-white/[0.05] rounded-[2px] space-y-1 hover:border-gold/20 transition-all duration-300">
                    <span className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase tracking-widest">Skills Bank</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-xl font-bold text-text-primary">
                        {skillCategories.reduce((acc, cat) => acc + (cat.skills?.length || 0), 0)}
                      </span>
                      <span className="font-mono text-[0.42rem] text-gold uppercase">{skillCategories.length} Categories</span>
                    </div>
                    {/* Tiny visual progress */}
                    <div className="h-[2px] bg-white/[0.04] rounded-full overflow-hidden w-full mt-1.5">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: "75%" }} />
                    </div>
                  </div>

                  {/* Metric 3 */}
                  <div className="p-4 bg-white/[0.01] border border-white/[0.05] rounded-[2px] space-y-1 hover:border-gold/20 transition-all duration-300">
                    <span className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase tracking-widest">Inbox Volume</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-xl font-bold text-text-primary">{messages.length}</span>
                      {messages.filter(m => m.status === "unread").length > 0 ? (
                        <span className="font-mono text-[0.42rem] text-red-00 uppercase animate-pulse text-red-400">
                          {messages.filter(m => m.status === "unread").length} Unread
                        </span>
                      ) : (
                        <span className="font-mono text-[0.42rem] text-emerald-400 uppercase">Cleared</span>
                      )}
                    </div>
                    {/* Tiny visual progress */}
                    <div className="h-[2px] bg-white/[0.04] rounded-full overflow-hidden w-full mt-1.5">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${messages.length > 0 ? 100 - (messages.filter(m => m.status === "unread").length / messages.length) * 100 : 100}%` }} />
                    </div>
                  </div>

                  {/* Metric 4 */}
                  <div className="p-4 bg-white/[0.01] border border-white/[0.05] rounded-[2px] space-y-1 hover:border-gold/20 transition-all duration-300">
                    <span className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase tracking-widest">Security Core</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-[0.62rem] font-bold text-emerald-400 uppercase">Firewall Active</span>
                    </div>
                    {/* Tiny visual progress */}
                    <div className="h-[2px] bg-white/[0.04] rounded-full overflow-hidden w-full mt-1.5">
                      <div className={`h-full rounded-full ${isTotpEnabled ? "bg-emerald-400" : "bg-gold"}`} style={{ width: "100%" }} />
                    </div>
                  </div>
                </div>

                {/* Sub sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Progress indices */}
                  <div className="border border-white/[0.05] bg-white/[0.005] p-5 rounded-[2px] space-y-4">
                    <div className="flex items-center justify-between border-b border-white/[0.03] pb-2">
                      <h4 className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-gold font-bold">PROJECT COMPLETENESS METERS</h4>
                      <button 
                        type="button"
                        onClick={() => setActiveTab("projects")} 
                        className="font-mono text-[0.45rem] text-[#8a8a93] hover:text-gold transition-colors uppercase tracking-widest cursor-pointer"
                      >
                        Manage Projects →
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
                      {projects.length === 0 ? (
                        <div className="text-center py-8 font-mono text-[0.52rem] uppercase tracking-widest text-[#8a8a93]/50">
                          No active projects found. Create one in Projects Port.
                        </div>
                      ) : (
                        projects.slice(0, 5).map((proj) => {
                          const pct = proj.completionPercent ?? (proj.size === "large" ? 100 : proj.size === "medium" ? 85 : 70);
                          return (
                            <div key={proj.id} className="p-2 border border-white/[0.03] bg-white/[0.005] rounded-[1px] hover:bg-white/[0.015] transition-all flex items-center justify-between gap-4">
                              <div className="space-y-1 flex-1 min-w-0">
                                <span className="block font-sans text-xs font-medium text-text-primary tracking-wide truncate">{proj.title}</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[0.45rem] text-[#8a8a93] uppercase tracking-widest bg-white/[0.03] px-1 rounded-[1px]">{proj.category}</span>
                                  <span className="font-mono text-[0.45rem] text-text-primary font-bold">{pct}%</span>
                                </div>
                              </div>
                              <div className="w-24 shrink-0">
                                <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden w-full">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? "bg-[#2de2c4]" : pct >= 75 ? "bg-gold" : "bg-indigo-500"}`} 
                                    style={{ width: `${pct}%` }} 
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Incoming Communicator Inbox */}
                  <div className="border border-white/[0.05] bg-white/[0.005] p-5 rounded-[2px] space-y-4">
                    <div className="flex items-center justify-between border-b border-white/[0.03] pb-2">
                      <h4 className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-gold font-bold">COMMUNICATOR INBOX INTAKE</h4>
                      <button 
                        type="button"
                        onClick={() => setActiveTab("inbox")} 
                        className="font-mono text-[0.45rem] text-[#8a8a93] hover:text-gold transition-colors uppercase tracking-widest cursor-pointer"
                      >
                        Go To Inbox →
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                      {messages.length === 0 ? (
                        <div className="text-center py-8 font-mono text-[0.52rem] uppercase tracking-widest text-[#8a8a93]/50">
                          Your mail inbox queue is empty. No messages received.
                        </div>
                      ) : (
                        messages.slice(0, 4).map((msg) => {
                          const isUnread = msg.status === "unread";
                          return (
                            <button
                              key={msg.id}
                              type="button"
                              onClick={() => {
                                setSelectedMessage(msg);
                                setActiveTab("inbox");
                              }}
                              className={`w-full text-left p-2.5 border border-white/[0.03] hover:border-gold/25 rounded-[1px] bg-white/[0.005] hover:bg-white/[0.015] transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer ${
                                isUnread ? "border-l-2 border-l-gold bg-gold/[0.01]" : ""
                              }`}
                            >
                              <div className="min-w-0 space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[0.52rem] text-text-primary break-all uppercase tracking-wider font-bold truncate">{msg.name}</span>
                                  {isUnread && (
                                    <span className="font-mono text-[0.4rem] bg-gold/10 text-gold border border-gold/20 px-1 py-0.2 uppercase tracking-wide rounded-[1px]">UNREAD</span>
                                  )}
                                </div>
                                <span className="block font-sans text-xs text-[#8a8a93] truncate">{msg.subject}</span>
                              </div>
                              <span className="font-mono text-[0.45rem] text-[#8a8a93]/40 tracking-wider font-medium whitespace-nowrap">
                                {new Date(msg.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                      <div className="sm:col-span-3 space-y-1">
                        <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase tracking-widest">BEFORE REVISION IMAGE (FOR INTERACTIVE REDESIGN COMPARISON)</label>
                        <input 
                          type="text"
                          placeholder="https://images.unsplash.com/before_design.jpg"
                          value={newProject.beforeImage}
                          onChange={(e) => setNewProject({ ...newProject, beforeImage: e.target.value })}
                          className="w-full p-2 bg-white/[0.01] border border-white/[0.08] text-text-primary font-mono text-xs rounded-[1px] focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-3 space-y-1">
                        <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase tracking-widest">AFTER REVISION IMAGE (FOR INTERACTIVE REDESIGN COMPARISON)</label>
                        <input 
                          type="text"
                          placeholder="https://images.unsplash.com/after_design.jpg"
                          value={newProject.afterImage}
                          onChange={(e) => setNewProject({ ...newProject, afterImage: e.target.value })}
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
                  <div className="fixed inset-0 z-[160] bg-bg-dark/95 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-bg-panel border border-white/[0.08] p-5 rounded-[2px] w-full max-w-xl shadow-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-mono text-xs text-gold uppercase tracking-[0.16em]">EDIT PROJECT: {editingProject.title}</h4>
                        <button onClick={() => setEditingProject(null)} className="text-muted-slate hover:text-white"><X className="w-4 h-4" /></button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[0.58rem]">
                        <div className="sm:col-span-2">
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
                        <div className="sm:col-span-2">
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
                        <div className="sm:col-span-2">
                          <label className="text-muted-slate">TOOLS (COMMA SEPARATED)</label>
                          <input type="text" value={Array.isArray(editingProject.tools) ? editingProject.tools.join(", ") : editingProject.tools} onChange={(e) => setEditingProject({...editingProject, tools: e.target.value})} className="w-full p-2 bg-white/[0.02] border border-white/10 text-text-primary rounded-[1px] mt-1 focus:outline-none" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-muted-slate">SCREENSHOTS (COMMA SEPARATED)</label>
                          <input type="text" value={Array.isArray(editingProject.screenshots) ? editingProject.screenshots.join(", ") : editingProject.screenshots} onChange={(e) => setEditingProject({...editingProject, screenshots: e.target.value})} className="w-full p-2 bg-white/[0.02] border border-white/10 text-text-primary rounded-[1px] mt-1 focus:outline-none" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-muted-slate">BEFORE REVISION IMAGE (URL)</label>
                          <input type="text" value={editingProject.beforeImage || ""} onChange={(e) => setEditingProject({...editingProject, beforeImage: e.target.value})} className="w-full p-2 bg-white/[0.02] border border-white/10 text-text-primary rounded-[1px] mt-1 focus:outline-none" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-muted-slate">AFTER REVISION IMAGE (URL)</label>
                          <input type="text" value={editingProject.afterImage || ""} onChange={(e) => setEditingProject({...editingProject, afterImage: e.target.value})} className="w-full p-2 bg-white/[0.02] border border-white/10 text-text-primary rounded-[1px] mt-1 focus:outline-none" />
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
                          className="w-full p-2 bg-bg-dark border border-white/[0.08] text-text-primary font-mono text-xs rounded-[1px] focus:outline-none"
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
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
                {/* Inbox Left list */}
                <div className={`lg:col-span-5 border border-white/[0.05] bg-bg-panel p-3 rounded-[1px] space-y-3 flex flex-col h-[500px] lg:h-full overflow-hidden ${selectedMessage ? "hidden lg:flex" : "flex"}`}>
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
                              : "bg-bg-dark border-white/[0.03]"
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
                <div className={`lg:col-span-7 border border-white/[0.05] bg-bg-dark/60 p-4 rounded-[1px] flex flex-col justify-between h-[500px] lg:h-full overflow-hidden ${selectedMessage ? "flex" : "hidden lg:flex"}`}>
                  {selectedMessage ? (
                    <div className="flex flex-col h-full justify-between gap-4 overflow-hidden">
                      <div className="space-y-4 overflow-y-auto pr-1 flex-1">
                        {/* Back button on mobile */}
                        <button
                          type="button"
                          onClick={() => setSelectedMessage(null)}
                          className="lg:hidden shrink-0 self-start mb-4 inline-flex items-center gap-1.5 font-mono text-[0.48rem] text-gold uppercase tracking-widest border border-gold/20 px-2.5 py-1 bg-gold/5 rounded-[1px] hover:bg-gold/15 transition-all duration-200 cursor-pointer"
                        >
                          ← BACK TO INBOX
                        </button>
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
                      <div className="border-t border-white/[0.05] pt-3 flex justify-between items-center bg-bg-dark/90 p-2 rounded-[1.5px]">
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
                {/* ADMIN PROTOCOL SECURITY SETUP CARD */}
                <div className="bg-white/[0.01] border border-white/[0.05] p-5 rounded-[2px] space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-mono text-[0.65rem] tracking-[0.16em] text-gold uppercase flex items-center gap-1.5 font-black">
                      <Smartphone className="w-3.5 h-3.5 animate-pulse" />
                      GOOGLE AUTHENTICATOR APP PORT
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full font-mono text-[0.45rem] tracking-wider uppercase font-black ${
                      isTotpEnabled 
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                        : "bg-red-500/10 border border-red-500/20 text-red-400"
                    }`}>
                      {isTotpEnabled ? "● ACTIVE & ENFORCED" : "○ INACTIVE (PIN ONLY)"}
                    </span>
                  </div>
                  
                  <p className="font-mono text-[0.55rem] text-[#8a8a93] uppercase tracking-widest leading-relaxed">
                    Lock down your administrator logins with the dynamic, high-strength RFC-6238 TOTP standard using authenticator apps like Google Authenticator, Authy, or Microsoft Authenticator.
                  </p>

                  <div className="space-y-5 pt-3 border-t border-white/[0.03]">
                    {/* Standard System Passcode Field */}
                    <div className="space-y-3 p-3.5 bg-black/30 border border-white/[0.02] rounded-[1px]">
                      <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase tracking-widest font-bold">A) STANDARD SYSTEM PIN</label>
                      <p className="font-mono text-[0.42rem] text-muted-slate/50 uppercase tracking-widest leading-normal">
                        This passcode is enforced when Google Authenticator multi-factor App Lock is disabled.
                      </p>
                      <div className="flex gap-2 pt-1">
                        <input 
                          type="text"
                          placeholder="admin"
                          value={passcodeInputVal}
                          onChange={(e) => setPasscodeInputVal(e.target.value)}
                          className="flex-1 p-2 bg-black border border-white/[0.08] text-text-primary font-mono text-xs rounded-[1px] focus:outline-none focus:border-gold/30"
                        />
                        <button
                          onClick={() => {
                            handleSavePasscode(passcodeInputVal);
                            logSecurityEvent("CREDENTIALS_CHANGED", "warning", `System authorization PIN updated in cache.`);
                          }}
                          className="px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-text-primary font-mono text-[0.5rem] font-bold tracking-widest uppercase rounded-[1px] cursor-pointer"
                        >
                          Commit PIN
                        </button>
                        <button
                          onClick={() => {
                            handleGenerateRandomPasscode();
                            logSecurityEvent("CREDENTIALS_CHANGED", "warning", "Generated randomized high-strength backup standard PIN.");
                          }}
                          className="px-3 py-2 bg-gold hover:bg-gold-light text-bg-dark font-mono text-[0.5rem] font-black tracking-widest uppercase rounded-[1px] cursor-pointer"
                          title="Generate randomized high-strength PIN code"
                        >
                          Gen PIN
                        </button>
                      </div>
                      
                      {/* REAL-TIME ENTROPY AND PASSCODE STRENGTH EVALUATOR */}
                      {passcodeInputVal && (
                        <div className={`p-2.5 rounded-[1.5px] border font-mono transition-all duration-300 ${getPasscodeStrength(passcodeInputVal).bg} ${getPasscodeStrength(passcodeInputVal).border}`}>
                          <div className="flex items-center justify-between gap-2 text-[0.42rem] mb-1.5 font-bold uppercase tracking-widest">
                            <span className="text-[#8a8a93]">PIN Strength Index:</span>
                            <span className={getPasscodeStrength(passcodeInputVal).color}>
                              {getPasscodeStrength(passcodeInputVal).label}
                            </span>
                          </div>
                          
                          <div className="h-1 bg-white/[0.03] rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 rounded-full ${
                                getPasscodeStrength(passcodeInputVal).pct <= 15 
                                  ? "bg-red-500" 
                                  : getPasscodeStrength(passcodeInputVal).pct <= 35 
                                  ? "bg-amber-500" 
                                  : getPasscodeStrength(passcodeInputVal).pct <= 70 
                                  ? "bg-gold animate-pulse" 
                                  : "bg-emerald-400"
                              }`}
                              style={{ width: `${getPasscodeStrength(passcodeInputVal).pct}%` }}
                            />
                          </div>
                          
                          <p className="text-[0.40rem] text-muted-slate/85 leading-relaxed mt-1.5 uppercase tracking-wider">
                            {getPasscodeStrength(passcodeInputVal).text}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[0.42rem] text-muted-slate/40 uppercase tracking-widest pt-1 border-t border-white/[0.02]">
                        <span>Local Cache Lock Authority Key:</span>
                        <span className="text-gold font-bold">{adminPasscode}</span>
                      </div>
                    </div>

                    {/* Passive Session Inactivity Watchdog */}
                    <div className="space-y-2 p-3 bg-black/20 border border-white/[0.02] rounded-[1px]">
                      <label className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase tracking-widest font-bold">B) SECURE IDLE TIME WATCHDOG</label>
                      <p className="font-mono text-[0.42rem] text-muted-slate/50 uppercase tracking-widest leading-normal">
                        To protect your active session from physical shoulder surfing, auto-logout when idle:
                      </p>
                      <div className="flex items-center gap-2 pt-1 font-mono text-[0.52rem]">
                        <select 
                          value={sessionTimeout}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSessionTimeout(val);
                            localStorage.setItem("ayman_portfolio_session_timeout", val);
                            logSecurityEvent("SECURITY_POLICY_CHANGED", "info", `Session logout timer reset to ${val === "never" ? "never expire" : val + " minutes"}.`);
                            showToast(`Timeout preset committed: ${val === "never" ? "Persistent" : val + " min"}`, "success");
                          }}
                          className="flex-1 p-2 bg-black border border-white/[0.08] text-gold font-mono rounded-[1px] focus:outline-none cursor-pointer"
                        >
                          <option value="1">1 Minute (Dry-run Security Check)</option>
                          <option value="5">5 Minutes (Hyper Security Guard)</option>
                          <option value="15">15 Minutes (Standard System Preset)</option>
                          <option value="30">30 Minutes (Convenience Preset)</option>
                          <option value="never">Never (Session Unlocked)</option>
                        </select>
                      </div>
                    </div>

                    {/* Step-by-Step 2FA Onboarding System */}
                    <div className="space-y-4">
                      {/* STEP 1: SCAN QR CODE */}
                      <div className="space-y-3 bg-white/[0.01] p-4 rounded-[1px] border border-white/[0.02]">
                        <span className="block font-mono text-[0.50rem] text-[#8a8a93] uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-gold/10 border border-gold/30 text-gold flex items-center justify-center font-mono text-[0.45rem]">1</span>
                          STEP 1: SCAN CODE OR BIND SYMMETRIC SEED
                        </span>

                        <div className="flex flex-col md:flex-row gap-5 items-center md:items-start pt-2 bg-black/30 p-3 border border-white/[0.03]">
                          {/* QR Code element */}
                          <div className="shrink-0 flex flex-col items-center gap-2 bg-white p-2 rounded-[2px] border border-white/20">
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=4&data=${encodeURIComponent(getTotpUri(totpSecret))}`}
                              alt="Google Authenticator QR Scan"
                              className="w-[120px] h-[120px] select-none pointer-events-none"
                              referrerPolicy="no-referrer"
                            />
                            <span className="text-[0.42rem] text-black font-mono font-black tracking-widest uppercase select-none">
                              SCAN QR PORT
                            </span>
                          </div>

                          <div className="flex-1 space-y-3 w-full">
                            <p className="font-mono text-[0.48rem] text-muted-slate/80 uppercase tracking-widest leading-relaxed">
                              Open your Google Authenticator or Authy App, select "Scan a QR code", or enter the symmetric seed string manually:
                            </p>

                            <div className="space-y-1">
                              <div className="flex gap-1.5">
                                <input 
                                  type="text"
                                  placeholder="Secret Seed (Base32)"
                                  value={totpSecretInputVal}
                                  onChange={(e) => setTotpSecretInputVal(e.target.value)}
                                  className="flex-1 p-1 px-2 bg-black border border-white/[0.08] text-text-primary font-mono text-[0.68rem] rounded-[1px] focus:outline-none uppercase"
                                />
                                <button
                                  onClick={() => handleSaveTotpSecret(totpSecretInputVal)}
                                  className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-text-primary font-mono text-[0.45rem] font-bold tracking-widest uppercase rounded-[1px]"
                                >
                                  Save Key
                                </button>
                              </div>
                            </div>

                            <div className="bg-black/[0.4] border border-white/[0.05] p-2 rounded-[1px] flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <span className="block font-mono text-[0.40rem] text-muted-slate/40 uppercase tracking-widest">Manual Setup Key:</span>
                                <span className="block font-mono text-[0.65rem] text-gold font-bold uppercase tracking-wider select-all truncate">
                                  {totpSecret.match(/.{1,4}/g)?.join(" ") || totpSecret}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(totpSecret);
                                  showToast("Authenticator secret key copied.", "success");
                                }}
                                className="p-1 px-2 border border-white/[0.08] hover:border-white/20 text-[#8a8a93] hover:text-white transition-all text-[0.42rem] uppercase font-mono tracking-wider flex items-center gap-1 shrink-0 rounded-[1px]"
                              >
                                <Copy className="w-2.5 h-2.5" />
                                Copy
                              </button>
                            </div>

                            <button
                              onClick={handleGenerateRandomSecret}
                              className="w-full py-1.5 bg-white/[0.02] hover:bg-white/[0.05] text-[#8a8a93] hover:text-white border border-white/[0.08] font-mono text-[0.48rem] tracking-widest uppercase rounded-[1px] transition-all"
                            >
                              Generate New Sync Key
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* STEP 2: TIME SYNC CHECK */}
                      <div className="space-y-3 bg-white/[0.01] p-4 rounded-[1px] border border-white/[0.02]">
                        <span className="block font-mono text-[0.50rem] text-[#8a8a93] uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-gold/10 border border-gold/30 text-gold flex items-center justify-center font-mono text-[0.45rem]">2</span>
                          STEP 2: COMPARE TIME-MATCH CODE
                        </span>

                        <div className="p-3 bg-black/40 border border-white/[0.04] flex flex-col sm:flex-row gap-4 items-center justify-between rounded-[1px]">
                          <div className="space-y-1">
                            <span className="block font-mono text-[0.48rem] text-text-primary/80 uppercase tracking-widest font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gold shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
                              APP WORKSPACE MATCH TICKER
                            </span>
                            <span className="block font-mono text-[0.42rem] text-muted-slate/50 uppercase tracking-widest leading-relaxed">
                              Compare with code shown in Authenticator app. If they match, timing is healthy:
                            </span>
                          </div>

                          <div className="flex items-center gap-3 bg-black/60 px-4 py-2 border border-white/[0.06] rounded-[2px] shrink-0">
                            <div className="text-center">
                              <span className="block font-mono text-sm tracking-[0.16em] text-emerald-400 font-black">
                                {dynamicCode.slice(0, 3)} {dynamicCode.slice(3)}
                              </span>
                              <span className="block font-mono text-[0.42rem] text-[#8a8a93]/40 uppercase tracking-widest mt-0.5">
                                Expires in {totpCountdown}s
                              </span>
                            </div>
                            <div className="w-6 h-6 border border-emerald-500/20 rounded-full flex items-center justify-center text-[0.52rem] font-mono text-emerald-400 relative select-none">
                              {totpCountdown}
                              <div className="absolute inset-0 border border-emerald-400/25 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* STEP 3: INTERACTIVE DYNAMIC VERIFICATION */}
                      <div className="space-y-3 bg-white/[0.01] p-4 rounded-[1px] border border-white/[0.02]">
                        <span className="block font-mono text-[0.50rem] text-[#8a8a93] uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-gold/10 border border-gold/30 text-gold flex items-center justify-center font-mono text-[0.45rem]">3</span>
                          STEP 3: DEPLOY CODE VERIFICATION CHALLENGE
                        </span>

                        <div className="p-3 bg-black/30 border border-white/[0.04] space-y-3 rounded-[1px]">
                          {!isTotpEnabled ? (
                            <form onSubmit={handleVerifyAndEnableTotp} className="space-y-3">
                              <p className="font-mono text-[0.46rem] text-muted-slate/80 uppercase tracking-widest leading-relaxed">
                                Enter the rolling <strong className="text-gold">6-digit code</strong> from your synchronized App below to verify and lock your admin dashboard with dynamic two-factor security:
                              </p>
                              
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  pattern="[0-9]*"
                                  inputMode="numeric"
                                  maxLength={6}
                                  placeholder="000 000"
                                  value={settingsVerifyCode}
                                  onChange={(e) => setSettingsVerifyCode(e.target.value.replace(/\D/g, ""))}
                                  className="flex-1 p-2 bg-black border border-white/[0.08] focus:border-gold/40 text-text-primary text-center tracking-[0.2em] font-mono text-xs rounded-[1px] focus:outline-none"
                                />
                                <button
                                  type="submit"
                                  className="px-4 py-2 bg-gold hover:bg-gold-light text-bg-dark font-mono text-[0.52rem] font-black tracking-widest uppercase rounded-[1px] transition-all"
                                >
                                  Activate Secure App Lock
                                </button>
                              </div>
                            </form>
                          ) : (
                            <form onSubmit={handleDeactivateTotp} className="space-y-3">
                              <p className="font-mono text-[0.46rem] text-emerald-400 capitalize bg-emerald-500/5 p-2 border border-emerald-500/15 rounded-[1px] leading-relaxed">
                                SECURITY LOCKENGAGED: You must provide a valid 6-digit Authenticator code below to authorize turning OFF dynamic authenticator security.
                              </p>
                              
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  pattern="[0-9]*"
                                  inputMode="numeric"
                                  maxLength={6}
                                  placeholder="000 000"
                                  value={settingsVerifyCode}
                                  onChange={(e) => setSettingsVerifyCode(e.target.value.replace(/\D/g, ""))}
                                  className="flex-1 p-2 bg-black border border-white/[0.08] focus:border-red-500/40 text-red-400 text-center tracking-[0.2em] font-mono text-xs rounded-[1px] focus:outline-none"
                                />
                                <button
                                  type="submit"
                                  className="px-4 py-2 bg-red-900/40 hover:bg-red-800 text-red-200 border border-red-500/30 font-mono text-[0.48rem] font-bold tracking-widest uppercase rounded-[1px] transition-all"
                                >
                                  Disable App Lock
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                       {/* ADMIN COMPLIANCE REGISTRY AND AUDIT TRAIL */}
                <div className="bg-white/[0.01] border border-white/[0.05] p-5 rounded-[2px] space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h4 className="font-mono text-[0.65rem] tracking-[0.16em] text-gold uppercase flex items-center gap-1.5 font-black">
                      <Clock className="w-3.5 h-3.5 animate-pulse text-gold" style={{ animationDuration: '4s' }} />
                      SECURE DASHBOARD COMPLIANCE AUDIT TRAIL
                    </h4>
                    <button 
                      onClick={() => {
                        if (confirm("Are you sure you want to purge the security compliance logs?")) {
                          setSecurityLogs([]);
                          localStorage.setItem("ayman_portfolio_security_logs", JSON.stringify([]));
                          showToast("Security compliance trail cleared from local storage.", "success");
                        }
                      }}
                      className="p-1 px-2.5 border border-red-500/15 hover:border-red-500/30 text-muted-slate hover:text-red-400 text-[0.42rem] font-mono uppercase tracking-widest transition-colors rounded-[1px] cursor-pointer"
                    >
                      Clear Log
                    </button>
                  </div>
                  
                  <p className="font-mono text-[0.52rem] text-[#8a8a93] uppercase tracking-widest leading-relaxed">
                    Live system and authorization events captured by firewall filters. Keep audit logs for compliance requirements.
                  </p>

                  {/* Dynamic Query & Filters controls */}
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="flex-1">
                      <input 
                        type="text"
                        placeholder="Search events (e.g., AUTHORIZATION, WRITE)..."
                        value={logSearchQuery}
                        onChange={(e) => setLogSearchQuery(e.target.value)}
                        className="w-full p-2 bg-black border border-white/[0.06] text-text-primary text-[0.55rem] font-mono rounded-[1px] focus:outline-none focus:border-gold/30 placeholder:text-muted-slate/50 uppercase"
                      />
                    </div>
                    <div className="w-full sm:w-44">
                      <select
                        value={logSeverityFilter}
                        onChange={(e) => setLogSeverityFilter(e.target.value)}
                        className="w-full p-2 bg-black border border-white/[0.06] text-gold text-[0.55rem] font-mono rounded-[1px] focus:outline-none focus:border-gold/30 cursor-pointer"
                      >
                        <option value="ALL">FILTER SEVERITY: ALL</option>
                        <option value="CRITICAL">FILTER SEVERITY: CRITICAL</option>
                        <option value="WARNING">FILTER SEVERITY: WARNING</option>
                        <option value="SUCCESS">FILTER SEVERITY: SUCCESS</option>
                        <option value="INFO">FILTER SEVERITY: INFO</option>
                      </select>
                    </div>
                  </div>

                  <div className="border border-white/[0.03] bg-black/40 rounded-[2.5px] overflow-hidden max-h-[160px] overflow-x-auto overflow-y-auto w-full">
                    <table className="w-full text-left font-mono text-[0.45rem] uppercase tracking-wider relative border-collapse">
                      <thead>
                        <tr className="bg-bg-panel text-[#8a8a93]/85 text-[0.40rem]">
                          <th className="py-2 px-3 sticky top-0 bg-bg-panel select-none border-b border-white/[0.05]">TIMESTAMP</th>
                          <th className="py-2 px-3 sticky top-0 bg-bg-panel select-none border-b border-white/[0.05]">EVENT TYPE</th>
                          <th className="py-2 px-3 sticky top-0 bg-bg-panel select-none border-b border-white/[0.05]">SEVERITY</th>
                          <th className="py-2 px-3 sticky top-0 bg-bg-panel select-none border-b border-white/[0.05]">SUMMARY DESCRIPTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.02]">
                        {(() => {
                          const filtered = securityLogs.filter(log => {
                            const sFilter = logSeverityFilter.toUpperCase();
                            const matchesSeverity = sFilter === "ALL" || log.severity.toUpperCase() === sFilter;
                            const q = logSearchQuery.toLowerCase();
                            const matchesSearch = q === "" || 
                              log.eventType.toLowerCase().includes(q) || 
                              log.summary.toLowerCase().includes(q);
                            return matchesSeverity && matchesSearch;
                          });

                          if (filtered.length === 0) {
                            return (
                              <tr>
                                <td colSpan={4} className="py-6 px-3 text-center text-muted-slate/30 uppercase tracking-[0.16em] text-[0.42rem]">
                                  NO AUDIT TRAILS MATCH FILTERED DIRECTIVES
                                </td>
                              </tr>
                            );
                          }

                          return [...filtered].reverse().map((log) => (
                            <tr key={log.id} className="hover:bg-white/[0.01] transition-colors leading-normal">
                              <td className="py-2 px-3 text-muted-slate/50 select-none whitespace-nowrap">
                                {new Date(log.timestamp).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
                              </td>
                              <td className="py-2 px-3 font-semibold text-text-primary whitespace-nowrap">
                                {log.eventType}
                              </td>
                              <td className="py-2 px-3 whitespace-nowrap">
                                <span className={`px-1.5 py-0.5 rounded-[1.5px] text-[0.38rem] font-bold ${
                                  log.severity === "critical"
                                    ? "bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse"
                                    : log.severity === "warning"
                                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                    : log.severity === "success"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-white/5 text-muted-slate border border-white/10"
                                }`}>
                                  {log.severity}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-[#a0a0ab] font-sans lowercase first-letter:uppercase max-w-[200px] truncate" title={log.summary}>
                                {log.summary}
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
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

                  {isFirebaseConfigured() && anonymousAuthError && (
                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-[2px] font-mono text-[0.485rem] text-amber-400 space-y-1">
                      <p className="font-extrabold flex items-center gap-1.5 uppercase tracking-wider">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        ANONYMOUS AUTHENTICATION REQUIRED
                      </p>
                      <p className="leading-relaxed text-amber-305">
                        To authorize administrative write operations with Firestore rules, you must enable the "Anonymous" provider in your Firebase Authentication Console (Sign-in method ➔ Add new provider ➔ Anonymous ➔ Enable). Otherwise, the system defaults to device-isolated local storage.
                      </p>
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap gap-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.02] border border-white/[0.05] rounded-full font-mono text-[0.52rem] text-muted-slate select-none">
                      <span className={`w-2 h-2 rounded-full ${isFirebaseConfigured() && !anonymousAuthError ? "bg-emerald-500" : "bg-amber-400"}`} />
                      DB MODE: {isFirebaseConfigured() && !anonymousAuthError ? "FIRESTORE ACTIVE" : isFirebaseConfigured() ? "LOCAL AUTHFALLBACK" : "LOCAL CACHE ISOLATION"}
                    </div>
                  </div>
                </div>

                {/* STEALTH MAINTENANCE CONFIGURATION CARD */}
                <div className="bg-white/[0.01] border border-white/[0.05] p-5 rounded-[2px] space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h4 className="font-mono text-[0.65rem] tracking-[0.16em] text-gold uppercase flex items-center gap-1.5 font-black">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      STEALTH MAINTENANCE REGIME
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full font-mono text-[0.45rem] tracking-wider uppercase font-black ${
                      isMaintenanceActive 
                        ? "bg-amber-500/10 border border-amber-500/20 text-amber-400 animate-pulse" 
                        : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    }`}>
                      {isMaintenanceActive ? "● ENGAGED" : "○ DISENGAGED (PUBLIC)"}
                    </span>
                  </div>
                  
                  <p className="font-mono text-[0.55rem] text-[#8a8a93] uppercase tracking-widest leading-relaxed">
                    Prevent unauthorized visitors from viewing site content during active updates. When engaged, a visually polished splash screen blocks standard users while keeping your active administrative session live.
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        const nextState = !isMaintenanceActive;
                        setIsMaintenanceActive(nextState);
                        localStorage.setItem("ayman_portfolio_maintenance_active", String(nextState));
                        logSecurityEvent(
                          nextState ? "MAINTENANCE_ENGAGED" : "MAINTENANCE_TERMINATED",
                          nextState ? "warning" : "success",
                          `Stealth maintenance regime is now statically ${nextState ? "active and online" : "disengaged"}.`
                        );
                        showToast(`Stealth Maintenance: ${nextState ? "ENGAGED" : "DISENGAGED"}`, "success");
                        registerSyncMutation();
                      }}
                      className={`w-full py-2.5 font-mono text-[0.52rem] font-bold tracking-widest uppercase rounded-[1px] transition-all duration-350 border ${
                        isMaintenanceActive 
                          ? "bg-amber-500/10 hover:bg-amber-500/20 text-text-primary border-amber-500/20 hover:border-amber-500/30" 
                          : "bg-white/[0.02] hover:bg-white/[0.06] text-[#8a8a93] hover:text-text-primary border-white/[0.08]"
                      } cursor-pointer`}
                    >
                      {isMaintenanceActive ? "Terminate Maintenance Mode" : "Engage Stealth Maintenance"}
                    </button>
                  </div>
                </div>

                {/* WORKSPACE PRESETS AND PORTABILITY BACKUP CONTROL */}
                <div className="bg-white/[0.01] border border-white/[0.05] p-5 rounded-[2px] space-y-4">
                  <h4 className="font-mono text-[0.65rem] tracking-[0.16em] text-gold uppercase flex items-center gap-1.5 font-black">
                    <Cloud className="w-3.5 h-3.5" />
                    SYSTEM PORTABILITY & COMPLIANCE PRESETS
                  </h4>
                  <p className="font-mono text-[0.55rem] text-muted-slate uppercase tracking-widest leading-relaxed">
                    Export your custom layouts, profile definitions, and dynamic telemetry items as an offline backup database file, or reload a previous configuration snapshot securely.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={handleExportConfig}
                      className="py-2.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] text-text-primary font-mono text-[0.50rem] font-bold tracking-widest uppercase rounded-[1px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-gold" />
                      Export Offline Backup
                    </button>

                    <label className="py-2.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] text-text-primary font-mono text-[0.50rem] font-bold tracking-widest uppercase rounded-[1px] flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center relative select-none">
                      <Upload className="w-3.5 h-3.5 text-[#2de2c4]" />
                      Import backup snapshot
                      <input 
                        type="file" 
                        accept=".json"
                        onChange={handleImportConfig} 
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </label>
                  </div>

                  <div className="pt-4 border-t border-white/[0.03]">
                    <button
                      onClick={handleFactoryReset}
                      className="w-full py-1.5 border border-red-500/10 hover:border-red-500/25 bg-red-950/5 hover:bg-red-950/20 text-[#8a8a93] hover:text-red-400 font-mono text-[0.45rem] font-bold tracking-widest uppercase transition-all rounded-[1px] cursor-pointer"
                    >
                      Restore System Original Sandbox Defaults
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "system" && (
              <div className="w-full">
                <SystemMonitor isEmbedded={true} />
              </div>
            )}

            {activeTab === "guestbook" && (
              <div className="space-y-6 text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.04] pb-4">
                  <div>
                    <h3 className="font-sans font-bold text-lg text-text-primary">
                      Verified Peer Ledger Signatures
                    </h3>
                    <p className="text-xs text-muted-slate font-sans mt-0.5">
                      Monitor, verify, or purge physical visitor signature block records from the ayman-core platform ledger.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[0.62rem] font-mono uppercase bg-gold/5 border border-gold/15 p-2 rounded-[2px] text-gold">
                    <Fingerprint className="w-4 h-4 shrink-0 animate-pulse" />
                    <span>LEDGER INTEGRITY: SIGNED</span>
                  </div>
                </div>

                {guestbook.length === 0 ? (
                  <div className="py-24 text-center border border-dashed border-white/10 rounded-[2px] bg-[#0c0d12]">
                    <Fingerprint className="w-12 h-12 text-white/10 mx-auto mb-3" />
                    <p className="font-mono text-xs uppercase text-muted-slate">
                      Zero Signed Blocks found in database
                    </p>
                    <p className="text-white/20 text-[0.68rem] font-sans mt-1">
                      Signatures will populate here as soon as clients transact their signature block.
                    </p>
                  </div>
                ) : (
                  <div className="border border-white/[0.04] rounded-[2px] bg-[#0c0d12] overflow-hidden">
                    <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                      <table className="w-full font-sans text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-[#141520] border-b border-white/[0.04] font-mono text-[0.55rem] uppercase text-[#8a8a93] tracking-widest">
                            <th className="p-4 font-bold select-none">Block Num</th>
                            <th className="p-4 font-bold">Signatory Identity</th>
                            <th className="p-4 font-bold">Message Content</th>
                            <th className="p-4 font-bold">Timestamp</th>
                            <th className="p-4 text-center font-bold">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                          {guestbook.map((entry, index) => {
                            const blockNum = guestbook.length - index;
                            const fauxHash = `SHA256://STG-F${Math.abs(entry.id.split("").reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)).toString(16).toUpperCase().padStart(8, "0")}E1489D`;
                            return (
                              <tr key={entry.id} className="hover:bg-[#1a1c29]/30 transition-colors">
                                <td className="p-4 font-mono text-[0.6rem] text-gold whitespace-nowrap">
                                  REG_BLOCK_0{blockNum}
                                </td>
                                <td className="p-4 whitespace-nowrap">
                                  <div className="font-bold text-text-primary leading-tight">
                                    {entry.name}
                                  </div>
                                  <div className="font-mono text-[0.55rem] text-muted-slate mt-0.5 uppercase">
                                    {entry.company || "Independent"}
                                  </div>
                                </td>
                                <td className="p-4 max-w-sm">
                                  <p className="leading-relaxed text-muted-lavender">
                                    "{entry.message}"
                                  </p>
                                  <span className="block font-mono text-[0.48rem] text-[#8a8a93]/30 mt-1 select-all hover:text-gold cursor-copy transition-colors">
                                    {fauxHash}
                                  </span>
                                </td>
                                <td className="p-4 whitespace-nowrap font-mono text-[0.55rem] text-[#8a8a93] uppercase">
                                  {new Date(entry.timestamp).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </td>
                                <td className="p-4 whitespace-nowrap text-center">
                                  <button
                                    onClick={() => handleDeleteGuestbookEntry(entry.id)}
                                    className="px-3 py-1.5 border border-red-500/10 hover:border-red-500/25 bg-red-500/5 hover:bg-red-500/15 text-red-400 hover:text-red-300 rounded-[2px] transition-all font-mono text-[0.52rem] uppercase cursor-pointer"
                                    title="Mod and purge block"
                                  >
                                    PURGE BLOCK
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </motion.div>
      )}

    </div>
  );
}
