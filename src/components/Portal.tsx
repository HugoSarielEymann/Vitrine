/**
 * Portal — la pièce 3D du hero.
 *
 * C'est le SEUL endroit du site où three.js est chargé. L'îlot est monté en
 * `client:visible`, donc le chunk `three` (~150 ko gz) part sur le réseau
 * après le premier rendu, jamais avant : le LCP ne le voit pas passer.
 *
 * Composition : deux anneaux d'or contrarotatifs, un disque de plasma piloté
 * par shader, et une poussière stellaire en orbite. Le tout suit le pointeur
 * avec une inertie forte — l'objet a de la masse, il ne « colle » pas au curseur.
 */
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, useState, Suspense } from 'react';
import * as THREE from 'three';

/* -------------------------------------------------------------------------
   Disque de plasma — shader maison.
   Un `MeshBasicMaterial` avec une texture ferait le même effet à 40 ko près ;
   50 lignes de GLSL font mieux, en 0 ko et sans requête réseau.
   ---------------------------------------------------------------------- */
const PLASMA_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const PLASMA_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1,0)), u.x),
               mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
  }

  void main() {
    vec2 p = vUv - 0.5;
    float r = length(p) * 2.0;
    float a = atan(p.y, p.x);

    // Coordonnées polaires « enroulées » : c'est la torsion de a par r qui
    // donne la spirale, pas une texture qui tourne.
    float swirl = a * 2.0 + r * 5.5 - uTime * 0.55;
    float bands = noise(vec2(swirl * 1.4, r * 3.2 - uTime * 0.35));
    bands = smoothstep(0.25, 0.85, bands);

    float core = smoothstep(1.0, 0.05, r);
    float edge = smoothstep(1.0, 0.72, r);

    vec3 deep = vec3(0.42, 0.20, 0.03);
    vec3 gold = vec3(1.00, 0.68, 0.20);
    vec3 hot  = vec3(1.00, 0.94, 0.78);

    vec3 col = mix(deep, gold, bands);
    col = mix(col, hot, pow(core, 3.0) * bands * 0.9);

    float alpha = core * edge * (0.22 + 0.78 * bands);
    gl_FragColor = vec4(col, alpha);
  }
`;

function Plasma() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: PLASMA_VERT,
        fragmentShader: PLASMA_FRAG,
        uniforms: { uTime: { value: 0 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [],
  );

  useFrame((_, dt) => {
    mat.uniforms.uTime.value += dt;
  });

  return (
    <mesh>
      <circleGeometry args={[1.62, 96]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

/* -------------------------------------------------------------------------
   Poussière stellaire en orbite
   ---------------------------------------------------------------------- */
function Dust({ count = 900 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const scale = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Distribution en coquille torique autour de l'anneau, épaissie en z
      // pour que la rotation révèle de la profondeur.
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.7 + Math.pow(Math.random(), 1.8) * 2.6;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius * 0.72;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2.4;
      scale[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aScale', new THREE.BufferAttribute(scale, 1));
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: new THREE.Color('#f3d98c'),
        size: 0.028,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useFrame((_, dt) => {
    if (points.current) {
      points.current.rotation.z += dt * 0.045;
      points.current.rotation.x += dt * 0.012;
    }
  });

  return <points ref={points} geometry={geometry} material={material} />;
}

/* -------------------------------------------------------------------------
   Anneaux d'or
   ---------------------------------------------------------------------- */
function Rings() {
  const outer = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (outer.current) outer.current.rotation.z += dt * 0.08;
    if (inner.current) {
      inner.current.rotation.z -= dt * 0.14;
      inner.current.rotation.x = Math.sin(performance.now() * 0.00016) * 0.32;
    }
  });

  return (
    <>
      {/* Anneau maître : métal quasi pur, rugosité basse. C'est la rugosité
          qui décide si l'or a l'air d'or ou de plastique jaune. */}
      <mesh ref={outer}>
        <torusGeometry args={[1.95, 0.055, 24, 180]} />
        <meshStandardMaterial
          color="#e0ad3c"
          metalness={1}
          roughness={0.22}
          emissive="#7a4f10"
          emissiveIntensity={0.55}
        />
      </mesh>

      {/* Anneau secondaire, incliné et contrarotatif : c'est lui qui donne
          la lecture volumétrique de la scène. */}
      <mesh ref={inner} rotation={[0.4, 0.2, 0]}>
        <torusGeometry args={[2.42, 0.016, 12, 160]} />
        <meshStandardMaterial
          color="#f3d98c"
          metalness={1}
          roughness={0.3}
          emissive="#5fd9ee"
          emissiveIntensity={0.22}
        />
      </mesh>
    </>
  );
}

/* -------------------------------------------------------------------------
   Scène
   ---------------------------------------------------------------------- */
function Scene() {
  const group = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const target = useRef({ x: 0, y: 0 });

  useFrame(({ pointer }) => {
    target.current.x += (pointer.y * 0.18 - target.current.x) * 0.03;
    target.current.y += (pointer.x * 0.28 - target.current.y) * 0.03;
    if (group.current) {
      group.current.rotation.x = target.current.x;
      group.current.rotation.y = target.current.y;
      // Respiration lente, indépendante du pointeur : l'objet reste vivant
      // même quand la souris ne bouge pas.
      group.current.position.y = Math.sin(performance.now() * 0.0004) * 0.09;
    }
  });

  // Sur mobile, la scène doit rétrécir sinon les anneaux sortent du cadre.
  const scale = Math.min(1, viewport.width / 7);

  return (
    <group ref={group} scale={scale}>
      <ambientLight intensity={0.35} color="#8b5fd6" />
      {/* Clé chaude, face avant */}
      <pointLight position={[2.5, 2, 4]} intensity={38} color="#ffc65c" distance={18} decay={2} />
      {/* Contre-jour froid : détache les anneaux du fond violet */}
      <pointLight position={[-4, -2, -3]} intensity={22} color="#5fd9ee" distance={16} decay={2} />
      {/* Rasante basse, écho de la source dorée du fond CSS */}
      <directionalLight position={[0, -5, 2]} intensity={1.4} color="#f0803a" />

      <Rings />
      <Plasma />
      <Dust />
    </group>
  );
}

/* -------------------------------------------------------------------------
   Enveloppe
   ---------------------------------------------------------------------- */
export default function Portal() {
  // On décide UNE fois, au montage, si la 3D a le droit de tourner.
  // `deviceMemory` et le nombre de cœurs écartent les machines qui
  // ramerait ; `prefers-reduced-motion` écarte ceux qui n'en veulent pas.
  const [allowed] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    const nav = navigator as Navigator & { deviceMemory?: number };
    if (typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4) return false;
    if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency < 4) return false;
    return true;
  });

  if (!allowed) return <PortalFallback />;

  return (
    <Canvas
      className="portal-canvas"
      camera={{ position: [0, 0, 6.4], fov: 42 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}

/** Repli non-WebGL : un anneau CSS. Même silhouette, coût nul. */
function PortalFallback() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <div
        style={{
          width: 'min(62%, 22rem)',
          aspectRatio: '1',
          borderRadius: '50%',
          border: '2px solid #e0ad3c',
          boxShadow:
            '0 0 90px 10px rgba(224,173,60,0.35), inset 0 0 90px 20px rgba(224,173,60,0.22)',
          background:
            'radial-gradient(circle at 50% 55%, rgba(255,214,120,0.5), rgba(120,60,10,0.15) 55%, transparent 72%)',
        }}
      />
    </div>
  );
}
