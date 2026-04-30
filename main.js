/* ═══════════════════════════════════════════════
   LUMIÈRE — Interior Architecture & Design
   main.js
   Requires: Three.js (loaded via CDN in index.html)
═══════════════════════════════════════════════ */

(function () {

  /* ──────────────────────────────
     DEVICE PERFORMANCE DETECTION
  ────────────────────────────── */
  const isLowEnd =
    window.innerWidth < 768 ||
    navigator.hardwareConcurrency <= 4 ||
    (navigator.deviceMemory && navigator.deviceMemory <= 4);

  /* ──────────────────────────────
     MOUSE PARALLAX (for camera)
  ────────────────────────────── */
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  let camX = 0;
  let camY = 0;
  // SCROLL CAMERA
let scrollProgress = 0;
let scrollSmooth = 0;

window.addEventListener('scroll', () => {
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  scrollProgress = window.scrollY / maxScroll;
});

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    targetX = (mouseX / window.innerWidth - 0.5) * 1.2;
    targetY = (mouseY / window.innerHeight - 0.5) * 0.8;
  });

  /* ──────────────────────────────
     CUSTOM CURSOR
  ────────────────────────────── */
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');

  const hasCursor = cursor && ring;

  if (hasCursor) {

    if (isLowEnd) {
      cursor.style.display = 'none';
      ring.style.display = 'none';
    } else {

      let mx = 0, my = 0, rx = 0, ry = 0;

      document.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
      });

      (function animCursor() {
        cursor.style.left = mx + 'px';
        cursor.style.top = my + 'px';

        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;

        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';

        requestAnimationFrame(animCursor);
      })();
    }
  }

  /* ──────────────────────────────
     STICKY NAV
  ────────────────────────────── */
  const nav = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  /* ──────────────────────────────
     THREE.JS SETUP
  ────────────────────────────── */
  const canvas = document.getElementById('three-canvas');

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });

  renderer.setPixelRatio(isLowEnd ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 18;

  const goldColor = new THREE.Color(0xc9a55a);

  /* ──────────────────────────────
     FLOATING OBJECTS
  ────────────────────────────── */
  const objects = [];

  const geometries = [
    new THREE.OctahedronGeometry(1.2),
    new THREE.TetrahedronGeometry(1.1),
    new THREE.BoxGeometry(1.4, 1.4, 1.4),
    new THREE.IcosahedronGeometry(1.1)
  ];

  const count = isLowEnd ? 10 : 22;

  for (let i = 0; i < count; i++) {

    const geom = geometries[i % geometries.length];

    const mat = new THREE.MeshBasicMaterial({
      color: goldColor,
      wireframe: Math.random() > 0.5,
      transparent: true,
      opacity: 0.05 + Math.random() * 0.15
    });

    const mesh = new THREE.Mesh(geom, mat);

    const r = 6 + Math.random() * 10;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    mesh.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta) * 0.6,
      r * Math.cos(phi) - 5
    );

    const s = 0.4 + Math.random() * 1.6;
    mesh.scale.setScalar(s);

    const speed = (Math.random() * 0.003) * (Math.random() > 0.5 ? 1 : -1);
    const speedY = (Math.random() * 0.002) * (Math.random() > 0.5 ? 1 : -1);

    objects.push({
      mesh,
      speed,
      speedY,
      floatOffset: Math.random() * Math.PI * 2,
      floatSpeed: 0.002 + Math.random() * 0.003
    });

    scene.add(mesh);
  }

  /* ──────────────────────────────
     PARTICLES
  ────────────────────────────── */
  const particleGeo = new THREE.BufferGeometry();
  const pCount = isLowEnd ? 100 : 280;

  const pPos = new Float32Array(pCount * 3);

  for (let i = 0; i < pCount; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 40;
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 22;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

  const particles = new THREE.Points(
    particleGeo,
    new THREE.PointsMaterial({
      color: 0xc9a55a,
      size: 0.06,
      transparent: true,
      opacity: 0.35
    })
  );

  scene.add(particles);

  /* ──────────────────────────────
     ANIMATION LOOP
  ────────────────────────────── */
  let t = 0;
  let lastFrame = 0;
  const targetFPS = isLowEnd ? 30 : 60;
  const frameInterval = 1000 / targetFPS;

  function animate(now = 0) {

    requestAnimationFrame(animate);

    if (now - lastFrame < frameInterval) return;
    lastFrame = now;

    t += isLowEnd ? 0.008 : 0.012;

    // Smooth scroll easing
// Smooth scroll
scrollSmooth += (scrollProgress - scrollSmooth) * 0.05;

// Mouse
camX += (targetX - camX) * 0.04;
camY += (targetY - camY) * 0.04;

// 🔥 STRONG CINEMATIC EFFECT (VISIBLE)
const zBase = 18 - scrollSmooth * 20;   // BIG zoom
const yBase = scrollSmooth * 10;        // BIG lift
const rotY  = scrollSmooth * 1.2;       // noticeable rotation

camera.position.x = camX * 1.5;
camera.position.y = yBase - camY * 1.2;
camera.position.z = zBase;

camera.rotation.y = rotY;

camera.lookAt(0, yBase * 0.2, 0);

    for (let i = 0; i < objects.length; i++) {
      const o = objects[i];

      o.mesh.rotation.x += o.speed;
      o.mesh.rotation.y += o.speedY;

      o.mesh.position.y += Math.sin(t + o.floatOffset) * o.floatSpeed;
    }

    if (!isLowEnd) {
      particles.rotation.y += 0.0003;
      particles.rotation.x += 0.0001;
    }

    renderer.render(scene, camera);
  }

  animate();

  /* ──────────────────────────────
     SCROLL REVEAL
  ────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ──────────────────────────────
     COUNT UP
  ────────────────────────────── */
  const counters = document.querySelectorAll('[data-count]');

  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;

      const el = e.target;
      const target = parseInt(el.dataset.count);
      const start = performance.now();
      const dur = 1800;

      function step(now) {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(p * target);
        if (p < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
      countObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => countObserver.observe(c));

  /* ──────────────────────────────
     TILT CARDS (simple)
  ────────────────────────────── */
  if (!isLowEnd) {
    document.querySelectorAll('.tilt-card').forEach(card => {

      let last = 0;

      card.addEventListener('mousemove', e => {
        const now = performance.now();
        if (now - last < 16) return;
        last = now;

        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        card.style.transform =
          `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateY(0) rotateX(0) scale(1)';
      });

    });
  }

})();
