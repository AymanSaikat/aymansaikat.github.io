import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Terminal, 
  X, 
  Send, 
  Sparkles, 
  Cpu, 
  MessageSquare, 
  Loader2, 
  RefreshCw,
  User,
  ArrowRight
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

interface AIPortfolioRaphaelProps {
  profile: any;
  projectsList: any[];
  skillsList: any[];
  experienceList: any[];
}

/**
 * Offline-intelligent systems answering core.
 * Evaluates context query and computes formatted markdown using the real portfolio data registry.
 */
function queryLocalKnowledgeCore(
  query: string,
  profile: any,
  projectsList: any[],
  skillsList: any[],
  experienceList: any[]
): string {
  const normalized = query.toLowerCase();

  // Helper matching functions
  const keys = (words: string[]) => words.some(w => normalized.includes(w));

  if (keys(["skill", "capable", "expert", "expertis", "know", "technic", "dossier", "stack", "language", "program"])) {
    let skillText = `##### SECURE DATA RETRIEVED: TECHNICAL INDEX ⚡\n\n`;
    skillText += `Rimon Ahmed possesses senior competencies in systems deployment, security management, and frontend/backend infrastructure development.\n\n`;
    
    if (skillsList && skillsList.length > 0) {
      skillsList.forEach((cat: any) => {
        skillText += `**${cat.name || "Specialization"}**:\n`;
        const items = Array.isArray(cat.skills) ? cat.skills : (cat.items || []);
        if (items.length > 0) {
          skillText += ` - ${items.map((s: any) => s.name || s).join(", ")}\n`;
        }
      });
    } else {
      skillText += `- **Systems Administration**: Enterprise server orchestration, Linux environments, database security modeling.\n`;
      skillText += `- **Web Application Orchestration**: Specialized WordPress customization, modern React framework integration, and performance optimizations (trimming asset load speeds by up to 40%).\n`;
      skillText += `- **Biometric Verification**: Precision configuration of secure iris scan registries and rapid high-accuracy fingerprint capture interfaces.\n`;
      skillText += `- **Interactive Asset Production**: Expert editing structures with Adobe Premiere, lower-third live broadcasting alignments, and graphical layout blueprints.\n`;
    }
    
    return skillText;
  }

  if (keys(["project", "work", "build", "portfolio", "develop", "st group", "election", "landing", "archiving", "savar"])) {
    let responseText = `##### DISPATCH COMPLETE: ENTERPRISE PROJECT INDEX 📁\n\n`;
    responseText += `Rimon Ahmed has engineered several high-accuracy database solutions and web portals. Operational indices include:\n\n`;

    if (projectsList && projectsList.length > 0) {
      projectsList.forEach((proj: any) => {
        responseText += `- **${proj.title || proj.name}**\n  *Role/Goal*: ${proj.description || "System integration & deployment"}\n`;
        if (proj.tech) {
          responseText += `  *Tech Core*: ${Array.isArray(proj.tech) ? proj.tech.join(", ") : proj.tech}\n`;
        }
        responseText += `\n`;
      });
    } else {
      responseText += `- **ST Group Corporate Portals**: Configured, stabilized and fully optimized corporate web structures, achieving 40% enhancements in response velocity.\n`;
      responseText += `- **Biometric Identification Pipeline**: Managed biometric capture terminals (dual iris & fingerprints) for Savar Region of the Bangladesh Election Commission with perfect fidelity.\n`;
      responseText += `- **News Tv Bangla live assets**: Designed active video transitions, audio track exports and broadcast grids.\n`;
      responseText += `- **RAJUK project office file archive**: Transcribed, validated and categorized high-volume historical real estate documents with unmatched cataloging speed.\n`;
    }

    return responseText;
  }

  if (keys(["experience", "job", "career", "history", "milestone", "employ", "workplace"])) {
    let responseText = `##### DECRYPTING CHRONOLOGICAL CAREER GRID 📅\n\n`;
    responseText += `Rimon has built high-speed validation pipelines and managed production servers for prominent institutions. Chronology includes:\n\n`;

    if (experienceList && experienceList.length > 0) {
      experienceList.forEach((exp: any) => {
        responseText += `- **${exp.role || "Specialist"}** at *${exp.org || exp.company}* (${exp.date || "Active Period"})\n`;
        const points = Array.isArray(exp.points) ? exp.points : [exp.points || "Core operations"];
        points.forEach((p: string) => {
          responseText += `  - ${p}\n`;
        });
        responseText += `\n`;
      });
    } else {
      responseText += `- **Web Administrator & Systems Specialist** | *ST Group Corporate Operations*\n  - Designed responsive entry channels and landing architectures; speed-boosted page generation times by 40%.\n`;
      responseText += `- **Biometric Fingerprint & Iris Operator** | *Bangladesh Election Commission*\n  - Operated national identification registers with 100% security accuracy for the Savar node.\n`;
      responseText += `- **Media Hub Technical Support** | *News Tv Bangla*\n  - Administered video servers and broadcast tracks under real-time constraints.\n`;
      responseText += `- **Technical Document Specialist** | *RAJUK Urban Development Project Office*\n  - Cataloged high-threat land ownership registers with 0% margin of error.\n`;
    }

    return responseText;
  }

  if (keys(["contact", "hire", "email", "mail", "reach", "message", "touch", "write", "send", "chat", "contracting"])) {
    return `##### TRANSPHASE COMMS STATUS: STANDBY ✉️\n\nDirect contact vectors for **Rimon Ahmed** are online:\n\n- **Direct Transmission Form**: You can send an immediate SMTP request by filling out the **Contact Form** directly on this page! It integrates standard spam regulation policies.\n- **Direct Email**: Send a message to **dev.rimonahmed@gmail.com**.\n- **Enterprise Nodes**: Connect via LinkedIn or explore his GitHub records using the quicklinks in the page header and footer grids.\n\n*Would you like me to guide you to the contact section?*`;
  }

  if (keys(["cv", "resume", "download", "pdf", "file"])) {
    const url = profile?.cvUrl || "https://github.com/AymanSaikat/aymansaikat.github.io/blob/aefd51a899d3de2ec5724b4f0c1a4b469d275bb1/assets/Rimon%20Ahmed%20Resume%20for%20web.pdf";
    return `##### ARCHIVE RETRIEVAL: QUALIFICATION RECORDS 📄\n\n- **Rimon Ahmed's Professional Resume**: You can read or download his verified resume directly at the link below:\n\n  👉 [Direct PDF Resume Link](${url})\n\nThis file highlights his extensive technical support, system engineering audits, and WordPress administration milestones.`;
  }

  if (keys(["who", "about", "bio", "yourself", "name", "raphael", "agent"])) {
    return `##### SYSTEMS COGNITIVE AGENT: ONLINE 🛡️\n\nI am **Raphael**, Rimon Ahmed's dedicated **AI Systems Assistant**.\n\nMy primary operations include:\n- Mapping queries to Rimon's engineering archives.\n- Analyzing database deployments, security records, and server integrations.\n- Facilitating recruiters and clients in scheduling coordination nodes.\n\nI am currently running in **offline-resilient (local cache nodes) execution mode** to ensure immediate response velocity regardless of host environment constraints (such as direct deployment to GitHub Pages).`;
  }

  if (keys(["wordpress", "server", "admin", "video", "edit", "graphic", "design", "security", "database", "iris", "biometric"])) {
    return `##### SECURE QUERY DECODED: ${query.toUpperCase()} 🛠️\n\n**Rimon's Core Administration Metrics**:\n\n- **WordPress Deployment**: Mastered layout designs, speed optimizations, responsive widgets, and landing setups.\n- **Database Architecture**: Managed Iris scan archives & fingerprint capture nodes with zero data loss or synchronization drift.\n- **Graphic Design & Video Editing**: Highly proficient in Adobe Premiere and Photoshop, exporting lower-third assets, live media transitions, and corporate branding schemas.\n- **Server Infrastructure**: Standard hosting operations, server hardening, custom assets pipeline configurations, and diagnostic scripting.`;
  }

  // Default intelligent greeting summarizing his competencies
  return `##### COMMAND RECEIVED ⚡\n\nGreetings! I am currently operating on Rimon's localized backup database (ideal for static hosts like GitHub Pages).\n\nHere are some operations I can execute immediately:\n\n- **Qualifications**: Ask me to list Rimon's **"skills"** or **"experience milestones"**.\n- **Build Artifacts**: Ask about his leading **"projects"** (e.g. ST Group portal, biometric scanner systems).\n- **Resumes**: Request his **"resume"** or **"CV"** link.\n- **Communications**: Ask how to **"contact"** or **"hire"** him.\n\nWhat can I retrieve for you today?`;
}

