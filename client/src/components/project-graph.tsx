import { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, Maximize2, Filter } from 'lucide-react';
import { Project } from '@/lib/types';

interface GraphNode {
    id: string;
    name: string;
    type: 'project' | 'tag' | 'technology' | 'integration';
    val: number;
    color: string;
    group: string;
    metadata?: any;
}

interface GraphLink {
    source: string;
    target: string;
    value: number;
    type: 'uses' | 'tagged-with' | 'integrates' | 'similar-to';
}

interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
}

interface ProjectGraphProps {
    currentProject: Project;
    allProjects?: Project[];
    showRelated?: boolean;
}

export function ProjectGraph({ currentProject, allProjects = [], showRelated = true }: ProjectGraphProps) {
    const fgRef = useRef<any>(null);
    const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
    const [highlightNodes, setHighlightNodes] = useState(new Set<string>());
    const [highlightLinks, setHighlightLinks] = useState(new Set<GraphLink>());
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

    // Generate graph data
    useEffect(() => {
        const nodes: GraphNode[] = [];
        const links: GraphLink[] = [];

        // Add current project as central node
        nodes.push({
            id: currentProject.name,
            name: currentProject.name,
            type: 'project',
            val: 30,
            color: '#00cd67',
            group: 'current',
            metadata: currentProject
        });

        // Add technology nodes
        if (currentProject.language) {
            const techId = `tech-${currentProject.language}`;
            nodes.push({
                id: techId,
                name: currentProject.language,
                type: 'technology',
                val: 15,
                color: '#4a9eff',
                group: 'technology'
            });
            links.push({
                source: currentProject.name,
                target: techId,
                value: 2,
                type: 'uses'
            });
        }

        // Add product node
        if (currentProject.product) {
            const productId = `product-${currentProject.product}`;
            nodes.push({
                id: productId,
                name: currentProject.product,
                type: 'tag',
                val: 20,
                color: '#f0a020',
                group: 'product'
            });
            links.push({
                source: currentProject.name,
                target: productId,
                value: 3,
                type: 'tagged-with'
            });
        }

        // Add use case node
        if (currentProject.usecase) {
            const usecaseId = `usecase-${currentProject.usecase}`;
            nodes.push({
                id: usecaseId,
                name: currentProject.usecase,
                type: 'tag',
                val: 15,
                color: '#00cd67',
                group: 'usecase'
            });
            links.push({
                source: currentProject.name,
                target: usecaseId,
                value: 2,
                type: 'tagged-with'
            });
        }

        // Add related projects if enabled
        if (showRelated && allProjects.length > 0) {
            const related = allProjects
                .filter(p =>
                    p.name !== currentProject.name &&
                    (p.product === currentProject.product || p.usecase === currentProject.usecase)
                )
                .slice(0, 5);

            related.forEach(project => {
                nodes.push({
                    id: project.name,
                    name: project.name,
                    type: 'project',
                    val: 15,
                    color: '#888888',
                    group: 'related',
                    metadata: project
                });

                // Link related projects
                const similarity =
                    (project.product === currentProject.product ? 1 : 0) +
                    (project.usecase === currentProject.usecase ? 1 : 0) +
                    (project.language === currentProject.language ? 1 : 0);

                links.push({
                    source: currentProject.name,
                    target: project.name,
                    value: similarity,
                    type: 'similar-to'
                });
            });
        }

        setGraphData({ nodes, links });
    }, [currentProject, allProjects, showRelated]);

    // Zoom controls
    const handleZoomIn = () => {
        if (fgRef.current) {
            fgRef.current.zoom(fgRef.current.zoom() * 1.2);
        }
    };

    const handleZoomOut = () => {
        if (fgRef.current) {
            fgRef.current.zoom(fgRef.current.zoom() / 1.2);
        }
    };

    const handleZoomToFit = () => {
        if (fgRef.current) {
            fgRef.current.zoomToFit(400);
        }
    };

    // Node interaction handlers
    const handleNodeClick = (node: GraphNode) => {
        setSelectedNode(node);

        // Highlight connected nodes
        const connectedNodes = new Set<string>();
        const connectedLinks = new Set<GraphLink>();

        graphData.links.forEach(link => {
            if (link.source === node.id || link.target === node.id) {
                connectedNodes.add(typeof link.source === 'string' ? link.source : link.source);
                connectedNodes.add(typeof link.target === 'string' ? link.target : link.target);
                connectedLinks.add(link);
            }
        });

        setHighlightNodes(connectedNodes);
        setHighlightLinks(connectedLinks);
    };

    const handleNodeHover = (node: GraphNode | null) => {
        if (!node) {
            setHighlightNodes(new Set<string>());
            setHighlightLinks(new Set<GraphLink>());
            return;
        }

        const connectedNodes = new Set<string>([node.id]);
        const connectedLinks = new Set<GraphLink>();

        graphData.links.forEach(link => {
            if (link.source === node.id || link.target === node.id) {
                connectedNodes.add(typeof link.source === 'string' ? link.source : (link.source as any).id);
                connectedNodes.add(typeof link.target === 'string' ? link.target : (link.target as any).id);
                connectedLinks.add(link);
            }
        });

        setHighlightNodes(connectedNodes);
        setHighlightLinks(connectedLinks);
    };

    const getNodeColor = (node: GraphNode) => {
        if (highlightNodes.size > 0 && !highlightNodes.has(node.id)) {
            return '#444444';
        }
        return node.color;
    };

    const getLinkColor = (link: GraphLink) => {
        if (highlightLinks.size > 0 && !highlightLinks.has(link)) {
            return 'rgba(255,255,255,0.1)';
        }

        switch (link.type) {
            case 'uses':
                return 'rgba(74, 158, 255, 0.6)';
            case 'tagged-with':
                return 'rgba(0, 205, 103, 0.6)';
            case 'similar-to':
                return 'rgba(240, 160, 32, 0.6)';
            default:
                return 'rgba(255, 255, 255, 0.3)';
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Project Network</CardTitle>
                        <CardDescription>
                            Interactive visualization of technologies, tags, and related projects
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleZoomIn}>
                            <ZoomIn className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleZoomOut}>
                            <ZoomOut className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleZoomToFit}>
                            <Maximize2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    {/* Graph Canvas */}
                    <div className="border rounded-lg overflow-hidden bg-black/90">
                        <ForceGraph2D
                            ref={fgRef}
                            graphData={graphData}
                            width={800}
                            height={500}
                            nodeRelSize={6}
                            nodeLabel={(node: any) => `
                <div class="bg-black text-white p-2 rounded text-sm">
                  <strong>${node.name}</strong><br/>
                  Type: ${node.type}
                </div>
              `}
                            nodeColor={getNodeColor}
                            linkColor={getLinkColor}
                            linkWidth={(link: any) => highlightLinks.has(link) ? 3 : 1}
                            linkDirectionalParticles={(link: any) => highlightLinks.has(link) ? 4 : 0}
                            linkDirectionalParticleWidth={2}
                            onNodeClick={handleNodeClick}
                            onNodeHover={handleNodeHover}
                            d3VelocityDecay={0.3}
                            cooldownTime={2000}
                        />
                    </div>

                    {/* Legend */}
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-[#00cd67]" />
                            <span>Current Project</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-[#888888]" />
                            <span>Related Projects</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-[#4a9eff]" />
                            <span>Technologies</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-[#f0a020]" />
                            <span>Categories</span>
                        </div>
                    </div>

                    {/* Selected Node Info */}
                    {selectedNode && (
                        <div className="mt-4 p-4 bg-accent rounded-lg">
                            <h4 className="font-semibold mb-2">{selectedNode.name}</h4>
                            <div className="flex gap-2 mb-2">
                                <Badge variant="outline">{selectedNode.type}</Badge>
                                <Badge variant="outline">{selectedNode.group}</Badge>
                            </div>
                            {selectedNode.metadata && selectedNode.type === 'project' && (
                                <p className="text-sm text-muted-foreground">
                                    {selectedNode.metadata.description}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
