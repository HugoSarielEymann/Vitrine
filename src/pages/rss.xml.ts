import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE } from '../consts';

/**
 * Flux RSS des tutoriels. Généré au build, servi comme un fichier statique.
 * Les brouillons (`draft: true`) en sont exclus au même titre que des pages.
 */
export async function GET(context: APIContext) {
  const tutoriels = (await getCollection('tutoriels', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  return rss({
    title: `${SITE.name} — Tutoriels`,
    description: 'Guides pas à pas pour prendre en main chaque logiciel.',
    site: context.site ?? SITE.url,
    trailingSlash: false,
    items: tutoriels.map((t) => ({
      title: t.data.title,
      description: t.data.summary,
      pubDate: t.data.date,
      link: `/tutoriels/${t.id}`,
      categories: t.data.tags,
    })),
    customData: '<language>fr-fr</language>',
  });
}
