/**
 * L'horloge des mouvements — portage web de Graine/src/Graine.App/Controls/Motion.cs.
 *
 * Une seule boucle pour tout ce qui bouge sur la page, réglée sur la cadence la
 * plus haute demandée, ARRÊTÉE quand rien ne bouge. Chaque élément animé dit, à
 * chaque image, combien d'images par seconde il lui faut encore :
 *
 *   0          posé, rien à faire
 *   BREATHING  une lumière qui respire (un halo, un cœur)          ≈ 7 i/s
 *   DRIFT      une rotation lente et lisible tant qu'un système vit ≈ 12 i/s
 *   EVENT      un événement en vol, qui FINIT (un appel, un geste)  60 i/s
 *
 * Graine joue ses événements à 30 i/s ; un navigateur sait composer à 60 sans
 * effort, et un écran de 165 Hz rend un 30 visiblement saccadé : le web monte
 * l'événement à 60, le reste ne bouge pas.
 *
 * Onglet masqué : tout se fige, et l'horloge reprend là où elle s'était arrêtée
 * sans rattraper le temps passé ailleurs. `prefers-reduced-motion` : rien ne
 * tourne ; les éléments sont priés de se poser sur leur état final.
 */

export const BREATHING = 7;
export const DRIFT = 12;
export const EVENT = 60;

export interface Mover {
  /** Nom affiché par le moniteur de fluidité (« d'où vient le mouvement »). */
  readonly kind: string;
  /**
   * Avance d'une image. `now` : secondes sur l'horloge des mouvements ;
   * `dt` : secondes depuis l'image précédente de CET élément.
   * Rend la cadence encore voulue (0 : posé).
   */
  advance(now: number, dt: number): number;
}

interface Entry {
  wanted: number;
  last: number;
}

const movers = new Map<Mover, Entry>();
let raf = 0;
let clock = 0;
let lastFrame = 0;
let lastTick = 0;
let requested = 0;

// Mesure : images réellement jouées par l'horloge, sur une fenêtre glissante.
const ticks: number[] = [];

const reduce =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Le visiteur a demandé moins de mouvement : c'est DÉFINITIF pour la page.
 * Les éléments se dessinent alors une fois, posés, et ne s'inscrivent pas.
 */
export function reducedMotion(): boolean {
  return !!(reduce && reduce.matches);
}

/**
 * L'horloge peut tourner en ce moment : mouvement permis ET onglet visible.
 * ⚠️ Ne jamais s'en servir pour décider de s'inscrire : un onglet ouvert en
 * arrière-plan est masqué au chargement, et un élément qui ne s'inscrit pas
 * ne s'animerait jamais, même une fois regardé (vécu). On s'inscrit toujours,
 * sauf `reducedMotion()` ; l'horloge, elle, attend que l'onglet soit visible.
 */
export function enabled(): boolean {
  return !reducedMotion() && typeof document !== 'undefined' && !document.hidden;
}

function loop(ts: number) {
  raf = 0;
  if (!enabled()) return;

  if (!lastFrame) lastFrame = ts;
  // Le temps de l'horloge n'avance que pendant qu'on regarde. Le retour d'onglet
  // remet `lastFrame` à zéro (plus bas) : rien n'est propulsé. Le plafond de
  // 250 ms ne protège que d'un gel ; plus bas (100 ms), il RALENTISSAIT le temps
  // sur une machine qui ne livre que quelques images par seconde — l'étincelle
  // de 0,9 s en mettait 3 (mesuré).
  clock += Math.min(0.25, (ts - lastFrame) / 1000);
  lastFrame = ts;

  // La cadence demandée décide si cette image du navigateur est jouée.
  if (requested > 0 && ts - lastTick >= 1000 / requested - 2) {
    lastTick = ts;
    ticks.push(ts);
    while (ticks.length && ts - ticks[0] > 1000) ticks.shift();

    let max = 0;
    for (const [mover, entry] of movers) {
      // Chaque élément ne joue qu'à SA cadence : la respiration d'un halo ne
      // se recalcule pas à 60 i/s parce qu'un appel file à côté.
      const interval = entry.wanted > 0 ? 1000 / entry.wanted : Infinity;
      if (entry.wanted === Infinity || ts - entry.last >= interval - 2) {
        const dt = entry.last ? Math.min(0.25, (ts - entry.last) / 1000) : 0;
        entry.last = ts;
        entry.wanted = Math.max(0, mover.advance(clock, dt));
      }
      if (entry.wanted > max) max = entry.wanted;
    }
    requested = max;
  }

  if (requested > 0) raf = requestAnimationFrame(loop);
}

function start() {
  if (!raf && enabled()) {
    lastFrame = 0;
    raf = requestAnimationFrame(loop);
  }
}

/** Inscrit un élément animé ; il jouera dès la prochaine image. */
export function join(mover: Mover) {
  movers.set(mover, { wanted: Infinity, last: 0 });
  requested = EVENT;
  start();
}

/** Désinscrit un élément (changement de page). */
export function leave(mover: Mover) {
  movers.delete(mover);
}

/** Quelque chose vient d'arriver à cet élément : il rejouera dès la prochaine image. */
export function wake(mover: Mover) {
  const entry = movers.get(mover);
  if (!entry) return;
  entry.wanted = Infinity;
  requested = EVENT;
  start();
}

/** Ce que la page demande en ce moment, pour le moniteur de fluidité. */
export function snapshot() {
  return {
    requested: requested === Infinity ? EVENT : requested,
    obtained: ticks.length,
    running: raf !== 0,
    demands: [...movers].map(([m, e]) => ({
      kind: m.kind,
      fps: e.wanted === Infinity ? EVENT : Math.round(e.wanted),
    })),
  };
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    // Retour à l'onglet : l'horloge reprend là où elle s'était arrêtée, sans
    // rattraper le temps passé ailleurs, et tout le monde rejoue une image.
    lastFrame = 0;
    for (const entry of movers.values()) {
      entry.wanted = Infinity;
      entry.last = 0;
    }
    requested = EVENT;
    start();
  });
  // Changement de page (View Transitions) : on repart d'une horloge vide.
  document.addEventListener('astro:before-swap', () => {
    movers.clear();
    requested = 0;
  });
}
