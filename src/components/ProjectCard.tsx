import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "motion/react";
import { Sparkles, ArrowUpRight, Github, ExternalLink, Clock, Maximize2, Info, X } from "lucide-react";
import { ProjectItem } from "../data";

interface ProjectCardProps {
  project: ProjectItem;
  spanClass: string;
  variants: any;
  key?: string;
  onExpand?: (project: ProjectItem) => void;
  layout?: boolean | string;
  initial?: any;
  animate?: any;
  whileInView?: any;
  viewport?: any;
  exit?: any;
  custom?: number;
}

export default function ProjectCard({
  project,
  spanClass,
  variants,
  onExpand,
  layout,
  initial,
  animate,
  whileInView,
  viewport,
  exit,
  custom
}: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Trigger brief subtle tap vibration feedback if supported
  const triggerHaptics = () => {
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(12);
      } catch (e) {
        // Ignored
      }
    }
  };

  // Motion values to track normal mouse coordinates (-0.5 to 0.5)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Map coordinate adjustments to degrees of rotation (subtle -10 to 10 degrees)
  const rotateX = useTransform(y, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-8, 8]);

  // Spring settings for super smooth transitions
  const springConfig = { damping: 20, stiffness: 150, mass: 0.6 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  // Dynamic radial gradient shine background corresponding to the mouse cursor position
  const shineBg = useTransform([x, y], ([latestX, latestY]) => {
    // Translate -0.5..0.5 space to percentage space 0%..100%
    const pctX = (Number(latestX) + 0.5) * 100;
    const pctY = (Number(latestY) + 0.5) * 100;
    return `radial-gradient(circle at ${pctX}% ${pctY}%, rgba(212, 175, 55, 0.12) 0%, transparent 65%)`;
  });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate cursor positions inside the card boundaries
    const mouseX = event.clientX - rect.left - width / 2;
    const mouseY = event.clientY - rect.top - height / 2;

    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const [showNotes, setShowNotes] = useState(false);

  // Reading time calculator: 200 words per minute / 3.3 words per second average
  const wordCount = project.description.split(/\s+/).filter(Boolean).length;
  const readTimeSeconds = Math.max(8, Math.round(wordCount * 0.4) + 6);

  // Combine parent variants with stagger properties for child staggered entrance
  const enhancedVariants = {
    hidden: { 
      ...(variants?.hidden || {}),
    },
    show: {
      ...(variants?.show || {}),
      transition: {
        ...(variants?.show?.transition || {}),
        staggerChildren: 0.08,
        delayChildren: 0.05,
      }
    },
    exit: variants?.exit
  };

  const childVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <motion.div
      ref={cardRef}
      variants={enhancedVariants}
      layout={layout}
      initial={initial}
      animate={animate}
      whileInView={whileInView}
      viewport={viewport}
      exit={exit}
      custom={custom}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", damping: 18, stiffness: 220 }}
      style={{
        rotateX: rotateXSpring,
        rotateY: rotateYSpring,
        transformStyle: "preserve-3d",
      }}
      className={`${spanClass} bg-bg-card border border-white/[0.06] hover:border-gold/90 p-8 rounded-[4px] relative group overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.25)] flex flex-col justify-between`}
    >
      {/* Top Border Hover Line */}
      <div 
        style={{ transform: "translateZ(12px)" }}
        className="absolute top-0 left-0 w-full h-[2.5px] bg-gradient-to-r from-gold to-transparent scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 z-40" 
      />

      {/* 3D layers inside the card leveraging preserve-3d */}
      
      {/* Dynamic Shine overlay */}
      <motion.div
        style={{
          background: shineBg,
          transform: "translateZ(10px)",
        }}
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      />

      {/* Backdrop overlay fallback glow */}
      <div 
        style={{ transform: "translateZ(5px)" }}
        className="absolute inset-0 bg-gradient-to-br from-gold/[0.015] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
      />
      
      <div style={{ transform: "translateZ(25px)" }} className="relative z-10 transition-transform duration-300">
        {/* Header Block */}
        <motion.div variants={childVariants} className="flex items-center justify-between mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[0.58rem] tracking-[0.18em] uppercase text-gold bg-gold/15 px-3 py-1 rounded-[1px] border border-gold/25">
              {project.category}
            </span>
            {project.beforeImage && project.afterImage && (
              <span className="font-mono text-[0.51rem] tracking-widest uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-[1px] border border-emerald-500/20">
                ★ BEFORE/AFTER
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Completion Status Progress Ring */}
            <div className="relative w-8 h-8 flex items-center justify-center shrink-0" title={`Completion Status: ${project.completionPercent ?? 100}%`}>
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background Track Circle */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  className="stroke-white/[0.08] fill-none"
                  strokeWidth="3.2"
                />
                {/* Animated Accent Line Arc */}
                <motion.circle
                  cx="18"
                  cy="18"
                  r="14"
                  className="stroke-gold fill-none"
                  strokeWidth="3.2"
                  strokeDasharray={`${2 * Math.PI * 14}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 14 }}
                  whileInView={{ strokeDashoffset: 2 * Math.PI * 14 - ((project.completionPercent ?? 100) / 100) * (2 * Math.PI * 14) }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute font-mono text-[0.52rem] text-text-primary group-hover:text-gold transition-colors duration-300 font-bold tracking-tighter">
                {project.completionPercent ?? 100}%
              </span>
            </div>

            {/* Info toggle button with larger touch target on mobile and haptic feedback */}
            {project.notes && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptics();
                  setShowNotes(!showNotes);
                }}
                className={`p-2.5 sm:p-1.5 min-w-[38px] min-h-[38px] sm:min-w-0 sm:min-h-0 rounded-full transition-all duration-300 interactive-cursor flex items-center justify-center border ${
                  showNotes 
                    ? "bg-gold/20 border-gold text-gold" 
                    : "bg-white/[0.03] border-white/[0.08] text-muted-slate hover:text-gold hover:border-gold/30 hover:bg-gold/5"
                }`}
                title="View Technical Notes"
                aria-label="View Technical Notes"
                style={{ transform: "translateZ(15px)" }}
              >
                <Info className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              </button>
            )}
            
            <Sparkles className="w-3.5 h-3.5 text-white/20 group-hover:text-gold transition-colors duration-300 shrink-0 select-none" />
          </div>
        </motion.div>

        {/* Technical Quick-Stats Bar & Reading Time */}
        <motion.div variants={childVariants} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.56rem] font-mono tracking-widest text-[#8a8a93] mb-4 border-b border-white/[0.04] pb-3 select-none">
          <span className="flex items-center gap-1">
            <span className="text-gold/50">YEAR:</span>
            <span className="text-text-primary font-medium">{project.year || "2025"}</span>
          </span>
          <span className="w-1 h-1 rounded-full bg-white/25" />
          <span className="flex items-center gap-1">
            <span className="text-gold/50">LEVEL:</span>
            <span className="text-text-primary font-medium">{project.complexity || "Medium"}</span>
          </span>
          <span className="w-1 h-1 rounded-full bg-white/25" />
          <span className="flex items-center gap-1 text-gold/90 bg-gold/[0.05] border border-gold/10 px-1.5 py-0.5 rounded-[1px]">
            <Clock className="w-2.5 h-2.5 mr-0.5 inline shrink-0" />
            <span>~{readTimeSeconds}s read</span>
          </span>
        </motion.div>

        {/* Project Title */}
        <motion.h3 
          variants={childVariants} 
          className="font-display text-xl sm:text-2xl font-bold tracking-wide text-text-primary mb-3 group-hover:text-gold transition-colors duration-300"
        >
          {project.title}
        </motion.h3>

        {/* Description text */}
        <motion.p 
          variants={childVariants} 
          className="text-xs text-muted-slate leading-relaxed font-serif mb-6 group-hover:text-muted-lavender transition-all duration-300"
        >
          {project.description}
        </motion.p>
      </div>

      <div style={{ transform: "translateZ(15px)" }} className="relative z-10 transition-transform duration-300">
        {/* Tools tag list */}
        <motion.div variants={childVariants} className="flex flex-wrap gap-1.5 mb-6">
          {project.tools.map((tool, idx) => (
            <span
              key={idx}
              className="font-mono text-[0.52rem] text-muted-slate bg-white/[0.02] border border-white/[0.06] px-2 py-0.5 rounded-[1px]"
            >
              {tool}
            </span>
          ))}
        </motion.div>

        {/* Bottom Actions Row */}
        <motion.div variants={childVariants} className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-4 border-t border-white/[0.04]">
          {/* Main Expand Button with subtle pulse animation and mobile touch target optimization */}
          <motion.button
            onClick={() => {
              triggerHaptics();
              onExpand?.(project);
            }}
            animate={{ 
              scale: [1, 1.03, 1],
              textShadow: ["0 0 0px rgba(212,175,55,0)", "0 0 4px rgba(212,175,55,0.45)", "0 0 0px rgba(212,175,55,0)"]
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-flex items-center gap-1.5 py-2.5 px-3.5 -my-2.5 -mx-3.5 font-mono text-[0.58rem] tracking-[0.16em] uppercase text-gold hover:text-text-primary transition-colors duration-300 group/link interactive-cursor border-b border-gold/30 hover:border-text-primary pb-0.5 whitespace-nowrap"
          >
            Expand Details
            <Maximize2 className="w-2.5 h-2.5 transition-transform duration-300 group-hover/link:scale-110" />
          </motion.button>

          {/* Dedicated inline GitHub icon shortcut */}
          {project.githubLink && (
            <a
              href={project.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-white/[0.03] hover:bg-gold/15 hover:text-gold border border-white/[0.08] hover:border-gold/30 rounded-[3px] text-muted-slate hover:scale-110 transition-all duration-300 interactive-cursor flex items-center justify-center shrink-0"
              title="Open GitHub Repository"
              aria-label="Open GitHub Repository"
              style={{ transform: "translateZ(8px)" }}
            >
              <Github className="w-3.5 h-3.5" />
            </a>
          )}

          {project.demoLink && (
            <a
              href={project.demoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-[0.58rem] tracking-[0.16em] uppercase text-text-primary hover:text-gold transition-colors duration-300 group/link interactive-cursor border-b border-white/10 hover:border-gold/50 pb-0.5"
            >
              {project.demoLinkText || "Live Demo"}
              <ArrowUpRight className="w-3" style={{ height: "12px", width: "12px" }} />
            </a>
          )}

          {project.releasesLink && (
            <a
              href={project.releasesLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-[0.58rem] tracking-[0.16em] uppercase text-text-primary hover:text-gold transition-colors duration-300 group/link interactive-cursor border-b border-white/10 hover:border-gold/50 pb-0.5"
            >
              {project.releasesLinkText || "Releases"}
              <ExternalLink className="w-3" style={{ height: "12px", width: "12px" }} />
            </a>
          )}
        </motion.div>
      </div>

      {/* Absolute Popover Overlay for detailed notes */}
      <AnimatePresence>
        {showNotes && project.notes && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            style={{ transform: "translateZ(30px)" }}
            className="absolute inset-0 bg-bg-card/98 backdrop-blur-md p-6 flex flex-col justify-between z-50 border border-gold/40 rounded-[4px]"
            onClick={(e) => e.stopPropagation()} // Prevent bubbling up and expanding detail modal
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4 select-none">
                <span className="font-mono text-[0.62rem] tracking-[0.2em] text-gold uppercase flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 animate-pulse" />
                  TECHNICAL NOTES // SPEC
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNotes(false);
                  }}
                  className="p-1 rounded-full text-muted-slate hover:text-text-primary hover:bg-white/[0.05] transition-colors interactive-cursor"
                  aria-label="Close notes"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-text-primary leading-relaxed font-sans overflow-y-auto max-h-[160px] pr-1 scrollbar-thin select-text">
                {project.notes}
              </p>
            </div>
            
            <div className="text-[0.55rem] font-mono text-muted-slate border-t border-white/[0.04] pt-3 flex justify-between select-none">
              <span>{project.title.toUpperCase()} SPEC</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotes(false);
                }}
                className="text-gold hover:underline font-bold uppercase tracking-wider"
              >
                Close Panel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
