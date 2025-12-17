import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Package, Calendar, GitBranch, CheckCircle2, Star, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { Project } from "@/lib/types";

interface ArsenalRelease {
  version: string;
  releaseDate: string;
  downloadUrl: string;
  size: string;
  description: string;
  highlights: string[];
  includedTools: {
    name: string;
    version: string;
    product: string;
    category: string;
  }[];
  salesProcesses: string[];
  changelog: string[];
}

// Mock release data - in production, this would come from an API or GitHub Releases
const latestRelease: ArsenalRelease = {
  version: "v2024.12.0",
  releaseDate: "2024-12-08",
  downloadUrl: "https://github.com/Palo-Cortex/cortex-arsenal/releases/latest",
  size: "2.4 GB",
  description: "The Cortex Arsenal is a comprehensive compilation of battle-tested technical content, demo environments, and sales enablement resources for Palo Alto Networks Cortex products. This release includes the latest incubated and promoted tools aligned to specific sales processes.",
  highlights: [
    "11 new SOC optimization playbooks from Palo-Cortex",
    "Enhanced XSIAM demo environments with CDR scenarios",
    "Updated Prisma Cloud compliance frameworks",
    "New XDR threat simulation tools",
    "Improved sales process alignment documentation"
  ],
  includedTools: [
    { name: "XDRTop", version: "v2.1.0", product: "Cortex XSIAM", category: "Monitoring" },
    { name: "MockTAXII", version: "v1.5.0", product: "Cortex XSIAM", category: "Testing" },
    { name: "SignalBench", version: "v3.0.0", product: "Cortex XDR", category: "Testing" },
    { name: "GCGit", version: "v1.2.0", product: "Cortex XSIAM", category: "Development" },
    { name: "AckbarX", version: "v2.0.0", product: "Cortex XSIAM", category: "Connectivity" },
    { name: "Broken Bank", version: "v1.8.0", product: "Cortex XSIAM", category: "Training" },
    { name: "SOC Framework", version: "v3.0.0", product: "Cortex XSIAM", category: "Framework" },
    { name: "SOC Toolkit", version: "v2.5.0", product: "Cortex XSIAM", category: "Utility" },
    { name: "PyGremlinBox", version: "v1.3.0", product: "Prisma Cloud", category: "Testing" },
    { name: "sigma2xsiam", version: "v1.4.0", product: "Cortex XSIAM", category: "Utility" }
  ],
  salesProcesses: [
    "Discovery & Assessment",
    "Proof of Concept (POC)",
    "Technical Deep Dives",
    "Competitive Differentiation",
    "Customer Success Enablement"
  ],
  changelog: [
    "Added 11 vendor-specific SOC playbooks (Crowdstrike, Microsoft Defender, Proofpoint, etc.)",
    "Introduced MITRE Turla Carbon threat emulation scenario",
    "Enhanced SOC optimization framework with new maturity models",
    "Updated threat intelligence feeds integration",
    "Improved documentation and setup automation",
    "Added pre-configured demo environments for rapid deployment"
  ]
};

const previousReleases = [
  { version: "v2024.11.0", date: "2024-11-15", tools: 45 },
  { version: "v2024.10.0", date: "2024-10-20", tools: 42 },
  { version: "v2024.09.0", date: "2024-09-18", tools: 38 }
];

