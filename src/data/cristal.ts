/**
 * Les données des pages du dialecte cristal.
 *
 * Instantané du 19 octobre 2026, tiré des sources réelles :
 *  - Geode/geodes/<id>/geode.md et cristaux/*.md (titres, chapitres, résumés) ;
 *  - Graine/README.md (le chemin d'un système, les terrains de la vallée).
 * Le site est construit sur Cloudflare, qui n'a pas accès au dossier Geode :
 * d'où une copie, à rafraîchir à la main quand une géode change.
 *
 * Une seule chose est inventée, et elle est déclarée comme telle sur la page :
 * la PROGRESSION. La vraie vit dans le profil de Géode, sur le poste de Hugo,
 * et n'a rien à faire sur un site public.
 */

// ---------------------------------------------------------------- Géode ----

export type FacetStatus = 'acquise' | 'araviver' | 'enattente' | 'oubliee' | 'ouverte' | 'echouee' | 'vierge';

export const FACETTES = [
  { n: 'I', nom: 'Reconnaître', dit: 'nommer, identifier, définir' },
  { n: 'II', nom: 'Comprendre', dit: 'expliquer avec ses mots, prévoir un comportement simple' },
  { n: 'III', nom: 'Appliquer', dit: 'exécuter une procédure, calculer, configurer' },
  { n: 'IV', nom: 'Analyser', dit: 'décomposer une situation, comparer, suivre un cas complexe' },
  { n: 'V', nom: 'Diagnostiquer', dit: 'trouver la cause d’un symptôme' },
  { n: 'VI', nom: 'Concevoir', dit: 'partir d’un besoin et produire une solution' },
] as const;

/** Sens de chaque état — repris de Geode.App/Controls/Visuals.cs (FacetColors). */
export const STATUTS: Record<FacetStatus, { label: string; sens: string; dit: string }> = {
  acquise: { label: 'Taillée', sens: 'cristal', dit: 'réussie ; elle brille d’autant plus qu’elle est fraîche' },
  araviver: { label: 'À raviver', sens: 'cristal-profond', dit: 'acquise, mais l’oubli approche : c’est le moment de la revoir' },
  enattente: { label: 'Copie en relecture', sens: 'vrille', dit: 'une rédaction rendue, qui attend sa relecture' },
  oubliee: { label: 'Oubliée', sens: 'braise', dit: 'acquise autrefois, laissée trop longtemps' },
  echouee: { label: 'Ratée', sens: 'braise', dit: 'ouverte, et la dernière tentative a échoué' },
  ouverte: { label: 'Ouverte', sens: 'seve', dit: 'à portée : ses épreuves sont déverrouillées' },
  vierge: { label: 'Vierge', sens: 'vierge', dit: 'pas encore à portée' },
};

export const GEODES = [
  { id: 'ip-chemin', titre: 'Comment une IP trouve son chemin', sous: 'D’un PC à l’autre, saut par saut', domaine: 'Réseaux', cristaux: 14 },
  { id: 'docker', titre: 'Docker et les conteneurs', sous: 'Images, conteneurs, réseau, données', domaine: 'Conteneurs', cristaux: 12 },
  { id: 'kubernetes', titre: 'Kubernetes : les fondamentaux', sous: 'Déclarer, faire tourner, exposer, configurer, tenir', domaine: 'Conteneurs', cristaux: 16 },
  { id: 'kubernetes-exploitation', titre: 'Kubernetes : exploiter un cluster', sous: 'Monter, tenir à jour, observer, réparer', domaine: 'Conteneurs', cristaux: 12 },
  { id: 'azure-fondamentaux', titre: 'Azure : les fondamentaux', sous: 'De la responsabilité partagée à la gouvernance', domaine: 'Cloud', cristaux: 17 },
  { id: 'llm', titre: 'Comment fonctionne un grand modèle de langage', sous: 'Du texte aux jetons, des jetons au texte', domaine: 'IA', cristaux: 12 },
  { id: 'optimisation', titre: 'Faire tourner un modèle vite et pour pas cher', sous: 'Mémoire, vitesse, coût', domaine: 'IA', cristaux: 13 },
  { id: 'agents', titre: 'L’ingénierie des agents', sous: 'Des consignes aux systèmes qui agissent', domaine: 'IA', cristaux: 12 },
  { id: 'rhetorique', titre: 'Argumenter et convaincre', sous: 'De l’auditoire au dernier mot', domaine: 'Communication', cristaux: 12 },
  { id: 'charisme', titre: 'Le charisme, ce qui s’apprend', sous: 'Présence, chaleur, compétence', domaine: 'Communication', cristaux: 8 },
  { id: 'manipulations', titre: 'Repérer une manipulation et y répondre', sous: 'Les tactiques du quotidien, et les tons qui les désamorcent', domaine: 'Communication', cristaux: 12 },
] as const;

