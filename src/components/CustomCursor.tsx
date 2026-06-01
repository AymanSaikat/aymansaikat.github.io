import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isVisibleRef = useRef(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      // Coarse pointer means a touch screen or remote without precise mouse capability,
      // and checking for !fine ensures we only hide on touch-only environments like mobile phones or tablets
      const isCoarseTouchOnly = window.matchMedia("(pointer: coarse)").matches && 
                                !window.matchMedia("(pointer: fine)").matches;
      const isSmallScreen = window.innerWidth < 768; // mobile screens
      setIsMobileDevice(isCoarseTouchOnly || isSmallScreen);
    };

    checkViewport();
    window.addEventListener("resize", checkViewport, { passive: true });
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  useEffect(() => {
    if (isMobileDevice) {
      return;
    }

    const mousePos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      isVisibleRef.current = true;
      setIsVisible(true);
    };

    // Listen for hovering over interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      const isInteractive =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.style.cursor === "pointer" ||
        target.classList.contains("interactive-cursor");

      setIsHovered(!!isInteractive);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mouseover", handleMouseOver, { passive: true });

    let animationFrameId: number;

    const animate = () => {
      const dot = dotRef.current;
      const ring = ringRef.current;

      if (dot && ring) {
        // Regular speed for core pointer
        dot.style.transform = `translate3d(${mousePos.x}px, ${mousePos.y}px, 0) translate(-50%, -50%)`;

        // Spring easing for secondary ring
        const ease = 0.15;
        ringPos.x += (mousePos.x - ringPos.x) * ease;
        ringPos.y += (mousePos.y - ringPos.y) * ease;
        ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mouseover", handleMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobileDevice]);

  if (isMobileDevice) {
    return null;
  }

  return (
    <>
      {/* Central gold solid dot */}
      <div
        id="cursor-dot"
        ref={dotRef}
        style={{ pointerEvents: "none", zIndex: 9999 }}
        className={`fixed top-0 left-0 bg-gold rounded-full transition-[width,height,background-color,opacity] duration-200 ease-out mix-blend-difference pointer-events-none ${
          isVisible ? "opacity-100" : "opacity-0"
        } ${
          isHovered ? "w-5 h-5 bg-gold-light" : "w-2.5 h-2.5"
        }`}
      />
      {/* Outer easing ring */}
      <div
        id="cursor-ring"
        ref={ringRef}
        style={{ pointerEvents: "none", zIndex: 9998 }}
        className={`fixed top-0 left-0 border rounded-full transition-[width,height,border-color,background-color,opacity] duration-300 ease-out pointer-events-none ${
          isVisible ? "opacity-100" : "opacity-0"
        } ${
          isHovered
            ? "w-14 h-14 border-gold bg-gold/5"
            : "w-9 h-9 border-gold/50"
        }`}
      />
    </>
  );
}
