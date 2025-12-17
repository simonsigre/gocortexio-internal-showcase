import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRODUCTS, THEATRES } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export type SortOption = "newest" | "top" | "hot" | "controversial" | "most-upvoted" | "most-downvoted";

interface FilterBarProps {
  search: string;
  setSearch: (value: string) => void;
  filters: {
    product: string | null;
    theatre: string | null;
    author: string | null;
    usecase: string | null;
    period: string | null;
  };
  setFilters: (filters: any) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  uniqueAuthors: string[];
  uniqueUsecases: string[];
}

export function FilterBar({ search, setSearch, filters, setFilters, sortBy, setSortBy, uniqueAuthors, uniqueUsecases }: FilterBarProps) {
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const clearFilters = () => {
    setFilters({ product: null, theatre: null, author: null, usecase: null, period: null });
    setSearch("");
    setSortBy("newest");
  };

  return (
    <div className="space-y-4 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search projects by name, description, or language..." 
            className="pl-9 bg-card/50 border-border focus:border-primary/50 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[160px] bg-card/50 border-border">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="bg-white text-black">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="top">Top Rated</SelectItem>
              <SelectItem value="hot">Hot</SelectItem>
              <SelectItem value="controversial">Controversial</SelectItem>
              <SelectItem value="most-upvoted">Most Upvoted</SelectItem>
              <SelectItem value="most-downvoted">Most Downvoted</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.period || "all"} onValueChange={(v) => setFilters({...filters, period: v === "all" ? null : v})}>
             <SelectTrigger className="w-[140px] bg-card/50 border-border">
               <SelectValue placeholder="Period" />
             </SelectTrigger>
             <SelectContent className="bg-white text-black">
               <SelectItem value="all">All Time</SelectItem>
               <SelectItem value="day">Last 24 Hours</SelectItem>
               <SelectItem value="week">Last 7 Days</SelectItem>
               <SelectItem value="month">Last 30 Days</SelectItem>
             </SelectContent>
           </Select>

          <Select value={filters.product || "all"} onValueChange={(v) => setFilters({...filters, product: v === "all" ? null : v})}>
            <SelectTrigger className="w-[160px] bg-card/50 border-border">
              <SelectValue placeholder="Product" />
            </SelectTrigger>
            <SelectContent className="bg-white text-black">
              <SelectItem value="all">All Products</SelectItem>
              {PRODUCTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filters.theatre || "all"} onValueChange={(v) => setFilters({...filters, theatre: v === "all" ? null : v})}>
            <SelectTrigger className="w-[140px] bg-card/50 border-border">
              <SelectValue placeholder="Theatre" />
            </SelectTrigger>
            <SelectContent className="bg-white text-black">
              <SelectItem value="all">All Theatres</SelectItem>
              {THEATRES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filters.author || "all"} onValueChange={(v) => setFilters({...filters, author: v === "all" ? null : v})}>
            <SelectTrigger className="w-[140px] bg-card/50 border-border">
              <SelectValue placeholder="Author" />
            </SelectTrigger>
            <SelectContent className="bg-white text-black">
              <SelectItem value="all">All Authors</SelectItem>
              {uniqueAuthors.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>

           <Select value={filters.usecase || "all"} onValueChange={(v) => setFilters({...filters, usecase: v === "all" ? null : v})}>
            <SelectTrigger className="w-[140px] bg-card/50 border-border">
              <SelectValue placeholder="Use Case" />
            </SelectTrigger>
            <SelectContent className="bg-white text-black">
              <SelectItem value="all">All Use Cases</SelectItem>
              {uniqueUsecases.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {(activeFilterCount > 0 || search) && (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Active Filters:</span>
          {search && (
             <Badge variant="secondary" className="gap-1 text-xs">
               Search: {search} <X className="w-3 h-3 cursor-pointer hover:text-primary" onClick={() => setSearch("")} />
             </Badge>
          )}
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;
            return (
              <Badge key={key} variant="secondary" className="gap-1 text-xs capitalize">
                {key}: {value} <X className="w-3 h-3 cursor-pointer hover:text-primary" onClick={() => setFilters({...filters, [key]: null})} />
              </Badge>
            );
          })}
          <Button variant="ghost" size="sm" className="h-6 text-[10px] text-muted-foreground hover:text-destructive ml-auto" onClick={clearFilters}>
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}
