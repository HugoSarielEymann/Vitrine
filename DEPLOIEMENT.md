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

4. **Variables d'environnement** — onglet *Settings → Environment variables* :

| Variable | Valeur | Pourquoi |
| --- | --- | --- |
| `NPM_VERSION` | `11.6.2` | **Obligatoire.** Voir l'encadré ci-dessous. |
| `NODE_VERSION` | `24` | Facultatif : Cloudflare fournit déjà Node 24. |

> ### Pourquoi `NPM_VERSION` est obligatoire
>
> Cloudflare installe les dépendances avec `npm ci`, qui exige que
> `package-lock.json` soit **exactement** synchronisé avec `package.json`.
> Or npm 10 et npm 11 ne résolvent pas identiquement les sous-arbres
> optionnels propres à une plateforme : le moteur Markdown `satteri` embarque
> un repli `wasm32-wasi` que npm n'installe pas sous Windows, et dont la
> dépendance `@emnapi/*` se résout en `1.11.1` sous npm 11, `1.11.3` sous npm 10.
>
> Sans cette variable, le build échoue sur :
>
> ```
> npm error `npm ci` can only install packages when your package.json
> npm error and package-lock.json ... are in sync.
> npm error Missing: @emnapi/runtime@1.11.3 from lock file
> ```
>
> Le lockfile n'est pas corrompu : il est valide, mais **pour npm 11**.
> Le champ `engines` de `package.json` et le `engine-strict=true` du `.npmrc`
> transforment désormais cet échec opaque en un message clair
> (« Unsupported engine ») si la variable venait à manquer.
>
> **Règle générale :** la version de npm en CI doit suivre celle de la machine
> qui écrit le lockfile. Après une montée de npm en local, mettre
> `NPM_VERSION` à jour — et vérifier avec `npm ci` avant de pousser.
>
> *Repli si le problème réapparaît :* remplacer la build command par
> `npm install && npm run build`. `npm install` tolère l'écart au lieu de le
> refuser, au prix de builds qui ne sont plus strictement reproductibles.

5. **Save and Deploy.** Le premier build prend une à deux minutes.

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

Une fois le domaine définitif connu, mettre à jour **deux** endroits :

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
