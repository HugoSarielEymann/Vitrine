# Déploiement — Git puis Cloudflare Pages

Objectif : chaque `git push` déclenche un build et met le site en ligne.
Une fois branché, il n'y a plus jamais de fichier à téléverser à la main.

---

## Étape 1 — Initialiser le dépôt local

Depuis `C:\Users\hugoe\Documents\Widgets\Vitrine` :

```bash
git init -b main
```

```bash
git add .
```

```bash
git commit -m "Site vitrine : structure, design system, contenu de démonstration"
```

`.gitignore` exclut déjà `node_modules/`, `dist/` et `.astro/`. Vérifier avant
de committer que `git status` ne les liste pas.

---

## Étape 2 — Relier au dépôt GitHub

```bash
git remote add origin https://github.com/HugoSarielEymann/Vitrine.git
```

```bash
git push -u origin main
```

Si GitHub refuse parce que le dépôt distant contient déjà un commit (un README
créé à la création du dépôt, par exemple) :

```bash
git pull --rebase origin main
```

puis relancer le `git push -u origin main`.

---

## Étape 3 — Créer le projet Cloudflare Pages

> **Ce qui existe en réalité** : le projet est un **Worker** (« Workers Builds :
> vitrine »), pas un projet Pages. Cloudflare construit avec `npm run build`,
> puis met en ligne avec `npx wrangler deploy`, qui sert `dist/` comme
> ressources statiques selon [`wrangler.jsonc`](wrangler.jsonc). Le domaine
> `hugoeymann.com` est branché sur ce Worker. Les étapes ci-dessous décrivent
> le chemin Pages d'origine ; la section « `wrangler.jsonc` » plus bas dit ce
> qui compte aujourd'hui.

1. Ouvrir le tableau de bord Cloudflare → **Workers & Pages** → **Create** →
   onglet **Pages** → **Connect to Git**.
2. Autoriser Cloudflare à accéder à GitHub, puis choisir le dépôt **Vitrine**.
3. Renseigner la configuration de build :

| Champ | Valeur |
| --- | --- |
| Framework preset | `Astro` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | *(laisser vide)* |

Aucune variable d'environnement n'est nécessaire. Cloudflare fournit déjà
Node 24 ; `NODE_VERSION` est facultatif.

4. **Save and Deploy.** Le premier build prend une à deux minutes.

---

## ⚠️ `wrangler.jsonc` doit rester dans le dépôt

Le 5 octobre 2026, la mise en ligne a échoué alors que le build passait.
`npx wrangler deploy` prend la **dernière** version de Wrangler (ce jour-là la
4.147.0), et, faute de fichier de configuration, celle-ci configure le projet
toute seule : elle a lancé `astro add cloudflare`, installé la dernière version
de l'adaptateur Cloudflare, incompatible avec notre Astro, puis reconstruit
avec :

```
[MISSING_EXPORT] "renderForPrerender" is not exported by "node_modules/astro/dist/core/app/entrypoints/index.js".
```

Le site est statique : [`wrangler.jsonc`](wrangler.jsonc) dit seulement de
servir `dist/` (et la page 404 pour une adresse inconnue), et Wrangler ne touche
plus au projet. **Ne pas ajouter l'adaptateur `@astrojs/cloudflare`** : il n'a
rien à faire sur un site statique. Un échec de mise en ligne laisse la version
précédente en ligne ; le journal se lit dans le tableau de bord (Workers &
Pages → vitrine → Builds), GitHub ne reçoit que « échec ».

---

## ⚠️ Le lockfile doit rester compatible npm 10

C'est la seule contrainte non évidente du projet. La lire une fois évite un
build cassé plus tard.

### Le problème

Cloudflare installe avec `npm ci`, qui exige que `package-lock.json` soit
**exactement** synchronisé avec `package.json`. Or l'image de build Cloudflare
utilise **npm 10.9.2**, alors que la machine de développement tourne sous
**npm 11.6.2** — et les deux ne résolvent pas identiquement les sous-arbres
optionnels propres à une plateforme.

En pratique : le moteur Markdown `satteri` embarque un repli `wasm32-wasi` que
npm n'installe pas sous Windows. Sa dépendance `@emnapi/*` se résout en
`1.11.1` sous npm 11, mais npm 10 réclame en plus `1.11.3`. D'où :

