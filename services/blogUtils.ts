import React from 'react';

export interface Article {
    slug: string;
    title: string;
    component: React.ComponentType;
}

/**
 * Processes the results of import.meta.glob to return a structured dictionary of articles.
 * 
 * @param componentModules Result of import.meta.glob('./posts/*.mdx', { eager: true })
 * @param rawModules Result of import.meta.glob('./posts/*.mdx', { query: '?raw', eager: true })
 * @returns Record<slug, Article>
 */
export const processArticles = (
    componentModules: Record<string, unknown>,
    rawModules: Record<string, unknown>
): Record<string, Article> => {
    const items: Record<string, Article> = {};

    for (const path in componentModules) {
        // Extract slug from filename: ./posts/my-post.mdx -> my-post
        const slug = path.split('/').pop()?.replace('.mdx', '') || '';

        // Get the component (the default export of the MDX module)
        // In Vite, eager glob imports return the module namespace.
        // We need to handle potential differences in how it's returned.
        const componentModule = componentModules[path] as { default: React.ComponentType };
        const component = componentModule?.default;

        if (!component) {
            console.warn(`No default export found for MDX file: ${path}`);
            continue;
        }

        // Get raw content to find the title
        // ?raw import returns a module with default export as the string
        let rawContent = '';
        const rawModule = rawModules[path] as { default: string } | string;

        // Handle case where rawModule might be the string itself or a module with default
        if (typeof rawModule === 'string') {
            rawContent = rawModule;
        } else if (rawModule && typeof rawModule.default === 'string') {
            rawContent = rawModule.default;
        }

        // Simple regex to find the first # Heading
        const titleMatch = rawContent.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1].trim() : slug; // Fallback to slug if no H1

        if (slug) {
            items[slug] = {
                slug,
                title,
                component
            };
        }
    }
    return items;
};
