/* ══════════════════════════════════════════════════════════
   Three.js Gold Star Background — Scroll-Reactive Particles
   Shared across all pages
   ══════════════════════════════════════════════════════════ */

(function initScrollBackground() {
  'use strict';

  // Don't run if Three.js isn't available
  if (typeof THREE === 'undefined') return;

  // ── Create fullscreen canvas ──
  const canvas = document.createElement('canvas');
  canvas.id = 'scrollBgCanvas';
  canvas.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    z-index: 0; pointer-events: none;
  `;
  document.body.insertBefore(canvas, document.body.firstChild);

  // ── Three.js Setup ──
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // ── Gold Star Particles ──
  const STAR_COUNT = 300;
  const positions = new Float32Array(STAR_COUNT * 3);
  const sizes = new Float32Array(STAR_COUNT);
  const opacities = new Float32Array(STAR_COUNT);
  const speeds = new Float32Array(STAR_COUNT);

  for (let i = 0; i < STAR_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;      // x
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;  // y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 15;  // z
    sizes[i] = Math.random() * 3 + 0.5;
    opacities[i] = Math.random() * 0.6 + 0.1;
    speeds[i] = Math.random() * 0.5 + 0.2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  // ── Custom Shader Material for gold stars ──
  const vertexShader = `
    attribute float size;
    varying float vOpacity;
    uniform float uTime;
    uniform float uScrollY;

    void main() {
      vec3 pos = position;

      // Gentle floating motion
      pos.x += sin(uTime * 0.3 + position.y * 0.5) * 0.15;
      pos.y += cos(uTime * 0.2 + position.x * 0.4) * 0.1;

      // Scroll-reactive movement — stars drift upward as user scrolls
      pos.y += uScrollY * 0.003;

      // Wrap stars that go off screen
      pos.y = mod(pos.y + 10.0, 20.0) - 10.0;
      pos.x = mod(pos.x + 10.0, 20.0) - 10.0;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      gl_PointSize = size * (200.0 / -mvPosition.z);

      // Fade based on depth
      vOpacity = smoothstep(-8.0, -1.0, mvPosition.z) * 0.5;
    }
  `;

  const fragmentShader = `
    varying float vOpacity;
    uniform float uTime;

    void main() {
      // Star shape — distance from center
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);

      // Soft glow circle
      float alpha = smoothstep(0.5, 0.0, dist) * vOpacity;

      // Cross/star sparkle effect
      float cross = smoothstep(0.04, 0.0, abs(center.x)) * smoothstep(0.3, 0.0, abs(center.y));
      cross += smoothstep(0.04, 0.0, abs(center.y)) * smoothstep(0.3, 0.0, abs(center.x));
      cross *= 0.4;

      // Gold color with slight shimmer
      float shimmer = sin(uTime * 2.0 + gl_FragCoord.x * 0.01) * 0.1 + 0.9;
      vec3 goldColor = vec3(0.788, 0.659, 0.298) * shimmer; // #c9a84c
      vec3 lightGold = vec3(0.878, 0.784, 0.447);           // #e0c872

      vec3 color = mix(goldColor, lightGold, cross);
      alpha = max(alpha, cross * vOpacity * 0.8);

      // Twinkle
      float twinkle = sin(uTime * 3.0 + gl_FragCoord.y * 0.1) * 0.15 + 0.85;
      alpha *= twinkle;

      if (alpha < 0.01) discard;
      gl_FragColor = vec4(color, alpha);
    }
  `;

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uScrollY: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const stars = new THREE.Points(geometry, material);
  scene.add(stars);

  // ── Larger Accent Diamonds (fewer, bigger, slower) ──
  const DIAMOND_COUNT = 15;
  const dPositions = new Float32Array(DIAMOND_COUNT * 3);
  const dSizes = new Float32Array(DIAMOND_COUNT);

  for (let i = 0; i < DIAMOND_COUNT; i++) {
    dPositions[i * 3] = (Math.random() - 0.5) * 16;
    dPositions[i * 3 + 1] = (Math.random() - 0.5) * 16;
    dPositions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
    dSizes[i] = Math.random() * 6 + 3;
  }

  const dGeometry = new THREE.BufferGeometry();
  dGeometry.setAttribute('position', new THREE.BufferAttribute(dPositions, 3));
  dGeometry.setAttribute('size', new THREE.BufferAttribute(dSizes, 1));

  const diamondVertexShader = `
    attribute float size;
    varying float vOpacity;
    uniform float uTime;
    uniform float uScrollY;

    void main() {
      vec3 pos = position;
      pos.x += sin(uTime * 0.15 + position.z) * 0.3;
      pos.y += cos(uTime * 0.12 + position.x) * 0.2;
      pos.y += uScrollY * 0.002;
      pos.y = mod(pos.y + 8.0, 16.0) - 8.0;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      gl_PointSize = size * (200.0 / -mvPosition.z);
      vOpacity = smoothstep(-6.0, -1.0, mvPosition.z) * 0.25;
    }
  `;

  const diamondFragShader = `
    varying float vOpacity;
    uniform float uTime;

    void main() {
      vec2 uv = gl_PointCoord - vec2(0.5);

      // Diamond shape (rotated square)
      float diamond = abs(uv.x) + abs(uv.y);
      float alpha = smoothstep(0.5, 0.35, diamond) * vOpacity;

      // Inner glow
      float inner = smoothstep(0.3, 0.0, diamond);
      alpha = max(alpha, inner * vOpacity * 0.5);

      float pulse = sin(uTime * 1.5 + gl_FragCoord.x * 0.005) * 0.1 + 0.9;
      vec3 color = vec3(0.788, 0.659, 0.298) * pulse;

      if (alpha < 0.01) discard;
      gl_FragColor = vec4(color, alpha);
    }
  `;

  const dMaterial = new THREE.ShaderMaterial({
    vertexShader: diamondVertexShader,
    fragmentShader: diamondFragShader,
    uniforms: {
      uTime: { value: 0 },
      uScrollY: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const diamonds = new THREE.Points(dGeometry, dMaterial);
  scene.add(diamonds);

  // ── Scroll Tracking ──
  let scrollY = 0;
  let targetScrollY = 0;

  window.addEventListener('scroll', () => {
    targetScrollY = window.scrollY;
  }, { passive: true });

  // ── Mouse Parallax (subtle) ──
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // ── Animation Loop ──
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    // Smooth scroll lerp
    scrollY += (targetScrollY - scrollY) * 0.05;

    // Update uniforms
    material.uniforms.uTime.value = elapsed;
    material.uniforms.uScrollY.value = scrollY;
    dMaterial.uniforms.uTime.value = elapsed;
    dMaterial.uniforms.uScrollY.value = scrollY;

    // Subtle camera sway from mouse
    camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 0.2 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    // Slow rotation of the entire star field
    stars.rotation.z = elapsed * 0.02;
    diamonds.rotation.z = -elapsed * 0.01;

    renderer.render(scene, camera);
  }
  animate();

  // ── Resize Handler ──
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

})();
