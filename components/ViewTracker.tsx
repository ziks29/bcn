"use client";

import { useEffect } from 'react';
import { incrementArticleViews } from '@/app/articles/actions';

interface ViewTrackerProps {
    articleId: string;
}

export default function ViewTracker({ articleId }: ViewTrackerProps) {
    useEffect(() => {
        // Create a unique key for this article view in this session
        const storageKey = `article_view_${articleId}`;

        // Check if we've already tracked this view in this session
        if (typeof window !== 'undefined' && !sessionStorage.getItem(storageKey)) {
            // Mark as tracked before making the call to prevent race conditions
            sessionStorage.setItem(storageKey, 'true');

            // Increment the view count
            incrementArticleViews(articleId);
        }
    }, [articleId]);

    // This component doesn't render anything
    return null;
}
