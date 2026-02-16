/* ============================================
   Typewriter Effect
   ============================================ */
(function () {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const titles = [
    'Senior Application Developer',
    'Pega Certified Senior System Architect',
    'AWS Certified Solutions Architect',
  ];

  let titleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const current = titles[titleIndex];

    if (!deleting) {
      el.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, 2000);
        return;
      }
      setTimeout(tick, 80);
    } else {
      el.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        deleting = false;
        titleIndex = (titleIndex + 1) % titles.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, 40);
    }
  }

  tick();
})();

/* ============================================
   Scroll Fade-in (Intersection Observer)
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
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  faders.forEach((el) => observer.observe(el));
})();

/* ============================================
   Smooth scroll for quick-nav buttons
   ============================================ */
(function () {
  document.querySelectorAll('.quick-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const href = btn.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
})();
