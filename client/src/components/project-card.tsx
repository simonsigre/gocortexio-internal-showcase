import { useState } from "react";
import { Project } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ExternalLink, Github, ChevronDown, ChevronUp, Play, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

const STATUS_COLORS = {
  active: "text-[#00cd67] border-[#00cd67] bg-[#00cd67]/10",
  development: "text-[#f0a020] border-[#f0a020] bg-[#f0a020]/10",
  beta: "text-[#4a9eff] border-[#4a9eff] bg-[#4a9eff]/10",
  deprecated: "text-[#ff4444] border-[#ff4444] bg-[#ff4444]/10",
};

const LANGUAGE_COLORS: Record<string, string> = {
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

export function ProjectCard({ project }: { project: Project }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusClass = STATUS_COLORS[project.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.development;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className="bg-card border-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,205,103,0.1)] flex flex-col md:flex-row h-full">
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
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-accent/5">
              <div className="w-20 h-20 border-2 border-primary/30 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <ImageIcon className="w-10 h-10 text-primary/50" />
              </div>
              <span className="text-xs uppercase tracking-widest opacity-50">No Media</span>
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
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground font-mono">
                  {project.product}
                </span>
                {project.theatre && (
                   <>
                    <span className="text-muted-foreground/30">•</span>
                    <span className="text-xs text-muted-foreground font-mono">{project.theatre}</span>
                   </>
                )}
                 {project.author && (
                   <>
                    <span className="text-muted-foreground/30">•</span>
                    <span className="text-xs text-muted-foreground font-mono text-primary/80">@{project.author}</span>
                   </>
                )}
              </div>
            </div>
            <Badge variant="outline" className={cn("uppercase tracking-wider text-[10px] font-bold px-2 py-0.5 h-6", statusClass)}>
              {project.status}
            </Badge>
          </div>

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
                  style={{ backgroundColor: LANGUAGE_COLORS[project.language] || LANGUAGE_COLORS.Default }}
                />
                <span className="text-xs font-mono text-muted-foreground">{project.language}</span>
                {project.githubApi && project.repo && (
                  <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground ml-2">
                    API Enabled
                  </span>
                )}
             </div>

             <div className="flex gap-2">
               {project.repo && (
                 <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                   <a href={`https://github.com/${project.repo}`} target="_blank" rel="noopener noreferrer">
                     <Github className="w-4 h-4" />
                   </a>
                 </Button>
               )}
               <Button size="sm" className="h-8 text-xs font-bold uppercase tracking-wider bg-primary text-black hover:bg-primary/90" asChild>
                 <a href={project.link} target="_blank" rel="noopener noreferrer">
                   View Project <ExternalLink className="w-3 h-3 ml-2" />
                 </a>
               </Button>
             </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
