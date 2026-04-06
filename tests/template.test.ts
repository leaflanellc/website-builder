import { describe, expect, it } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { generateSiteDraft } from '../src/generator.js';
import { materializeStaticTemplate } from '../src/template.js';

const spec = JSON.parse(readFileSync('examples/project-spec.json', 'utf8'));

describe('template renderer', () => {
  it('renders index html and css for static deployment', async () => {
    const root = await mkdtemp(join(tmpdir(), 'wb-template-'));
    try {
      const outDir = join(root, 'static');
      const draft = generateSiteDraft(spec);
      await materializeStaticTemplate(draft, outDir);

      const homeHtml = await readFile(join(outDir, 'index.html'), 'utf8');
      const css = await readFile(join(outDir, 'assets', 'site.css'), 'utf8');

      expect(homeHtml).toContain('<!doctype html>');
      expect(homeHtml).toContain('Generated version');
      expect(css).toContain('--primary');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
