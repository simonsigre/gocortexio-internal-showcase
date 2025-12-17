import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Rocket, Target, TrendingUp, CheckCircle2, Clock, AlertCircle, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { Project } from '@/lib/types';

interface IncubationProject extends Project {
    incubationStatus: 'nominated' | 'in-review' | 'ready' | 'promoted';
    promotionTarget: 'pre-sales' | 'regional-nam' | 'regional-emea' | 'regional-japac' | 'global';
    maturityScore: number; // 0-100
    reviewNotes?: string;
    promotionDate?: string;
    champion?: string; // Who is championing this for promotion
}

export default function IncubationHub() {
    // Mock data - in production this would fetch from an API
    const { data: projects } = useQuery<IncubationProject[]>({
        queryKey: ['incubation-projects'],
        queryFn: async () => {
            // This would be replaced with actual API call
            return [
                {
                    name: 'Advanced XSIAM Alert Enrichment',
                    description: 'Automated enrichment pipeline for XSIAM alerts using threat intelligence APIs and machine learning models.',
                    status: 'active',
                    publicationStatus: 'published',
                    link: 'https://github.com/example/xsiam-enrichment',
                    language: 'Python',
                    githubApi: true,
                    author: 'Security Team NAM',
                    product: 'Cortex XSIAM',
                    theatre: 'NAM',
                    usecase: 'Security Operations',
                    date: '2024-11-15',
                    incubationStatus: 'ready',
                    promotionTarget: 'pre-sales',
                    maturityScore: 92,
                    champion: 'John Doe',
                    stars: 45,
                    forks: 12,
                    upvotes: 0,
                    downvotes: 0
                },
                {
                    name: 'XDR Mobile Threat Dashboard',
                    description: 'Interactive dashboard for visualizing mobile endpoint threats detected by Cortex XDR.',
                    status: 'beta',
                    publicationStatus: 'published',
                    link: 'https://github.com/example/xdr-mobile-dashboard',
                    language: 'TypeScript',
                    githubApi: true,
                    author: 'Engineering EMEA',
                    product: 'Cortex XDR',
                    theatre: 'EMEA',
                    usecase: 'Threat Detection',
                    date: '2024-11-20',
                    incubationStatus: 'in-review',
                    promotionTarget: 'regional-emea',
                    maturityScore: 75,
                    champion: 'Jane Smith',
                    reviewNotes: 'Needs additional documentation and deployment guide',
                    stars: 28,
                    forks: 7,
                    upvotes: 0,
                    downvotes: 0
                },
                {
                    name: 'XSOAR Playbook Framework',
                    description: 'Reusable framework for building complex XSOAR playbooks with version control and testing.',
                    status: 'active',
                    publicationStatus: 'published',
                    link: 'https://github.com/example/xsoar-framework',
                    language: 'Python',
                    githubApi: true,
                    author: 'Automation Team',
                    product: 'Cortex XSOAR',
                    theatre: 'Global',
                    usecase: 'Automation',
                    date: '2024-10-30',
                    incubationStatus: 'nominated',
                    promotionTarget: 'global',
                    maturityScore: 68,
                    champion: 'Bob Johnson',
                    stars: 67,
                    forks: 23,
                    upvotes: 0,
                    downvotes: 0
                }
            ];
        }
    });

    const statusConfig = {
        nominated: { label: 'Nominated', color: 'bg-blue-500', icon: Target },
        'in-review': { label: 'In Review', color: 'bg-yellow-500', icon: Clock },
        ready: { label: 'Ready', color: 'bg-green-500', icon: CheckCircle2 },
        promoted: { label: 'Promoted', color: 'bg-purple-500', icon: Rocket }
    };

    const targetConfig = {
        'pre-sales': { label: 'Content Arsenal', icon: TrendingUp },
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
                    className="flex items-center gap-3 mb-4"
                >
                    <Rocket className="w-12 h-12 text-[#00cd67]" />
                    <div>
                        <h1 className="text-5xl font-bold font-mono uppercase tracking-tight">
                            Incubation <span className="text-[#00cd67]">Hub</span>
                        </h1>
                        <p className="text-muted-foreground">
                            Projects being prepared for field teams and regional promotion
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Info Banner */}
            <Card className="mb-8 border-[#00cd67] bg-[#00cd67]/5">
                <CardContent className="py-6">
                    <div className="flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-[#00cd67] flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold mb-2">About the Incubation Hub</h3>
                            <p className="text-sm text-muted-foreground">
                                The Incubation Hub showcases high-quality projects being evaluated for promotion to
                                field teams and regional releases. Projects undergo thorough review including
                                documentation quality, test coverage, security validation, and production readiness.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Pipeline Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
                {Object.entries(statusConfig).map(([status, config]) => {
                    const count = projects?.filter(p => p.incubationStatus === status).length || 0;
                    const Icon = config.icon;
                    return (
                        <Card key={status} className="text-center">
                            <CardHeader>
                                <div className={`w-12 h-12 rounded-full ${config.color} flex items-center justify-center mx-auto mb-2`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <CardTitle className="text-2xl">{count}</CardTitle>
                                <CardDescription>{config.label}</CardDescription>
                            </CardHeader>
                        </Card>
                    );
                })}
            </div>

            {/* Projects List */}
            <div className="space-y-6">
                {projects?.map((project, index) => {
                    const StatusIcon = statusConfig[project.incubationStatus].icon;
                    const TargetIcon = targetConfig[project.promotionTarget].icon;

                    return (
                        <motion.div
                            key={project.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="hover:border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(0,205,103,0.1)]">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <h3 className="text-2xl font-bold">{project.name}</h3>
                                                <Badge className={`${statusConfig[project.incubationStatus].color} text-white`}>
                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                    {statusConfig[project.incubationStatus].label}
                                                </Badge>
                                            </div>
                                            <p className="text-muted-foreground mb-4">{project.description}</p>

                                            {/* Metadata */}
                                            <div className="flex flex-wrap gap-3 text-sm">
                                                <Badge variant="outline">{project.product}</Badge>
                                                <Badge variant="outline">{project.language}</Badge>
                                                <Badge variant="outline">{project.theatre}</Badge>
                                                {project.champion && (
                                                    <span className="text-muted-foreground">
                                                        Champion: <span className="text-foreground font-medium">{project.champion}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Promotion Target Badge */}
                                        <div className="text-right">
                                            <Badge variant="outline" className="mb-2">
                                                <TargetIcon className="w-3 h-3 mr-1" />
                                                {targetConfig[project.promotionTarget].label}
                                            </Badge>
                                            {project.promotionDate && (
                                                <p className="text-xs text-muted-foreground">
                                                    Target: {project.promotionDate}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    {/* Maturity Score */}
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">Maturity Score</span>
                                            <span className="text-sm font-bold">{project.maturityScore}%</span>
                                        </div>
                                        <Progress value={project.maturityScore} className="h-2" />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {project.maturityScore >= 90 ? 'Excellent - Ready for promotion' :
                                                project.maturityScore >= 75 ? 'Good - Minor improvements needed' :
                                                    'Needs work - Additional development required'}
                                        </p>
                                    </div>

                                    {/* Review Notes */}
                                    {project.reviewNotes && (
                                        <div className="bg-accent/50 rounded-lg p-3 mb-4">
                                            <p className="text-sm">
                                                <span className="font-semibold">Review Notes:</span> {project.reviewNotes}
                                            </p>
                                        </div>
                                    )}

                                    {/* GitHub Stats & Actions */}
                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                            {project.stars !== undefined && (
                                                <span className="flex items-center gap-1">
                                                    ⭐ {project.stars}
                                                </span>
                                            )}
                                            {project.forks !== undefined && (
                                                <span className="flex items-center gap-1">
                                                    🔀 {project.forks}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/project/${project.name.toLowerCase().replace(/\s+/g, '-')}`}>
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View Details
                                                </Link>
                                            </Button>
                                            {project.incubationStatus === 'ready' && (
                                                <Button size="sm" className="bg-[#00cd67] text-black hover:bg-[#00cd67]/90">
                                                    <Rocket className="w-4 h-4 mr-2" />
                                                    Promote
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Nomination CTA */}
            <div className="mt-12">
                <Card className="bg-gradient-to-br from-[#00cd67]/10 to-transparent border-[#00cd67]">
                    <CardContent className="py-12 text-center">
                        <Rocket className="w-16 h-16 text-[#00cd67] mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-4">Nominate a Project for Incubation</h3>
                        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                            Have a high-quality project ready for field teams or regional promotion?
                            Nominate it for the Incubation Hub and get it in front of decision makers.
                        </p>
                        <Button className="bg-[#00cd67] text-black hover:bg-[#00cd67]/90" size="lg">
                            Submit Nomination
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
