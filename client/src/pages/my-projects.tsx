import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Project } from '@/lib/types';

// Mock user auth hook (replace with actual Okta hook)
function useAuth() {
  // TODO: Replace with actual Okta authentication
  return {
    user: {
      id: 'mock-user-123',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
    },
    isAuthenticated: true,
    isLoading: false,
  };
}

interface ProjectStats {
  totalProjects: number;
  published: number;
  pending: number;
  drafts: number;
  rejected: number;
  totalViews: number;
  totalStars: number;
}

interface ProjectWithMetadata extends Omit<Project, 'status'> {
  id: string;
  status: 'draft' | 'pending' | 'approved' | 'published' | 'rejected';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  views?: number;
  detailViews?: number;
  reviewNotes?: string;
}

export default function MyProjects() {
  const { user, isLoading: authLoading } = useAuth();
  const [selectedProject, setSelectedProject] = useState<ProjectWithMetadata | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch user's projects
  // TODO: Replace with actual API call
  const { data: projects, isLoading } = useQuery<ProjectWithMetadata[]>({
    queryKey: ['my-projects', user?.id],
    queryFn: async () => {
      // Mock data for now
      // In production: fetch(`/api/users/${user.id}/projects`)
      return [];
    },
    enabled: !!user?.id,
  });

  // Calculate stats
  const stats: ProjectStats = {
    totalProjects: projects?.length || 0,
    published: projects?.filter(p => p.status === 'published').length || 0,
    pending: projects?.filter(p => p.status === 'pending').length || 0,
    drafts: projects?.filter(p => p.status === 'draft').length || 0,
    rejected: projects?.filter(p => p.status === 'rejected').length || 0,
    totalViews: projects?.reduce((sum, p) => sum + (p.views || 0), 0) || 0,
    totalStars: projects?.reduce((sum, p) => sum + (p.stars || 0), 0) || 0,
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      draft: { variant: 'secondary', icon: Clock },
      pending: { variant: 'default', icon: AlertCircle },
      approved: { variant: 'default', icon: CheckCircle },
      published: { variant: 'default', icon: CheckCircle },
      rejected: { variant: 'destructive', icon: XCircle },
    };

    const config = variants[status] || variants.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleEdit = (project: ProjectWithMetadata) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const handleDelete = (project: ProjectWithMetadata) => {
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedProject) return;

    // TODO: Implement delete API call
    // await fetch(`/api/users/${user.id}/projects/${selectedProject.id}`, {
    //   method: 'DELETE',
    // });

    setShowDeleteModal(false);
    setSelectedProject(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Projects</h1>
          <p className="text-muted-foreground">
            Manage your project submissions and track their performance
          </p>
        </div>

        <Button asChild>
          <Link href="/submit">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Projects</CardDescription>
            <CardTitle className="text-3xl">{stats.totalProjects}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Published</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {stats.published}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Review</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {stats.pending}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Views</CardDescription>
            <CardTitle className="text-3xl">
              {stats.totalViews.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Projects</CardTitle>
          <CardDescription>
            View and manage all your project submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                All Projects ({stats.totalProjects})
              </TabsTrigger>
              <TabsTrigger value="published">
                Published ({stats.published})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({stats.pending})
              </TabsTrigger>
              <TabsTrigger value="drafts">
                Drafts ({stats.drafts})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {projects && projects.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{project.name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {project.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(project.status)}</TableCell>
                        <TableCell>
                          {project.product && (
                            <Badge variant="outline">{project.product}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                            {project.views || 0}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(project)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(project)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            {project.status === 'published' && (
                              <Button size="sm" variant="ghost" asChild>
                                <Link
                                  href={`/project/${project.name
                                    .toLowerCase()
                                    .replace(/\s+/g, '-')}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    You haven't submitted any projects yet.
                  </p>
                  <Button asChild>
                    <Link href="/submit">
                      <Plus className="mr-2 h-4 w-4" />
                      Submit Your First Project
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="published">
              <div className="text-center py-8 text-muted-foreground">
                Published projects will appear here
              </div>
            </TabsContent>

            <TabsContent value="pending">
              <div className="text-center py-8 text-muted-foreground">
                Projects pending review will appear here
              </div>
            </TabsContent>

            <TabsContent value="drafts">
              <div className="text-center py-8 text-muted-foreground">
                Draft projects will appear here
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Make changes to your project. Changes require re-approval if already
              published.
            </DialogDescription>
          </DialogHeader>

          {selectedProject && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Project editing form will be implemented here.
              </p>
              <p className="text-sm">
                <strong>Project:</strong> {selectedProject.name}
              </p>
              <p className="text-sm">
                <strong>Status:</strong> {selectedProject.status}
              </p>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowEditModal(false)}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          {selectedProject && (
            <div className="space-y-4">
              <p className="text-sm">
                <strong>Project:</strong> {selectedProject.name}
              </p>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  Delete Project
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
