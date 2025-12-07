import { Project } from "./types";

export const MOCK_PROJECTS: Project[] = [
  {
    name: "Snellen for Containers",
    description: "A web-based platform for running simulated cyber attacks against containerized environments to test detection capabilities. Features a modular architecture allowing for easy extension of attack scenarios.",
    status: "development",
    link: "https://github.com/simonsigre/snellen-for-containers",
    language: "TypeScript",
    author: "Simon Sigre",
    product: "Cortex XDR",
    theatre: "EMEA",
    usecase: "Simulation",
    githubApi: false,
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1667372393119-c85c020d575c?q=80&w=1000&auto=format&fit=crop",
      alt: "Container visualization"
    }
  },
  {
    name: "XDRTop",
    description: "A high-performance Rust CLI monitoring tool for Cortex XSIAM. Provides real-time metrics on ingestion rates, query performance, and system health in a top-like interface.",
    status: "active",
    link: "https://github.com/gocortexio/xdrtop/releases/latest",
    language: "Rust",
    repo: "gocortexio/xdrtop",
    githubApi: true,
    author: "GoCortex Team",
    product: "Cortex XSIAM",
    theatre: "Global",
    usecase: "Monitoring",
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop",
      alt: "Terminal dashboard"
    }
  },
  {
    name: "SignalBench",
    description: "Generates endpoint telemetry aligned with MITRE ATT&CK techniques for validating detection logic. Capable of generating high-volume realistic traffic patterns.",
    status: "active",
    link: "https://github.com/gocortexio/signalbench",
    language: "Rust",
    repo: "gocortexio/signalbench",
    githubApi: true,
    author: "Security Research Team",
    product: "Cortex XDR",
    theatre: "NAM",
    usecase: "Testing",
    media: {
      type: "youtube",
      url: "dQw4w9WgXcQ", // Rick roll as placeholder from example
      alt: "SignalBench Demo"
    }
  },
  {
    name: "XSOAR-Lint",
    description: "Static code analysis tool specifically designed for XSOAR automations and integrations. Checks for common best practices, security issues, and performance bottlenecks.",
    status: "beta",
    link: "https://github.com/example/xsoar-lint",
    language: "Python",
    author: "DevOps Team",
    product: "Cortex XSOAR",
    theatre: "JAPAC",
    usecase: "Development",
    githubApi: false,
  },
  {
    name: "Cloud-Sentry",
    description: "Automated remediation framework for Prisma Cloud alerts. Connects to various cloud providers to enforce security policies in real-time.",
    status: "deprecated",
    link: "https://github.com/example/cloud-sentry",
    language: "Go",
    author: "Cloud Ops",
    product: "Prisma Cloud",
    theatre: "Global",
    usecase: "Remediation",
    githubApi: false,
  }
];
