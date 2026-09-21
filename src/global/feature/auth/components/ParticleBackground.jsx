import React, { useEffect, useRef } from "react";

export const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];
    let stars = [];

    const resize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      createStars();
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 1.8 + 0.8;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) {
          this.vx = -this.vx;
        }

        if (this.y < 0 || this.y > canvas.height) {
          this.vy = -this.vy;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        ctx.fillStyle = "rgba(255, 235, 248, 0.95)";
        ctx.shadowBlur = 14;
        ctx.shadowColor = "rgba(255, 170, 220, 0.95)";

        ctx.fill();

        ctx.shadowBlur = 0;
      }
    }

    const createStars = () => {
      stars = [];

      const starCount = Math.min(
        Math.floor((canvas.width * canvas.height) / 35000),
        45,
      );

      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.6,
          alpha: Math.random() * 0.5 + 0.5,
          speed: Math.random() * 0.02 + 0.01,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    const drawStar = (star, time) => {
      const twinkle =
        star.alpha +
        Math.sin(time * star.speed + star.phase) * 0.25;

      const alpha = Math.max(0.3, Math.min(1, twinkle));

      ctx.save();

      ctx.translate(star.x, star.y);

      ctx.shadowBlur = 14;
      ctx.shadowColor = `rgba(255, 193, 7, ${alpha})`;

      ctx.fillStyle = `rgba(255, 215, 90, ${alpha})`;

      ctx.beginPath();
      ctx.moveTo(0, -star.radius * 3);
      ctx.lineTo(star.radius * 0.8, -star.radius * 0.8);
      ctx.lineTo(star.radius * 3, 0);
      ctx.lineTo(star.radius * 0.8, star.radius * 0.8);
      ctx.lineTo(0, star.radius * 3);
      ctx.lineTo(-star.radius * 0.8, star.radius * 0.8);
      ctx.lineTo(-star.radius * 3, 0);
      ctx.lineTo(-star.radius * 0.8, -star.radius * 0.8);
      ctx.closePath();

      ctx.fill();

      ctx.restore();
    };

    window.addEventListener("resize", resize);
    resize();

    const particleCount = Math.min(
      Math.floor((canvas.width * canvas.height) / 15000),
      100,
    );

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();

            const opacity = 1 - distance / 150;

            ctx.strokeStyle = `rgba(255, 225, 242, ${
              opacity * 0.45
            })`;

            ctx.lineWidth = 0.8;

            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      stars.forEach((star) => {
        drawStar(star, time);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
    />
  );
};
