import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Terminal as TerminalIcon, 
  Activity, 
  Cpu, 
  Server, 
  Database, 
  Wifi, 
  ShieldAlert, 
  Code,
  Sparkles,
  Search,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { isFirebaseConfigured, db } from "../firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

interface LineItem {
  id: string;
  type: "input" | "output" | "error" | "system";
  text: string;
}

export default function SystemMonitor({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const [activeTab, setActiveTab] = useState<"hud" | "console" | "firewall">("hud");
  
  // Real database latency counter vs simulated pings
  const [dbLatency, setDbLatency] = useState<number>(14);
  const [cdnLatency, setCdnLatency] = useState<number>(32);
  const [gatewayLatency, setGatewayLatency] = useState<number>(24);
  const [cpuUsage, setCpuUsage] = useState<number>(18);
  const [ramUsage, setRamUsage] = useState<number>(4.2);
  const [systemUptime, setSystemUptime] = useState<string>("342:15:28");

  // Console Shell states
  const [consoleInput, setConsoleInput] = useState("");
  const [consoleHistory, setConsoleHistory] = useState<LineItem[]>([
    { id: "1", type: "system", text: "AYMAN SECURITY SUPPORT OS v4.2.1-SECURE" },
    { id: "2", type: "system", text: "CORE SYSTEMS STABLE // FIREWALL ACTIVE // TOTP LAYER 2 SYNCHRONIZED" },
    { id: "3", type: "output", text: "Type 'help' to audit system capabilities and discover core commands." }
  ]);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  // Firewall simulated feed ticker states
  const [firewallLogs, setFirewallLogs] = useState<any[]>([]);

  // Periodically update latency and performance stats for high interactivity
  useEffect(() => {
    const interval = setInterval(() => {
      setDbLatency(prev => Math.max(8, Math.min(65, prev + (Math.random() > 0.5 ? 2 : -2))));
      setCdnLatency(prev => Math.max(15, Math.min(85, prev + (Math.random() > 0.5 ? 3 : -3))));
      setGatewayLatency(prev => Math.max(10, Math.min(55, prev + (Math.random() > 0.5 ? 2 : -2))));
      setCpuUsage(prev => Math.max(5, Math.min(32, prev + Math.floor(Math.random() * 5 - 2))));
      setRamUsage(prev => parseFloat(Math.max(3.8, Math.min(4.8, prev + (Math.random() > 0.5 ? 0.02 : -0.02))).toFixed(2)));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Update uptime counter
  useEffect(() => {
    let secs = 54800; // base offset
    const timer = setInterval(() => {
      secs++;
      const hours = Math.floor(secs / 3600);
      const mins = Math.floor((secs % 3600) / 60);
      const remainingSecs = secs % 60;
      setSystemUptime(`${342 + hours}:${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Ticker feeding firewall events
  useEffect(() => {
    const defaultLogs = [
      { id: "f1", time: "16:21:04", ip: "103.145.74.12", event: "TCP_HANDSHAKE_OK", status: "ALLOWED", sev: "info" },
      { id: "f2", time: "16:21:18", ip: "198.51.100.42", event: "RECV_SYN_COOKIE", status: "ACKNOWLEDGED", sev: "info" },
      { id: "f3", time: "16:22:05", ip: "82.165.109.2", event: "PORT_SCAN_SUSPECTED", status: "RATE_LIMITED", sev: "warning" },
      { id: "f4", time: "16:23:41", ip: "185.220.101.4", event: "CMS_PIN_ATTEMPT", status: "BLOCKED_IP", sev: "critical" },
      { id: "f5", time: "16:24:12", ip: "104.244.42.1", event: "TLS_AES_256_DECRYPT", status: "SECURE", sev: "success" }
    ];
    setFirewallLogs(defaultLogs);

    // Feed new firewall events randomly
    const appendInterval = setInterval(() => {
      const ips = ["45.33.2.145", "192.168.1.104", "203.0.113.88", "18.234.5.12", "103.145.74.12", "142.250.190.46"];
      const events = [
        { name: "RECV_HTTP_GET_INDEX", status: "ROUTE_SERVED", sev: "info" },
        { name: "ROUTE_VALIDATION", status: "HEALTHY", sev: "success" },
        { name: "API_GATEWAY_THROTTLE", status: "RATE_LIMIT_PASS", sev: "info" },
        { name: "SSH_AUTH_KNOCK", status: "DENIED", sev: "warning" },
        { name: "FIREBASE_TOKEN_POLL", status: "AUTHENTICATED", sev: "success" },
        { name: "ADMIN_TOTP_VERIFY", status: "ACTIVE_MONITOR", sev: "success" }
      ];
      
      const randomIp = ips[Math.floor(Math.random() * ips.length)];
      const randomEv = events[Math.floor(Math.random() * events.length)];
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

      setFirewallLogs(prev => [
        {
          id: String(Date.now()),
          time: timeStr,
          ip: randomIp,
          event: randomEv.name,
          status: randomEv.status,
          sev: randomEv.sev
        },
        ...prev
      ].slice(0, 30));
    }, 5000);

    return () => clearInterval(appendInterval);
  }, []);

  // Scroll terminal to bottom
  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [consoleHistory]);

  const handleConsoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = consoleInput.trim();
    if (!cmd) return;

    const newHistory = [...consoleHistory, { id: String(Date.now()), type: "input" as const, text: `$ ${cmd}` }];
    setConsoleInput("");

    const parts = cmd.toLowerCase().split(" ");
    const primaryCmd = parts[0];

    let reply = "";
    let isError = false;

    switch (primaryCmd) {
      case "help":
        reply = "Available system utilities:\n- help : Audit commands and tools\n- cat bio : View professional systems coordinate bio\n- ping : Run live latency handshake checks\n- lsof : List active service stacks\n- projects : Audit portfolio records index\n- skills : Audit verified capability tags\n- system : Print system health stats\n- clear : Flush terminal stdout";
        break;
      case "clear":
        setConsoleHistory([]);
        return;
      case "ping":
        reply = `PING ayman.support-edge [ICMP seq=1]:\n- CDN Gateway: ${cdnLatency}ms (TTL 64)\n- Database Node: ${dbLatency}ms (Secure cluster)\n- Auth Matrix Shield: ${gatewayLatency}ms (Zero-trust verify)`;
        break;
      case "lsof":
        reply = "COMMAND    PID    USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME\n" +
                "nginx_rx  1408   ayman   4u  IPv4 0x7ffd5211b    0t0    TCP *:3000 (LISTEN)\n" +
                "node_cms  2452   ayman   3u  IPv4 0x7ffd5211d    0t0    TCP *:5001 (SECURE)\n" +
                "pingsrv   2890  system   5u  IPv4 0x7ffd5102a    0t0    UDP *:1212";
        break;
      case "system":
        reply = `--- SYSTEM HEALTH SHIELD ---\n` +
                `- CPU CORES: 8x Hyperthreaded\n` +
                `- CORE LOAD: ${cpuUsage}%\n` +
                `- MEMORY CAP: ${ramUsage}GB / 8.0GB\n` +
                `- FIREWALL STATUS: Active (99.99% safe)\n` +
                `- ENCRYPTOR LAYER: AES-256 HMAC-SHA512`;
        break;
      case "cat":
        if (parts[1] === "bio") {
          reply = "SYSTEM SUPPORT COORDINATOR & WEB ADMINISTRATOR\n" +
                  "--------------------------------------------------\n" +
                  "Expertise lies in enterprise systems management, biometric archiving protocols,\n" +
                  "and high-efficiency multimedia workflows. Confident handling critical client-side database schemas,\n" +
                  "architecting real-time network logging, web applications administration, and social assets amplification.";
        } else {
          reply = "Format: cat [filename]. Target file not found inside storage sector. Try 'cat bio'.";
          isError = true;
        }
        break;
      case "projects":
        reply = "SECURE PORTFOLIO DIRECTORY:\n" +
                "- project-1: Land Boundary Digitization System (Bangladesh Land Ministry)\n" +
                "- project-2: Media Stream Production Console\n" +
                "- project-3: WordPress CMS Security Auditor\n" +
                "- project-4: Google Authenticator TOTP Client Portal\n" +
                "To search details on the UI, use the SEARCH input above.";
        break;
      case "skills":
        reply = "VERIFIED INVENTORY MATRIX:\n" +
                "- CORE SYSTEMS: Windows Server Active Directory, VMware ESXi, AWS Cloud, Docker\n" +
                "- NETWORKING: ICMP, TCP/IP, Port Mapping, DNS Records administration, SSL certificate layers\n" +
                "- ARCHIVING: Biometric verification, fast SQL & Firestore indexing, system security logging\n" +
                "- MULTIMEDIA: Adobe Premiere Pro, Photoshop CC, Meta Business Suite, Social platforms API";
        break;
      case "secret":
        reply = "   ______   __    __  ___     ___   .__   __. \n" +
                "  /  __  \\  |  |  |  | \\  \\   /  /   |  \\ |  | \n" +
                " |  |  |  | |  |  |  |  \\  \\_/  /    |   \\|  | \n" +
                " |  |  |  | |  |  |  |   \\   __/     |  . `  | \n" +
                " |  `--'  | |  `--'  |    |  |       |  |\\   | \n" +
                "  \\______/   \\______/     |__|       |__| \\__| \n" +
                "                                                \n" +
                "[SYSTEM ACCESS GRANTED] EASTER EGG SYNCHRONIZED. STAY CONNECTED.";
        break;
      default:
        reply = `Command not recognized: '${primaryCmd}'. Type 'help' to review directory of tools.`;
        isError = true;
    }

    setConsoleHistory(prev => [
      ...newHistory,
      {
        id: String(Date.now() + 1),
        type: isError ? "error" : "output",
        text: reply
      }
    ]);
  };

  return (
    <div className={`${isEmbedded ? "w-full" : "bg-bg-dark relative z-20 border-b border-white/[0.02] py-24 lg:py-32"} system-monitor-container`}>
      <div className={isEmbedded ? "w-full" : "max-w-7xl mx-auto px-6 md:px-16"}>
        
        {/* Label & Title */}
        {!isEmbedded && (
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-[1.5px] bg-gold" />
              <span className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-gold">
                04 — Interactive Control Panel
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-6xl lg:text-7xl leading-none">
              SYSTEM <span className="text-outline-gold font-bold">MONITORING</span>
            </h2>
            <p className="mt-4 text-muted-slate text-xs md:text-sm font-mono tracking-wide max-w-2xl leading-relaxed">
              Direct telemetry console validating system security integrity, server connection handshakes, and interactive shell logs auditing.
            </p>
          </div>
        )}

        {/* Master Control Board Card */}
        <div className="bg-[#0b0b12] border border-white/[0.05] rounded-[3px] shadow-2xl overflow-hidden min-h-[500px] flex flex-col w-full system-monitor-board">
          
          {/* Diagnostic Card Header */}
          <div className="bg-[#06060c] border-b border-white/[0.05] px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 system-monitor-header">
            
            {/* Server Identity Indicator */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="absolute -inset-1 rounded-full bg-emerald-500/15 animate-ping" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <div>
                <span className="font-mono text-[0.55rem] tracking-[0.2em] text-muted-slate block">HOST NODE</span>
                <span className="font-mono text-[0.65rem] tracking-wider text-text-primary uppercase font-bold">ayman-cyber-core // live</span>
              </div>
            </div>

            {/* Diagnostics Tabs */}
            <div className="flex items-center gap-1 bg-black/45 border border-white/[0.04] p-1 rounded-[2px] self-start md:self-auto system-diagnostic-tabs">
              <button
                onClick={() => setActiveTab("hud")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-[1.5px] font-mono text-[0.58rem] tracking-wider uppercase transition-all duration-300 ${
                  activeTab === "hud" 
                    ? "bg-gold/15 text-gold border border-gold/20 font-bold" 
                    : "text-muted-slate/85 hover:text-text-primary"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                SYS_HUD
              </button>
              <button
                onClick={() => setActiveTab("console")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-[1.5px] font-mono text-[0.58rem] tracking-wider uppercase transition-all duration-300 ${
                  activeTab === "console" 
                    ? "bg-gold/15 text-gold border border-gold/20 font-bold" 
                    : "text-muted-slate/85 hover:text-text-primary"
                }`}
              >
                <TerminalIcon className="w-3.5 h-3.5" />
                CMD_CONSOLE
              </button>
              <button
                onClick={() => setActiveTab("firewall")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-[1.5px] font-mono text-[0.58rem] tracking-wider uppercase transition-all duration-300 ${
                  activeTab === "firewall" 
                    ? "bg-gold/15 text-gold border border-gold/20 font-bold" 
                    : "text-muted-slate/85 hover:text-text-primary"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                FIREWALL_FEED
              </button>
            </div>
          </div>

          {/* Tab Content Envelop */}
          <div className="flex-1 p-5 md:p-8 flex flex-col justify-stretch relative">
            <AnimatePresence mode="wait">
              
              {/* Tab 1: Live HUD stats */}
              {activeTab === "hud" && (
                <motion.div
                  key="hud-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1 items-stretch"
                >
                  
                  {/* Metric 1: Network response stats */}
                  <div className="bg-black/35 border border-white/[0.04] p-5 rounded-[2px] flex flex-col justify-between system-stat-card">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-mono text-[0.55rem] tracking-[0.2em] text-gold uppercase">NETWORK HANDSHAKE</span>
                        <Wifi className="w-4 h-4 text-gold/60" />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <span className="font-mono text-[0.58rem] text-muted-slate block">CDN GATEWAY Latency</span>
                          <div className="flex items-baseline gap-2">
                            <span className="font-display font-bold text-2xl tracking-tight text-text-primary">{cdnLatency}</span>
                            <span className="font-mono text-[0.55rem] text-emerald-400 font-bold">MS // HEALTHY</span>
                          </div>
                        </div>
                        <div>
                          <span className="font-mono text-[0.58rem] text-muted-slate block">Database Index Lockout</span>
                          <div className="flex items-baseline gap-2">
                            <span className="font-display font-bold text-2xl tracking-tight text-text-primary">{dbLatency}</span>
                            <span className="font-mono text-[0.55rem] text-emerald-400 font-bold font-mono">MS // EXCELLENT</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-[0.5rem] tracking-widest text-[#a0a0ab]/40 block mt-6 uppercase border-t border-white/[0.04] pt-3">
                      PING TARGET: 8.8.8.8 / FIREBASE DB
                    </span>
                  </div>

                  {/* Metric 2: Server Capacity Tracker */}
                  <div className="bg-black/35 border border-white/[0.04] p-5 rounded-[2px] flex flex-col justify-between system-stat-card">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-mono text-[0.55rem] tracking-[0.2em] text-gold uppercase">CPU CORES LOAD</span>
                        <Cpu className="w-4 h-4 text-gold/60" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between font-mono text-[0.58rem] text-muted-slate">
                          <span>CORE EFFICIENCY</span>
                          <span>{cpuUsage}%</span>
                        </div>
                        <div className="w-full bg-[#14141f] h-[5px] rounded-full overflow-hidden border border-white/[0.03] system-progress-bg">
                          <motion.div 
                            className="bg-gold h-full rounded-full"
                            style={{ width: `${cpuUsage}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <span className="font-mono text-[0.52rem] text-muted-slate block leading-relaxed pt-2">
                          All 8 virtual core threads operating inside secure memory bounds. No bottleneck threads suspected.
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-[0.5rem] tracking-widest text-[#a0a0ab]/40 block mt-6 uppercase border-t border-white/[0.04] pt-3">
                      SYS POLLING: EVERY 3000MS
                    </span>
                  </div>

                  {/* Metric 3: Virtual Memory Capacity */}
                  <div className="bg-black/35 border border-white/[0.04] p-5 rounded-[2px] flex flex-col justify-between system-stat-card">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-mono text-[0.55rem] tracking-[0.2em] text-gold uppercase">SECURE SANDBOX RAM</span>
                        <Server className="w-4 h-4 text-gold/60" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between font-mono text-[0.58rem] text-muted-slate">
                          <span>USED FRAME MEMORY</span>
                          <span>{ramUsage} GB / 8.0 GB</span>
                        </div>
                        <div className="w-full bg-[#14141f] h-[5px] rounded-full overflow-hidden border border-white/[0.03] system-progress-bg">
                          <motion.div 
                            className="bg-gold/85 h-full rounded-full"
                            style={{ width: `${(ramUsage/8.0)*100}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <span className="font-mono text-[0.52rem] text-muted-slate block leading-relaxed pt-2">
                          Vite HMR module disabled. Standalone SPA build package running inside highly-isolated secure container stacks.
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-[0.5rem] tracking-widest text-[#a0a0ab]/40 block mt-6 uppercase border-t border-white/[0.04] pt-3">
                      RAM BUFFER STATS: PERSISTENT
                    </span>
                  </div>

                  {/* Metric 4: System Integration Core */}
                  <div className="bg-black/35 border border-white/[0.04] p-5 rounded-[2px] flex flex-col justify-between system-stat-card">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-mono text-[0.55rem] tracking-[0.2em] text-gold uppercase">INTEGRATION CONDUIT</span>
                        <Database className="w-4 h-4 text-gold/60" />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <span className="font-mono text-[0.58rem] text-muted-slate block">SYSTEM STATUS UPTIME</span>
                          <span className="font-display font-medium text-xl tracking-tight text-white uppercase block font-mono">{systemUptime}</span>
                        </div>
                        <div>
                          <span className="font-mono text-[0.58rem] text-muted-slate block">API DEPLOY STATE</span>
                          <span className="font-mono text-[0.55rem] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-[1px] font-bold inline-block border border-emerald-500/20">
                            ONLINE // STABLE
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-[0.5rem] tracking-widest text-[#a0a0ab]/40 block mt-6 uppercase border-t border-white/[0.04] pt-3">
                      ENGINE DEPLOY: CLOUD_RUN
                    </span>
                  </div>

                </motion.div>
              )}

              {/* Tab 2: Interactive UNIX Shell Console */}
              {activeTab === "console" && (
                <motion.div
                  key="console-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="bg-[#050508] border border-white/[0.04] rounded-[2px] p-4 flex flex-col h-[350px] system-terminal-panel"
                >
                  
                  {/* CLI Output history */}
                  <div className="flex-1 overflow-y-auto font-mono text-[0.62rem] leading-relaxed space-y-2 pr-2 scrollbar-thin select-text">
                    {consoleHistory.map((item) => (
                      <div 
                        key={item.id} 
                        className={`whitespace-pre-wrap ${
                          item.type === "input" 
                            ? "text-gold font-bold" 
                            : item.type === "error" 
                            ? "text-red-400" 
                            : item.type === "system" 
                            ? "text-[#8f8f9e]/50 font-bold italic" 
                            : "text-[#d1d1db] bg-white/[0.01] px-2 py-1 border-l border-white/[0.03] my-1"
                        }`}
                      >
                        {item.text}
                      </div>
                    ))}
                    <div ref={consoleBottomRef} />
                  </div>

                  {/* Input form */}
                  <form 
                    onSubmit={handleConsoleSubmit}
                    className="mt-3 pt-3 border-t border-white/[0.04] flex items-center gap-3 system-terminal-form"
                  >
                    <span className="font-mono text-[0.62rem] text-gold font-bold select-none whitespace-nowrap">
                      ayman@system-support-core:~$
                    </span>
                    <input
                      type="text"
                      value={consoleInput}
                      onChange={(e) => setConsoleInput(e.target.value)}
                      placeholder="Type a command (e.g. 'help', 'cat bio', 'ping', 'secret')..."
                      autoFocus
                      className="flex-1 bg-transparent border-none text-[0.62rem] text-white font-mono tracking-wide focus:outline-none placeholder:text-muted-slate/30 system-terminal-input"
                    />
                  </form>
                </motion.div>
              )}

              {/* Tab 3: Simulated dynamic Security Firewall feed */}
              {activeTab === "firewall" && (
                <motion.div
                  key="firewall-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col flex-1"
                >
                  <div className="flex items-center justify-between mb-4 bg-red-500/5 border border-red-500/10 px-4 py-2.5 rounded-[2px]">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
                      <span className="font-mono text-[0.58rem] tracking-wider text-rose-500 font-bold">
                        ZERO-TRUST SHIELD ACTIVATED // PUBLIC SECURITY AUDITING STREAM
                      </span>
                    </div>
                    <span className="font-mono text-[0.5rem] tracking-widest text-[#a0a0ab]/40 uppercase hidden sm:inline-block">
                      FIREWALL PORT FILTER: SECURE
                    </span>
                  </div>

                  {/* Live Feed Event Grid Ticker */}
                  <div className="bg-[#050508] border border-white/[0.04] rounded-[2px] overflow-y-auto h-[280px] p-2 pr-3 space-y-1 font-mono text-[0.6rem] select-text system-firewall-ticker">
                    {firewallLogs.map((log) => {
                      let sevColor = "text-[#a0a0ab]/60";
                      let bgBadge = "bg-white/5 text-[#a0a0ab]";
                      if (log.sev === "warning") {
                        sevColor = "text-yellow-400";
                        bgBadge = "bg-yellow-400/10 text-yellow-300 border border-yellow-400/20";
                      } else if (log.sev === "critical") {
                        sevColor = "text-rose-500 font-bold";
                        bgBadge = "bg-rose-500/15 text-rose-400 border border-rose-500/25";
                      } else if (log.sev === "success") {
                        sevColor = "text-emerald-400";
                        bgBadge = "bg-emerald-400/10 text-emerald-300 border border-emerald-400/20";
                      }

                      return (
                        <div 
                          key={log.id} 
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 hover:bg-white/[0.02] border-b border-white/[0.02] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-[#a0a0ab]/35 text-[0.55rem]">{log.time}</span>
                            <span className="text-gold font-bold min-w-[90px]">{log.ip}</span>
                            <span className={`font-mono text-[0.58rem] ${sevColor}`}>
                              {log.event}
                            </span>
                          </div>
                          <span className={`text-[0.48rem] px-2 py-0.5 rounded-[1px] font-bold uppercase self-start sm:self-auto ${bgBadge}`}>
                            {log.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
}
