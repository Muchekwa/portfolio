/* ============================================
   AMBIENT "SCATTERPLOT" CANVAS
   A quiet nod to data viz: drifting points that
   connect when close, like a live correlation plot.
   ============================================ */
(function () {
  const canvas = document.getElementById('plot');
  if (!canvas) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const ctx = canvas.getContext('2d');
  let w, h, points;
  const COLORS = ['rgba(214,119,192,', 'rgba(167,24,95,', 'rgba(245,212,232,'];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function makePoints() {
    const count = Math.max(28, Math.min(60, Math.floor((w * h) / 38000)));
    points = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.6 + 0.8,
      c: COLORS[Math.floor(Math.random() * COLORS.length)]
    }));
  }

  function step() {
    ctx.clearRect(0, 0, w, h);

    for (const p of points) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }

    const maxDist = Math.min(160, w / 6);
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i], b = points[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.12;
          ctx.strokeStyle = `rgba(214,119,192,${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const p of points) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c + '0.85)';
      ctx.fill();
    }

    requestAnimationFrame(step);
  }

  resize();
  makePoints();
  step();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      makePoints();
    }, 200);
  });
})();

/* ============================================
   MOBILE NAV TOGGLE
   ============================================ */
(function () {
  const toggle = document.getElementById('navToggle');
  const navList = document.getElementById('navList');
  if (!toggle || !navList) return;

  toggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  navList.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navList.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ============================================
   ACTIVE NAV LINK ON SCROLL
   ============================================ */
(function () {
  const sections = document.querySelectorAll('main > section[id], main > #intro');
  const navLinks = document.querySelectorAll('.nav-list a');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { rootMargin: '-45% 0px -45% 0px' }
  );

  sections.forEach((section) => observer.observe(section));
})();

/* ============================================
   CONTACT FORM (Formspree fetch submit)
   ============================================ */
(function () {
  const form = document.getElementById('mutshe');
  const note = document.getElementById('formNote');
  const submitButton = form ? form.querySelector('button[type="submit"]') : null;

  if (!form || !note) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const originalButtonText = submitButton ? submitButton.textContent : 'Send message';
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }

    note.dataset.state = 'sending';
    note.textContent = 'Sending your message...';

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (response.ok) {
        form.reset();
        note.dataset.state = 'success';
        note.textContent = 'Thanks. Your message was sent successfully.';
      } else {
        note.dataset.state = 'error';
        note.textContent = 'Something went wrong. Please try again in a moment.';
      }
    } catch (error) {
      note.dataset.state = 'error';
      note.textContent = 'Could not reach the form service. Please try again.';
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
})();

