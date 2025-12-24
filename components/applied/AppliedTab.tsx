import React, { useState } from 'react';
import Duke890RSuspension from '../../articles/duke-890r-suspension.mdx';

const articles = {
    'duke-890r': {
        title: 'KTM Duke 890R Suspension Tuning',
        component: Duke890RSuspension,
    },
    // ... more articles can be added here
};

const AppliedTab: React.FC = () => {
    const [selectedArticle, setSelectedArticle] = useState('duke-890r');

    const handleSelectArticle = (articleKey: string) => {
        setSelectedArticle(articleKey);
    };

    const ArticleComponent = articles[selectedArticle]?.component;

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800">Applied</h2>
                    <p className="text-sm text-slate-500">How this tool was used in different contexts.</p>
                </div>
                <div className="flex">
                    <div className="w-1/4 p-6 border-r border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Applications</h3>
                        <nav>
                            <ul>
                                {Object.entries(articles).map(([key, { title }]) => (
                                    <li key={key} className="mb-2">
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleSelectArticle(key);
                                            }}
                                            className={`block text-sm font-medium ${selectedArticle === key
                                                ? 'text-blue-600'
                                                : 'text-slate-500 hover:text-slate-700'
                                                }`}>
                                            {title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                    <div className="w-3/4 p-6">
                        {ArticleComponent ? <ArticleComponent /> : <p>Select an article to read.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppliedTab;