/* ══════════════════════════════════════════════════════════
   Three.js Hero — Enhanced 3D Diamond with sparkle effects
   Premium interactive crystal with brilliance & reflections
   ══════════════════════════════════════════════════════════ */

(function initThreeHero() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  // ── Scene Setup ────────────────────────────────────────
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 5);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;

  // ── Enhanced Lighting (increased brilliance) ──────────
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffecd2, 2.0);
  keyLight.position.set(5, 5, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xc9a84c, 1.0);
  fillLight.position.set(-5, 3, 2);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.7);
  rimLight.position.set(0, -3, -5);
  scene.add(rimLight);

  // Extra accent light for more sparkle
  const accentLight = new THREE.DirectionalLight(0xf5e066, 0.6);
  accentLight.position.set(2, -2, 4);
  scene.add(accentLight);

  const pointLight1 = new THREE.PointLight(0xc9a84c, 2.5, 18);
  pointLight1.position.set(3, 2, 3);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xe0c872, 2.0, 18);
  pointLight2.position.set(-3, -1, 2);
  scene.add(pointLight2);

  // Interactive glow light (follows mouse)
  const mouseLight = new THREE.PointLight(0xf5d77a, 0, 12);
  mouseLight.position.set(0, 0, 4);
  scene.add(mouseLight);

  // ── Diamond Group ─────────────────────────────────────
  const group = new THREE.Group();

  // Main diamond body — brilliant octahedron
  const diamondGeo = new THREE.OctahedronGeometry(1.2, 0);
  const diamondMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.0,
    roughness: 0.0,
    transmission: 0.95,
    ior: 2.42,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    envMapIntensity: 4,
    transparent: true,
    opacity: 0.92,
    reflectivity: 1.0,
  });

  const diamond = new THREE.Mesh(diamondGeo, diamondMat);
  diamond.scale.set(1, 1.3, 1);
  group.add(diamond);

  // Inner glow sphere — enhanced pulsation
  const glowGeo = new THREE.SphereGeometry(0.55, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xd4af37,
    transparent: true,
    opacity: 0.18,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  group.add(glow);

  // Secondary inner glow (brighter core)
  const coreGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xf5e066, transparent: true, opacity: 0.12 })
  );
  group.add(coreGlow);

  // Wireframe overlay — subtle geometric detail
  const wireGeo = new THREE.OctahedronGeometry(1.25, 1);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xc9a84c,
    wireframe: true,
    transparent: true,
    opacity: 0.1,
  });
  const wire = new THREE.Mesh(wireGeo, wireMat);
  wire.scale.set(1, 1.3, 1);
  group.add(wire);

  // ── Sparkle Particles (increased count & brightness) ──
  const particleCount = 350;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3); // for subtle motion

  for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 1.8 + Math.random() * 3.5;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    velocities[i * 3] = (Math.random() - 0.5) * 0.002;
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const particleMat = new THREE.PointsMaterial({
    color: 0xd4af37,
    size: 0.025,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  group.add(particles);

  // ── Orbiting Rings (elegant golden bands) ─────────────
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2, 0.005, 16, 100),
    new THREE.MeshBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.35 })
  );
  ring.rotation.x = Math.PI / 3;
  group.add(ring);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.3, 0.003, 16, 100),
    new THREE.MeshBasicMaterial({ color: 0xe0c872, transparent: true, opacity: 0.18 })
  );
  ring2.rotation.x = Math.PI / 2.5;
  ring2.rotation.y = Math.PI / 4;
  group.add(ring2);

  const ring3 = new THREE.Mesh(
    new THREE.TorusGeometry(1.7, 0.004, 16, 80),
    new THREE.MeshBasicMaterial({ color: 0xf5d77a, transparent: true, opacity: 0.12 })
  );
  ring3.rotation.x = Math.PI / 1.8;
  ring3.rotation.z = Math.PI / 6;
  group.add(ring3);

  scene.add(group);

  // ── Mouse Interaction (enhanced tracking) ─────────────
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;

  document.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ── Animation Loop ────────────────────────────────────
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.005;

    // Smooth mouse interpolation
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    // Smooth rotation with mouse influence
    group.rotation.y += 0.003;
    group.rotation.y += (mouseX * 0.3 - group.rotation.y) * 0.015;
    group.rotation.x = Math.sin(time) * 0.1;
    group.rotation.x += (-mouseY * 0.2 - group.rotation.x) * 0.015;

    // Interactive glow light follows mouse
    mouseLight.position.x = mouseX * 3;
    mouseLight.position.y = -mouseY * 3;
    mouseLight.intensity = 1.5 + Math.abs(mouseX) + Math.abs(mouseY);

    // Enhanced inner glow pulsation
    const pulse = 0.15 + Math.sin(time * 3) * 0.08;
    glow.material.opacity = pulse;
    glow.scale.setScalar(0.55 + Math.sin(time * 2) * 0.12);

    // Core glow sparkle
    coreGlow.material.opacity = 0.08 + Math.sin(time * 5) * 0.06;
    coreGlow.scale.setScalar(0.25 + Math.sin(time * 4) * 0.08);

    // Wireframe slow counter-rotation
    wire.rotation.y -= 0.002;
    wire.rotation.z += 0.001;

    // Particles gentle drift
    particles.rotation.y += 0.0012;
    particles.rotation.x += 0.0006;

    // Subtle particle position drift
    const pos = particleGeo.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] += velocities[i * 3];
      pos[i * 3 + 1] += velocities[i * 3 + 1];
      pos[i * 3 + 2] += velocities[i * 3 + 2];
    }
    particleGeo.attributes.position.needsUpdate = true;

    // Rings elegant orbit
    ring.rotation.z += 0.002;
    ring2.rotation.z -= 0.0015;
    ring3.rotation.z += 0.001;
    ring3.rotation.x += 0.0008;

    // Point lights orbit for dynamic reflections
    pointLight1.position.x = Math.sin(time * 1.5) * 4;
    pointLight1.position.z = Math.cos(time * 1.5) * 4;
    pointLight1.intensity = 2.5 + Math.sin(time * 3) * 0.5;

    pointLight2.position.x = Math.cos(time * 1.2) * 3;
    pointLight2.position.z = Math.sin(time * 1.2) * 3;

    renderer.render(scene, camera);
  }

  animate();

  // ── Resize Handler ────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
