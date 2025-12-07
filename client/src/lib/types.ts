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
  media: z.object({
    type: z.enum(["image", "youtube"]),
    url: z.string().url(),
    alt: z.string()
  }).optional()
});

export type Project = z.infer<typeof projectSchema>;

export const DEFAULT_PROJECT: Partial<Project> = {
  status: "development",
  githubApi: false,
  language: "Python",
  theatre: "Global",
  product: "Cortex XSIAM"
};
