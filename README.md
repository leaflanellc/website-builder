# Website Builder Generation Pipeline (LEA-133)

Deterministic `ProjectSpec` to site-draft pipeline with preview/publish deployment metadata tracking.

## Commands

- `npm run generate` - generate draft site files from `examples/project-spec.json`
- `npm run preview` - create preview deployment metadata record
- `npm run publish` - promote latest preview to production metadata record
- `npm test` - run unit tests
- `npm run build` - type-check and build

## Output

Generated artifacts land in `.generated/`:

- `site/site-draft.json`
- `site/version.json`
- `site/pages/*.json`
- `deployments.json`

## Notes

- Generation is deterministic: `versionRef` is hash-derived from normalized `ProjectSpec`.
- `reviewState` defaults to `draft_review_required` to keep content reviewable/editable before publish.
- Preview and production deployments are persisted with reproducible `projectId + versionRef + siteDigest` metadata.
