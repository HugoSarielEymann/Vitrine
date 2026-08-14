---
title: MicroForge
summary: Une bibliothèque de micropackages .NET qui empêche une IA de réécrire cent fois le même code générique.
status: beta
order: 10
featured: true
stack: ['C#', '.NET 9', 'NuGet', 'CLI']
glyph: '⬡'
accent: 'gold'
highlights:
  - 'Recherche sémantique avant génération'
  - 'Validation opposable à la publication'
  - 'Catalogue d’aléas de test partagé'
year: 2026
---

## Le problème

Une IA qui génère du C# recommence à chaque projet : une politique de relance
ici, un découpeur de lots là, un parseur de durées ailleurs. Le code produit
est correct, mais il est neuf à chaque fois — donc jamais éprouvé, jamais
testé deux fois, jamais amélioré.

## Ce que fait MicroForge

MicroForge transforme ce code jetable en **capital**. Chaque brique générique
devient un package NuGet versionné, documenté et testé, que la génération
suivante retrouve par recherche en langage naturel au lieu de le réinventer.

Le workflow est volontairement contraignant :

1. La bibliothèque standard couvre-t-elle déjà le besoin ? Alors on l'utilise.
2. Sinon, `forge search` interroge le catalogue existant.
3. Rien ne correspond ? On forge le micropackage — et il devient disponible
   pour tous les projets suivants.

## Le validateur

Publier n'est pas automatique. `forge publish` oppose quatre refus :
violation de règle, version déjà publiée, incrément insuffisant, quasi-doublon.
Aucun ne se contourne — c'est ce qui garde le catalogue utilisable après deux
cents packages.

Les effets non déterministes sont interdits dans `src/` : pas d'horloge système,
pas d'accès disque, pas d'aléa sans graine. Tout est injecté. Un micropackage
qu'on ne peut pas tester en isolation n'entre pas dans la bibliothèque.

## Les aléas

Un « aléa » est une classe d'entrées dangereuses déjà rencontrée ailleurs :
`null-input`, `numeric-overflow`, `secret-leak`, `unicode-edge`, `cancellation`.
Chaque package déclare ceux qu'il affronte, et **doit** en apporter la preuve
par un test tracé. L'expérience acquise sur un projet cesse d'être redécouverte
au projet suivant.