```
npm error Missing: @emnapi/runtime@1.11.3 from lock file
```

Le lockfile n'est pas corrompu dans ce cas : il est valide, mais pour npm 11
seulement.

> **La version de npm n'est pas configurable sur Cloudflare.** Contrairement à
> `NODE_VERSION`, `PNPM_VERSION` ou `YARN_VERSION`, il n'existe **pas** de
> `NPM_VERSION` : npm est fourni par l'image de build.
> C'est donc au lockfile de s'adapter, pas au CI.

### La règle

Le `package-lock.json` versionné a été généré par npm 10.9.2 et contient les
deux résolutions — il satisfait donc npm 10 **et** npm 11.

Un `npm install` lancé localement avec npm 11 peut le réécrire et retirer les
entrées propres à npm 10. **Après toute modification des dépendances**, vérifier
avec la commande exacte du CI avant de pousser :

```bash
npm run lock:verify
```

Elle exécute `npm ci --dry-run` sous npm 10.9.2. Si elle passe, Cloudflare
passera. Si elle affiche `Missing: … from lock file`, régénérer le lockfile
avec la même version :

```bash
npx --yes npm@10.9.2 install --package-lock-only
```

*Dépannage en dernier recours :* remplacer la build command par
`npm install --engine-strict=false && npm run build`. `npm install` tolère
l'écart au lieu de le refuser — au prix de builds qui ne sont plus strictement
reproductibles.

À la fin, le site est en ligne sur `https://<projet>.pages.dev`. C'est déjà une
URL publique fonctionnelle, HTTPS compris — utile pour vérifier avant de brancher
le vrai domaine.

---

## Étape 4 — Brancher le domaine

Comme le domaine est chez Cloudflare Registrar, la zone DNS est déjà gérée par
Cloudflare : il n'y a **aucun enregistrement à créer à la main**.

1. Dans le projet Pages → onglet **Custom domains** → **Set up a custom domain**.
2. Saisir le domaine (`exemple.fr`), valider.
3. Recommencer pour `www.exemple.fr`.

Cloudflare crée les enregistrements et provisionne le certificat TLS tout seul.
Compter quelques minutes.

### Rediriger `www` vers le domaine nu (ou l'inverse)

Choisir une forme canonique et rediriger l'autre, sinon les deux versions du
site existent en parallèle — mauvais pour le référencement.

Le plus simple : **Rules → Redirect Rules → Create rule**.

- *If* : `Hostname equals www.exemple.fr`
- *Then* : `Dynamic redirect` → `concat("https://exemple.fr", http.request.uri.path)`
- Status : `301`

---

## Étape 5 — Après la mise en ligne

Une fois le domaine définitif connu, mettre à jour **deux** endroits (fait le
5 octobre 2026 : `https://hugoeymann.com`) :

- `astro.config.mjs` → `site: 'https://exemple.fr'`
- `src/consts.ts` → `SITE.url`

Ils alimentent les URL canoniques, le `sitemap.xml` et le flux RSS. Puis
committer et pousser : le déploiement se refait tout seul.

---

## Le cycle de travail ensuite

```bash
git add . && git commit -m "Nouveau tutoriel : titre" && git push
```

Cloudflare détecte le push, rebuild, remplace la version en ligne.
Chaque branche autre que `main` reçoit sa propre URL de prévisualisation :
pratique pour faire relire une refonte sans toucher au site public.

---

## Ce qu'il reste à décider

### Email sur le domaine

Cloudflare **Email Routing** (gratuit) redirige `contact@exemple.fr` vers une
boîte existante. Pour *envoyer* depuis cette adresse, il faut un vrai service
(Google Workspace, Infomaniak, Migadu…).

### Formulaire de contact

Le site est statique : il ne peut pas envoyer d'email. Aujourd'hui, la page
d'accueil pointe vers un lien `mailto:`, ce qui est suffisant et sans
dépendance. Si un vrai formulaire devient nécessaire, la voie propre est un
**Cloudflare Worker** relayant vers Resend ou Brevo — sans quitter Cloudflare.

### Mesure d'audience

**Cloudflare Web Analytics** est gratuit, s'active en une case à cocher, et ne
dépose aucun cookie : pas de bandeau de consentement à ajouter.
