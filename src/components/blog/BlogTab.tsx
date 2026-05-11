import React, { useState, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import { processArticles, Article } from '../../services/blogUtils';

// Error Boundary to catch MDX processing/rendering errors
class BlogErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
    constructor(props: { children: ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error) {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Blog Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 text-center text-slate-500">
                    <p>Something went wrong loading the blog content.</p>
                </div>
            );
        }

        return this.props.children;
    }
}

// 1. Glob import all MDX files as React components
const componentModules = import.meta.glob('./posts/*.{mdx,md}', { eager: true });

// 2. Glob import raw content to parse titles
const rawModules = import.meta.glob('./posts/*.{mdx,md}', { query: '?raw', eager: true });

const BlogTab: React.FC = () => {
    // memoize the articles list so we don't re-parse on every render
    const articles = useMemo(() => {
        try {
            return processArticles(componentModules, rawModules);
        } catch (e) {
            console.error("Failed to process articles", e);
            return {};
        }
    }, []);

    // Get list of keys for navigation
    const articleKeys = Object.keys(articles);

    // Initialize selection with the first available article, or empty string
    const [selectedArticle, setSelectedArticle] = useState<string>(articleKeys[0] || '');

    // Handle case where selection might be invalid (e.g. if files changed hot-reload) or empty
    const currentArticle = articles[selectedArticle];
    const ArticleComponent = currentArticle?.component;

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Blog</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Insights, case studies, and updates.</p>
                </div>
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/4 p-6 border-r border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/20 transition-colors">
                        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Latest Posts</h3>

                        {articleKeys.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No posts found.</p>
                        ) : (
                            <nav>
                                <ul>
                                    {articleKeys.map((key) => (
                                        <li key={key} className="mb-3">
                                            <button
                                                onClick={() => setSelectedArticle(key)}
                                                className={`text-left w-full text-sm font-medium transition-colors ${selectedArticle === key
                                                    ? 'text-blue-600 dark:text-blue-400'
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                                    }`}>
                                                {articles[key].title}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        )}
                    </div>
                    <div className="w-full md:w-3/4 p-8 prose prose-slate dark:prose-invert max-w-none transition-colors">
                        <BlogErrorBoundary>
                            {ArticleComponent ? <ArticleComponent /> : (
                                <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-500">
                                    <p>Select an article to read</p>
                                </div>
                            )}
                        </BlogErrorBoundary>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogTab;