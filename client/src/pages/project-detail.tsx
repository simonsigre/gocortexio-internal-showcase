import { useRoute, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, GitFork, Star, Calendar, Download, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ReadmeViewer } from '@/components/readme-viewer';
import { MediaGallery } from '@/components/media-gallery';
import { Project } from '@/lib/types';
import { formatDate, formatNumber } from '@/lib/utils';
import { extractSections, createFallbackContent } from '@/lib/content-extraction';

export default function ProjectDetail() {
  const [match, params] = useRoute('/project/:id');
  const projectId = params?.id;

  // Fetch projects data
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => fetch('projects.json').then((res) => res.json()),
  });

  // Find project by ID (slug from name)
  const project = projects?.find(
    (p) => p.name.toLowerCase().replace(/\s+/g, '-') === projectId
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The project you're looking for doesn't exist.
        </p>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Showcase
          </Link>
        </Button>
      </div>
    );
  }

  // Calculate related projects (same product or usecase)
  const relatedProjects = projects?.filter(
    (p) =>
      p.name !== project.name &&
      (p.product === project.product || p.usecase === project.usecase)
  ).slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Showcase
        </Link>
      </Button>

      {/* Project Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
            <p className="text-xl text-muted-foreground">{project.description}</p>
          </div>

          {project.status && (
            <Badge
              variant={
                project.status === 'active'
                  ? 'default'
                  : project.status === 'development'
                    ? 'secondary'
                    : project.status === 'beta'
                      ? 'outline'
                      : 'destructive'
              }
            >
              {project.status}
            </Badge>
          )}
        </div>

        {/* Metadata badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {project.product && <Badge variant="outline">{project.product}</Badge>}
          {project.theatre && <Badge variant="outline">{project.theatre}</Badge>}
          {project.language && (
            <Badge variant="outline">
              <span className="mr-1">💻</span>
              {project.language}
            </Badge>
          )}
          {project.usecase && (
            <Badge variant="outline">
              <span className="mr-1">🎯</span>
              {project.usecase}
            </Badge>
          )}
        </div>

        {/* Stats */}
        {project.githubApi && (
          <div className="flex flex-wrap gap-6 text-sm">
            {project.stars !== undefined && (
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold">{formatNumber(project.stars)}</span>
                <span className="text-muted-foreground">stars</span>
              </div>
            )}
            {project.forks !== undefined && (
              <div className="flex items-center gap-2">
                <GitFork className="h-4 w-4 text-blue-500" />
                <span className="font-semibold">{formatNumber(project.forks)}</span>
                <span className="text-muted-foreground">forks</span>
              </div>
            )}
            {project.lastUpdated && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">
                  Updated {formatDate(new Date(project.lastUpdated))}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <Separator className="mb-8" />

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Tabs for different content sections */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="readme">README</TabsTrigger>
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="deployment">Deployment</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
              <TabsTrigger value="troubleshooting" className="hidden lg:block">Troubleshooting</TabsTrigger>
              <TabsTrigger value="media" className="hidden lg:block">Media</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{project.description}</p>

                  {project.usecase && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Use Case</h4>
                      <p className="text-muted-foreground">{project.usecase}</p>
                    </div>
                  )}

                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Author</span>
                      <span className="font-medium">{project.author}</span>
                    </div>
                    {project.date && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Release Date</span>
                        <span className="font-medium">{project.date}</span>
                      </div>
                    )}
                    {project.license && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">License</span>
                        <span className="font-medium">{project.license}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick links */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <a href={project.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Visit Project Website
                    </a>
                  </Button>

                  {project.repo && (
                    <Button asChild variant="outline" className="w-full justify-start">
                      <a
                        href={`https://github.com/${project.repo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="mr-2 h-4 w-4" />
                        View on GitHub
                      </a>
                    </Button>
                  )}

                  {project.repo && (
                    <Button asChild variant="outline" className="w-full justify-start">
                      <a
                        href={`https://github.com/${project.repo}/archive/refs/heads/main.zip`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Source
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="readme">
              {project.readme?.content ? (
                <ReadmeViewer
                  content={project.readme.content}
                  title="README"
                  description="Project documentation and setup instructions"
                  githubUrl={project.repo ? `https://github.com/${project.repo}#readme` : undefined}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>README</CardTitle>
                    <CardDescription>
                      Project documentation and setup instructions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {project.repo ? (
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-muted-foreground">
                          README content will be fetched from the GitHub repository.
                        </p>
                        <p className="text-sm">
                          <a
                            href={`https://github.com/${project.repo}#readme`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            View on GitHub →
                          </a>
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No README available for this project.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="setup">
              <Card>
                <CardHeader>
                  <CardTitle>Setup & Installation</CardTitle>
                  <CardDescription>
                    Step-by-step guide to get started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Detailed setup instructions will be available once the project includes a SETUP.md file.
                    </p>
                    {project.repo && (
                      <div className="space-y-3">
                        <h4 className="font-semibold">Quick Start</h4>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">1. Clone the repository:</p>
                          <code className="block bg-muted p-3 rounded-md text-sm">
                            git clone https://github.com/{project.repo}.git
                          </code>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">2. Install dependencies:</p>
                          <code className="block bg-muted p-3 rounded-md text-sm">
                            cd {project.name.toLowerCase()}<br />
                            npm install
                          </code>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">3. Run the project:</p>
                          <code className="block bg-muted p-3 rounded-md text-sm">
                            npm start
                          </code>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deployment">
              <Card>
                <CardHeader>
                  <CardTitle>Deployment Guide</CardTitle>
                  <CardDescription>
                    Instructions for deploying to production
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Deployment documentation will be available once the project includes a DEPLOYMENT.md file or deployment section in the README.
                  </p>
                  {project.repo && (
                    <div className="mt-4">
                      <Button asChild variant="outline">
                        <a
                          href={`https://github.com/${project.repo}/blob/main/DEPLOYMENT.md`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Deployment Docs
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api">
              <Card>
                <CardHeader>
                  <CardTitle>API Documentation</CardTitle>
                  <CardDescription>
                    Endpoints, parameters, and usage examples
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    API documentation will be available if the project exposes APIs or integration points.
                  </p>
                  {project.repo && (
                    <div className="mt-4">
                      <Button asChild variant="outline">
                        <a
                          href={`https://github.com/${project.repo}/blob/main/API.md`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View API Docs
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="troubleshooting">
              <Card>
                <CardHeader>
                  <CardTitle>Troubleshooting</CardTitle>
                  <CardDescription>
                    Common issues and solutions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Troubleshooting guide will be available as the project matures.
                    </p>
                    {project.repo && (
                      <div className="mt-4">
                        <Button asChild variant="outline">
                          <a
                            href={`https://github.com/${project.repo}/issues`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Issues on GitHub
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media">
              {project.gallery && project.gallery.length > 0 ? (
                <MediaGallery
                  items={project.gallery}
                  title="Screenshots & Media"
                  description="Visual preview of the project"
                />
              ) : project.media ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Screenshots & Media</CardTitle>
                    <CardDescription>
                      Visual preview of the project
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {project.media.type === 'image' && (
                        <img
                          src={project.media.url}
                          alt={project.media.alt}
                          className="rounded-lg border w-full"
                        />
                      )}
                      {project.media.type === 'youtube' && (
                        <div className="aspect-video">
                          <iframe
                            src={project.media.url}
                            title={project.media.alt}
                            className="w-full h-full rounded-lg border"
                            allowFullScreen
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Screenshots & Media</CardTitle>
                    <CardDescription>
                      Visual preview of the project
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      No media available for this project.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right column - Sidebar */}
        <div className="space-y-6">
          {/* Getting Started */}
          {project.repo && (
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Clone Repository</h4>
                  <code className="block bg-muted p-3 rounded-md text-sm overflow-x-auto">
                    git clone https://github.com/{project.repo}
                  </code>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Install Dependencies</h4>
                  <code className="block bg-muted p-3 rounded-md text-sm">
                    npm install
                  </code>
                </div>

                <Button asChild className="w-full">
                  <a
                    href={`https://github.com/${project.repo}#readme`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Full Documentation
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Related Projects */}
          {relatedProjects && relatedProjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Projects</CardTitle>
                <CardDescription>
                  Similar projects you might be interested in
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {relatedProjects.map((related) => (
                  <Link
                    key={related.name}
                    href={`/project/${related.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                      <h4 className="font-semibold mb-1">{related.name}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {related.description}
                      </p>
                      {related.product && (
                        <Badge variant="outline" className="mt-2">
                          {related.product}
                        </Badge>
                      )}
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.product && <Badge>{project.product}</Badge>}
                {project.language && <Badge>{project.language}</Badge>}
                {project.usecase && <Badge>{project.usecase}</Badge>}
                {project.theatre && <Badge>{project.theatre}</Badge>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
