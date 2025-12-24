import React, { useState } from 'react';
import Duke890RSuspension from './posts/duke-890r-suspension.mdx';
import HelloWorld from './posts/hello-world.mdx';

const articles = {
    'duke-890r': {
        title: 'KTM Duke 890R Suspension Tuning',
        component: Duke890RSuspension,
    },
    'hello-world': {
        title: 'Hello World: Setting up MDX',
        component: HelloWorld,
    },
};

const BlogTab: React.FC = () => {
    const [selectedArticle, setSelectedArticle] = useState('duke-890r');

    const handleSelectArticle = (articleKey: string) => {
        setSelectedArticle(articleKey);
    };

    const ArticleComponent = articles[selectedArticle as keyof typeof articles]?.component;

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
                        <nav>
                            <ul>
                                {Object.entries(articles).map(([key, { title }]) => (
                                    <li key={key} className="mb-3">
                                        <button
                                            onClick={() => handleSelectArticle(key)}
                                            className={`text-left w-full text-sm font-medium transition-colors ${selectedArticle === key
                                                ? 'text-blue-600'
                                                : 'text-slate-500 hover:text-slate-800'
                                                }`}>
                                            {title}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                    <div className="w-full md:w-3/4 p-8 prose prose-slate max-w-none">
                        {ArticleComponent ? <ArticleComponent /> : <p>Select an article to read.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogTab;