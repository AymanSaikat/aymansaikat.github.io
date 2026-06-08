import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Fingerprint, 
  ShieldCheck, 
  Send, 
  Loader2, 
  Database,
  Lock, 
  Unlock, 
  Terminal, 
  CheckCircle, 
  UserCheck, 
  Globe, 
  Server,
  Zap,
  HelpCircle
} from "lucide-react";
import { dataService, GuestbookEntry } from "../dataService";
import { isFirebaseConfigured } from "../firebase";

// Helper to generate a stable, beautiful faux block hash for visual styling
function generateFauxHash(id: string, name: string): string {
  let hash = 0;
  const str = id + name;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");
  return `SHA256://STG-F${hex}E14A89${hex.slice(2, 6)}`;
}

export default function GuestbookLedger() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittingPhase, setSubmittingPhase] = useState("");
  
  // Form fields
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isDbLive = isFirebaseConfigured();

  // Load guestbook records
  const loadLedger = async () => {
    try {
      setLoading(true);
      const data = await dataService.getGuestbook();
      setEntries(data);
    } catch (err) {
      console.error("Failed to load guestbook ledger:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setSubmitting(true);
    setErrorMsg("");

    // Beautiful system logging transition delays
    try {
      setSubmittingPhase("Establishing handshake with STG-FEDERATED cluster...");
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSubmittingPhase("Computing cryptographic block signature hash...");
      await new Promise(resolve => setTimeout(resolve, 600));

      setSubmittingPhase("Writing secure payload stream to ledger matrix...");
      
      await dataService.addGuestbookEntry({
        name: name.trim(),
        company: company.trim() || "Independent Peer Evaluator",
        message: message.trim(),
        timestamp: Date.now()
      });

      setSubmittingPhase("Block validated. Synced with Firestore index cluster OK.");
      await new Promise(resolve => setTimeout(resolve, 500));

      setSuccess(true);
      setName("");
      setCompany("");
      setMessage("");
      loadLedger();
    } catch (err) {
      console.error("Submission failed:", err);
      setErrorMsg("Write failure. Security handshake rejected block candidate.");
    } finally {
      setSubmitting(false);
      setSubmittingPhase("");
    }
  };

  return (
    <section id="guestbook" className="relative py-24 border-t border-white/[0.04] overflow-hidden bg-[#07070a]">
      
      {/* Background grids styling */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#1b1c2e]/20 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3.5">
              <span className="w-1.5 h-1.5 bg-gold rounded-full" />
              <span className="font-mono text-[0.62rem] tracking-[0.3em] text-gold uppercase font-bold">
                AUDITED USER-FEEDBACK TERMINAL
              </span>
            </div>
            <h2 className="font-sans font-medium tracking-tight text-3xl md:text-4xl text-white">
              04 — Verified Peer Ledger
            </h2>
            <p className="mt-4 text-[#a0a0ab] text-sm font-sans max-w-xl leading-relaxed">
              Welcome to the public-key signature terminal. Sign the ledger to leave an endorsement, validation, or feedback. Each entry is cryptographically stamped on Rimon's security grid.
            </p>
          </div>

          {/* Real-time sync tracker banner */}
          <div className="flex items-center gap-4 border border-white/[0.04] bg-black/45 p-3.5 rounded-[2px] font-mono text-[0.58rem] shrink-0 self-start md:self-auto">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-gold animate-pulse" />
              <span className="text-muted-slate uppercase font-medium">INDEX HUB:</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isDbLive ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span className={`font-bold uppercase ${isDbLive ? "text-emerald-400" : "text-amber-400"}`}>
                {isDbLive ? "FIRESTORE_LIVE" : "LOCAL_CACHED_STORE"}
              </span>
            </div>
            <div className="text-white/20 border-l border-white/10 pl-3.5 flex items-center gap-1">
              <Server className="w-2.5 h-2.5 text-[#a0a0ab]/40" />
              <span>REG_SVR_SAVAR</span>
            </div>
          </div>
        </div>

        {/* Real responsive grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL (Col-span 7): Signatures Ledger Records timeline */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-2 bg-[#040407]/40">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-gold" />
                <span className="font-mono text-[0.65rem] tracking-wider uppercase text-text-primary font-bold">
                  LEDGER TRANSCRIPT REGISTER
                </span>
                <span className="font-mono text-[0.52rem] text-muted-slate mb-0.5">
                  ({entries.length} validated blocks)
                </span>
              </div>
              <button 
                onClick={loadLedger}
                className="text-[0.55rem] font-mono tracking-wider text-gold hover:text-white uppercase transition-colors px-2 py-1 bg-gold/5 border border-gold/15 select-none hover:bg-gold/10 hover:border-gold/35 rounded-[1px] cursor-pointer"
              >
                Sync Feed
              </button>
            </div>

            <AnimatePresence mode="popLayout">
              {loading ? (
                <div className="py-24 flex flex-col items-center justify-center border border-white/[0.04] bg-black/15 rounded-[2px]">
                  <Loader2 className="w-8 h-8 text-gold animate-spin mb-4" />
                  <span className="font-mono text-[0.6rem] text-muted-slate uppercase tracking-widest">
                    SYNCING AND AUDITING SIGNATURE BLOCKS...
                  </span>
                </div>
              ) : entries.length === 0 ? (
                <div className="py-24 text-center border border-dashed border-white/15 bg-black/10 rounded-[2px]">
                  <p className="font-mono text-[0.68rem] text-muted-slate uppercase">
                    NO COMPLETED BLOCK REGISTRATIONS.
                  </p>
                  <p className="mt-2 text-white/30 text-xs font-sans">
                    Be the very first system colleague to sign our guestbook!
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[620px] overflow-y-auto pr-2 custom-scrollbar">
                  {entries.map((entry, index) => {
                    const blockNumber = entries.length - index;
                    const blockHash = generateFauxHash(entry.id, entry.name);
                    
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -15, y: 10 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.35, delay: index * 0.05 }}
                        className="p-5 bg-[#0b0c10]/90 border border-white/[0.04] hover:border-gold/15 rounded-[3px] space-y-4 transition-all duration-300 hover:shadow-lg hover:shadow-gold/[0.01]"
                      >
                        {/* Entry Header: Name & Company info with Block Tag */}
                        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/[0.02] pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gold/5 border border-gold/25 flex items-center justify-center font-mono text-xs text-gold font-bold">
                              {entry.name[0]?.toUpperCase()}
                            </div>
                            <div className="text-left">
                              <h4 className="font-sans font-bold text-sm text-text-primary leading-tight">
                                {entry.name}
                              </h4>
                              <p className="font-mono text-[0.58rem] text-muted-lavender uppercase tracking-wide mt-0.5">
                                {entry.company}
                              </p>
                            </div>
                          </div>

                          {/* Block numbering design & timestamps */}
                          <div className="text-right font-mono text-[0.52rem]">
                            <div className="text-gold font-black uppercase tracking-widest bg-gold/5 border border-gold/10 px-1.5 py-0.5 rounded-[1px] inline-block">
                              BLOCK_0{blockNumber}
                            </div>
                            <div className="text-[#a0a0ab]/40 mt-1 uppercase">
                              {new Date(entry.timestamp).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Signed Message Content */}
                        <p className="text-muted-slate text-sm font-sans leading-relaxed text-left whitespace-pre-wrap">
                          "{entry.message}"
                        </p>

                        {/* Security Ledger Bottom Footer: SHA indicators */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.01] font-mono text-[0.52rem] text-[#a0a0ab]/30">
                          <div className="flex items-center gap-1.5 tracking-wider uppercase text-[#a0a0ab]/40">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-emerald-400 font-bold">{blockHash}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="uppercase text-[0.45rem] font-bold border border-white/5 py-0.25 px-1 bg-white/[0.01]">
                              MFA_BYPASS_EXEMPT
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT PANEL (Col-span 5): Commitment Terminal form */}
          <div className="lg:col-span-5 bg-black/45 border border-white/[0.04] p-6 rounded-[3px] relative">
            <div className="absolute top-0 right-0 p-3 flex gap-1 font-mono text-[0.46rem] text-white/10 select-none">
              <span>SEC_OVERRIDE_ACTIVE</span>
            </div>

            <div className="flex items-center gap-2 mb-6 border-b border-white/[0.04] pb-4">
              <Fingerprint className="w-4 h-4 text-gold" />
              <h3 className="font-mono text-xs tracking-widest text-[#a0a0ab] uppercase font-bold text-left">
                COMMIT BLOCK TERMINAL
              </h3>
            </div>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="form-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-8 space-y-5"
                >
                  <div className="w-12 h-12 rounded-full border border-emerald-500/25 bg-emerald-500/5 flex items-center justify-center mx-auto text-emerald-400 shadow-md">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-mono text-xs uppercase text-text-primary tracking-wider font-bold">
                      SIGNATURE TRANSACTION COMPLETE
                    </h4>
                    <p className="mt-2 text-[#a0a0ab] text-xs font-sans leading-relaxed max-w-xs mx-auto">
                      Your entry block has been validated, stamped with our public certificate key, and appended to the portfolio's secure register. Thank you!
                    </p>
                  </div>
                  <button
                    onClick={() => setSuccess(false)}
                    className="py-2.5 px-6 border border-gold/20 hover:border-gold hover:bg-gold/10 text-gold font-mono text-[0.62rem] uppercase tracking-widest rounded-[2px] transition-all cursor-pointer"
                  >
                    REGISTER NEW ENTRY
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  {/* Visitor Name */}
                  <div className="space-y-2 text-left">
                    <label className="block font-mono text-[0.58rem] text-muted-slate uppercase tracking-wider font-bold">
                      Full Name / Signature Alias *
                    </label>
                    <input
                      required
                      type="text"
                      disabled={submitting}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe, Senior SysAdmin"
                      className="w-full bg-[#14141f]/70 border border-white/[0.06] hover:border-white/15 focus:border-gold focus:outline-none px-4 py-3 text-white text-xs rounded-[2px] transition-colors placeholder:text-white/20 font-sans h-11"
                    />
                  </div>

                  {/* designation/company */}
                  <div className="space-y-2 text-left">
                    <label className="block font-mono text-[0.58rem] text-muted-slate uppercase tracking-wider font-bold">
                      Agency / Institution / Company (Optional)
                    </label>
                    <input
                      type="text"
                      disabled={submitting}
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. ST Group, Google, Independent"
                      className="w-full bg-[#14141f]/70 border border-white/[0.06] hover:border-white/15 focus:border-gold focus:outline-none px-4 py-3 text-white text-xs rounded-[2px] transition-colors placeholder:text-white/20 font-sans h-11"
                    />
                  </div>

                  {/* signature message */}
                  <div className="space-y-2 text-left">
                    <label className="block font-mono text-[0.58rem] text-muted-slate uppercase tracking-wider font-bold">
                      Validation Signature (Message) *
                    </label>
                    <textarea
                      required
                      disabled={submitting}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Leave your peer assessment, corporate appraisal, or general comment here..."
                      rows={5}
                      className="w-full bg-[#14141f]/70 border border-white/[0.06] hover:border-white/15 focus:border-gold focus:outline-none p-4 text-white text-xs rounded-[2px] transition-colors placeholder:text-white/20 font-sans resize-none"
                    />
                  </div>

                  {errorMsg && (
                    <div className="text-red-400 font-mono text-[0.58rem] text-left uppercase border border-red-500/20 bg-red-500/5 p-3 rounded-[1px]">
                      {errorMsg}
                    </div>
                  )}

                  {/* Submit loading phases */}
                  <AnimatePresence>
                    {submitting && submittingPhase && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-3.5 bg-gold/5 border border-gold/15 rounded-[2px] flex items-start gap-3"
                      >
                        <Loader2 className="w-4 h-4 text-gold animate-spin shrink-0 mt-0.5" />
                        <div className="text-left">
                          <span className="block font-mono text-[0.45rem] tracking-[0.2em] text-gold uppercase leading-none font-bold">
                            MAPPING LEDGER LAYER
                          </span>
                          <p className="font-mono text-[0.55rem] text-muted-slate uppercase mt-1 leading-normal">
                            {submittingPhase}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submission Button */}
                  <button
                    type="submit"
                    disabled={submitting || !name.trim() || !message.trim()}
                    className="w-full h-11 bg-gold hover:bg-gold-light text-bg-dark disabled:bg-white/5 disabled:text-muted-slate font-mono text-[0.62rem] uppercase tracking-widest font-black rounded-[2px] transition-all flex items-center justify-center gap-2 hover:translate-y-[-1px] select-none cursor-pointer mt-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        TRANSACTING SECURE PAYLOAD...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        COMMIT SIGNATURE BLOCKS
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
            
            {/* Disclaimer and system protocol notes */}
            <div className="mt-6 border-t border-white/[0.04] pt-4 flex gap-2 text-left">
              <HelpCircle className="w-4 h-4 text-[#a0a0ab]/20 shrink-0 mt-0.5" />
              <p className="font-mono text-[0.48em] text-muted-slate leading-normal uppercase">
                SECURITY ADVISORY: THIS FEEDBACK FORM USES DIRECT FIRESTORE INJECTION STREAMS WITH DYNAMIC SPAM REGULATING POLICIES. SYSTEM ADMINISTRATOR (RIMON) RESERVES COMMITTAL MODERATION CONTROLS.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
