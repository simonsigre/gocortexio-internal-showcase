import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Rocket, Target, TrendingUp, CheckCircle2, Clock, AlertCircle, Eye, Megaphone, Sparkles, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/utils';
import { Project } from '@/lib/types';

// Blog Post Interface
interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    date: string;
    category: 'announcement' | 'feature' | 'update' | 'community';
    tags: string[];
    image?: string;
    featured?: boolean;
}

export default function Announcements() {
    // Fetch blog posts from JSON file
    const { data: posts } = useQuery<BlogPost[]>({
        queryKey: ['blog-posts'],
        queryFn: async () => {
            const response = await fetch('/announcements.json');
            if (!response.ok) {
                throw new Error('Failed to fetch announcements');
            }
            return response.json();
        }
    });

    // Fetch all projects and filter for incubation
    const { data: allProjects = [] } = useQuery<Project[]>({
        queryKey: ['projects-for-announcements'],
        queryFn: async () => {
            const response = await fetch('/projects.json');
            if (!response.ok) throw new Error('Failed to load projects');
            return response.json();
        }
    });

    // Filter projects in incubation pipeline
    const incubationProjects = allProjects.filter(p =>
        p.incubationStatus && p.incubationStatus !== 'none'
    );

    const featuredPost = posts?.find(p => p.featured);
    const regularPosts = posts?.filter(p => !p.featured);

    const categoryColors = {
        announcement: 'bg-[#00cd67] text-black',
        feature: 'bg-[#4a9eff] text-white',
        update: 'bg-[#f0a020] text-black',
        community: 'bg-purple-500 text-white'
    };

    const categoryIcons = {
        announcement: Megaphone,
        feature: Sparkles,
        update: ArrowRight,
        community: Calendar
    };

    const statusConfig = {
        nominated: { label: 'Nominated', color: 'bg-blue-500', icon: Target },
        'in-review': { label: 'In Review', color: 'bg-yellow-500', icon: Clock },
        ready: { label: 'Ready', color: 'bg-green-500', icon: CheckCircle2 },
        promoted: { label: 'Promoted', color: 'bg-purple-500', icon: Rocket }
    };

    const targetConfig = {
        'pre-sales': { label: 'Pre-Sales Arsenal', icon: TrendingUp },
        'regional-nam': { label: 'NAM Regional', icon: Target },
        'regional-emea': { label: 'EMEA Regional', icon: Target },
        'regional-japac': { label: 'JAPAC Regional', icon: Target },
        'global': { label: 'Global Release', icon: Rocket }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <h1 className="text-5xl font-bold mb-4 font-mono uppercase tracking-tight">
                        <span className="text-[#00cd67]">Arsenal</span> Announcements
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Latest updates, featured projects, and pre-sales promotion pipeline
                    </p>
                </motion.div>
            </div>

            <Tabs defaultValue="updates" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="updates" className="text-base">
                        <Megaphone className="w-4 h-4 mr-2" />
                        Updates & News
                    </TabsTrigger>
                    <TabsTrigger value="incubation" className="text-base">
                        <Rocket className="w-4 h-4 mr-2" />
                        Promotion Pipeline
                    </TabsTrigger>
                </TabsList>

                {/* Updates Tab */}
                <TabsContent value="updates" className="space-y-8">
                    {/* Featured Post */}
                    {featuredPost && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Link href={`/announcement/${featuredPost.id}`}>
                                <Card className="border-2 border-[#00cd67] bg-gradient-to-br from-[#00cd67]/10 to-transparent hover:border-primary hover:shadow-[0_0_30px_rgba(0,205,103,0.2)] transition-all cursor-pointer">
                                    <CardHeader>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Badge className={categoryColors[featuredPost.category]}>
                                                {featuredPost.category.toUpperCase()}
                                            </Badge>
                                            <Badge variant="outline">Featured</Badge>
                                        </div>
                                        <CardTitle className="text-3xl group-hover:text-primary transition-colors">{featuredPost.title}</CardTitle>
                                        <CardDescription className="text-base mt-2">{featuredPost.excerpt}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span>By {featuredPost.author}</span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(new Date(featuredPost.date))}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {featuredPost.tags.map(tag => (
                                                    <Badge key={tag} variant="outline" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    )}

                    {/* Regular Posts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {regularPosts?.map((post, index) => {
                            const Icon = categoryIcons[post.category];
                            return (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link href={`/announcement/${post.id}`}>
                                        <Card className="h-full hover:border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(0,205,103,0.1)] cursor-pointer">
                                            <CardHeader>
                                                <div className="flex items-center justify-between mb-3">
                                                    <Badge className={categoryColors[post.category]}>
                                                        <Icon className="w-3 h-3 mr-1" />
                                                        {post.category}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(new Date(post.date))}
                                                    </span>
                                                </div>
                                                <CardTitle className="text-xl hover:text-primary transition-colors">{post.title}</CardTitle>
                                                <CardDescription>{post.excerpt}</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex flex-wrap gap-2">
                                                    {post.tags.map(tag => (
                                                        <Badge key={tag} variant="outline" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </TabsContent>

                {/* Incubation Pipeline Tab */}
                <TabsContent value="incubation" className="space-y-6">
                    {/* Info Banner */}
                    <Card className="border-[#00cd67] bg-[#00cd67]/5">
                        <CardContent className="py-6">
                            <div className="flex items-start gap-4">
                                <Rocket className="w-6 h-6 text-[#00cd67] flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold mb-2">Pre-Sales Promotion Pipeline</h3>
                                    <p className="text-sm text-muted-foreground">
                                        High-quality projects being evaluated for promotion to pre-sales teams and regional releases.
                                        Projects undergo documentation review, quality validation, and production readiness assessment.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pipeline Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(statusConfig).map(([status, config]) => {
                            const count = incubationProjects.filter(p => p.incubationStatus === status).length;
                            const Icon = config.icon;
                            return (
                                <Card key={status}>
                                    <CardContent className="pt-6 text-center">
                                        <div className={`w-12 h-12 rounded-full ${config.color} flex items-center justify-center mx-auto mb-2`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-2xl font-bold">{count}</div>
                                        <div className="text-sm text-muted-foreground">{config.label}</div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Projects List */}
                    <div className="space-y-4">
                        {incubationProjects.map((project, index) => {
                            const status = project.incubationStatus || 'nominated';
                            const target = project.promotionTarget || 'pre-sales';
                            const StatusIcon = statusConfig[status as keyof typeof statusConfig].icon;
                            const TargetIcon = targetConfig[target as keyof typeof targetConfig].icon;

                            return (
                                <motion.div
                                    key={project.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="hover:border-primary/50 transition-all">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-xl font-bold">{project.name}</h3>
                                                        <Badge className={`${statusConfig[status as keyof typeof statusConfig].color} text-white`}>
                                                            <StatusIcon className="w-3 h-3 mr-1" />
                                                            {statusConfig[status as keyof typeof statusConfig].label}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground text-sm mb-3">{project.description}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Badge variant="outline" className="text-xs">{project.product || 'Cortex XSIAM'}</Badge>
                                                        <Badge variant="outline" className="text-xs">{project.language}</Badge>
                                                        {project.champion && (
                                                            <span className="text-xs text-muted-foreground">
                                                                Champion: <span className="font-medium">{project.champion}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <Badge variant="outline">
                                                    <TargetIcon className="w-3 h-3 mr-1" />
                                                    {targetConfig[target as keyof typeof targetConfig].label}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium">Readiness Score</span>
                                                        <span className="text-sm font-bold">{project.maturityScore || 0}%</span>
                                                    </div>
                                                    <Progress value={project.maturityScore || 0} className="h-2" />
                                                </div>
                                                {project.reviewNotes && (
                                                    <div className="bg-accent/50 rounded p-2 text-sm">
                                                        <span className="font-semibold">Notes:</span> {project.reviewNotes}
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between pt-2">
                                                    <div className="flex gap-4 text-sm text-muted-foreground">
                                                        {project.stars !== undefined && <span>⭐ {project.stars}</span>}
                                                        {project.forks !== undefined && <span>🔀 {project.forks}</span>}
                                                    </div>
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/project/${project.name.toLowerCase().replace(/\s+/g, '-')}`}>
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            Details
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Nomination CTA */}
                    <Card className="bg-gradient-to-br from-[#00cd67]/10 to-transparent border-[#00cd67]">
                        <CardContent className="py-8 text-center">
                            <Rocket className="w-12 h-12 text-[#00cd67] mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Nominate a Project</h3>
                            <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
                                Have a high-quality project ready for the Arsenal? Submit it for review and promotion.
                            </p>
                            <Button className="bg-[#00cd67] text-black hover:bg-[#00cd67]/90" asChild>
                                <Link href="/submit">Submit Project</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
