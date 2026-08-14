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

    // --- Motif SANS couture ---------------------------------------------
    // Piège : atan() saute de +PI à -PI sur une demi-droite. Nourrir un bruit
    // non périodique avec cet angle imprime cette discontinuité dans l'image,
    // et le tourbillon se retrouve « coupé » par un trait.
    //
    // Parade en deux temps :
    //
    // 1. La torsion ne dépend QUE du rayon, jamais de l'angle. On s'en sert
    //    pour faire tourner le plan cartésien sur lui-même : plus on s'éloigne
    //    du centre, plus le domaine est vrillé. Le bruit est ensuite
    //    échantillonné dans ce plan tourné — donc en coordonnées continues,
    //    sans jamais toucher à atan().
    float twist = r * 5.2 - uTime * 0.5;
    float cs = cos(twist), sn = sin(twist);
    vec2 q = mat2(cs, sn, -sn, cs) * p;
    // Deux octaves. Avec une seule, le centre du disque échantillonne une
    // zone minuscule du champ de bruit — donc presque constante — et le cœur
    // du tourbillon devient une nappe laiteuse au lieu de filaments.
    // La seconde octave apporte le détail qui manque aux petits rayons.
    // Moyenner deux octaves à poids égaux resserre la distribution autour de
    // 0.5 et efface le contraste : l'octave large reste dominante.
    float grain = noise(q * 7.5 + uTime * 0.12) * 0.72
                + noise(q * 21.0 - uTime * 0.22) * 0.28;

    // 2. Les bras spiralés, eux, ont besoin de l'angle. Mais un sinus dont le
    //    coefficient angulaire est ENTIER est périodique par construction :
    //    sin(3(a + 2PI)) == sin(3a). Le raccord est exact, pas approché.
    float arms = 0.5 + 0.5 * sin(3.0 * a + twist * 2.0);

    // MÉLANGE, surtout pas addition : grain et arms valent chacun 0..1, les
    // additionner décale la moyenne vers le haut et le disque vire au blanc
    // opaque (avec un blending additif, l'erreur est spectaculaire).
    // mix() conserve la moyenne à 0.5 et laisse le seuillage décider.
    // NB : pas de backtick dans ce commentaire, il fermerait le template literal.
    // Les bras sont une sinusoïde : ils produisent de larges plages continues,
    // là où le bruit donne des filaments. Trop pondérés, le tourbillon devient
    // une masse et le texte posé devant cesse d'être lisible. Ils restent donc
    // minoritaires, et le seuillage est resserré vers le haut pour ne garder
    // que les crêtes.
    float pattern = mix(grain, arms, 0.22);
    float bands = smoothstep(0.24, 0.84, pattern);

    float core = smoothstep(1.0, 0.05, r);
    float edge = smoothstep(1.0, 0.72, r);

    vec3 deep = vec3(0.42, 0.20, 0.03);
    vec3 gold = vec3(1.00, 0.68, 0.20);
    vec3 hot  = vec3(1.00, 0.94, 0.78);

    vec3 col = mix(deep, gold, bands);
    // Exposant élevé : le blanc chaud reste confiné au tout centre. Étalé,
    // il désature le portail qui cesse de se lire comme de l'or.
    col = mix(col, hot, pow(core, 4.0) * bands * 0.7);

    // Petit plancher d'opacité : il donne du corps au disque entre les crêtes.
    // Il reste bas — au-delà de ~0.2 le portail redevient un voile opaque.
    float alpha = core * edge * (0.15 + 0.85 * bands) * 0.88;
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
   Étincelles éjectées du portail.

   Chaque particule naît au cœur du tourbillon, spirale vers l'extérieur en
   accélérant, sort du plan vers la caméra, puis s'éteint et renaît au centre.
   Le cycle est décalé par particule : le flux paraît continu alors que la
   population reste constante.

   Le mouvement est calculé sur le CPU (900 particules, une passe de boucle
   par frame — négligeable) plutôt qu'en shader : les positions restent
   lisibles et réglables sans recompiler du GLSL.
   ---------------------------------------------------------------------- */
