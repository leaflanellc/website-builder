import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { ProjectSpecSchema, type GeneratedPage, type ProjectSpec, type SiteDraft } from './types.js';
import { writeJsonFile } from './io.js';

function normalizeForHash(spec: ProjectSpec): string {
  return JSON.stringify(spec);
}

export function computeVersionRef(spec: ProjectSpec): string {
  const hash = createHash('sha256').update(normalizeForHash(spec)).digest('hex');
  return hash.slice(0, 12);
}

export function generateSiteDraft(specInput: unknown): SiteDraft {
  const spec = ProjectSpecSchema.parse(specInput);
  const versionRef = computeVersionRef(spec);

  const pages: GeneratedPage[] = spec.pages.map((page) => {
    const route = page.slug === 'index' ? '/' : `/${page.slug}`;
    const canonicalUrl = `https://${spec.domain}${route}`;

    return {
      slug: page.slug,
      route,
      title: page.title,
      description: page.description,
      metadata: {
        title: `${page.title} | ${spec.seo.defaultTitle}`,
        description: page.description || spec.seo.defaultDescription,
        canonicalUrl,
      },
      sections: [...page.sections].sort((a, b) => a.order - b.order).map((section) => ({
        id: section.id,
        type: section.type,
        title: section.title,
        content: section.content,
        order: section.order,
      })),
    };
  });

  return {
    projectId: spec.projectId,
    versionRef,
    generatedAt: new Date().toISOString(),
    reviewState: 'draft_review_required',
    nav: spec.nav,
    theme: spec.theme,
    analytics: spec.analytics,
    pages,
  };
}

export async function materializeDraftSite(draft: SiteDraft, outDir: string): Promise<void> {
  await writeJsonFile(join(outDir, 'site-draft.json'), draft);
  await writeJsonFile(join(outDir, 'version.json'), {
    projectId: draft.projectId,
    versionRef: draft.versionRef,
    generatedAt: draft.generatedAt,
    reviewState: draft.reviewState,
  });

  for (const page of draft.pages) {
    await writeJsonFile(join(outDir, 'pages', `${page.slug}.json`), page);
  }
}
