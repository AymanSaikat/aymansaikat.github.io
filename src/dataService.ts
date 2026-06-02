import { 
  db, 
  handleFirestoreError, 
  OperationType, 
  isFirebaseConfigured,
  auth
} from "./firebase";
import { 
  collection, 
  getDocs, 
  getDoc,
  setDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from "firebase/firestore";
import { 
  projectsData as defaultProjects,
  experienceData as defaultExperience,
  educationData as defaultEducation,
  skillCategories as defaultSkillCategories,
  socialLinks as defaultSocialLinks,
  stats as defaultStats,
  languages as defaultLanguages,
  marqueeItems as defaultMarquee
} from "./data";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: number;
  status: "unread" | "read" | "archived";
}

// Global Profile Schema
export interface Profile {
  name: string;
  title: string;
  bio: string;
  email: string;
  location: string;
  cvUrl: string;
  github: string;
  linkedin: string;
  twitter: string;
  blog: string;
  portfolio: string;
}

const STORAGE_KEYS = {
  PROFILE: "ayman_portfolio_profile",
  PROJECTS: "ayman_portfolio_projects",
  EXPERIENCE: "ayman_portfolio_experience",
  EDUCATION: "ayman_portfolio_education",
  SKILLS: "ayman_portfolio_skills",
  MESSAGES: "ayman_portfolio_messages",
  STATS: "ayman_portfolio_stats",
  LANGUAGES: "ayman_portfolio_languages",
  MARQUEE: "ayman_portfolio_marquee"
};

// Initial Profile setup mirroring App.tsx defaults
const initialProfile: Profile = {
  name: "Ayman Saikat",
  title: "System Support Co-Ordinator / Web Administrator",
  bio: "Highly organized and tech-savvy professional with professional experience in system administration, WordPress management, video editing, and graphic design. Adept at maintaining web infrastructures, executing digital marketing campaigns, and managing large-scale database operations with high precision.",
  email: "dev.rimonahmed@gmail.com",
  location: "Savar DOHS, Dhaka",
  cvUrl: "https://github.com/AymanSaikat/aymansaikat.github.io/blob/aefd51a899d3de2ec5724b4f0c1a4b469d275bb1/assets/Rimon%20Ahmed%20Resume%20for%20web.pdf",
  github: "https://github.com/aymansaikat",
  linkedin: "https://linkedin.com/in/aymansaikat",
  twitter: "https://twitter.com/AymanSaikat", // or placeholder
  blog: "https://aymansaikat.blogspot.com",
  portfolio: "https://aymansaikat.github.io"
};

