/**
 * Content Extraction Utilities
 * Extracts structured content from markdown and GitHub repositories
 */

export interface ExtractedSections {
    installation?: string;
    usage?: string;
    api?: string;
    deployment?: string;
    contributing?: string;
    troubleshooting?: string;
    security?: string;
    architecture?: string;
    testing?: string;
    changelog?: string;
    [key: string]: string | undefined;
}

/**
 * Section detection patterns for common README sections
 */
const SECTION_PATTERNS: Record<string, RegExp> = {
    installation: /^##?\s*(installation|setup|getting started|quick start|prerequisites)/i,
    usage: /^##?\s*(usage|how to use|examples|basic usage)/i,
    api: /^##?\s*(api|endpoints|reference|api reference)/i,
    deployment: /^##?\s*(deploy|deployment|hosting|production)/i,
    contributing: /^##?\s*(contribut|development|how to contribute)/i,
    troubleshooting: /^##?\s*(troubleshoot|faq|common issues|known issues|debugging)/i,
    security: /^##?\s*(security|authentication|authorization|permissions)/i,
    architecture: /^##?\s*(architecture|design|structure|overview)/i,
    testing: /^##?\s*(test|testing|qa|quality assurance)/i,
    changelog: /^##?\s*(changelog|release notes|version history|versions)/i
};

/**
 * Extract sections from markdown content
 */
