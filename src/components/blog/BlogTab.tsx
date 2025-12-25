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
const componentModules = import.meta.glob('./posts/*.mdx', { eager: true });

// 2. Glob import raw content to parse titles
const rawModules = import.meta.glob('./posts/*.mdx', { query: '?raw', eager: true });

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
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800">Blog</h2>
                    <p className="text-sm text-slate-500">Insights, case studies, and updates.</p>
                </div>
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/4 p-6 border-r border-slate-100 bg-slate-50/30">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Latest Posts</h3>

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
                                                    ? 'text-blue-600'
                                                    : 'text-slate-500 hover:text-slate-800'
                                                    }`}>
                                                {articles[key].title}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        )}
                    </div>
                    <div className="w-full md:w-3/4 p-8 prose prose-slate max-w-none">
                        <BlogErrorBoundary>
                            {ArticleComponent ? <ArticleComponent /> : (
                                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
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