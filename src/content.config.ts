import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
// `z` réexporté depuis astro:content est déprécié ; on prend la source directe.
import { z } from 'astro/zod';

/**
 * Content Layer (Astro 5+) : le contenu est une source de données typée,
 * pas un dossier de pages. Conséquences concrètes —
 *  - ajouter un logiciel = déposer UN fichier Markdown, rien d'autre ;
 *  - une faute de frappe dans un frontmatter casse le build, pas la page en
 *    production ;
 *  - l'autocomplétion connaît les champs dans les templates.
 */

const logiciels = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/logiciels' }),
  schema: z.object({
    title: z.string(),
    /** Une phrase. Sert dans les cartes, l'OG et les listes. */
    summary: z.string().max(200),
    status: z.enum(['stable', 'beta', 'alpha', 'laboratoire']),
    /** Ordre d'affichage : plus petit = plus haut. */
    order: z.number().default(50),
    featured: z.boolean().default(false),
    stack: z.array(z.string()).default([]),
    glyph: z.string().default('◈'),
    accent: z.enum(['gold', 'plasma', 'nebula', 'ember']).default('gold'),
    /** Trois arguments courts affichés en haut de la fiche. */
    highlights: z.array(z.string()).default([]),
    repo: z.string().url().optional(),
    download: z.string().url().optional(),
    year: z.number().optional(),
  }),
});

const tutoriels = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/tutoriels' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().max(240),
    /** Slug du logiciel concerné — relie le tutoriel à sa fiche. */
    logiciel: z.string().optional(),
    level: z.enum(['découverte', 'intermédiaire', 'avancé']),
    /** Durée de lecture annoncée, en minutes. */
    duration: z.number(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { logiciels, tutoriels };
