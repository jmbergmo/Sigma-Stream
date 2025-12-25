import { describe, it, expect } from 'vitest';
import { processArticles } from '../services/blogUtils';
import React from 'react';

// Mock component
const MockComponent = () => React.createElement('div', null, 'Mock');

describe('processArticles', () => {
    it('should correctly parse a standard MDX file with a title', () => {
        const componentModules = {
            './posts/test.mdx': { default: MockComponent }
        };
        const rawModules = {
            './posts/test.mdx': { default: '# My Great Post\n\nSome content.' }
        };

        const result = processArticles(componentModules, rawModules);

        expect(result['test']).toBeDefined();
        expect(result['test'].title).toBe('My Great Post');
        expect(result['test'].slug).toBe('test');
        expect(result['test'].component).toBe(MockComponent);
    });

    it('should fallback to slug if no H1 title is found', () => {
        const componentModules = {
            './posts/no-title.mdx': { default: MockComponent }
        };
        const rawModules = {
            './posts/no-title.mdx': { default: 'Just some content without a header.' }
        };

        const result = processArticles(componentModules, rawModules);

        expect(result['no-title'].title).toBe('no-title');
    });

    it('should handle raw modules returned as strings (not objects)', () => {
        // Simulating different bundler behavior where ?raw might return string directly
        const componentModules = {
            './posts/string-raw.mdx': { default: MockComponent }
        };
        const rawModules = {
            './posts/string-raw.mdx': '# Direct String Title'
        } as any;

        const result = processArticles(componentModules, rawModules);

        expect(result['string-raw'].title).toBe('Direct String Title');
    });

    it('should ignore files without a default export (component)', () => {
        const componentModules = {
            './posts/broken.mdx': {} // No default export
        };
        const rawModules = {
            './posts/broken.mdx': { default: '# Broken' }
        };

        const result = processArticles(componentModules, rawModules);

        expect(result['broken']).toBeUndefined();
    });
});
