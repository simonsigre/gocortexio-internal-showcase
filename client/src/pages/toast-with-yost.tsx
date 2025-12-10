import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight, Megaphone, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/utils';

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

export default function ToastWithYost() {
    // Mock data - in production this would fetch from an API or CMS
    const { data: posts } = useQuery<BlogPost[]>({
        queryKey: ['blog-posts'],
        queryFn: async () => {
            // This would be replaced with actual API call
            return [
                {
                    id: '1',
                    title: 'Introducing the GoCortex Showcase Platform',
                    excerpt: 'A new community-driven platform for sharing and discovering Palo Alto Networks Cortex ecosystem projects.',
                    content: 'Full blog post content here...',
                    author: 'Yost Team',
                    date: '2024-12-01',
                    category: 'announcement',
                    tags: ['platform', 'community', 'launch'],
                    featured: true,
                    image: '/defaults/announcement-banner.png'
                },
                {
                    id: '2',
                    title: 'Community Contributions Surpass 100 Projects',
                    excerpt: 'The Cortex community has submitted over 100 innovative projects covering XSIAM, XDR, XSOAR, and Prisma Cloud.',
                    content: 'Full blog post content here...',
                    author: 'Yost Team',
                    date: '2024-11-28',
                    category: 'community',
                    tags: ['milestone', 'community'],
                    featured: false
                },
                {
                    id: '3',
                    title: 'New AI-Powered Documentation Features',
                    excerpt: 'Automatic README generation and quality validation now available to help standardize project submissions.',
                    content: 'Full blog post content here...',
                    author: 'Yost Team',
                    date: '2024-11-25',
                    category: 'feature',
                    tags: ['AI', 'documentation', 'automation'],
                    featured: false
                }
            ];
        }
    });

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

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-12 text-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-block mb-4"
                >
                    <Badge className="bg-[#00cd67] text-black text-sm px-4 py-1">
                        🍞 Toast with Yost
                    </Badge>
                </motion.div>
                <h1 className="text-5xl font-bold mb-4 font-mono uppercase tracking-tight">
                    Latest from the <span className="text-[#00cd67]">Cortex</span> Community
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Announcements, updates, and insights from the GoCortex Showcase team and community
                </p>
            </div>

            {/* Featured Post Banner */}
            {featuredPost && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-12"
                >
                    <Card className="border-2 border-[#00cd67] bg-gradient-to-br from-[#00cd67]/10 to-transparent overflow-hidden">
                        <div className="md:flex">
                            {featuredPost.image && (
                                <div className="md:w-1/2 h-[300px] md:h-auto bg-black/20">
                                    <img
                                        src={featuredPost.image}
                                        alt={featuredPost.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="md:w-1/2 p-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <Badge className={categoryColors[featuredPost.category]}>
                                        {featuredPost.category.toUpperCase()}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">Featured</span>
                                </div>
                                <h2 className="text-3xl font-bold mb-4">{featuredPost.title}</h2>
                                <p className="text-muted-foreground mb-6">{featuredPost.excerpt}</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span>By {featuredPost.author}</span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {formatDate(new Date(featuredPost.date))}
                                        </span>
                                    </div>
                                    <Button className="bg-[#00cd67] text-black hover:bg-[#00cd67]/90">
                                        Read More
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Regular Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularPosts?.map((post, index) => {
                    const Icon = categoryIcons[post.category];
                    return (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="h-full hover:border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(0,205,103,0.1)]">
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
                                    <CardTitle className="text-xl">{post.title}</CardTitle>
                                    <CardDescription>{post.excerpt}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {post.tags.map(tag => (
                                            <Badge key={tag} variant="outline" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                    <Button variant="ghost" className="w-full justify-between group">
                                        Read Article
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Call to Action */}
            <div className="mt-16 text-center">
                <Card className="bg-accent/50 border-dashed">
                    <CardContent className="py-12">
                        <h3 className="text-2xl font-bold mb-4">Want to contribute?</h3>
                        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                            Share your Cortex projects, insights, and innovations with the community.
                            Get featured in our next Toast with Yost update!
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button asChild className="bg-primary text-black">
                                <Link href="/submit">Submit Your Project</Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/">Browse Showcase</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
