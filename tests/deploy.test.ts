import { describe, expect, it } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { createPreviewDeployment, publishLatestPreview } from '../src/deploy.js';
import { generateSiteDraft, materializeDraftSite } from '../src/generator.js';

const spec = JSON.parse(readFileSync('examples/project-spec.json', 'utf8'));

describe('deployment flow', () => {
  it('creates preview then production deployment linked by promotion id', async () => {
    const root = await mkdtemp(join(tmpdir(), 'wb-'));
    try {
      const siteDir = join(root, 'site');
      const storePath = join(root, 'deployments.json');
      const draft = generateSiteDraft(spec);
      await materializeDraftSite(draft, siteDir);

      const preview = await createPreviewDeployment(siteDir, storePath);
      const production = await publishLatestPreview(siteDir, storePath);

      expect(preview.env).toEqual('preview');
      expect(production.env).toEqual('production');
      expect(production.promotedFromDeploymentId).toEqual(preview.id);

      const saved = JSON.parse(await readFile(storePath, 'utf8')) as { deployments: Array<{ id: string }> };
      expect(saved.deployments).toHaveLength(2);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('fails publish when no preview exists', async () => {
    const root = await mkdtemp(join(tmpdir(), 'wb-'));
    try {
      const siteDir = join(root, 'site');
      const storePath = join(root, 'deployments.json');
      const draft = generateSiteDraft(spec);
      await materializeDraftSite(draft, siteDir);

      await expect(publishLatestPreview(siteDir, storePath)).rejects.toThrow(
        'No preview deployment exists for this project. Run preview first.',
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
