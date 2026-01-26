import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import Navigation from '../src/components/layout/Navigation';

// Mock useLocation since it is used in Navigation
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useLocation: vi.fn(),
    };
});

describe('Navigation Component', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    const renderWithPath = (path: string) => {
        (useLocation as Mock).mockReturnValue({ pathname: path });
        render(
            <MemoryRouter initialEntries={[path]}>
                <Navigation />
            </MemoryRouter>
        );
    };

    it('highlights Input tab for root path /', () => {
        renderWithPath('/');
        const inputLink = screen.getByText('Input');
        expect(inputLink).toHaveClass('text-white');
    });

    it('highlights Input tab for /inputs', () => {
        renderWithPath('/inputs');
        const inputLink = screen.getByText('Input');
        expect(inputLink).toHaveClass('text-white');
    });

    it('highlights Output tab for /output', () => {
        renderWithPath('/output');
        const outputLink = screen.getByText('Output');
        // Expect text-white for active state
        expect(outputLink).toHaveClass('text-white');
    });

    it('highlights History tab for /history', () => {
        renderWithPath('/history');
        const historyLink = screen.getByText('History');
        expect(historyLink).toHaveClass('text-white');
    });

    it('highlights Blog tab for /blog', () => {
        renderWithPath('/blog');
        const blogLink = screen.getByText('Blog');
        expect(blogLink).toHaveClass('text-white');
    });

    it('highlights Account tab for /account', () => {
        renderWithPath('/account');
        const accountLink = screen.getByText('Account');
        expect(accountLink).toHaveClass('text-white');
    });
});