const SPARK_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  varying float vAlpha;
  void main() {
    vAlpha = aAlpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    // Taille en perspective : une étincelle proche est plus grosse.
    // Le facteur est en PIXELS, pas en unités monde : à z ≈ 6, un facteur de
    // 260 donnait des points de 60 à 200 px qui se fondaient en un nuage
    // laiteux masquant le portail entier. 30 donne 3 à 10 px — des étincelles.
    gl_PointSize = aSize * (30.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const SPARK_FRAG = /* glsl */ `
  precision mediump float;
  varying float vAlpha;
  void main() {
    // Point rond à bord doux : sans ça, gl_Points rend des carrés.
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.06, d);
    if (a <= 0.001) discard;
    vec3 col = mix(vec3(1.0, 0.72, 0.28), vec3(1.0, 0.95, 0.80), a * 0.6);
    gl_FragColor = vec4(col, a * vAlpha);
  }
`;

const R_BIRTH = 0.12; // rayon d'apparition, au cœur du tourbillon
const R_DEATH = 4.6; // rayon d'extinction

function Sparks({ count = 620 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);

  // État par particule, hors du buffer GPU : angle, rayon, vitesse, dérive.
  const state = useMemo(() => {
    const angle = new Float32Array(count);
    const radius = new Float32Array(count);
    const speed = new Float32Array(count);
    const spin = new Float32Array(count);
    const vz = new Float32Array(count);
    const z = new Float32Array(count);
    const size = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      angle[i] = Math.random() * Math.PI * 2;
      // Rayons initiaux étalés sur tout le trajet : sinon toutes les
      // particules partiraient ensemble et on verrait une onde de choc.
      radius[i] = R_BIRTH + Math.random() * (R_DEATH - R_BIRTH);
      speed[i] = 0.15 + Math.random() * 0.3;
      spin[i] = 0.26 + Math.random() * 0.58;
      vz[i] = 0.05 + Math.random() * 0.2;
      z[i] = (Math.random() - 0.5) * 0.3;
      size[i] = 0.6 + Math.random() * 1.7;
    }
    return { angle, radius, speed, spin, vz, z, size };
  }, [count]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('aAlpha', new THREE.BufferAttribute(new Float32Array(count), 1));
    g.setAttribute('aSize', new THREE.BufferAttribute(state.size, 1));
    // Le frustum culling se base sur la bounding sphere, que l'on ne
    // recalcule pas à chaque frame : on le désactive plutôt que de risquer
    // une disparition du nuage entier hors champ.
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), R_DEATH + 1);
    return g;
  }, [count, state.size]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: SPARK_VERT,
        fragmentShader: SPARK_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useFrame((_, delta) => {
    if (!points.current) return;
    // Borne le pas : après un changement d'onglet, delta peut valoir plusieurs
    // secondes et propulserait toutes les particules hors champ d'un coup.
    const dt = Math.min(delta, 0.05);

    const pos = geometry.getAttribute('position') as THREE.BufferAttribute;
    const alpha = geometry.getAttribute('aAlpha') as THREE.BufferAttribute;
    const { angle, radius, speed, spin, vz, z } = state;

    for (let i = 0; i < count; i++) {
      // Accélération radiale : lent près du cœur, projeté ensuite.
      radius[i] += speed[i] * dt * (0.3 + radius[i] * 0.4);
      // Rotation en 1/r : la particule est happée par le tourbillon au centre
      // et se redresse en s'éloignant. C'est ce gradient qui donne la spirale.
      angle[i] += (spin[i] * dt * 1.6) / (0.45 + radius[i]);
      z[i] += vz[i] * dt;

      if (radius[i] > R_DEATH) {
        radius[i] = R_BIRTH + Math.random() * 0.1;
        angle[i] = Math.random() * Math.PI * 2;
        z[i] = (Math.random() - 0.5) * 0.15;
        speed[i] = 0.15 + Math.random() * 0.3;
        vz[i] = 0.05 + Math.random() * 0.2;
      }

      const r = radius[i];
      pos.setXYZ(i, Math.cos(angle[i]) * r, Math.sin(angle[i]) * r * 0.88, z[i]);

      // Apparition franche au cœur, extinction longue vers l'extérieur :
      // on ne doit jamais voir une particule se couper net.
      const fadeIn = Math.min(1, (r - R_BIRTH) / 0.35);
      const fadeOut = Math.min(1, (R_DEATH - r) / 1.9);
      alpha.setX(i, Math.max(0, fadeIn * fadeOut));
    }

    pos.needsUpdate = true;
    alpha.needsUpdate = true;
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
  // Le facteur 0.78 compense l'agrandissement du conteneur : le canvas déborde
  // du hero pour ne rien couper, mais l'objet doit garder sa taille à l'écran.
  const scale = Math.min(1, viewport.width / 7) * 0.78;

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
      <Sparks />
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
