#!/usr/bin/env node
import { join } from 'node:path';
import { generateSiteDraft, materializeDraftSite } from './generator.js';
import { createPreviewDeployment, publishLatestPreview } from './deploy.js';
import { readJsonFile } from './io.js';

function getArgValue(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  return args[index + 1];
}

async function run(): Promise<void> {
  const [, , command, ...args] = process.argv;

  if (!command) {
    throw new Error('Missing command. Use generate|preview|publish');
  }

  if (command === 'generate') {
    const specPath = getArgValue(args, '--spec');
    const outDir = getArgValue(args, '--out');
    if (!specPath || !outDir) {
      throw new Error('generate requires --spec <path> and --out <dir>');
    }

    const spec = await readJsonFile<unknown>(specPath);
    const draft = generateSiteDraft(spec);
    await materializeDraftSite(draft, outDir);
    console.log(`Generated draft site for ${draft.projectId} @ ${draft.versionRef}`);
    return;
  }

  if (command === 'preview') {
    const siteDir = getArgValue(args, '--site');
    const env = getArgValue(args, '--env');
    if (!siteDir || env !== 'preview') {
      throw new Error('preview requires --site <dir> --env preview');
    }
    const storePath = join(siteDir, '..', 'deployments.json');
    const record = await createPreviewDeployment(siteDir, storePath);
    console.log(`Created preview deployment ${record.id} for version ${record.versionRef}`);
    return;
  }

  if (command === 'publish') {
    const siteDir = getArgValue(args, '--site');
    const env = getArgValue(args, '--env');
    if (!siteDir || env !== 'production') {
      throw new Error('publish requires --site <dir> --env production');
    }
    const storePath = join(siteDir, '..', 'deployments.json');
    const record = await publishLatestPreview(siteDir, storePath);
    console.log(`Published deployment ${record.id} from preview ${record.promotedFromDeploymentId}`);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
