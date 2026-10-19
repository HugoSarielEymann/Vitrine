/**
 * Point de réglage unique du site.
 * Tout ce qui est « éditorial » (nom, baselines, liens, navigation) vit ici :
 * changer d'identité ne doit jamais obliger à ouvrir un composant.
 */

export const SITE = {
  /** Nom affiché dans la navigation et le <title>. */
  name: 'Hugo Eymann',
  /** Mot court affiché sous le logo. */
  mark: 'Atelier logiciel',
  /** Baseline utilisée en fallback SEO et dans les cartes de partage. */
  tagline: "Des logiciels taillés à la main, et le mode d'emploi qui va avec.",
  description:
    "Vitrine des logiciels d'Hugo Eymann : outils d'analyse, générateurs de code et pipelines visuels, accompagnés de tutoriels détaillés.",
  locale: 'fr-FR',
  /** Domaine définitif : le même que `site` dans astro.config.mjs. */
  url: 'https://hugoeymann.com',
} as const;

export const NAV = [
  { label: 'Logiciels', href: '/logiciels' },
  { label: 'Tutoriels', href: '/tutoriels' },
  { label: 'Cristal', href: '/cristal' },
  { label: 'À propos', href: '/a-propos' },
  { label: 'Labo', href: '/labo' },
] as const;

export const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/HugoSarielEymann' },
  { label: 'Email', href: 'mailto:hugo.eymann@gmail.com' },
] as const;

/** Libellés et couleurs des états de maturité d'un logiciel. */
export const STATUS = {
  stable: { label: 'Stable', tone: 'gold' },
  beta: { label: 'Bêta', tone: 'plasma' },
  alpha: { label: 'Alpha', tone: 'ember' },
  laboratoire: { label: 'Laboratoire', tone: 'nebula' },
} as const;

export type StatusKey = keyof typeof STATUS;
