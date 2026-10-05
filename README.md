# Vitrine — logiciels & tutoriels

Site vitrine statique : présentation des logiciels, tutoriels associés, page
personnelle. Thème cosmique et doré, fond animé en WebGL, pièce 3D sur l'accueil.

---

## Démarrer

```bash
npm install
npm run dev
```

Le site tourne sur <http://localhost:4321>.

| Commande | Effet |
| --- | --- |
| `npm run dev` | Serveur de développement, rechargement à chaud |
| `npm run build` | Vérification des types **puis** build de production dans `dist/` |
| `npm run build:fast` | Build sans vérification des types |
| `npm run preview` | Sert `dist/` comme le fera Cloudflare |

---

## Choix techniques

### Astro 7 — sortie statique

Un site vitrine est du contenu, pas une application. Astro génère du HTML au
build et **n'envoie aucun JavaScript par défaut** ; les composants interactifs
sont déclarés un par un comme « îlots ». Concrètement, la page d'accueil ne
charge `three.js` qu'après le premier rendu, et les pages de tutoriels ne le
chargent jamais.

Next.js aurait apporté un runtime React sur chaque page pour un besoin qui est
à 95 % du document. Astro fait l'inverse : zéro JS, puis on en ajoute là où
c'est justifié.

### Tailwind CSS v4 — configuration en CSS

Plus de `tailwind.config.js` : le bloc `@theme` de
[`src/styles/global.css`](src/styles/global.css) **est** la configuration.
Chaque token y génère ses utilitaires, et reste lisible comme variable CSS
native dans les blocs `<style>` scopés des composants. Une seule source de
vérité pour la palette.

### CSS scopé plutôt qu'utilitaires partout

Les composants utilisent les `<style>` scopés d'Astro, alimentés par les tokens
Tailwind. Raison : ce site a beaucoup d'états visuels composites (halos,
reflets, filets, dégradés) que des chaînes de 15 classes utilitaires rendraient
illisibles. Tailwind sert de **système de tokens**, pas de langage de mise en
forme.

### WebGL brut pour le fond, three.js pour le portail

Deux besoins, deux outils :

- **Le fond** ([`Cosmos.astro`](src/components/Cosmos.astro)) est un unique
  fragment shader sur un triangle plein écran : nébuleuse FBM, trois couches
  d'étoiles parallaxées, halo doré. ~4 ko de JS, zéro dépendance. Charger
  three.js pour dessiner deux triangles aurait coûté 150 ko sur **chaque** page.
- **Le portail** ([`Portal.tsx`](src/components/Portal.tsx)) est un îlot React
  Three Fiber monté en `client:visible`, présent uniquement sur l'accueil.

Les deux se coupent sur `prefers-reduced-motion`, en l'absence de WebGL, et le
portail est aussi désactivé sur les machines à faible mémoire ou peu de cœurs.
Un repli CSS prend le relais dans tous les cas.

### Content Layer — le contenu est une base de données typée

Les logiciels et tutoriels sont des fichiers Markdown/MDX validés par un schéma
Zod ([`src/content.config.ts`](src/content.config.ts)). Un frontmatter invalide
**casse le build**, pas la page en production. Ajouter un logiciel = déposer un
fichier ; aucune page à modifier.

### Fontes auto-hébergées

Inter et JetBrains Mono sont servies depuis `node_modules` via Fontsource ;
Jost, la police d'affichage (variable, licence OFL), depuis `public/fonts/jost`. Aucun appel à `fonts.googleapis.com` : une connexion tierce en
moins sur le chemin critique, et pas de transfert d'IP vers un tiers à déclarer.

---

## Principes de design

1. **Une seule source de lumière.** Tout le site est éclairé par un halo doré
   bas, hors champ. Ombres, dégradés et reflets en découlent. C'est ce qui tient
   la palette ensemble malgré cinq familles de couleurs.
2. **L'or est un dégradé, jamais une couleur plate.** Un aplat `#e0ad3c` donne
   du jaune moutarde. La classe `.gilded` applique un dégradé à quatre arrêts.
3. **Le cyan sauve l'or.** Sans contrepoint froid (`--color-plasma-*`), l'or
   vire au sale. Il est rare mais présent sur chaque écran.
4. **Du grain partout.** Une texture de bruit à 3,5 % d'opacité élimine le
   *banding* des dégradés sombres, principal défaut visuel des sites dark.
5. **La dégradation va toujours vers « visible ».** Pas de JS → contenu affiché.
   Pas de WebGL → dégradé CSS. `prefers-reduced-motion` → tout s'arrête.
   Un effet qui rate ne doit jamais produire une page blanche.
6. **Lourd, mais pas sur le chemin critique.** Le site assume son poids visuel ;
   il le charge après le premier rendu, jamais avant.

---

## Structure

```
src/
├─ components/     Cosmos (shader), Portal (3D), Nav, Footer, cartes, Reveal
├─ content/
│  ├─ logiciels/   1 fichier .md = 1 fiche logiciel
│  └─ tutoriels/   1 fichier .mdx = 1 tutoriel
├─ layouts/        Base.astro (SEO, fontes, fond, nav, pied de page)
├─ pages/          Routes ; [...slug].astro génère les pages de contenu
├─ styles/         global.css — tokens, base, composants, prose
├─ consts.ts       Nom du site, navigation, liens. Point de réglage unique.
└─ content.config.ts  Schémas Zod des collections
```

---

## Ajouter du contenu

### Un logiciel

Créer `src/content/logiciels/mon-outil.md` :

```markdown
---
title: Mon Outil
summary: Une phrase qui dit ce que ça fait et pour qui.
status: beta          # stable | beta | alpha | laboratoire
order: 25             # ordre d'affichage, croissant
featured: true        # remonte sur la page d'accueil
stack: ['C#', '.NET 9']
glyph: '⬡'
accent: 'gold'        # gold | plasma | nebula | ember
highlights:
  - 'Argument court 1'
  - 'Argument court 2'
year: 2026
---

## Le problème
...
```

L'URL sera `/logiciels/mon-outil`.

### Un tutoriel

Créer `src/content/tutoriels/mon-guide.mdx` :

```markdown
---
title: Mon guide
summary: Ce que le lecteur saura faire à la fin.
logiciel: mon-outil       # relie le guide à la fiche du logiciel
level: découverte         # découverte | intermédiaire | avancé
duration: 10              # minutes
date: 2026-08-14
tags: ['C#']
draft: false
---
```

Le sommaire latéral se construit tout seul à partir des titres `##`.

---

## Reste à faire avant mise en ligne

- [ ] **Contenu personnel** — [`src/pages/a-propos.astro`](src/pages/a-propos.astro)
      contient des marqueurs `[à compléter]` à remplacer.
- [ ] **Fiche TSP Overlay** — [`src/content/logiciels/tsp-overlay.md`](src/content/logiciels/tsp-overlay.md)
      est un gabarit, pas du contenu.
- [ ] **Mentions légales** — champs éditeur obligatoires (LCEN art. 6-III).
- [ ] **Portrait** — déposer l'image dans `public/` et la brancher dans `a-propos`.
- [ ] **Domaine** — renseigner `site` dans `astro.config.mjs` **et** `SITE.url`
      dans `src/consts.ts`.
- [ ] **Image de partage** — ajouter un `og:image` (1200×630) dans `public/`.
- [ ] **Pages Labo** — trois pistes de design à arbitrer, puis à supprimer.

---

## Déploiement

Sortie statique dans `dist/`. Voir [`DEPLOIEMENT.md`](DEPLOIEMENT.md) pour la
procédure Git → Cloudflare Pages.
