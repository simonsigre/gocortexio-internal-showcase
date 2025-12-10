import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import 'highlight.js/styles/github-dark.css';

interface ReadmeViewerProps {
    content: string;
    title?: string;
    description?: string;
    githubUrl?: string;
}

export function ReadmeViewer({ content, title = 'README', description, githubUrl }: ReadmeViewerProps) {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            toast({
                title: 'Copied to clipboard',
                description: 'README content has been copied.'
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast({
                title: 'Failed to copy',
                description: 'Could not copy content to clipboard.',
                variant: 'destructive'
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        {description && <CardDescription>{description}</CardDescription>}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopy}
                        >
                            <Copy className="w-4 h-4 mr-2" />
                            {copied ? 'Copied!' : 'Copy'}
                        </Button>
                        {githubUrl && (
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                            >
                                <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    View on GitHub
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight, rehypeRaw]}
                        components={{
                            // Customize link rendering to open external links in new tab
                            a: ({ node, children, href, ...props }) => {
                                const isExternal = href?.startsWith('http');
                                return (
                                    <a
                                        href={href}
                                        target={isExternal ? '_blank' : undefined}
                                        rel={isExternal ? 'noopener noreferrer' : undefined}
                                        className="text-primary hover:underline"
                                        {...props}
                                    >
                                        {children}
                                    </a>
                                );
                            },
                            // Add copy button to code blocks
                            pre: ({ node, children, ...props }) => {
                                const [copyCode, setCopyCode] = useState(false);
                                const codeContent = node?.children?.[0]?.type === 'element' &&
                                    node.children[0].children?.[0]?.type === 'text'
                                    ? node.children[0].children[0].value
                                    : '';

                                const handleCopyCode = async () => {
                                    if (typeof codeContent === 'string') {
                                        await navigator.clipboard.writeText(codeContent);
                                        setCopyCode(true);
                                        setTimeout(() => setCopyCode(false), 2000);
                                    }
                                };

                                return (
                                    <div className="relative group">
                                        {codeContent && (
                                            <button
                                                onClick={handleCopyCode}
                                                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded px-2 py-1 text-xs"
                                            >
                                                {copyCode ? 'Copied!' : 'Copy'}
                                            </button>
                                        )}
                                        <pre className="bg-muted p-4 rounded-md overflow-x-auto" {...props}>
                                            {children}
                                        </pre>
                                    </div>
                                );
                            },
                            // Style images properly
                            img: ({ node, ...props }) => (
                                <img
                                    className="rounded-lg border max-w-full h-auto my-4"
                                    loading="lazy"
                                    {...props}
                                    alt={props.alt || 'Image'}
                                />
                            ),
                            // Style tables
                            table: ({ node, ...props }) => (
                                <div className="overflow-x-auto my-4">
                                    <table className="w-full border-collapse border border-border" {...props} />
                                </div>
                            ),
                            th: ({ node, ...props }) => (
                                <th className="border border-border bg-muted px-4 py-2 text-left font-semibold" {...props} />
                            ),
                            td: ({ node, ...props }) => (
                                <td className="border border-border px-4 py-2" {...props} />
                            )
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            </CardContent>
        </Card>
    );
}
