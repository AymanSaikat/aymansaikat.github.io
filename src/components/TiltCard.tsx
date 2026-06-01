import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  variants?: any;
  maxRotation?: number;
  useShine?: boolean;
  shineColor?: string;
  onClick?: () => void;
  id?: string;
  key?: React.Key;
  showTopHoverLine?: boolean;
}

export default function TiltCard({
  children,
  className = "",
  variants,
  maxRotation = 8,
  useShine = true,
  shineColor = "rgba(212, 175, 55, 0.12)",
  onClick,
  id,
  showTopHoverLine = false,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values to track normalized coordinates (-0.5 to 0.5)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Map mouse coordinates to rotation values
  const rotateX = useTransform(y, [-0.5, 0.5], [maxRotation, -maxRotation]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-maxRotation, maxRotation]);

  // Spring animations for a super smooth butter-like movement
  const springConfig = { damping: 20, stiffness: 150, mass: 0.6 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  // Dynamic radial gradient shine background corresponding to the mouse cursor position
  const shineBg = useTransform([x, y], ([latestX, latestY]) => {
    const pctX = (Number(latestX) + 0.5) * 100;
    const pctY = (Number(latestY) + 0.5) * 100;
    return `radial-gradient(circle at ${pctX}% ${pctY}%, ${shineColor} 0%, transparent 65%)`;
  });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = event.clientX - rect.left - width / 2;
    const mouseY = event.clientY - rect.top - height / 2;

    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      id={id}
      ref={cardRef}
      variants={variants}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX: rotateXSpring,
        rotateY: rotateYSpring,
        transformStyle: "preserve-3d",
      }}
      className={`${className} group relative overflow-hidden transition-colors duration-500`}
    >
      {/* Top Border Hover Line */}
      {showTopHoverLine && (
        <div
          style={{ transform: "translateZ(12px)" }}
          className="absolute top-0 left-0 w-full h-[2.5px] bg-gradient-to-r from-gold to-transparent scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 z-40"
        />
      )}

      {/* Glow overlay */}
      {useShine && (
        <motion.div
          style={{
            background: shineBg,
            transform: "translateZ(10px)",
          }}
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-30"
        />
      )}

      {/* Internal interactive-cursor support wrapper */}
      <div 
        style={{ transform: "translateZ(20px)" }} 
        className="relative z-10 w-full h-full"
      >
        {children}
      </div>
    </motion.div>
  );
}
