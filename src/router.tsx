import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import { InputWrapper, OutputWrapper } from './routes/Wrappers';
import HistoryTab from './components/history/HistoryTab';
import BlogTab from './components/blog/BlogTab';
import AccountTab from './components/account/AccountTab';

// Placeholder for Blog Post route as requested in plan
const BlogPost = () => <div>Blog Post Content</div>;

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <Navigate to="/inputs" replace />
            },
            {
                path: "inputs",
                element: <InputWrapper />
            },
            {
                path: "output",
                element: <OutputWrapper />
            },
            {
                path: "history",
                element: <HistoryTab />
            },
            {
                path: "blog",
                element: <BlogTab />
            },
            {
                path: "blog/:id",
                element: <BlogPost />
            },
            {
                path: "account",
                element: <AccountTab />
            }
        ]
    }
]);
