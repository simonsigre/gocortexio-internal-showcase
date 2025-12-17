import { useState } from "react";
import { Link } from "wouter";
import { Project } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ExternalLink, Github, ChevronDown, ChevronUp, Play, Image as ImageIcon, Star, GitFork, Scale, Eye, ArrowUp, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import { VoteType } from "@/hooks/useVoting";

const STATUS_COLOURS = {
  active: "text-[#00cd67] border-[#00cd67] bg-[#00cd67]/10",
  development: "text-[#f0a020] border-[#f0a020] bg-[#f0a020]/10",
  beta: "text-[#4a9eff] border-[#4a9eff] bg-[#4a9eff]/10",
  deprecated: "text-[#ff4444] border-[#ff4444] bg-[#ff4444]/10",
};

const LANGUAGE_COLOURS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#2b7489",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#ffac45",
  Kotlin: "#F18E33",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Default: "#888888",
};

// Helper function to get product-specific colors (PANW branding)
function getProductColor(product: string): string {
  const colorMap: Record<string, string> = {
    'Cortex XSIAM': 'bg-[#00cd67]/20 text-[#00cd67] border-[#00cd67]/30', // Green
    'Cortex XDR': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', // Cyan
    'Cortex XSOAR': 'bg-purple-500/20 text-purple-400 border-purple-500/30', // Purple
    'Prisma Cloud': 'bg-blue-500/20 text-blue-400 border-blue-500/30', // Blue
    'Strata': 'bg-orange-500/20 text-orange-400 border-orange-500/30', // Orange
  };
  return colorMap[product] || 'bg-secondary';
}

interface ProjectCardProps {
  project: Project;
  userVote?: VoteType;
  netScore?: number;
  onVote?: (projectName: string, voteType: VoteType) => void;
}