export const IP_CHAPITRES = [
  { id: 'adresses', nom: 'Adresses et réseaux' },
  { id: 'lien', nom: 'Sur le réseau local' },
  { id: 'routage', nom: 'De réseau en réseau' },
  { id: 'internet', nom: 'Jusqu’au bout d’Internet' },
  { id: 'maitrise', nom: 'Diagnostiquer et concevoir' },
] as const;

export const IP_CRISTAUX = [
  { id: 'adresse-ip', titre: 'L’adresse IP', chapitre: 'adresses', resume: 'Ce qu’une adresse IPv4 désigne vraiment, comment elle s’écrit, et les adresses qui ne sont pas comme les autres.' },
  { id: 'binaire', titre: 'Le binaire des adresses', chapitre: 'adresses', resume: 'Lire un octet bit à bit, passer du décimal au binaire et retour, et faire le ET logique qui sépare le réseau de l’hôte.' },
  { id: 'masque', titre: 'Le masque et le préfixe', chapitre: 'adresses', resume: 'Où s’arrête le réseau, où commence l’hôte — et tout ce qu’on en déduit.' },
  { id: 'meme-reseau', titre: 'Sur le lien ou ailleurs ?', chapitre: 'adresses', resume: 'La toute première décision d’une machine qui envoie un paquet — le remettre elle-même, ou le confier à sa passerelle.' },
  { id: 'mac-trame', titre: 'Adresse MAC et trame', chapitre: 'lien', resume: 'Deux adresses pour un même voyage — l’IP vise la destination finale, la MAC seulement le prochain appareil.' },
  { id: 'arp', titre: 'ARP : de l’adresse IP à l’adresse MAC', chapitre: 'lien', resume: 'Une question criée à tout le lien, une réponse en privé, et un cache pour ne pas recommencer.' },
  { id: 'commutateur', titre: 'Le commutateur et sa table', chapitre: 'lien', resume: 'Comment un commutateur apprend où est chaque machine, et ne remet une trame qu’au bon port.' },
  { id: 'routeur', titre: 'Le routeur et sa table', chapitre: 'routage', resume: 'Lire la destination, consulter sa table, choisir le prochain saut — et recommencer au routeur suivant.' },
  { id: 'plus-long-prefixe', titre: 'La plus longue correspondance', chapitre: 'routage', resume: 'Quand plusieurs routes contiennent la destination, la plus précise gagne.' },
  { id: 'ttl-icmp', titre: 'TTL, ICMP, ping et traceroute', chapitre: 'routage', resume: 'La durée de vie d’un paquet, les messages d’erreur d’IP, et les deux outils qui voient le chemin.' },
  { id: 'nat', titre: 'Le NAT : sortir avec une seule adresse', chapitre: 'internet', resume: 'Toute une maison derrière une seule adresse publique — et pourquoi personne n’y entre sans y être invité.' },
  { id: 'routage-dynamique', titre: 'Routage dynamique : OSPF dedans, BGP entre les réseaux', chapitre: 'internet', resume: 'Comment soixante-quinze mille réseaux indépendants apprennent leurs routes et tiennent ensemble.' },
  { id: 'diagnostic', titre: 'Diagnostiquer une panne, du plus proche au plus loin', chapitre: 'maitrise', resume: 'Le lien, l’adresse, la passerelle, la sortie, le nom, le chemin, le service — et les commandes qui le prouvent.' },
  { id: 'conception', titre: 'Concevoir un petit réseau qui route', chapitre: 'maitrise', resume: 'Des besoins à un réseau qui marche, avec un plan d’adressage aligné et un document qui dit tout.' },
] as const;

