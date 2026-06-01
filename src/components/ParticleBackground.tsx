import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  o: number;
}

export default function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Initialize particles
    const initParticles = (w: number, h: number) => {
      particles = [];
      // Lower density ceiling for optimal background performance and cleaner aesthetic
      const density = Math.min(40, Math.floor((w * h) / 32000));
      for (let i = 0; i < density; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 0.8 + 0.3,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          o: Math.random() * 0.4 + 0.1,
        });
      }
    };

    // Draw and update loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Move and draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around bounds
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 169, 110, ${p.o})`;
        ctx.fill();
      });

      // Draw lines between nearby particles using fast early-out checks
      const maxDistance = 110;
      const maxDistanceSq = maxDistance * maxDistance;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          // Simple horizontal delta check first to fast-fail far particles
          if (Math.abs(dx) > maxDistance) continue;

          const dy = p1.y - p2.y;
          // Vertical delta check next
          if (Math.abs(dy) > maxDistance) continue;

          // Squared distance comparison to bypass Math.sqrt
          const distSq = dx * dx + dy * dy;
          if (distSq < maxDistanceSq) {
            const d = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            // Higher opacity for closer nodes
            const opacity = 0.08 * (1 - d / maxDistance);
            ctx.strokeStyle = `rgba(200, 169, 110, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Use ResizeObserver to safely update size and re-initialize
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width: entryWidth, height: entryHeight } = entries[0].contentRect;

      width = canvas.width = entryWidth;
      height = canvas.height = entryHeight;

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        initParticles(width, height);
      }, 100);
    });

    resizeObserver.observe(container);

    // Initial setup and trigger particle animation loop
    render();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, []);

  return (
    <div
      id="particles-container"
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
    >
      <canvas
        id="particles-canvas"
        ref={canvasRef}
        className="block w-full h-full opacity-60"
      />
    </div>
  );
}
