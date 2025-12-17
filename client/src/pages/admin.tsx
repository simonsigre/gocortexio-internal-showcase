import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Clock, FileEdit, Trophy, Eye, MessageSquare, Plus, Code, Rocket, AlertCircle, TrendingUp, Archive } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Project } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

// Removed mock data - now using real projects.json

export default function AdminPage() {
  // Fetch all projects from projects.json
  const { data: allProjects = [], isLoading, refetch } = useQuery<Project[]>({
    queryKey: ['admin-projects'],
    queryFn: async () => {
      const response = await fetch('projects.json');
      if (!response.ok) throw new Error('Failed to load projects');
      return response.json();
    }
  });

  // Filter projects by publication status
  const pendingReview = allProjects.filter(p => p.publicationStatus === 'pending-review');
  const needsWork = allProjects.filter(p => p.publicationStatus === 'needs-work');
  const published = allProjects.filter(p => p.publicationStatus === 'published');
  const drafts = allProjects.filter(p => p.publicationStatus === 'draft');

  // Filter projects in incubation pipeline
  const incubationProjects = allProjects.filter(p =>
    p.incubationStatus && p.incubationStatus !== 'none'
  );

  // Action handlers - These update the local state and show instructions for manual JSON update
  const handleApprove = async (projectName: string) => {
    const project = allProjects.find(p => p.name === projectName);
    if (!project) return;

    const updatedProject = {
      ...project,
      publicationStatus: 'published' as const,
      status: 'active' as const
    };

    toast({
      title: "Approval Action",
      description: (
        <div className="space-y-2">
          <p>Update the project in projects.json:</p>
          <pre className="bg-accent p-2 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify({ name: project.name, publicationStatus: 'published', status: 'active' }, null, 2)}
          </pre>
          <p className="text-xs">Then refresh the page.</p>
        </div>
      )
    });
  };

  const handleReject = async (projectName: string, reason: string) => {
    const project = allProjects.find(p => p.name === projectName);
    if (!project) return;

    toast({
      title: "Rejection Action",
      description: (
        <div className="space-y-2">
          <p>Remove this project from projects.json or set publicationStatus to 'draft'</p>
          <pre className="bg-accent p-2 rounded text-xs">
            Project: {project.name}
            Reason: {reason}
          </pre>
        </div>
      ),
      variant: "destructive"
    });
  };

  const handleRequestChanges = async (projectName: string, notes: string) => {
    const project = allProjects.find(p => p.name === projectName);
    if (!project) return;

    const updatedProject = {
      ...project,
      publicationStatus: 'needs-work' as const,
      reviewNotes: notes
    };

    toast({
      title: "Changes Requested",
      description: (
        <div className="space-y-2">
          <p>Update the project in projects.json:</p>
          <pre className="bg-accent p-2 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify({ name: project.name, publicationStatus: 'needs-work', reviewNotes: notes }, null, 2)}
          </pre>
        </div>
      )
    });
  };

  const handleNominateForIncubation = async (projectName: string) => {
    const project = allProjects.find(p => p.name === projectName);
    if (!project) return;

    toast({
      title: "Nominate for Incubation",
      description: (
        <div className="space-y-2">
          <p>Update the project in projects.json:</p>
          <pre className="bg-accent p-2 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify({
              name: project.name,
              incubationStatus: 'nominated',
              promotionTarget: 'pre-sales',
              maturityScore: 0
            }, null, 2)}
          </pre>
        </div>
      )
    });
  };

  const handleUpdateIncubation = async (projectName: string, updates: any) => {
    const project = allProjects.find(p => p.name === projectName);
    if (!project) return;

    toast({
      title: "Update Incubation Status",
      description: (
        <div className="space-y-2">
          <p>Update the project in projects.json:</p>
          <pre className="bg-accent p-2 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify({ name: project.name, ...updates }, null, 2)}
          </pre>
        </div>
      )
    });

    // Refresh after a delay
    setTimeout(() => refetch(), 1000);
  };

  // Calculate statistics from real projects
  const stats = {
    pendingReview: pendingReview.length,
    needsWork: needsWork.length,
    inIncubation: incubationProjects.length,
    readyForRelease: incubationProjects.filter(p => (p.maturityScore || 0) >= 85).length,
    totalSubmissions: allProjects.length // All projects = all submissions/records
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold uppercase tracking-wider mb-2">
          Admin <span className="text-primary">Dashboard</span>
        </h1>
        <p className="text-muted-foreground">
          Manage project submissions, review queue, and incubation pipeline.
        </p>
      </div>

      {/* Dashboard Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                  <h3 className="text-3xl font-bold text-yellow-500">{stats.pendingReview}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-orange-500/30 bg-orange-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Needs Work</p>
                  <h3 className="text-3xl font-bold text-orange-500">{stats.needsWork}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Incubation</p>
                  <h3 className="text-3xl font-bold text-blue-500">{stats.inIncubation}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ready for Arsenal</p>
                  <h3 className="text-3xl font-bold text-primary">{stats.readyForRelease}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                  <h3 className="text-3xl font-bold">{stats.totalSubmissions}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                  <Archive className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="pending">
            Pending Review
            <Badge variant="secondary" className="ml-2">{pendingReview.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="needs-work">
            Needs Work
            <Badge variant="outline" className="ml-2">{needsWork.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="published">
            Published
            <Badge variant="outline" className="ml-2">{published.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="incubation">
            Incubation
            <Badge variant="outline" className="ml-2">{incubationProjects.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="arsenal">
            Arsenal
          </TabsTrigger>
          <TabsTrigger value="announcements">
            Announcements
          </TabsTrigger>
          <TabsTrigger value="promotions">
            Promotions
          </TabsTrigger>
          <TabsTrigger value="audit">
            Audit Log
          </TabsTrigger>
        </TabsList>

        {/* Pending Review Tab */}
        <TabsContent value="pending" className="space-y-4">
          {pendingReview.map((project) => (
            <SubmissionCard
              key={project.name}
              submission={project}
              onApprove={() => handleApprove(project.name)}
              onReject={(reason: string) => handleReject(project.name, reason)}
              onRequestChanges={(notes: string) => handleRequestChanges(project.name, notes)}
              onNominate={() => handleNominateForIncubation(project.name)}
            />
          ))}

          {pendingReview.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                No pending submissions
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Needs Work Tab */}
        <TabsContent value="needs-work" className="space-y-4">
          {needsWork.map((project) => (
            <SubmissionCard
              key={project.name}
              submission={project}
              onApprove={() => handleApprove(project.name)}
              onReject={(reason: string) => handleReject(project.name, reason)}
              onRequestChanges={(notes: string) => handleRequestChanges(project.name, notes)}
              onNominate={() => handleNominateForIncubation(project.name)}
              showReviewNotes
            />
          ))}

          {needsWork.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileEdit className="w-12 h-12 mx-auto mb-4 opacity-50" />
                No projects need work
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Published Projects Tab - For Management */}
        <TabsContent value="published" className="space-y-4">
          <div className="mb-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <h4 className="font-semibold mb-2">Published Projects Management</h4>
            <p className="text-sm text-muted-foreground">
              Manage all published projects. You can unpublish projects to remove them from the showcase,
              or edit their details. All changes require manual updates to projects.json.
            </p>
          </div>

          {published.map((project) => (
            <PublishedProjectCard
              key={project.name}
              project={project}
              onUnpublish={(projectName: string) => {
                toast({
                  title: "Unpublish Project",
                  description: (
                    <div className="space-y-2">
                      <p>Update the project in projects.json:</p>
                      <pre className="bg-accent p-2 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify({ name: projectName, publicationStatus: 'draft' }, null, 2)}
                      </pre>
                    </div>
                  ),
                  variant: "destructive"
                });
              }}
              onEdit={(projectName: string) => {
                const proj = allProjects.find(p => p.name === projectName);
                if (!proj) return;

                toast({
                  title: "Edit Project",
                  description: (
                    <div className="space-y-2">
                      <p>Edit this project in projects.json:</p>
                      <pre className="bg-accent p-2 rounded text-xs overflow-auto max-h-60">
                        {JSON.stringify(proj, null, 2)}
                      </pre>
                      <p className="text-xs">Copy the JSON above, make your changes, and update projects.json</p>
                    </div>
                  )
                });
              }}
            />
          ))}

          {published.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                No published projects
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Incubation Pipeline Tab */}
        <TabsContent value="incubation" className="space-y-4">
          {incubationProjects.map((project) => (
            <IncubationProjectCard
              key={project.name}
              project={project}
              onUpdate={(updates: any) => handleUpdateIncubation(project.name, updates)}
            />
          ))}

          {incubationProjects.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                No projects in incubation pipeline
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Arsenal Release Builder Tab */}
        <TabsContent value="arsenal" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Arsenal Release Builder</CardTitle>
                  <CardDescription>
                    Create and manage Cortex Arsenal releases. Select projects from the incubation pipeline to include in the next release.
                  </CardDescription>
                </div>
                <ArsenalReleaseDialog />
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-accent/20 p-4 rounded mb-4">
                <h4 className="font-semibold mb-2">Release Selection Criteria:</h4>
                <ul className="text-sm space-y-1">
                  <li>✓ Maturity Score ≥ 85 (automatic promotion)</li>
                  <li>✓ Status: "Ready" or "Promoted"</li>
                  <li>✓ Complete documentation</li>
                  <li>✓ Production usage validation</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Projects Ready for Arsenal:</h4>
                {incubationProjects?.filter(p => p.incubationStatus === 'in-review' || (p.maturityScore || 0) >= 85).map((project) => (
                  <Card key={project.name} className="border-primary/30">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-semibold">{project.name}</h5>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">Score: {project.maturityScore || 0}%</Badge>
                            <Badge variant="outline">{project.promotionTarget || 'pre-sales'}</Badge>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Add to Release
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Manage Announcements</CardTitle>
                  <CardDescription>Create and publish announcements for the community (supports markdown & Mermaid diagrams)</CardDescription>
                </div>
                <NewAnnouncementDialog />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <AnnouncementCard
                  announcement={{
                    id: '1',
                    type: 'feature',
                    title: 'New Feature: AI-Powered Documentation',
                    subtitle: 'Automatic extraction and formatting of project documentation',
                    content: 'We\'ve launched AI-powered documentation extraction for all projects. The system now automatically parses README, INSTALL, API, and other markdown files to populate project detail pages.',
                    author: 'admin@paloaltonetworks.com',
                    publishedAt: '2024-12-08T10:00:00Z',
                    isPublished: true,
                    tags: ['Feature', 'AI', 'Documentation']
                  }}
                />
                <AnnouncementCard
                  announcement={{
                    id: '2',
                    type: 'maintenance',
                    title: 'Scheduled Maintenance Window',
                    subtitle: 'System updates and database optimization',
                    content: 'Scheduled maintenance on December 15th from 2-4 AM EST. The showcase will be temporarily unavailable during this period. All submissions will be preserved.',
                    author: 'operations@paloaltonetworks.com',
                    publishedAt: null,
                    isPublished: false,
                    tags: ['Maintenance', 'Downtime']
                  }}
                />
                <AnnouncementCard
                  announcement={{
                    id: '3',
                    type: 'update',
                    title: 'Q4 2024 Showcase Statistics',
                    subtitle: '250+ projects submitted, 85% approval rate',
                    content: 'Amazing growth this quarter! We received over 250 project submissions with an 85% approval rate. Top categories: Cortex XSIAM integrations and Prisma Cloud automation tools.',
                    author: 'community@paloaltonetworks.com',
                    publishedAt: '2024-12-01T15:30:00Z',
                    isPublished: true,
                    tags: ['Statistics', 'Community']
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Promotions Pipeline Tab */}
        <TabsContent value="promotions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Promotion Pipeline</CardTitle>
              <CardDescription>Promote projects to featured status, blog posts, or external channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PromotionCard
                promotion={{
                  id: '1',
                  projectName: 'Cortex XSIAM Threat Hunter',
                  promotionType: 'featured',
                  status: 'pending',
                  targetDate: '2024-12-15'
                }}
              />
              <PromotionCard
                promotion={{
                  id: '2',
                  projectName: 'Prisma Cloud Compliance Toolkit',
                  promotionType: 'blog-post',
                  status: 'scheduled',
                  targetDate: '2024-12-20'
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Audit trail of all admin actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 px-4 py-2 rounded bg-accent/20">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>admin@example.com</span>
                  <span className="text-muted-foreground">approved submission "XDR Toolkit"</span>
                  <span className="ml-auto text-xs text-muted-foreground">2 hours ago</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded bg-accent/20">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <span>admin@example.com</span>
                  <span className="text-muted-foreground">requested changes on "Prisma Scanner"</span>
                  <span className="ml-auto text-xs text-muted-foreground">5 hours ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Submission Card Component
function SubmissionCard({ submission, onApprove, onReject, onRequestChanges, onNominate, showReviewNotes = false }: {
  submission: Project;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onRequestChanges: (notes: string) => void;
  onNominate: () => void;
  showReviewNotes?: boolean;
}) {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isChangesDialogOpen, setIsChangesDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [changeNotes, setChangeNotes] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine card styling based on publicationStatus
  const statusStyles = {
    'pending-review': 'border-yellow-500/50 bg-yellow-500/5',
    'needs-work': 'border-orange-500/50 bg-orange-500/5',
    'published': 'border-green-500/50 bg-green-500/5',
    'draft': 'border-border bg-card'
  };

  const cardClass = statusStyles[submission.publicationStatus || 'draft'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`${cardClass} hover:shadow-lg transition-all`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{submission.name}</CardTitle>
                <Badge
                  variant="outline"
                  className={
                    submission.publicationStatus === 'pending-review' ? 'border-yellow-500 text-yellow-500' :
                    submission.publicationStatus === 'needs-work' ? 'border-orange-500 text-orange-500' :
                    submission.publicationStatus === 'published' ? 'border-green-500 text-green-500' :
                    'border-gray-500 text-gray-500'
                  }
                >
                  {submission.publicationStatus === 'pending-review' && <Clock className="w-3 h-3 mr-1" />}
                  {submission.publicationStatus === 'needs-work' && <AlertCircle className="w-3 h-3 mr-1" />}
                  {submission.publicationStatus === 'published' && <CheckCircle className="w-3 h-3 mr-1" />}
                  {(submission.publicationStatus || 'draft').replace('-', ' ').toUpperCase()}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2">
                <span className="font-medium">{submission.submittedBy || submission.author}</span>
                <span>•</span>
                <span>{submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }) : new Date(submission.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}</span>
              </CardDescription>
            </div>
            <Badge variant="secondary" className="uppercase text-xs">{submission.product || 'Cortex XSIAM'}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-accent/30 p-3 rounded border border-border">
            <p className="text-sm leading-relaxed">{submission.description}</p>
          </div>

          {/* Expandable Project Artifacts */}
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between p-3 bg-accent/20 hover:bg-accent/30 transition-colors"
            >
              <span className="font-semibold text-sm flex items-center gap-2">
                <FileEdit className="w-4 h-4" />
                Project Artifacts & Details
              </span>
              <span className="text-xs">
                {isExpanded ? '▼ Hide' : '▶ Show'}
              </span>
            </button>

            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-accent/10 space-y-3"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Repository Link</p>
                    <a
                      href={submission.link || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline break-all"
                    >
                      {submission.link || 'Not provided'}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Primary Language</p>
                    <p className="text-sm font-medium">{submission.language || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Theatre</p>
                    <Badge variant="outline" className="text-xs">
                      {submission.theatre || 'Global'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Use Case</p>
                    <p className="text-sm">{submission.usecase || 'General'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Author/Team</p>
                    <p className="text-sm font-medium">{submission.author || submission.submittedBy}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Submission Date</p>
                    <p className="text-sm">{submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : new Date(submission.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}</p>
                  </div>
                </div>

                {/* GitHub API Integration Status */}
                {submission.githubApi !== undefined && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">GitHub API Integration</p>
                    <Badge variant={submission.githubApi ? 'default' : 'secondary'} className="text-xs">
                      {submission.githubApi ? '✓ Enabled - Live stats will be fetched' : '✗ Disabled'}
                    </Badge>
                  </div>
                )}

                {/* Review Notes */}
                {showReviewNotes && submission.reviewNotes && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Review Notes</p>
                    <div className="bg-accent/30 p-2 rounded text-sm">
                      {submission.reviewNotes}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={onApprove} className="bg-green-600 hover:bg-green-700 gap-2">
            <CheckCircle className="w-4 h-4" />
            Approve & Publish
          </Button>

          <Dialog open={isChangesDialogOpen} onOpenChange={setIsChangesDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FileEdit className="w-4 h-4" />
                Request Changes
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Changes</DialogTitle>
                <DialogDescription>Provide feedback for the submitter</DialogDescription>
              </DialogHeader>
              <Textarea
                placeholder="Please add more details about..."
                value={changeNotes}
                onChange={(e) => setChangeNotes(e.target.value)}
                className="h-32"
              />
              <Button onClick={() => {
                onRequestChanges(changeNotes);
                setIsChangesDialogOpen(false);
              }}>
                Send Feedback
              </Button>
            </DialogContent>
          </Dialog>

          <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <XCircle className="w-4 h-4" />
                Reject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Submission</DialogTitle>
                <DialogDescription>Provide a reason for rejection</DialogDescription>
              </DialogHeader>
              <Textarea
                placeholder="Reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="h-32"
              />
              <Button variant="destructive" onClick={() => {
                onReject(rejectReason);
                setIsRejectDialogOpen(false);
              }}>
                Confirm Rejection
              </Button>
            </DialogContent>
          </Dialog>

          <Button variant="secondary" onClick={onNominate} className="gap-2 ml-auto">
            <Trophy className="w-4 h-4" />
            Nominate for Incubation
          </Button>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}

// Incubation Project Card
function IncubationProjectCard({ project, onUpdate }: {
  project: Project;
  onUpdate: (updates: any) => void;
}) {
  const maturityScore = project.maturityScore || 0;

  // Determine card styling based on maturity score and status
  const getCardStyle = () => {
    if (maturityScore >= 85) return 'border-primary/50 bg-primary/5';
    if (project.incubationStatus === 'ready') return 'border-green-500/50 bg-green-500/5';
    if (project.incubationStatus === 'in-review') return 'border-blue-500/50 bg-blue-500/5';
    return 'border-border bg-card/50';
  };

  const getProgressColor = () => {
    if (maturityScore >= 85) return 'from-green-500 via-primary to-primary';
    if (maturityScore >= 70) return 'from-yellow-500 via-green-500 to-primary';
    return 'from-orange-500 via-yellow-500 to-green-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`${getCardStyle()} hover:shadow-lg transition-all`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-primary" />
                <CardTitle className="text-xl">{project.name}</CardTitle>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={
                  project.incubationStatus === 'ready' ? 'border-green-500 text-green-500' :
                  project.incubationStatus === 'in-review' ? 'border-blue-500 text-blue-500' :
                  project.incubationStatus === 'nominated' ? 'border-yellow-500 text-yellow-500' :
                  'border-purple-500 text-purple-500'
                }>
                  {project.incubationStatus === 'ready' && <CheckCircle className="w-3 h-3 mr-1" />}
                  {project.incubationStatus === 'in-review' && <Clock className="w-3 h-3 mr-1" />}
                  {project.incubationStatus === 'promoted' && <Rocket className="w-3 h-3 mr-1" />}
                  {(project.incubationStatus || 'none').replace('-', ' ').toUpperCase()}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Target: {project.promotionTarget || 'pre-sales'}
                </Badge>
                {maturityScore >= 85 && (
                  <Badge className="bg-primary text-black">
                    <Rocket className="w-3 h-3 mr-1" />
                    Arsenal Ready
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Maturity Score Progress */}
            <div className="bg-accent/30 p-4 rounded border border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Maturity Score</span>
                <span className="text-2xl font-bold text-primary">{maturityScore}%</span>
              </div>
              <div className="h-3 bg-accent rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500`}
                  style={{ width: `${maturityScore}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Needs Work</span>
                <span>Good</span>
                <span>Arsenal Ready</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Select onValueChange={(value) => onUpdate({ incubationStatus: value })}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Update Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nominated">Nominated</SelectItem>
                  <SelectItem value="in-review">In Review</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="promoted">Promoted</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="gap-2">
                <Eye className="w-4 h-4" />
                View Details
              </Button>

              {maturityScore >= 85 && (
                <Button className="gap-2 ml-auto bg-primary">
                  <Rocket className="w-4 h-4" />
                  Add to Arsenal
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Announcement Card Component with structured breakout text
function AnnouncementCard({ announcement }: any) {
  const typeColors = {
    feature: { bg: 'bg-blue-500/10', border: 'border-blue-500/50', text: 'text-blue-500', icon: '🚀' },
    maintenance: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', text: 'text-yellow-500', icon: '🔧' },
    update: { bg: 'bg-green-500/10', border: 'border-green-500/50', text: 'text-green-500', icon: '📢' },
    alert: { bg: 'bg-red-500/10', border: 'border-red-500/50', text: 'text-red-500', icon: '⚠️' },
  };

  const typeConfig = typeColors[announcement.type as keyof typeof typeColors] || typeColors.update;

  return (
    <Card className={`${typeConfig.bg} ${typeConfig.border} border-2`}>
      <CardHeader>
        <div className="space-y-3">
          {/* Type Badge and Status */}
          <div className="flex items-start justify-between">
            <Badge variant="outline" className={`${typeConfig.text} ${typeConfig.border} uppercase text-xs font-bold`}>
              {typeConfig.icon} {announcement.type}
            </Badge>
            <div className="flex gap-2">
              {announcement.isPublished ? (
                <Badge variant="default" className="bg-green-600">Published</Badge>
              ) : (
                <Badge variant="outline">Draft</Badge>
              )}
            </div>
          </div>

          {/* Title and Subtitle */}
          <div>
            <CardTitle className="text-xl mb-1">{announcement.title}</CardTitle>
            {announcement.subtitle && (
              <p className="text-sm text-muted-foreground font-medium">{announcement.subtitle}</p>
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {announcement.author && (
              <span className="flex items-center gap-1">
                <span className="font-mono">👤</span> {announcement.author}
              </span>
            )}
            {announcement.publishedAt && (
              <span className="flex items-center gap-1">
                <span>📅</span> {new Date(announcement.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Content */}
          <p className="text-sm leading-relaxed">{announcement.content}</p>

          {/* Tags */}
          {announcement.tags && announcement.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {announcement.tags.map((tag: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-border/50">
            <Button variant="outline" size="sm">Edit</Button>
            {!announcement.isPublished && (
              <Button size="sm" className="bg-primary">Publish</Button>
            )}
            {announcement.isPublished && (
              <Button variant="outline" size="sm">Unpublish</Button>
            )}
            <Button variant="destructive" size="sm" className="ml-auto">Delete</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Promotion Card Component
function PromotionCard({ promotion }: any) {
  const statusColors = {
    pending: 'border-yellow-500/50 text-yellow-500',
    scheduled: 'border-blue-500/50 text-blue-500',
    published: 'border-green-500/50 text-green-500',
    cancelled: 'border-red-500/50 text-red-500',
  };

  const promotionTypes = {
    'featured': 'Featured Project',
    'blog-post': 'Blog Post',
    'social-media': 'Social Media',
    'newsletter': 'Newsletter',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{promotion.projectName}</CardTitle>
            <CardDescription>
              {promotionTypes[promotion.promotionType as keyof typeof promotionTypes]} • Target: {promotion.targetDate}
            </CardDescription>
          </div>
          <Badge variant="outline" className={statusColors[promotion.status as keyof typeof statusColors]}>
            {promotion.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Select defaultValue={promotion.status}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">Edit Details</Button>
          <Button size="sm">Publish Now</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// New Announcement Dialog Component
function NewAnnouncementDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    excerpt: '',
    content: '',
    author: 'Arsenal Team',
    category: 'announcement' as 'announcement' | 'feature' | 'update' | 'community',
    tags: '',
    featured: false
  });

  const handleSubmit = () => {
    // Generate ID from title
    const id = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const announcement = {
      ...formData,
      id,
      date: new Date().toISOString().split('T')[0],
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    // In production, this would save to announcements.json
    // For now, show the JSON payload for manual adding
    const json = JSON.stringify(announcement, null, 2);

    toast({
      title: "Announcement Created",
      description: (
        <div>
          <p className="mb-2">Copy this JSON and add it to client/public/announcements.json:</p>
          <pre className="bg-accent p-2 rounded text-xs overflow-auto max-h-60">
            {json}
          </pre>
        </div>
      )
    });

    navigator.clipboard.writeText(json);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Announcement
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Announcement</DialogTitle>
          <DialogDescription>
            Write your announcement in Markdown. Supports code blocks, tables, and Mermaid diagrams.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Welcome to the Cortex Arsenal"
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt *</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
              placeholder="A brief summary that appears on the announcements list"
              rows={2}
            />
          </div>

          {/* Category & Author Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: any) => setFormData({...formData, category: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({...formData, author: e.target.value})}
                placeholder="Arsenal Team"
              />
            </div>
          </div>

          {/* Tags & Featured Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                placeholder="platform, launch, pre-sales"
              />
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="featured">Featured Announcement</Label>
            </div>
          </div>

          {/* Markdown Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Content (Markdown) *</Label>
              <Badge variant="outline" className="gap-1">
                <Code className="w-3 h-3" />
                Markdown Supported
              </Badge>
            </div>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder={"# Welcome to the Arsenal\n\nWrite your announcement here using **Markdown**.\n\n## Features\n\n- Lists\n- Tables\n- Code blocks\n\n```mermaid\ngraph TD\n    A[Start] --> B[End]\n```"}
              rows={15}
              className="font-mono text-sm"
            />
          </div>

          {/* Markdown Help */}
          <div className="bg-accent/20 p-3 rounded text-xs space-y-1">
            <p className="font-semibold">Markdown Tips:</p>
            <p>• Use <code className="bg-accent px-1 rounded">**bold**</code> for emphasis</p>
            <p>• Code blocks: <code className="bg-accent px-1 rounded">```language</code></p>
            <p>• Mermaid diagrams: <code className="bg-accent px-1 rounded">```mermaid</code></p>
            <p>• Tables: <code className="bg-accent px-1 rounded">| Header | Header |</code></p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.title || !formData.excerpt || !formData.content}>
            Create & Copy JSON
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Arsenal Release Dialog Component
function ArsenalReleaseDialog() {
  const [open, setOpen] = useState(false);
  const [releaseData, setReleaseData] = useState({
    version: '',
    releaseNotes: '',
    highlights: '',
    salesProcess: [] as string[],
    selectedProjects: [] as string[]
  });

  const handleSubmit = () => {
    const release = {
      ...releaseData,
      releaseDate: new Date().toISOString().split('T')[0],
      highlights: releaseData.highlights.split('\n').map(h => h.trim()).filter(Boolean),
      salesProcess: releaseData.salesProcess
    };

    const json = JSON.stringify(release, null, 2);

    toast({
      title: "Arsenal Release Created",
      description: (
        <div>
          <p className="mb-2">Release package created. Deploy via CI/CD:</p>
          <pre className="bg-accent p-2 rounded text-xs overflow-auto max-h-40">
            {json}
          </pre>
        </div>
      )
    });

    navigator.clipboard.writeText(json);
    setOpen(false);
  };

  const salesProcessOptions = [
    "Discovery & Assessment",
    "Proof of Concept (POC)",
    "Technical Deep Dives",
    "Competitive Differentiation",
    "Customer Success Enablement"
  ];

  const toggleSalesProcess = (process: string) => {
    setReleaseData(prev => ({
      ...prev,
      salesProcess: prev.salesProcess.includes(process)
        ? prev.salesProcess.filter(p => p !== process)
        : [...prev.salesProcess, process]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary">
          <Plus className="w-4 h-4" />
          Create Release
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Arsenal Release</DialogTitle>
          <DialogDescription>
            Bundle selected projects into an official Cortex Arsenal release package
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Version */}
          <div className="space-y-2">
            <Label htmlFor="version">Version *</Label>
            <Input
              id="version"
              value={releaseData.version}
              onChange={(e) => setReleaseData({...releaseData, version: e.target.value})}
              placeholder="v2024.12.0"
            />
          </div>

          {/* Highlights */}
          <div className="space-y-2">
            <Label htmlFor="highlights">Release Highlights (one per line) *</Label>
            <Textarea
              id="highlights"
              value={releaseData.highlights}
              onChange={(e) => setReleaseData({...releaseData, highlights: e.target.value})}
              placeholder={"11 new SOC optimization playbooks\nEnhanced XSIAM demo environments\nNew XDR threat simulation tools"}
              rows={5}
            />
          </div>

          {/* Sales Process Alignment */}
          <div className="space-y-2">
            <Label>Sales Process Alignment *</Label>
            <div className="grid grid-cols-2 gap-2">
              {salesProcessOptions.map((process) => (
                <div key={process} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`process-${process}`}
                    checked={releaseData.salesProcess.includes(process)}
                    onChange={() => toggleSalesProcess(process)}
                    className="rounded"
                  />
                  <Label htmlFor={`process-${process}`} className="text-sm font-normal">
                    {process}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Release Notes */}
          <div className="space-y-2">
            <Label htmlFor="releaseNotes">Release Notes (Markdown)</Label>
            <Textarea
              id="releaseNotes"
              value={releaseData.releaseNotes}
              onChange={(e) => setReleaseData({...releaseData, releaseNotes: e.target.value})}
              placeholder="## What's New\n\n- Feature 1\n- Feature 2\n\n## Bug Fixes\n\n- Fix 1"
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          {/* Info Box */}
          <div className="bg-primary/10 border border-primary/30 p-4 rounded">
            <p className="text-sm">
              <strong>Note:</strong> Projects with maturity score ≥ 85 will be automatically included.
              Additional projects can be manually selected from the Arsenal tab.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!releaseData.version || !releaseData.highlights || releaseData.salesProcess.length === 0}
          >
            Create Release Package
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Published Project Card Component
function PublishedProjectCard({ project, onUnpublish, onEdit }: {
  project: Project;
  onUnpublish: (projectName: string) => void;
  onEdit: (projectName: string) => void;
}) {
  const [isUnpublishDialogOpen, setIsUnpublishDialogOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-green-500/30 bg-green-500/5 hover:shadow-lg transition-all">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{project.name}</CardTitle>
                <Badge variant="outline" className="border-green-500 text-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  PUBLISHED
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2">
                <span className="font-medium">{project.author}</span>
                <span>•</span>
                <span>{project.product || 'Cortex XSIAM'}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-accent/20 p-3 rounded border border-border">
            <p className="text-sm leading-relaxed line-clamp-2">{project.description}</p>
          </div>

          <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => onEdit(project.name)}>
              <FileEdit className="w-4 h-4" />
              Edit
            </Button>

            <Button variant="destructive" size="sm" className="gap-2 ml-auto" onClick={() => setIsUnpublishDialogOpen(true)}>
              <XCircle className="w-4 h-4" />
              Unpublish
            </Button>

            <Dialog open={isUnpublishDialogOpen} onOpenChange={setIsUnpublishDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Unpublish Project</DialogTitle>
                  <DialogDescription>
                    Remove "{project.name}" from the showcase?
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsUnpublishDialogOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={() => {
                      onUnpublish(project.name);
                      setIsUnpublishDialogOpen(false);
                    }}>
                    Confirm
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
