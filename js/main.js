/* ============================================
   Particle Canvas
   ============================================ */
(function () {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height, particles;
  const PARTICLE_COUNT = 50;

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.x += p.dx;
      p.y += p.dy;

      // Wrap around edges
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    resize();
  });

  resize();
  createParticles();
  draw();
})();

/* ============================================
   Typewriter Effect
   ============================================ */
(function () {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const titles = [
    'Pega Lead System Architect',
    'Kubernetes Engineer',
    'AWS Cloud Architect',
  ];

  let titleIndex = 0;
  let charIndex = 0;
  let deleting = false;
  const TYPING_SPEED = 80;
  const DELETING_SPEED = 40;
  const PAUSE_AFTER_TYPING = 2000;
  const PAUSE_AFTER_DELETING = 400;

  function tick() {
    const current = titles[titleIndex];

    if (!deleting) {
      el.textContent = current.substring(0, charIndex + 1);
      charIndex++;

      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, PAUSE_AFTER_TYPING);
        return;
      }
      setTimeout(tick, TYPING_SPEED);
    } else {
      el.textContent = current.substring(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        deleting = false;
        titleIndex = (titleIndex + 1) % titles.length;
        setTimeout(tick, PAUSE_AFTER_DELETING);
        return;
      }
      setTimeout(tick, DELETING_SPEED);
    }
  }

  tick();
})();

/* ============================================
   Scroll-triggered Fade-in (Intersection Observer)
   ============================================ */
(function () {
  const faders = document.querySelectorAll('.fade-in');
  if (!faders.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  faders.forEach((el) => observer.observe(el));
})();
