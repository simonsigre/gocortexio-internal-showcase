import { useState, useMemo, useEffect } from "react";
import { Project } from "@/lib/types";
import { ProjectCard } from "@/components/project-card";
import { FilterBar } from "@/components/filter-bar";
import { motion, AnimatePresence } from "framer-motion";
import { subDays, isAfter, parseISO } from "date-fns";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<{
    product: string | null;
    theatre: string | null;
    author: string | null;
    usecase: string | null;
    period: string | null;
  }>({
    product: null,
    theatre: null,
    author: null,
    usecase: null,
    period: null
  });

  useEffect(() => {
    fetch("./projects.json")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load projects:", err);
        setIsLoading(false);
      });
  }, []);

  const uniqueAuthors = useMemo(() => Array.from(new Set(projects.map(p => p.author).filter(Boolean))), [projects]);
  const uniqueUsecases = useMemo(() => Array.from(new Set(projects.map(p => p.usecase).filter(Boolean))), [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Search filter
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        project.name.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        project.language.toLowerCase().includes(searchLower) ||
        project.author?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Dropdown filters
      if (filters.product && project.product !== filters.product) return false;
      if (filters.theatre && project.theatre !== filters.theatre) return false;
      if (filters.author && project.author !== filters.author) return false;
      if (filters.usecase && project.usecase !== filters.usecase) return false;

      // Period filter (using date added to the project)
      if (filters.period) {
         const today = new Date();
         // Default to today if no date exists on the project (for legacy data)
         const projectDate = project.date ? parseISO(project.date) : parseISO("2020-01-01");
         
         let cutoffDate;
         if (filters.period === "day") cutoffDate = subDays(today, 1);
         else if (filters.period === "week") cutoffDate = subDays(today, 7);
         else if (filters.period === "month") cutoffDate = subDays(today, 30);
         
         if (cutoffDate && !isAfter(projectDate, cutoffDate)) return false;
      }

      return true;
    });
  }, [projects, search, filters]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">Loading project database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 py-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-display font-bold uppercase tracking-widest"
        >
          Project <span className="text-primary glow-text">Showcase</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground max-w-2xl mx-auto"
        >
          Discover and collaborate on independent tools and projects for the Cortex ecosystem.
          Built by the community, for the community.
        </motion.p>
      </div>

      <FilterBar 
        search={search} 
        setSearch={setSearch}
        filters={filters}
        setFilters={setFilters}
        uniqueAuthors={uniqueAuthors as string[]}
        uniqueUsecases={uniqueUsecases as string[]}
      />

      {filteredProjects.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-lg bg-card/20">
          <p className="text-muted-foreground">No projects found matching your criteria.</p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 gap-6"
        >
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <ProjectCard key={project.name} project={project} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
