import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronsLeftRight } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "BEFORE (LEGACY UI)",
  afterLabel = "AFTER (REDESIGN)"
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsPointerDown(true);
    setHasInteracted(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    handleMove(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDown) return;
    handleMove(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsPointerDown(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div id="before-after-slider-root" className="relative w-full flex flex-col gap-2 select-none">
      <div className="flex items-center justify-between font-mono text-[0.55rem] tracking-wider text-gold uppercase px-1">
        <span>INTERACTIVE REVISION COMPARATOR</span>
        <span className="text-[#a0a0ab]/60">Drag screen divider left / right</span>
      </div>

      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full aspect-video rounded-[3px] border border-white/[0.08] bg-[#0c0c14] overflow-hidden cursor-ew-resize group shadow-2xl touch-none"
      >
        {/* --- BEFORE IMAGE --- */}
        <img 
          id="slider-before-img"
          src={beforeImage} 
          alt="Legacy Design version" 
          referrerPolicy="no-referrer"
          className="absolute top-0 left-0 w-full h-full object-cover select-none pointer-events-none"
        />

        {/* --- AFTER IMAGE CONTAINER & IMAGE --- */}
        <div 
          id="slider-after-container"
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
        >
          <img 
            id="slider-after-img"
            src={afterImage} 
            alt="Redesigned Version" 
            referrerPolicy="no-referrer"
            className="absolute top-0 left-0 w-full h-full object-cover select-none pointer-events-none"
          />
        </div>

        {/* --- METADATA OVERLAYS --- */}
        {/* Legacy/Before Tag (Right Aligned to contrast when slider moves) */}
        {sliderPosition < 85 && (
          <div className="absolute right-4 top-4 bg-black/80 backdrop-blur-md px-2.5 py-1 border border-white/5 font-mono text-[0.48rem] tracking-widest text-[#ef4444] rounded-[1px] uppercase pointer-events-none z-10 transition-opacity duration-300">
            {beforeLabel}
          </div>
        )}

        {/* Redesign/After Tag (Left Aligned to contrast when slider moves) */}
        {sliderPosition > 15 && (
          <div className="absolute left-4 top-4 bg-gold/10 border border-gold/40 backdrop-blur-md px-2.5 py-1 font-mono text-[0.48rem] tracking-widest text-gold rounded-[1px] uppercase pointer-events-none z-10 transition-opacity duration-300">
            {afterLabel}
          </div>
        )}

        {/* --- VERTICAL DIVIDER LINE --- */}
        <div 
          id="slider-divider-line"
          className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-gold/30 via-gold to-gold/30 pointer-events-none z-20 shadow-[0_0_10px_rgba(212,175,55,0.5)]"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          {/* DRAG HANDLE BUTTON */}
          <div 
            id="slider-drag-handle"
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border bg-black/90 flex items-center justify-center shadow-3xl text-gold transition-transform duration-200 ${
              isPointerDown ? "scale-110 border-gold" : "scale-100 border-white/10 group-hover:border-gold/60"
            }`}
          >
            <ChevronsLeftRight className="w-4 h-4 text-gold shrink-0" />
          </div>
        </div>

        {/* --- INITIAL INSTRUCTION OVERLAY --- */}
        <AnimatePresence>
          {!hasInteracted && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 bottom-6 flex justify-center pointer-events-none z-10"
            >
              <div className="bg-black/85 border border-gold/15 px-3 py-1.5 rounded-[2px] font-mono text-[0.52rem] tracking-widest text-gold-light uppercase flex items-center gap-1.5 shadow-2xl animate-pulse">
                <span className="w-1 h-1 rounded-full bg-gold animate-ping" />
                Drag handle to slide revisions
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
