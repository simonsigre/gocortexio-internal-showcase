import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Grid Effect */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-20"
           style={{
             backgroundImage: `
               linear-gradient(90deg, transparent 0%, var(--border) 1px, transparent 1px),
               linear-gradient(180deg, transparent 0%, var(--border) 1px, transparent 1px)
             `,
             backgroundSize: '50px 50px'
           }}
      />
      
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-primary text-xl font-bold tracking-widest font-display uppercase">
              % GoCortex<span className="text-foreground">.io</span>
            </span>
            <span className="text-xs text-muted-foreground px-2 border-l border-border ml-2">
              Internal Showcase
            </span>
          </div>

          <nav className="flex items-center gap-6">
            <Link href="/" className={cn(
                "text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors relative group",
                location === "/" ? "text-primary" : "text-muted-foreground"
              )}>
                Showcase
                <span className={cn(
                  "absolute -bottom-5 left-0 w-full h-0.5 bg-primary transition-transform origin-left",
                  location === "/" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                )} />
            </Link>
            <Link href="/submit" className={cn(
                "text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors relative group",
                location === "/submit" ? "text-primary" : "text-muted-foreground"
              )}>
                Submit Project
                <span className={cn(
                  "absolute -bottom-5 left-0 w-full h-0.5 bg-primary transition-transform origin-left",
                  location === "/submit" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                )} />
            </Link>
            <Link href="/admin" className={cn(
                "text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors relative group",
                location === "/admin" ? "text-primary" : "text-muted-foreground"
              )}>
                Admin
                <span className={cn(
                  "absolute -bottom-5 left-0 w-full h-0.5 bg-primary transition-transform origin-left",
                  location === "/admin" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                )} />
            </Link>
          </nav>
        </div>
        {/* Glowing Line */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_10px_var(--primary)]" />
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-border mt-auto py-8">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>GoCortex Internal Project Showcase &copy; {new Date().getFullYear()}</p>
          <p className="mt-2 opacity-50">System Status: ONLINE</p>
        </div>
      </footer>
    </div>
  );
}