export function ProjectCard({ project, userVote = 0, netScore = 0, onVote }: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusClass = STATUS_COLOURS[project.status as keyof typeof STATUS_COLOURS] || STATUS_COLOURS.development;

  const handleUpvote = () => {
    if (onVote) {
      onVote(project.name, 1);
    }
  };

  const handleDownvote = () => {
    if (onVote) {
      onVote(project.name, -1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className="bg-card border-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,205,103,0.1)] flex flex-col md:flex-row h-full">
        {/* Voting Area */}
        <div className="flex flex-row md:flex-col items-center justify-center gap-1 p-3 md:p-2 md:w-16 bg-black/10 border-b md:border-b-0 md:border-r border-border">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 hover:bg-primary/20 transition-all",
              userVote === 1 && "text-primary bg-primary/10 hover:bg-primary/20"
            )}
            onClick={handleUpvote}
            title="Upvote"
          >
            <ArrowUp className={cn("w-5 h-5", userVote === 1 && "fill-primary")} />
          </Button>
          <div className={cn(
            "text-sm font-bold font-mono px-2 md:px-0",
            netScore > 0 && "text-primary",
            netScore < 0 && "text-red-400",
            netScore === 0 && "text-muted-foreground"
          )}>
            {netScore > 0 ? `+${netScore}` : netScore}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 hover:bg-destructive/20 transition-all",
              userVote === -1 && "text-destructive bg-destructive/10 hover:bg-destructive/20"
            )}
            onClick={handleDownvote}
            title="Downvote"
          >
            <ArrowDown className={cn("w-5 h-5", userVote === -1 && "fill-destructive")} />
          </Button>
        </div>

        {/* Visual Area */}
        <div className="w-full md:w-[280px] h-[200px] md:h-auto bg-black/20 shrink-0 border-b md:border-b-0 md:border-r border-border relative overflow-hidden group-hover:border-primary/50 transition-colors">
          {project.media ? (
            project.media.type === "youtube" ? (
              <div className="w-full h-full flex items-center justify-center bg-black relative group/media cursor-pointer">
                <img
                  src={`https://img.youtube.com/vi/${project.media.url}/0.jpg`}
                  alt={project.media.alt}
                  className="w-full h-full object-cover opacity-70 group-hover/media:opacity-90 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover/media:scale-110 transition-transform">
                    <Play className="fill-white text-white ml-1" />
                  </div>
                </div>
              </div>
            ) : (
              <img
                src={project.media.url}
                alt={project.media.alt}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            )
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
              {/* Background gradient based on product */}
              <div className={cn(
                "absolute inset-0 opacity-10",
                project.product === 'Cortex XSIAM' && "bg-gradient-to-br from-[#00cd67] to-[#00d9ff]",
                project.product === 'Cortex XDR' && "bg-gradient-to-br from-cyan-500 to-blue-500",
                project.product === 'Cortex XSOAR' && "bg-gradient-to-br from-purple-500 to-pink-500",
                project.product === 'Prisma Cloud' && "bg-gradient-to-br from-blue-500 to-indigo-500",
                project.product === 'Strata' && "bg-gradient-to-br from-orange-500 to-red-500",
                !project.product && "bg-gradient-to-br from-gray-500 to-gray-700"
              )} />

              {/* Grid pattern overlay */}
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `linear-gradient(90deg, currentColor 1px, transparent 1px),
                                   linear-gradient(180deg, currentColor 1px, transparent 1px)`,
                  backgroundSize: '20px 20px'
                }}
              />

              {/* Cortex logo placeholder */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={cn(
                  "w-20 h-20 rounded-lg flex items-center justify-center mb-3 shadow-lg",
                  "bg-gradient-to-br from-[#00d9ff] to-[#00cd67]"
                )}>
                  <span className="text-black font-bold text-3xl font-display">C</span>
                </div>
                <span className="text-xs uppercase tracking-widest opacity-70 text-muted-foreground font-mono">
                  {project.product || "Cortex Ecosystem"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 flex flex-col">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h3 className="text-lg font-bold font-mono uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              {/* Tags */}
              {(project.product || project.usecase || project.theatre) && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {project.product && (
                    <Link href={`/?product=${encodeURIComponent(project.product)}`}>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] px-2 py-0.5 cursor-pointer hover:opacity-80 transition-opacity",
                          getProductColor(project.product)
                        )}
                      >
                        {project.product}
                      </Badge>
                    </Link>
                  )}
                  {project.usecase && (
                    <Link href={`/?usecase=${encodeURIComponent(project.usecase)}`}>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-2 py-0.5 border-primary/30 text-primary cursor-pointer hover:bg-primary/10 transition-colors"
                      >
                        {project.usecase}
                      </Badge>
                    </Link>
                  )}
                  {project.theatre && (
                    <Link href={`/?theatre=${encodeURIComponent(project.theatre)}`}>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-2 py-0.5 cursor-pointer hover:bg-accent transition-colors"
                      >
                        {project.theatre}
                      </Badge>
                    </Link>
                  )}
                </div>
              )}
              {project.author && (
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground font-mono text-primary/80">@{project.author}</span>
                </div>
              )}
            </div>
            <Badge variant="outline" className={cn("uppercase tracking-wider text-[10px] font-bold px-2 py-0.5 h-6", statusClass)}>
              {project.status}
            </Badge>
          </div>

          {/* Stats Bar */}
          {project.githubApi && (project.stars !== undefined || project.forks !== undefined) && (
            <div className="flex items-center gap-4 mb-3 pb-3 border-b border-border/40">
              {project.stars !== undefined && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground" title="GitHub Stars">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500/20" />
                  <span className="font-mono">{project.stars}</span>
                </div>
              )}
              {project.forks !== undefined && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground" title="GitHub Forks">
                  <GitFork className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-mono">{project.forks}</span>
                </div>
              )}
              {project.license && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground" title="License">
                  <Scale className="w-3.5 h-3.5" />
                  <span className="font-mono">{project.license}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex-1">
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <div className={cn(
                "text-sm text-muted-foreground leading-relaxed font-sans relative",
                !isExpanded && "line-clamp-3"
              )}>
                {project.description}
                {!isExpanded && project.description.length > 150 && (
                  <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                )}
              </div>
              {project.description.length > 150 && (
                <CollapsibleTrigger asChild>
                  <Button variant="link" className="p-0 h-auto text-xs text-primary mt-2 font-mono uppercase tracking-wider hover:text-primary/80">
                    {isExpanded ? (
                      <span className="flex items-center gap-1">Read Less <ChevronUp className="w-3 h-3" /></span>
                    ) : (
                      <span className="flex items-center gap-1">Read More <ChevronDown className="w-3 h-3" /></span>
                    )}
                  </Button>
                </CollapsibleTrigger>
              )}
            </Collapsible>
          </div>

          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: LANGUAGE_COLOURS[project.language] || LANGUAGE_COLOURS.Default }}
              />
              <span className="text-xs font-mono text-muted-foreground">{project.language}</span>
              {project.githubApi && project.repo && !project.stars && (
                <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground ml-2">
                  API Enabled
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {/* PRIMARY: View Details (local page) */}
              <Button size="sm" className="h-8 text-xs font-bold uppercase tracking-wider bg-primary text-black hover:bg-primary/90" asChild>
                <Link href={`/project/${project.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <Eye className="w-3 h-3 mr-2" />
                  View Details
                </Link>
              </Button>

              {/* SECONDARY: External links */}
              {project.repo && (
                <Button size="sm" variant="outline" className="h-8 w-8 p-0" asChild>
                  <a href={`https://github.com/${project.repo}`} target="_blank" rel="noopener noreferrer">
                    <Github className="w-4 h-4" />
                  </a>
                </Button>
              )}
              <Button size="sm" variant="outline" className="h-8 w-8 p-0" asChild>
                <a href={project.link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
