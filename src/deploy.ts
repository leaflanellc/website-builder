import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { readJsonFile, writeJsonFile } from './io.js';

export type DeploymentEnv = 'preview' | 'production';

export type DeploymentRecord = {
  id: string;
  env: DeploymentEnv;
  projectId: string;
  versionRef: string;
  siteDigest: string;
  createdAt: string;
  source: 'automation';
  promotedFromDeploymentId?: string;
};

export type DeploymentStore = {
  deployments: DeploymentRecord[];
};

async function computeSiteDigest(siteDir: string): Promise<string> {
  const draftText = await readFile(join(siteDir, 'site-draft.json'), 'utf8');
  return createHash('sha256').update(draftText).digest('hex').slice(0, 16);
}

async function loadStore(storePath: string): Promise<DeploymentStore> {
  try {
    return await readJsonFile<DeploymentStore>(storePath);
  } catch {
    return { deployments: [] };
  }
}

function createDeploymentId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${random}`;
}

async function readVersion(siteDir: string): Promise<{ projectId: string; versionRef: string }> {
  return readJsonFile(join(siteDir, 'version.json'));
}

export async function createPreviewDeployment(siteDir: string, storePath: string): Promise<DeploymentRecord> {
  const store = await loadStore(storePath);
  const version = await readVersion(siteDir);
  const siteDigest = await computeSiteDigest(siteDir);

  const record: DeploymentRecord = {
    id: createDeploymentId('prv'),
    env: 'preview',
    projectId: version.projectId,
    versionRef: version.versionRef,
    siteDigest,
    createdAt: new Date().toISOString(),
    source: 'automation',
  };

  store.deployments.push(record);
  await writeJsonFile(storePath, store);
  return record;
}

export async function publishLatestPreview(siteDir: string, storePath: string): Promise<DeploymentRecord> {
  const store = await loadStore(storePath);
  const version = await readVersion(siteDir);
  const siteDigest = await computeSiteDigest(siteDir);

  const latestPreview = [...store.deployments]
    .reverse()
    .find((item) => item.env === 'preview' && item.projectId === version.projectId);

  if (!latestPreview) {
    throw new Error('No preview deployment exists for this project. Run preview first.');
  }

  const record: DeploymentRecord = {
    id: createDeploymentId('prod'),
    env: 'production',
    projectId: version.projectId,
    versionRef: version.versionRef,
    siteDigest,
    createdAt: new Date().toISOString(),
    source: 'automation',
    promotedFromDeploymentId: latestPreview.id,
  };

  store.deployments.push(record);
  await writeJsonFile(storePath, store);
  return record;
}
