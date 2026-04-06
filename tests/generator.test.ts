import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { generateSiteDraft } from '../src/generator.js';

const spec = JSON.parse(readFileSync('examples/project-spec.json', 'utf8'));

describe('generateSiteDraft', () => {
  it('produces deterministic version refs from the same spec', () => {
    const first = generateSiteDraft(spec);
    const second = generateSiteDraft(spec);
    expect(first.versionRef).toEqual(second.versionRef);
    expect(first.reviewState).toEqual('draft_review_required');
  });

  it('maps index slug to root route and sorts sections', () => {
    const draft = generateSiteDraft(spec);
    const home = draft.pages.find((page) => page.slug === 'index');
    expect(home?.route).toEqual('/');
    expect(home?.sections.map((section) => section.order)).toEqual([0, 1, 2]);
  });
});
