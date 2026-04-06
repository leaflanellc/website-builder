import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { SiteDraft, GeneratedPage } from './types.js';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderSection(section: GeneratedPage['sections'][number]): string {
  return `<section data-type="${section.type}" id="${escapeHtml(section.id)}"><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.content)}</p></section>`;
}

function renderPage(draft: SiteDraft, page: GeneratedPage): string {
  const navLinks = draft.nav
    .map((item) => `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`)
    .join('');

  const sections = page.sections.map(renderSection).join('');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(page.metadata.title)}</title>
    <meta name="description" content="${escapeHtml(page.metadata.description)}" />
    <link rel="canonical" href="${escapeHtml(page.metadata.canonicalUrl)}" />
    <link rel="stylesheet" href="/assets/site.css" />
  </head>
  <body>
    <header>
      <h1>${escapeHtml(draft.projectId)}</h1>
      <nav>${navLinks}</nav>
    </header>
    <main>
      <article>
        <h1>${escapeHtml(page.title)}</h1>
        <p>${escapeHtml(page.description)}</p>
        ${sections}
      </article>
    </main>
    <footer><small>Generated version ${escapeHtml(draft.versionRef)}</small></footer>
  </body>
</html>`;
}

function renderCss(draft: SiteDraft): string {
  return `:root {
  --primary: ${draft.theme.primaryColor};
  --secondary: ${draft.theme.secondaryColor};
  --font: ${draft.theme.fontFamily}, serif;
}
body { margin: 0; font-family: var(--font); background: #fff; color: #111; }
header { background: var(--primary); color: #fff; padding: 1rem; display: flex; gap: 1rem; align-items: center; }
nav a { color: #fff; margin-right: 0.75rem; text-decoration: none; }
main { padding: 1.5rem; }
article { max-width: 800px; }
section { border-top: 1px solid #ddd; padding: 1rem 0; }
footer { background: var(--secondary); padding: 1rem; }
`;
}

export async function materializeStaticTemplate(draft: SiteDraft, outDir: string): Promise<void> {
  await mkdir(join(outDir, 'assets'), { recursive: true });
  await writeFile(join(outDir, 'assets', 'site.css'), renderCss(draft), 'utf8');

  for (const page of draft.pages) {
    const filePath = page.slug === 'index' ? join(outDir, 'index.html') : join(outDir, page.slug, 'index.html');
    await mkdir(join(filePath, '..'), { recursive: true });
    await writeFile(filePath, renderPage(draft, page), 'utf8');
  }
}
