import { z } from "zod";

export const PROJECT_STATUS = ["active", "development", "beta", "deprecated"] as const;
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
  product: z.enum(PRODUCTS).optional(), // New field
  author: z.string().min(1, "Author name is required"), // New field
  theatre: z.enum(THEATRES).optional(), // New field
  usecase: z.string().optional(), // New field
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").default(new Date().toISOString().split('T')[0]), // New field for release period filtering
  // Enriched Data Fields (populated by build script)
  stars: z.number().optional(),
  forks: z.number().optional(),
  lastUpdated: z.string().optional(),
  license: z.string().optional(),
  media: z.object({
    type: z.enum(["image", "youtube"]),
    url: z.string(), // Changed from .url() to allow relative paths like "./thumbnail.png"
    alt: z.string()
  }).optional()
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
