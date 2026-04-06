import { z } from 'zod';

export const SectionSpecSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['hero', 'features', 'testimonials', 'cta', 'faq', 'custom']),
  title: z.string().min(1),
  content: z.string().min(1),
  order: z.number().int().nonnegative(),
});

export const PageSpecSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  sections: z.array(SectionSpecSchema).min(1),
});

export const ProjectSpecSchema = z.object({
  specVersion: z.literal('1.0'),
  projectId: z.string().min(1),
  companyName: z.string().min(1),
  domain: z.string().min(1),
  theme: z.object({
    primaryColor: z.string().min(1),
    secondaryColor: z.string().min(1),
    fontFamily: z.string().min(1),
  }),
  nav: z.array(z.object({ label: z.string().min(1), href: z.string().min(1) })).min(1),
  pages: z.array(PageSpecSchema).min(1),
  seo: z.object({
    defaultTitle: z.string().min(1),
    defaultDescription: z.string().min(1),
  }),
  analytics: z.object({ provider: z.string().min(1), trackingId: z.string().min(1) }),
});

export type SectionSpec = z.infer<typeof SectionSpecSchema>;
export type PageSpec = z.infer<typeof PageSpecSchema>;
export type ProjectSpec = z.infer<typeof ProjectSpecSchema>;

export type GeneratedSection = {
  id: string;
  type: SectionSpec['type'];
  title: string;
  content: string;
  order: number;
};

export type GeneratedPage = {
  slug: string;
  route: string;
  title: string;
  description: string;
  metadata: {
    title: string;
    description: string;
    canonicalUrl: string;
  };
  sections: GeneratedSection[];
};

export type SiteDraft = {
  projectId: string;
  versionRef: string;
  generatedAt: string;
  reviewState: 'draft_review_required' | 'approved';
  nav: ProjectSpec['nav'];
  theme: ProjectSpec['theme'];
  analytics: ProjectSpec['analytics'];
  pages: GeneratedPage[];
};
