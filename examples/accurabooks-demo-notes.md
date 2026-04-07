# AccuraBooks Demo Notes

## Source spec

- `examples/accurabooks-project-spec.json`
- target packet reference: [LEA-147](/LEA/issues/LEA-147)

## Generated output

- draft site JSON: `.generated/demos/accurabooks/site/site-draft.json`
- static site files: `.generated/demos/accurabooks/site-static/`
- deployment metadata: `.generated/demos/accurabooks/deployments.json`

## Real vs mocked

Real from source packet:
- company identity and market/category
- operating since 2008
- Austin/Round Rock/Georgetown coverage
- named operator: David Kuzak
- named customer/proof list

Mocked/placeholder:
- scheduling endpoint and contact form wiring
- GA4 tracking id (`G-ACCURADEMO`)
- demo domain (`accurabooks-demo.leaflane.co`)
- testimonial quote text (only named proof block included)

## Fastest external-share path

1. Push branch/commit to `main` (already wired to `leaflanellc/website-builder`).
2. In Netlify site `website-builder-leaflane`, set publish directory to `.generated/demos/accurabooks/site-static`.
3. Trigger deploy and share Netlify deploy URL.

Alternative:
- keep current project publish dir (`.generated/site-static`) and copy this demo static output into that path in a dedicated release commit before deploy.
