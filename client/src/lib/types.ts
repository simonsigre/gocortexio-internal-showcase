import { z } from "zod";

export const PROJECT_STATUS = ["active", "development", "beta", "deprecated"] as const;
export const PUBLICATION_STATUS = ["draft", "pending-review", "needs-work", "published"] as const;
export const INCUBATION_STATUS = ["none", "nominated", "in-review", "ready", "promoted"] as const;
export const THEATRES = ["NAM", "JAPAC", "EMEA", "LATAM", "Global"] as const;
export const PRODUCTS = ["Cortex XSIAM", "Cortex XDR", "Cortex XSOAR", "Prisma Cloud", "Strata"] as const;

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(10, "Description needs to be at least 10 characters"),
  status: z.enum(PROJECT_STATUS),
  link: z.string().url("Must be a valid URL"),
  language: z.string().min(1, "Primary language is required"),
  repo: z.string().optional(),
  githubApi: z.boolean().default(false),
  product: z.enum(PRODUCTS).optional(),
  author: z.string().min(1, "Author name is required"),
  theatre: z.enum(THEATRES).optional(),
  usecase: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").default(new Date().toISOString().split('T')[0]),

  // Publication & Review Status
  publicationStatus: z.enum(PUBLICATION_STATUS).default("draft"), // Controls visibility in showcase
  submittedBy: z.string().optional(), // Email of submitter
  submittedAt: z.string().optional(), // ISO timestamp
  reviewNotes: z.string().optional(), // Admin feedback for needs-work status

  // Incubation Pipeline
  incubationStatus: z.enum(INCUBATION_STATUS).default("none"),
  maturityScore: z.number().min(0).max(100).optional(), // 0-100 score for Arsenal readiness
  promotionTarget: z.enum(["pre-sales", "regional-nam", "regional-emea", "regional-japac", "global"]).optional(),
  champion: z.string().optional(), // Person championing the project
  // Enriched Data Fields (populated by build script)
  stars: z.number().optional(),
  forks: z.number().optional(),
  lastUpdated: z.string().optional(),
  license: z.string().optional(),
  media: z.object({
    type: z.enum(["image", "youtube"]),
    url: z.string(), // Changed from .url() to allow relative paths like "./thumbnail.png"
    alt: z.string()
  }).optional(),
  // Documentation fields
  readme: z.object({
    url: z.string().optional(),
    content: z.string().optional()
  }).optional(),
  setup: z.object({
    url: z.string().optional(),
    content: z.string().optional()
  }).optional(),
  deployment: z.object({
    url: z.string().optional(),
    content: z.string().optional()
  }).optional(),
  api: z.object({
    url: z.string().optional(),
    content: z.string().optional()
  }).optional(),
  troubleshooting: z.object({
    url: z.string().optional(),
    content: z.string().optional()
  }).optional(),
  contributing: z.object({
    url: z.string().optional(),
    content: z.string().optional()
  }).optional(),
  changelog: z.object({
    url: z.string().optional(),
    content: z.string().optional()
  }).optional(),
  // Standard Operating Procedures
  sops: z.array(z.object({
    title: z.string(),
    url: z.string().optional(),
    content: z.string(),
    category: z.enum(["setup", "deployment", "maintenance", "security"])
  })).optional(),
  // Media gallery for screenshots/videos
  gallery: z.array(z.object({
    type: z.enum(["image", "video", "screenshot"]),
    url: z.string(),
    thumbnail: z.string().optional(),
    caption: z.string().optional()
  })).optional(),

  // Voting System Fields (managed client-side)
  upvotes: z.number().default(0),
  downvotes: z.number().default(0),
});

export type Project = z.infer<typeof projectSchema>;

export const DEFAULT_PROJECT: Partial<Project> = {
  status: "development",
  githubApi: false,
  language: "Python",
  theatre: "Global",
  product: "Cortex XSIAM",
  date: new Date().toISOString().split('T')[0]
};