export default function AIPortfolioRaphael({
  profile,
  projectsList,
  skillsList,
  experienceList
}: AIPortfolioRaphaelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-msg",
      role: "model",
      text: `##### COGNITIVE LINK ESTABLISHED ⚡
Hello! I am Raphael, Rimon Ahmed's **AI Systems Assistant**. 

I have full operational access to Rimon's qualifications directory, system configurations, and project indices. 

How can I assist you today? Feel free to ask about his WordPress work, Server specs, or custom tool setups!`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Suggestions customized to Rimon Ahmed's real portfolio data in data.ts
  const suggestions = [
    "What are Rimon Ahmed's key technical skills?",
    "Tell me about the ST Group Portal Redesign.",
    "Is he available for systems/server administrator contracting?",
    "Highlight Rimon's experience milestones."
  ];

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isGenerating, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isGenerating) return;

    const userMessage: Message = {
      id: "user-" + Date.now(),
      role: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsGenerating(true);

    try {
      // Map existing messages to basic history schema
      const history = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      let apiSuccess = false;
      let textResponse = "";

      try {
        const res = await fetch("/api/gemini/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: textToSend,
            history,
            profileState: profile,
            projectsList,
            skillsList,
            experienceList
          })
        });

        if (res.ok) {
          const data = await res.json();
          textResponse = data.text || "";
          apiSuccess = true;
        } else if (res.status === 404) {
          console.warn("[Raphael Engine] Static deployment detected (404 API Endpoint). Directing connection request to local storage node.");
        }
      } catch (fetchErr) {
        console.warn("[Raphael Engine] Network interface unreachable. Activating off-grid localized core.", fetchErr);
      }

      // High-Fidelity Client-side AI Simulation Fallback Node for Offline/Static deployments
      if (!apiSuccess) {
        textResponse = queryLocalKnowledgeCore(textToSend, profile, projectsList, skillsList, experienceList);
      }
      
      const raphaelMessage: Message = {
        id: "raphael-" + Date.now(),
        role: "model",
        text: textResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, raphaelMessage]);
    } catch (err: any) {
      console.error("Raphael AI integration error:", err);
      const errorMessage: Message = {
        id: "err-" + Date.now(),
        role: "model",
        text: `⚠️ **COMMUNICATION PROTOCOL INTERRUPTED**

My connection to the secure server core timed out. Please verify your internet connection or try again shortly.

*Technical: ${err.message || "Endpoint error"}*`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: "initial-msg-reset",
        role: "model",
        text: `##### CORE REBOOTED ⚙️
Cache purged. Direct data terminal link is active. What would you like to request?`,
        timestamp: new Date()
      }
    ]);
  };

  // Helper to format simple markdown elements (bolding, headers, bullet points, code blocks)
  const renderMessageContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let content: React.ReactNode = line;

      // Handle Headers
      if (line.startsWith("##### ")) {
        return <h5 key={idx} className="font-mono text-xs font-bold text-gold tracking-wider mt-2 mb-1 uppercase">{line.replace("##### ", "")}</h5>;
      }
      if (line.startsWith("#### ")) {
        return <h4 key={idx} className="font-mono text-[0.68rem] font-black text-gold tracking-widest mt-3 mb-1 uppercase">{line.replace("#### ", "")}</h4>;
      }
      if (line.startsWith("### ")) {
        return <h3 key={idx} className="font-sans text-xs font-bold text-text-primary mt-3 mb-1">{line.replace("### ", "")}</h3>;
      }

      // Handle bullet points
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const itemText = line.trim().substring(2);
        content = (
          <span className="flex items-start gap-1.5 pl-1 my-0.5">
            <span className="text-gold shrink-0 mt-1.5 text-[0.4rem]">■</span>
            <span>{formatInlineMarkdown(itemText)}</span>
          </span>
        );
        return <div key={idx}>{content}</div>;
      }

      return (
        <p key={idx} className="my-1.5 leading-relaxed">
          {formatInlineMarkdown(line)}
        </p>
      );
    });
  };

  const formatInlineMarkdown = (text: string) => {
    // Basic regex formatting for Bold (**text**)
    const parts = [];
    let currentIdx = 0;
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      // Append text before bold
      if (match.index > currentIdx) {
        parts.push(text.substring(currentIdx, match.index));
      }
      // Append bold text
      parts.push(
        <strong key={match.index} className="text-gold font-semibold">
          {match[1]}
        </strong>
      );
      currentIdx = boldRegex.lastIndex;
    }

    if (currentIdx < text.length) {
      parts.push(text.substring(currentIdx));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <>
      {/* Mobile-only background click-away overlay/backdrop with very soft blur */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#020204]/70 backdrop-blur-xs z-[9997] sm:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <div 
        id="ai-raphael-container" 
        className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 font-sans z-[9999] transition-all duration-300 print:hidden ${
          isOpen ? "hidden sm:block" : "block"
        }`}
      >
        <motion.button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`interactive-cursor flex items-center justify-center gap-2 px-4.5 py-3 w-auto bg-bg-card/[0.93] backdrop-blur-md border rounded-full text-gold shadow-3xl transition-all duration-300 ${
            isOpen 
              ? "border-gold/65 bg-gold/15" 
              : "border-white/10 hover:border-gold/50 shadow-[0_0_20px_rgba(212,175,55,0.15)] group"
          }`}
        >
          <div className="relative">
            <Sparkles className={`w-3.5 h-3.5 text-gold ${isGenerating ? "animate-spin" : "animate-pulse"}`} />
            {!isOpen && (
              <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </div>
          <span className="font-mono text-[0.62rem] tracking-widest uppercase font-bold text-text-primary group-hover:text-gold transition-colors">
            {isOpen ? "DISCONNECT" : "RAPHAEL"}
          </span>
        </motion.button>
      </div>

      {/* Main Drawer Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="fixed bottom-0 left-0 right-0 w-full h-[84vh] sm:bottom-24 sm:right-8 sm:left-auto sm:w-[420px] sm:h-[580px] sm:max-h-[80vh] border-t sm:border border-white/10 bg-bg-panel/98 backdrop-blur-2xl rounded-t-2xl sm:rounded-lg shadow-3xl overflow-hidden flex flex-col justify-between z-[9998] print:hidden"
          >
            {/* Mobile Sheet Visual Drag Handle Grip Indicator */}
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

            {/* Header section styled like a command rail dashboard */}
            <div className="bg-white/[0.02] border-b border-white/[0.08] px-4 py-3 flex items-center justify-between">
               <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-gold/10 border border-gold/25">
                  <Cpu className="w-3.5 h-3.5 text-gold animate-pulse" />
                </div>
                <div>
                  <h4 className="font-mono text-[0.65rem] tracking-wider text-text-primary uppercase font-bold flex items-center gap-1.5">
                    RAPHAEL // SYSTEMS ASSISTANT
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </h4>
                  <p className="font-mono text-[0.45rem] text-[#8a8a93] uppercase tracking-widest leading-none mt-0.5">
                    Direct Raphael AI Terminal
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button 
                  onClick={resetChat}
                  title="Force Core Reboot (Clear Cache)"
                  className="p-1.5 text-muted-slate hover:text-gold transition-colors rounded hover:bg-white/5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-muted-slate hover:text-text-primary transition-colors rounded hover:bg-white/5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chat conversations workspace area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs text-muted-lavender bg-gradient-to-b from-bg-dark/20 to-bg-panel/50">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  {/* Avatar Icon placeholder */}
                  <div className={`w-6 h-6 rounded border flex items-center justify-center shrink-0 mt-0.5 font-mono text-[0.55rem] ${
                    msg.role === "user" 
                      ? "border-gold/30 bg-gold/10 text-gold" 
                      : "border-white/10 bg-white/[0.03] text-muted-slate"
                  }`}>
                    {msg.role === "user" ? <User className="w-3 h-3" /> : "AI"}
                  </div>

                  <div className={`p-3 rounded-[3px] border relative ${
                    msg.role === "user"
                      ? "bg-gold/5 border-gold/20 text-text-primary text-right"
                      : "bg-bg-card border-white/[0.04] text-[#a0a0ab]"
                  }`}>
                    <div className="break-words leading-relaxed whitespace-pre-wrap font-sans text-[0.72rem]">
                      {msg.role === "model" ? renderMessageContent(msg.text) : msg.text}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loader/Typing feedback */}
              {isGenerating && (
                <div className="flex gap-3 max-w-[85%] mr-auto">
                  <div className="w-6 h-6 rounded border border-white/5 bg-white/[0.02] flex items-center justify-center shrink-0 mt-0.5 font-mono text-[0.55rem] text-muted-slate">
                    AI
                  </div>
                  <div className="p-3 bg-bg-card border border-white/[0.04] rounded-[2px] flex items-center gap-1.5 text-muted-slate font-mono text-[0.55rem] tracking-wider uppercase">
                    <Loader2 className="w-3.5 h-3.5 text-gold animate-spin shrink-0" />
                    Connecting Core Memory...
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Dynamic Suggestion Prompt Overlay inside viewport */}
            {messages.length < 3 && (
              <div className="px-4 py-2 bg-bg-dark/45 border-t border-white/[0.03] space-y-1.5 animate-fade-in">
                <span className="block font-mono text-[0.45rem] text-[#8a8a93] uppercase tracking-widest pl-1 font-semibold">
                  RECOMMENDED QUERIES:
                </span>
                <div className="flex flex-col gap-1">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(s)}
                      className="interactive-cursor flex items-center gap-1.5 text-left font-mono text-[0.52rem] text-gold/80 hover:text-gold hover:bg-gold/5 border border-gold/10 hover:border-gold/35 px-2.5 py-1 rounded-[1px] transition-all whitespace-normal cursor-pointer"
                    >
                      <ArrowRight className="w-2.5 h-2.5 shrink-0 text-gold-light" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input action toolbar */}
            <div className="p-3 bg-white/[0.01] border-t border-white/[0.08] flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isGenerating ? "Synthesizing prompt..." : "Ask Raphael... (e.g., 'WordPress setups')" }
                disabled={isGenerating}
                className="flex-1 px-3 py-2 bg-white/[0.01] border border-white/10 text-text-primary placeholder-muted-slate/50 rounded-[1px] font-mono text-xs focus:outline-none focus:border-gold/40 disabled:opacity-40"
              />
              <button
                type="button"
                onClick={() => handleSendMessage(inputValue)}
                disabled={isGenerating || !inputValue.trim()}
                className="interactive-cursor px-3 py-2 bg-gold disabled:bg-white/5 hover:bg-gold-light text-bg-dark disabled:text-muted-slate rounded-[1px] transition-all shrink-0 flex items-center justify-center font-semibold text-xs border border-gold/20 disabled:border-transparent cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