// Unified Data Service covering LocalStorage & Firestore
export const dataService = {
  // ─── PROFILE ───
  async getProfile(): Promise<Profile> {
    if (isFirebaseConfigured() && db) {
      try {
        const snap = await getDoc(doc(db, "profile", "main"));
        if (snap.exists()) {
          return snap.data() as Profile;
        } else {
          const email = auth?.currentUser?.email;
          const isAdmin = email && (email === "rimon.newpagla@gmail.com" || email === "dev.rimonahmed@gmail.com");
          if (isAdmin) {
            try {
              await setDoc(doc(db, "profile", "main"), initialProfile);
            } catch (seedErr) {
              console.warn("Failed to seed profile:", seedErr);
            }
          }
          return initialProfile;
        }
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.GET, "profile/main");
        } catch {}
      }
    }
    const local = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (local) return JSON.parse(local);
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(initialProfile));
    return initialProfile;
  },

  async updateProfile(profile: Profile): Promise<void> {
    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, "profile", "main"), profile);
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, "profile/main");
      }
    }
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    // Backwards compatibility with the legacy CV field
    localStorage.setItem("originalCvUrl", profile.cvUrl);
  },

  // ─── STATS ───
  async getStats(): Promise<any[]> {
    const local = localStorage.getItem(STORAGE_KEYS.STATS);
    if (local) return JSON.parse(local);
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(defaultStats));
    return defaultStats;
  },

  async saveStats(stats: any[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  },

  // ─── LANGUAGES ───
  async getLanguages(): Promise<any[]> {
    const local = localStorage.getItem(STORAGE_KEYS.LANGUAGES);
    if (local) return JSON.parse(local);
    localStorage.setItem(STORAGE_KEYS.LANGUAGES, JSON.stringify(defaultLanguages));
    return defaultLanguages;
  },

  async saveLanguages(languages: any[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.LANGUAGES, JSON.stringify(languages));
  },

  // ─── MARQUEE ───
  async getMarquee(): Promise<string[]> {
    const local = localStorage.getItem(STORAGE_KEYS.MARQUEE);
    if (local) return JSON.parse(local);
    localStorage.setItem(STORAGE_KEYS.MARQUEE, JSON.stringify(defaultMarquee));
    return defaultMarquee;
  },

  async saveMarquee(items: string[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.MARQUEE, JSON.stringify(items));
  },

  // ─── PROJECTS ───
  async getProjects(): Promise<any[]> {
    if (isFirebaseConfigured() && db) {
      try {
        const snap = await getDocs(collection(db, "projects"));
        if (!snap.empty) {
          return snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        } else {
          const email = auth?.currentUser?.email;
          const isAdmin = email && (email === "rimon.newpagla@gmail.com" || email === "dev.rimonahmed@gmail.com");
          if (isAdmin) {
            try {
              for (const proj of defaultProjects) {
                await setDoc(doc(db, "projects", proj.id), proj);
              }
            } catch (seedErr) {
              console.warn("Failed to seed projects:", seedErr);
            }
          }
          return defaultProjects;
        }
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.LIST, "projects");
        } catch {}
      }
    }
    const local = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (local) return JSON.parse(local);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(defaultProjects));
    return defaultProjects;
  },

  async addProject(project: any): Promise<void> {
    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, "projects", project.id), project);
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `projects/${project.id}`);
      }
    }
    const projects = await this.getProjects();
    projects.push(project);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },

  async updateProject(id: string, updated: any): Promise<void> {
    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, "projects", id), updated);
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `projects/${id}`);
      }
    }
    const projects = await this.getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      projects[index] = { ...updated, id };
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    }
  },

  async deleteProject(id: string): Promise<void> {
    if (isFirebaseConfigured() && db) {
      try {
        await deleteDoc(doc(db, "projects", id));
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `projects/${id}`);
      }
    }
    const projects = await this.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
  },

  // ─── SKILLS ───
  async getSkillCategories(): Promise<any[]> {
    if (isFirebaseConfigured() && db) {
      try {
        const snap = await getDocs(collection(db, "skills"));
        if (!snap.empty) {
          return snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        } else {
          const email = auth?.currentUser?.email;
          const isAdmin = email && (email === "rimon.newpagla@gmail.com" || email === "dev.rimonahmed@gmail.com");
          if (isAdmin) {
            try {
              for (const cat of defaultSkillCategories) {
                await setDoc(doc(db, "skills", cat.id), cat);
              }
            } catch (seedErr) {
              console.warn("Failed to seed skills:", seedErr);
            }
          }
          return defaultSkillCategories;
        }
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.LIST, "skills");
        } catch {}
      }
    }
    const local = localStorage.getItem(STORAGE_KEYS.SKILLS);
    if (local) return JSON.parse(local);
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(defaultSkillCategories));
    return defaultSkillCategories;
  },

  async updateSkillCategories(categories: any[]): Promise<void> {
    if (isFirebaseConfigured() && db) {
      try {
        for (const cat of categories) {
          await setDoc(doc(db, "skills", cat.id), cat);
        }
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, "skills");
      }
    }
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(categories));
  },

  // ─── EXPERIENCE ───
  async getExperiences(): Promise<any[]> {
    if (isFirebaseConfigured() && db) {
      try {
        const snap = await getDocs(collection(db, "experience"));
        if (!snap.empty) {
          return snap.docs.map(doc => ({ ...doc.data(), docId: doc.id }));
        } else {
          const email = auth?.currentUser?.email;
          const isAdmin = email && (email === "rimon.newpagla@gmail.com" || email === "dev.rimonahmed@gmail.com");
          if (isAdmin) {
            try {
              for (let i = 0; i < defaultExperience.length; i++) {
                await setDoc(doc(db, "experience", `exp-${i}`), defaultExperience[i]);
              }
            } catch (seedErr) {
              console.warn("Failed to seed experience:", seedErr);
            }
          }
          return defaultExperience;
        }
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.LIST, "experience");
        } catch {}
      }
    }
    const local = localStorage.getItem(STORAGE_KEYS.EXPERIENCE);
    if (local) return JSON.parse(local);
    localStorage.setItem(STORAGE_KEYS.EXPERIENCE, JSON.stringify(defaultExperience));
    return defaultExperience;
  },

  async saveExperiences(experiences: any[]): Promise<void> {
    if (isFirebaseConfigured() && db) {
      try {
        // Simple write tracking
        for (let i = 0; i < experiences.length; i++) {
          const id = experiences[i].docId || `exp-${i}`;
          await setDoc(doc(db, "experience", id), experiences[i]);
        }
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, "experience");
      }
    }
    localStorage.setItem(STORAGE_KEYS.EXPERIENCE, JSON.stringify(experiences));
  },

  // ─── EDUCATION ───
  async getEducation(): Promise<any[]> {
    if (isFirebaseConfigured() && db) {
      try {
        const snap = await getDocs(collection(db, "education"));
        if (!snap.empty) {
          return snap.docs.map(doc => ({ ...doc.data(), docId: doc.id }));
        } else {
          const email = auth?.currentUser?.email;
          const isAdmin = email && (email === "rimon.newpagla@gmail.com" || email === "dev.rimonahmed@gmail.com");
          if (isAdmin) {
            try {
              for (let i = 0; i < defaultEducation.length; i++) {
                await setDoc(doc(db, "education", `edu-${i}`), defaultEducation[i]);
              }
            } catch (seedErr) {
              console.warn("Failed to seed education:", seedErr);
            }
          }
          return defaultEducation;
        }
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.LIST, "education");
        } catch {}
      }
    }
    const local = localStorage.getItem(STORAGE_KEYS.EDUCATION);
    if (local) return JSON.parse(local);
    localStorage.setItem(STORAGE_KEYS.EDUCATION, JSON.stringify(defaultEducation));
    return defaultEducation;
  },

  async saveEducation(education: any[]): Promise<void> {
    if (isFirebaseConfigured() && db) {
      try {
        for (let i = 0; i < education.length; i++) {
          const id = education[i].docId || `edu-${i}`;
          await setDoc(doc(db, "education", id), education[i]);
        }
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, "education");
      }
    }
    localStorage.setItem(STORAGE_KEYS.EDUCATION, JSON.stringify(education));
  },

  // ─── RECEIVED MESSAGES (INBOX) ───
  async getMessages(): Promise<ContactMessage[]> {
    if (isFirebaseConfigured() && db) {
      // If no valid session is present, fall back to local storage without querying Firestore
      // to avoid causing "Missing or insufficient permissions" console warnings.
      if (!auth || !auth.currentUser) {
        const local = localStorage.getItem(STORAGE_KEYS.MESSAGES);
        if (local) {
          return JSON.parse(local).sort((a: any, b: any) => b.timestamp - a.timestamp);
        }
        return [];
      }

      try {
        const snap = await getDocs(collection(db, "messages"));
        return snap.docs.map(doc => ({ ...doc.data(), id: doc.id }) as ContactMessage)
          .sort((a, b) => b.timestamp - a.timestamp);
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.LIST, "messages");
        } catch {}
      }
    }
    const local = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (local) {
      return JSON.parse(local).sort((a: any, b: any) => b.timestamp - a.timestamp);
    }
    return [];
  },

  async addMessage(msg: Omit<ContactMessage, "id">): Promise<void> {
    const id = "msg-" + Date.now();
    const newMsg: ContactMessage = { ...msg, id };

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, "messages", id), newMsg);
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `messages/${id}`);
      }
    }
    const messages = await this.getMessages();
    messages.push(newMsg);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  },

  async updateMessageStatus(id: string, status: "unread" | "read" | "archived"): Promise<void> {
    if (isFirebaseConfigured() && db) {
      try {
        await updateDoc(doc(db, "messages", id), { status });
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `messages/${id}`);
      }
    }
    const messages = await this.getMessages();
    const index = messages.findIndex(m => m.id === id);
    if (index !== -1) {
      messages[index].status = status;
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    }
  },

  async deleteMessage(id: string): Promise<void> {
    if (isFirebaseConfigured() && db) {
      try {
        await deleteDoc(doc(db, "messages", id));
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `messages/${id}`);
      }
    }
    const messages = await this.getMessages();
    const filtered = messages.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(filtered));
  }
};
