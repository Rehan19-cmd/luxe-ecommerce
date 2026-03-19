/* ══════════════════════════════════════════════════════════
   Three.js Hero — Elegant 3D Diamond / Crystal
   ══════════════════════════════════════════════════════════ */

(function initThreeHero() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 5);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // ── Lighting ──
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffecd2, 1.5);
  keyLight.position.set(5, 5, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xc9a84c, 0.8);
  fillLight.position.set(-5, 3, 2);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
  rimLight.position.set(0, -3, -5);
  scene.add(rimLight);

  const pointLight1 = new THREE.PointLight(0xc9a84c, 2, 15);
  pointLight1.position.set(3, 2, 3);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xe0c872, 1.5, 15);
  pointLight2.position.set(-3, -1, 2);
  scene.add(pointLight2);

  // ── Diamond / Gem geometry ──
  // A beautiful octahedron-based diamond shape
  const group = new THREE.Group();

  // Main diamond body – octahedron
  const diamondGeo = new THREE.OctahedronGeometry(1.2, 0);
  const diamondMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.0,
    roughness: 0.0,
    transmission: 0.95,
    ior: 2.42,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    envMapIntensity: 3,
    transparent: true,
    opacity: 0.9,
  });

  const diamond = new THREE.Mesh(diamondGeo, diamondMat);
  diamond.scale.set(1, 1.3, 1);
  group.add(diamond);

  // Inner glow sphere
  const glowGeo = new THREE.SphereGeometry(0.5, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xc9a84c,
    transparent: true,
    opacity: 0.15,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  group.add(glow);

  // Wireframe overlay
  const wireGeo = new THREE.OctahedronGeometry(1.25, 1);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xc9a84c,
    wireframe: true,
    transparent: true,
    opacity: 0.08,
  });
  const wire = new THREE.Mesh(wireGeo, wireMat);
  wire.scale.set(1, 1.3, 1);
  group.add(wire);

  // Floating particles around the diamond
  const particleCount = 200;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const particleSizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 2 + Math.random() * 3;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    particleSizes[i] = Math.random() * 2 + 0.5;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

  const particleMat = new THREE.PointsMaterial({
    color: 0xc9a84c,
    size: 0.02,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  group.add(particles);

  // Orbiting ring
  const ringGeo = new THREE.TorusGeometry(2, 0.005, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xc9a84c,
    transparent: true,
    opacity: 0.3,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 3;
  group.add(ring);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.3, 0.003, 16, 100),
    new THREE.MeshBasicMaterial({ color: 0xe0c872, transparent: true, opacity: 0.15 })
  );
  ring2.rotation.x = Math.PI / 2.5;
  ring2.rotation.y = Math.PI / 4;
  group.add(ring2);

  scene.add(group);

  // ── Mouse interaction ──
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ── Animate ──
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.005;

    // Smooth rotation
    group.rotation.y += 0.003;
    group.rotation.x = Math.sin(time) * 0.1;

    // Mouse-driven subtle rotation
    group.rotation.y += (mouseX * 0.3 - group.rotation.y) * 0.02;
    group.rotation.x += (-mouseY * 0.2 - group.rotation.x) * 0.02;

    // Inner glow pulsation
    const pulse = 0.12 + Math.sin(time * 3) * 0.06;
    glow.material.opacity = pulse;
    glow.scale.setScalar(0.5 + Math.sin(time * 2) * 0.1);

    // Wireframe slow rotation
    wire.rotation.y -= 0.002;
    wire.rotation.z += 0.001;

    // Particles orbit
    particles.rotation.y += 0.001;
    particles.rotation.x += 0.0005;

    // Rings orbit
    ring.rotation.z += 0.002;
    ring2.rotation.z -= 0.0015;

    // Point lights orbit
    pointLight1.position.x = Math.sin(time * 1.5) * 4;
    pointLight1.position.z = Math.cos(time * 1.5) * 4;
    pointLight2.position.x = Math.cos(time * 1.2) * 3;
    pointLight2.position.z = Math.sin(time * 1.2) * 3;

    renderer.render(scene, camera);
  }

  animate();

  // ── Resize ──
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
