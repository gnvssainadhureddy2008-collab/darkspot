import { useEffect, useRef } from "react";

/**
 * A live particle intelligence sphere. Pure canvas — no external assets.
 * Rotates slowly, drifts toward the pointer, and renders a soft violet core.
 */
export default function IntelligenceSphere({ className = "" }) {
  const canvasRef = useRef(null);
  const pointer = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let frame = 0;

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const COUNT = 168;
    const points = Array.from({ length: COUNT }, (_, i) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      return {
        x: Math.cos(theta) * Math.sin(phi),
        y: Math.sin(theta) * Math.sin(phi),
        z: Math.cos(phi),
        size: 0.7 + Math.random() * 1.6,
      };
    });

    const onPointerMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      pointer.current.targetX = Math.max(-1, Math.min(1, (event.clientX - cx) / (rect.width * 0.9)));
      pointer.current.targetY = Math.max(-1, Math.min(1, (event.clientY - cy) / (rect.height * 0.9)));
    };

    const project = (point, rotationX, rotationY, radius, cx, cy) => {
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);
      const x1 = point.x * cosY - point.z * sinY;
      const z1 = point.x * sinY + point.z * cosY;
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);
      const y1 = point.y * cosX - z1 * sinX;
      const z2 = point.y * sinX + z1 * cosX;
      const perspective = 1 / (2.6 - z2 * 0.72);
      return { x: cx + x1 * radius * perspective, y: cy + y1 * radius * perspective, z: z2, depth: perspective };
    };

    const draw = (time) => {
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.35;
      const t = reduced ? 0 : time / 1000;

      pointer.current.x += (pointer.current.targetX - pointer.current.x) * 0.045;
      pointer.current.y += (pointer.current.targetY - pointer.current.y) * 0.045;

      ctx.clearRect(0, 0, width, height);

      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.5);
      core.addColorStop(0, "rgba(128,101,255,0.30)");
      core.addColorStop(0.42, "rgba(57,139,255,0.10)");
      core.addColorStop(1, "rgba(7,9,18,0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.55, 0, Math.PI * 2);
      ctx.fill();

      const rotationY = t * 0.16 + pointer.current.x * 0.5;
      const rotationX = Math.sin(t * 0.22) * 0.16 + pointer.current.y * 0.32;
      const projected = points.map((point) => project(point, rotationX, rotationY, radius, cx, cy));

      for (let i = 0; i < projected.length; i += 1) {
        for (let j = i + 1; j < projected.length; j += 1) {
          const a = projected[i];
          const b = projected[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.hypot(dx, dy);
          if (distance > radius * 0.28) continue;
          const alpha = (1 - distance / (radius * 0.28)) * 0.16 * ((a.z + b.z) / 2 + 1);
          ctx.strokeStyle = `rgba(160,150,255,${Math.max(0, alpha)})`;
          ctx.lineWidth = 0.55;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      projected.forEach((point, index) => {
        const bright = (point.z + 1) / 2;
        const dotAlpha = 0.22 + bright * 0.7;
        const size = points[index].size * (0.7 + bright * 1.2);
        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fillStyle =
          bright > 0.62 ? `rgba(214,205,255,${dotAlpha})` : `rgba(128,101,255,${dotAlpha * 0.9})`;
        ctx.fill();
      });

      const ringRadius = radius * 1.28;
      ctx.strokeStyle = "rgba(128,101,255,0.16)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, ringRadius, ringRadius * 0.32, Math.sin(t * 0.2) * 0.25, 0, Math.PI * 2);
      ctx.stroke();

      const sweep = (t * 0.55) % (Math.PI * 2);
      const sweepX = cx + Math.cos(sweep) * ringRadius;
      const sweepY = cy + Math.sin(sweep) * ringRadius * 0.32;
      const halo = ctx.createRadialGradient(sweepX, sweepY, 0, sweepX, sweepY, 26);
      halo.addColorStop(0, "rgba(200,190,255,0.85)");
      halo.addColorStop(1, "rgba(128,101,255,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(sweepX, sweepY, 26, 0, Math.PI * 2);
      ctx.fill();

      if (!reduced) frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-6 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" aria-hidden="true" />
      <canvas ref={canvasRef} className="relative h-full w-full" aria-hidden="true" />
    </div>
  );
}