export function extractSections(markdown: string): ExtractedSections {
    const sections: ExtractedSections = {};
    const lines = markdown.split('\n');

    let currentSection = '';
    let currentContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check if line is a header (## or ###)
        const isHeader = line.match(/^#{1,3}\s/);

        if (isHeader) {
            // Save previous section
            if (currentSection && currentContent.length > 0) {
                sections[currentSection] = currentContent.join('\n').trim();
            }

            // Detect section type
            let matched = false;
            for (const [sectionType, pattern] of Object.entries(SECTION_PATTERNS)) {
                if (pattern.test(line)) {
                    currentSection = sectionType;
                    currentContent = [line]; // Include the header
                    matched = true;
                    break;
                }
            }

            // If no match, reset
            if (!matched) {
                currentSection = '';
                currentContent = [];
            }
        } else if (currentSection) {
            // Only add to current section if we've detected one
            currentContent.push(line);

            // Stop if we hit another high-level header (# or ##)
            if (line.match(/^#{1,2}\s/) && i > 0) {
                sections[currentSection] = currentContent.slice(0, -1).join('\n').trim();
                currentSection = '';
                currentContent = [];
            }
        }
    }

    // Save final section
    if (currentSection && currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n').trim();
    }

    return sections;
}

/**
 * Extract code blocks from markdown
 */
export function extractCodeBlocks(markdown: string): Array<{ language: string; code: string }> {
    const codeBlocks: Array<{ language: string; code: string }> = [];
    const lines = markdown.split('\n');

    let inCodeBlock = false;
    let currentLanguage = '';
    let currentCode: string[] = [];

    for (const line of lines) {
        if (line.startsWith('```')) {
            if (inCodeBlock) {
                // End of code block
                codeBlocks.push({
                    language: currentLanguage,
                    code: currentCode.join('\n')
                });
                inCodeBlock = false;
                currentLanguage = '';
                currentCode = [];
            } else {
                // Start of code block
                inCodeBlock = true;
                currentLanguage = line.substring(3).trim() || 'plaintext';
            }
        } else if (inCodeBlock) {
            currentCode.push(line);
        }
    }

    return codeBlocks;
}

/**
 * Extract links from markdown
 */
export function extractLinks(markdown: string): Array<{ text: string; url: string }> {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links: Array<{ text: string; url: string }> = [];

    let match;
    while ((match = linkRegex.exec(markdown)) !== null) {
        links.push({
            text: match[1],
            url: match[2]
        });
    }

    return links;
}

/**
 * Create smart fallback content when sections are missing
 */
export function createFallbackContent(sectionType: string, project: {
    name: string;
    description?: string;
    language?: string;
    repo?: string;
}): string {
    switch (sectionType) {
        case 'installation':
            return project.repo
                ? `## Installation

\`\`\`bash
git clone https://github.com/${project.repo}
cd ${project.name.toLowerCase().replace(/\s+/g, '-')}
# Install dependencies (see repository for specific instructions)
\`\`\`

Visit the [repository](https://github.com/${project.repo}) for detailed installation instructions.`
                : `## Installation

Please refer to the project documentation for installation instructions.`;

        case 'usage':
            return `## Usage

${project.description || 'This project provides functionality for Cortex ecosystem integration.'}

For detailed usage examples, please refer to the project documentation${project.repo ? ` or visit the [repository](https://github.com/${project.repo})` : ''}.`;

        case 'deployment':
            return `## Deployment

Deployment instructions will vary based on your environment and requirements.

${project.repo ? `Refer to the [repository documentation](https://github.com/${project.repo}) for environment-specific deployment guides.` : 'Contact the project author for deployment guidance.'}`;

        case 'troubleshooting':
            return `## Troubleshooting

If you encounter issues:

1. Check the project documentation
2. Review the issue tracker${project.repo ? ` on [GitHub](https://github.com/${project.repo}/issues)` : ''}
3. Ensure all dependencies are properly installed
4. Verify your environment configuration

${project.repo ? `For additional help, please [open an issue](https://github.com/${project.repo}/issues/new).` : ''}`;

        case 'api':
            return `## API Reference

API documentation for this project is available in the repository.

${project.repo ? `View the [API documentation](https://github.com/${project.repo}#api-reference).` : 'Contact the project maintainer for API details.'}`;

        default:
            return `Information about ${sectionType} is not yet available for this project.`;
    }
}

/**
 * Extract technology stack from markdown content and dependencies
 */
export function extractTechStack(markdown: string, language: string): string[] {
    const techStack = new Set<string>([language]);

    // Common tech keywords to look for
    const techKeywords = [
        'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
        'React', 'Vue', 'Angular', 'Node.js', 'Express',
        'Flask', 'Django', 'FastAPI', 'Spring Boot',
        'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
        'Terraform', 'Ansible', 'Jenkins', 'GitHub Actions',
        'REST API', 'GraphQL', 'gRPC', 'WebSocket'
    ];

    // Search for tech keywords in markdown
    const lowerMarkdown = markdown.toLowerCase();
    techKeywords.forEach(tech => {
        if (lowerMarkdown.includes(tech.toLowerCase())) {
            techStack.add(tech);
        }
    });

    return Array.from(techStack);
}

/**
 * Extract dependencies from package.json content
 */
export function extractNpmDependencies(packageJson: string): {
    production: string[];
    development: string[];
} {
    try {
        const pkg = JSON.parse(packageJson);
        return {
            production: Object.keys(pkg.dependencies || {}),
            development: Object.keys(pkg.devDependencies || {})
        };
    } catch (error) {
        return { production: [], development: [] };
    }
}

/**
 * Extract dependencies from requirements.txt content
 */
export function extractPythonDependencies(requirementsTxt: string): string[] {
    return requirementsTxt
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
        .map(line => line.split('==')[0].split('>=')[0].split('<=')[0].trim());
}

/**
 * Enhance project with extracted content
 */
export function enhanceProjectWithContent(
    project: any,
    readmeContent?: string
): any {
    if (!readmeContent) return project;

    const sections = extractSections(readmeContent);
    const codeBlocks = extractCodeBlocks(readmeContent);
    const links = extractLinks(readmeContent);
    const techStack = extractTechStack(readmeContent, project.language);

    return {
        ...project,
        readme: {
            content: readmeContent,
            sections: Object.keys(sections),
            codeExamples: codeBlocks.length
        },
        setup: sections.installation ? {
            content: sections.installation
        } : undefined,
        deployment: sections.deployment ? {
            content: sections.deployment
        } : undefined,
        api: sections.api ? {
            content: sections.api
        } : undefined,
        troubleshooting: sections.troubleshooting ? {
            content: sections.troubleshooting
        } : undefined,
        extractedSections: sections,
        technicalStack: techStack,
        externalLinks: links,
        hasCodeExamples: codeBlocks.length > 0
    };
}
