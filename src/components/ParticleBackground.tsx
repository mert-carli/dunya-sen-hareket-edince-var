import { useEffect, useRef } from 'react';

export function ParticleBackground({ intensity = 1 }: { intensity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let animId: number;
    let particles: Array<{
      x: number; y: number; vx: number; vy: number;
      alpha: number; size: number; life: number; maxLife: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const spawn = () => {
      const count = Math.floor(80 * intensity);
      while (particles.length < count) {
        const maxLife = 200 + Math.random() * 300;
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -Math.random() * 0.6 - 0.1,
          alpha: 0,
          size: Math.random() * 2 + 0.5,
          life: 0,
          maxLife,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      spawn();

      particles = particles.filter(p => p.life < p.maxLife);

      particles.forEach(p => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        const progress = p.life / p.maxLife;
        p.alpha = progress < 0.2
          ? progress / 0.2
          : progress > 0.8
          ? (1 - progress) / 0.2
          : 1;

        ctx.save();
        ctx.globalAlpha = p.alpha * 0.5;
        const color = intensity > 0.5
          ? `rgba(212, 175, 55, ${p.alpha})`
          : `rgba(180, 180, 200, ${p.alpha})`;
        ctx.fillStyle = color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="particles"
      style={{ position: 'fixed', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}
    />
  );
}