export default function ArsenalPage() {
  const [release] = useState<ArsenalRelease>(latestRelease);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch projects to link in Arsenal
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('projects.json');
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 py-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Package className="w-12 h-12 text-primary" />
          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-widest">
            Cortex <span className="text-primary glow-text">Arsenal</span>
          </h1>
        </div>
        <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
          The definitive collection of technical content, demo environments, and sales enablement resources
          for Palo Alto Networks Cortex ecosystem. Curated, tested, and aligned to your sales process.
        </p>
      </motion.div>

      {/* Release Selection Process - Optimized */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-primary" />
              Arsenal Release Process
            </CardTitle>
            <CardDescription>
              Community projects are curated through a rigorous review and incubation process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Stage 1 */}
              <div className="relative p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
                <div className="absolute -top-3 left-4 bg-card px-2">
                  <Badge variant="outline" className="border-blue-500 text-blue-500">Stage 1</Badge>
                </div>
                <h4 className="font-semibold mb-3 mt-2">Initial Review</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Documentation completeness</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Code quality assessment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Security validation</span>
                  </li>
                </ul>
              </div>

              {/* Stage 2 */}
              <div className="relative p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
                <div className="absolute -top-3 left-4 bg-card px-2">
                  <Badge variant="outline" className="border-yellow-500 text-yellow-500">Stage 2</Badge>
                </div>
                <h4 className="font-semibold mb-3 mt-2">Incubation Pipeline</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Champion nomination</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Technical deep dive</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Production testing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Maturity scoring (0-100)</span>
                  </li>
                </ul>
              </div>

              {/* Stage 3 */}
              <div className="relative p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/50">
                <div className="absolute -top-3 left-4 bg-card px-2">
                  <Badge className="bg-primary text-black">Stage 3</Badge>
                </div>
                <h4 className="font-semibold mb-3 mt-2">Arsenal Release</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Score ≥ 85 required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Version tagged</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Distribution bundle</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Sales enablement</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Maturity Score Breakdown */}
            <div className="mt-6 p-4 bg-card rounded-lg border border-primary/30">
              <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                Maturity Score Criteria (0-100)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-2 rounded bg-accent/20">
                  <div className="text-2xl font-bold text-primary">25</div>
                  <div className="text-xs text-muted-foreground mt-1">Documentation</div>
                </div>
                <div className="text-center p-2 rounded bg-accent/20">
                  <div className="text-2xl font-bold text-primary">25</div>
                  <div className="text-xs text-muted-foreground mt-1">Code Quality</div>
                </div>
                <div className="text-center p-2 rounded bg-accent/20">
                  <div className="text-2xl font-bold text-primary">25</div>
                  <div className="text-xs text-muted-foreground mt-1">Production Usage</div>
                </div>
                <div className="text-center p-2 rounded bg-accent/20">
                  <div className="text-2xl font-bold text-primary">25</div>
                  <div className="text-xs text-muted-foreground mt-1">Community Adoption</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Latest Release Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-primary/30 bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Badge variant="default" className="bg-primary text-primary-foreground text-lg px-4 py-1">
                    Latest Release
                  </Badge>
                  <h2 className="text-3xl font-display font-bold">{release.version}</h2>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(release.releaseDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    {release.includedTools.length} Tools
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    {release.size}
                  </span>
                </div>
              </div>
              <Button size="lg" className="gap-2" asChild>
                <a href={release.downloadUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="w-5 h-5" />
                  Download Arsenal
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Description */}
            <p className="text-base leading-relaxed">{release.description}</p>

            {/* Highlights */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Release Highlights
              </h3>
              <ul className="space-y-2">
                {release.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Included Tools */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Included Tools ({projects.filter(p => p.status === 'active').length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projects
                  .filter(p => p.status === 'active')
                  .slice(0, 10)
                  .map((project, idx) => (
                    <Link key={idx} href={`/project/${project.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:border-primary/50 transition-all cursor-pointer group">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold group-hover:text-primary transition-colors truncate">
                            {project.name}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {project.usecase || project.language}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          {project.stars !== undefined && (
                            <Badge variant="outline" className="mb-1">
                              <Star className="w-3 h-3 mr-1" />
                              {project.stars}
                            </Badge>
                          )}
                          <div className="text-xs text-muted-foreground truncate">
                            {project.product}
                          </div>
                        </div>
                        <Eye className="w-4 h-4 ml-2 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      </div>
                    </Link>
                  ))}
              </div>
            </div>

            {/* Sales Process Alignment */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-primary" />
                Sales Process Alignment
              </h3>
              <div className="flex flex-wrap gap-2">
                {release.salesProcesses.map((process, idx) => (
                  <Badge key={idx} variant="secondary" className="text-sm px-3 py-1">
                    {process}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Changelog */}
            <div>
              <h3 className="text-lg font-semibold mb-3">What's New</h3>
              <ul className="space-y-2 text-sm">
                {release.changelog.map((change, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary mt-1">▸</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Previous Releases */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Previous Releases</CardTitle>
            <CardDescription>Download earlier versions of the Cortex Arsenal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {previousReleases.map((prev, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Package className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-semibold">{prev.version}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(prev.date).toLocaleDateString()} • {prev.tools} tools
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <a
                      href={`https://github.com/Palo-Cortex/cortex-arsenal/releases/tag/${prev.version}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Installation Guide */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Start Guide</CardTitle>
            <CardDescription>Get started with the Cortex Arsenal in minutes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Download the Arsenal</h4>
                  <p className="text-sm text-muted-foreground">
                    Click the download button above to get the latest release package
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Extract & Configure</h4>
                  <p className="text-sm text-muted-foreground">
                    Unzip the archive and run the setup script to configure your environment
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Deploy Tools</h4>
                  <p className="text-sm text-muted-foreground">
                    Follow the included documentation to deploy tools based on your sales process needs
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
