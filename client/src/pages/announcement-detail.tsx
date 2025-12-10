import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import mermaid from 'mermaid';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, Tag, Megaphone, Sparkles, ArrowRight, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

// Initialize Mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#00cd67',
    primaryTextColor: '#fff',
    primaryBorderColor: '#00cd67',
    lineColor: '#00cd67',
    secondaryColor: '#00d9ff',
    tertiaryColor: '#1a1a1a',
  },
});

interface Announcement {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: 'announcement' | 'feature' | 'update' | 'community';
  tags: string[];
  featured?: boolean;
  content: string;
}

// Mermaid component
function MermaidDiagram({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        setSvg(renderedSvg);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError('Failed to render diagram');
      }
    };

    renderDiagram();
  }, [chart]);

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive rounded p-4 text-destructive text-sm">
        {error}
      </div>
    );
  }

  return (
    <div
      className="mermaid-diagram bg-card rounded-lg border border-border p-4 my-6 overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export default function AnnouncementDetail() {
  const params = useParams();
  const announcementId = params.id;
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await fetch('/announcements.json');
        const announcements: Announcement[] = await response.json();
        const found = announcements.find((a) => a.id === announcementId);
        setAnnouncement(found || null);
      } catch (error) {
        console.error('Failed to load announcement:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncement();
  }, [announcementId]);

  const categoryColors = {
    announcement: { bg: 'bg-[#00cd67]', text: 'text-black', icon: Megaphone },
    feature: { bg: 'bg-[#4a9eff]', text: 'text-white', icon: Sparkles },
    update: { bg: 'bg-[#f0a020]', text: 'text-black', icon: ArrowRight },
    community: { bg: 'bg-purple-500', text: 'text-white', icon: Calendar },
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading announcement...</p>
        </div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Announcement Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The announcement you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link href="/announcements">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Announcements
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categoryConfig = categoryColors[announcement.category];
  const Icon = categoryConfig.icon;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back Button */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/announcements">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Announcements
          </Link>
        </Button>
      </motion.div>

      {/* Article Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="mb-8 border-primary/30">
          <CardContent className="pt-8">
            {/* Category Badge */}
            <div className="flex items-center gap-2 mb-4">
              <Badge className={`${categoryConfig.bg} ${categoryConfig.text}`}>
                <Icon className="w-3 h-3 mr-1" />
                {announcement.category.toUpperCase()}
              </Badge>
              {announcement.featured && <Badge variant="outline">Featured</Badge>}
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold font-display mb-4 leading-tight">
              {announcement.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-muted-foreground mb-6">{announcement.excerpt}</p>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-t border-border pt-4">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {announcement.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(announcement.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              {announcement.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <div className="flex flex-wrap gap-1">
                    {announcement.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Article Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="prose prose-invert max-w-none pt-8">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
              components={{
                // Code blocks with syntax highlighting
                code({ className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';
                  const isInline = !className;

                  // Handle Mermaid diagrams
                  if (language === 'mermaid') {
                    return <MermaidDiagram chart={String(children).trim()} />;
                  }

                  // Regular code blocks
                  if (!isInline && language) {
                    return (
                      <SyntaxHighlighter
                        style={vscDarkPlus as any}
                        language={language}
                        PreTag="div"
                        className="rounded-md my-4"
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    );
                  }

                  // Inline code
                  return (
                    <code
                      className="bg-accent px-1.5 py-0.5 rounded text-sm font-mono border border-border"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                // Headings with custom styling
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold font-display mb-4 mt-8 text-foreground">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold font-display mb-3 mt-6 text-foreground">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold font-display mb-2 mt-4 text-foreground">
                    {children}
                  </h3>
                ),
                // Links
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-primary hover:text-primary/80 underline transition-colors"
                    target={href?.startsWith('http') ? '_blank' : undefined}
                    rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {children}
                  </a>
                ),
                // Blockquotes
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground bg-primary/5 py-2 rounded-r">
                    {children}
                  </blockquote>
                ),
                // Tables
                table: ({ children }) => (
                  <div className="overflow-x-auto my-6">
                    <table className="w-full border-collapse border border-border rounded-lg overflow-hidden">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="bg-primary/10 border border-border px-4 py-2 text-left font-semibold">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-border px-4 py-2">{children}</td>
                ),
                // Lists
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-2 my-4">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-2 my-4">{children}</ol>
                ),
                // Paragraphs
                p: ({ children }) => <p className="mb-4 leading-relaxed text-foreground">{children}</p>,
              }}
            >
              {announcement.content}
            </ReactMarkdown>
          </CardContent>
        </Card>
      </motion.div>

      {/* Related Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <Card className="bg-accent/20">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Found this helpful?</h3>
                <p className="text-sm text-muted-foreground">
                  Explore more announcements and updates
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/announcements">
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
