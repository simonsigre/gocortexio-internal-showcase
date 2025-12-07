import { useState, useMemo } from "react";
import { MOCK_PROJECTS } from "@/lib/mock-data";
import { ProjectCard } from "@/components/project-card";
import { FilterBar } from "@/components/filter-bar";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<{
    product: string | null;
    theatre: string | null;
    author: string | null;
    usecase: string | null;
  }>({
    product: null,
    theatre: null,
    author: null,
    usecase: null
  });

  const uniqueAuthors = useMemo(() => Array.from(new Set(MOCK_PROJECTS.map(p => p.author).filter(Boolean))), []);
  const uniqueUsecases = useMemo(() => Array.from(new Set(MOCK_PROJECTS.map(p => p.usecase).filter(Boolean))), []);

  const filteredProjects = useMemo(() => {
    return MOCK_PROJECTS.filter(project => {
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

      return true;
    });
  }, [search, filters]);

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