/**
 * Progression d'exemple, déterministe (même dessin à chaque build) : on avance
 * dans la géode comme on avance vraiment — les premiers cristaux taillés loin,
 * les suivants à peine entamés, et quelques accidents de parcours.
 */
export const IP_PROGRESSION: Record<string, FacetStatus[]> = {
  'adresse-ip':        ['acquise', 'acquise', 'acquise', 'acquise', 'acquise', 'acquise'],
  binaire:             ['acquise', 'acquise', 'acquise', 'araviver', 'acquise', 'acquise'],
  masque:              ['acquise', 'acquise', 'acquise', 'acquise', 'enattente', 'ouverte'],
  'meme-reseau':       ['acquise', 'acquise', 'araviver', 'acquise', 'ouverte', 'vierge'],
  'mac-trame':         ['acquise', 'acquise', 'acquise', 'ouverte', 'vierge', 'vierge'],
  arp:                 ['acquise', 'oubliee', 'acquise', 'echouee', 'vierge', 'vierge'],
  commutateur:         ['acquise', 'acquise', 'ouverte', 'vierge', 'vierge', 'vierge'],
  routeur:             ['acquise', 'acquise', 'enattente', 'vierge', 'vierge', 'vierge'],
  'plus-long-prefixe': ['acquise', 'ouverte', 'vierge', 'vierge', 'vierge', 'vierge'],
  'ttl-icmp':          ['acquise', 'ouverte', 'vierge', 'vierge', 'vierge', 'vierge'],
  nat:                 ['ouverte', 'vierge', 'vierge', 'vierge', 'vierge', 'vierge'],
  'routage-dynamique': ['ouverte', 'vierge', 'vierge', 'vierge', 'vierge', 'vierge'],
  diagnostic:          ['vierge', 'vierge', 'vierge', 'vierge', 'vierge', 'vierge'],
  conception:          ['vierge', 'vierge', 'vierge', 'vierge', 'vierge', 'vierge'],
};

// --------------------------------------------------------------- Graine ----

export type StepState = 'faite' | 'ouverte' | 'avenir' | 'bloquee' | 'vivante';

/** Le chemin d'un système, tel que la Graine le déroule dans sa fenêtre. */
export const GRAINE_ETAPES = [
  { n: 1, nom: 'Accueil', touche: '', glyph: '◇', fait: 'Une graine existe : un exemple, une graine vide, ou une base absorbée — son schéma devient une graine.' },
  { n: 2, nom: 'Domaine', touche: 'Ctrl+2', glyph: '⬡', fait: 'Les entités et leurs champs ; racines, composants, références, listes de choix.' },
  { n: 3, nom: 'Génome', touche: 'Ctrl+3', glyph: '✣', fait: 'Les priorités classées : chaque gène dit ce qui l’a emporté, et ce qui a été sacrifié.' },
  { n: 4, nom: 'Croissance et portes', touche: 'Ctrl+4', glyph: '⇡', fait: 'Copies, processeur, mémoire, ports, préfixe REST.' },
  { n: 5, nom: 'Facettes', touche: 'Ctrl+5', glyph: '◈', fait: 'Ce que la graine devient : schéma SQL ou MongoDB, Compose, Kubernetes, Dockerfile, contrat .proto.' },
  { n: 6, nom: 'Vallée', touche: 'Ctrl+6', glyph: '△', fait: 'Les terrains sondés, chacun avec son génome ; rien ne bouge avant « Semer ».' },
  { n: 7, nom: 'Données', touche: 'Ctrl+7', glyph: '▤', fait: 'Les fiches du système semé, lues par son API comme n’importe quel client.' },
  { n: 8, nom: 'Observatoire', touche: 'Ctrl+8', glyph: '◎', fait: 'Chaque terrain semé en orbite ; chaque appel servi file le long de sa vrille.' },
] as const;

/** Les terrains de la vallée, et le génome que chacun pose sur la graine. */
export const TERRAINS = [
  { id: 'poste', nom: 'Ce poste', role: 'développement', genome: 'SQLite · un processus', copies: 1 },
  { id: 'preprod', nom: 'Préproduction', role: 'Compose sur un serveur SSH', genome: 'Compose · PostgreSQL', copies: 1 },
  { id: 'prod', nom: 'Production', role: 'grappe Kubernetes', genome: 'Kubernetes · PostgreSQL', copies: 3 },
] as const;
