'use client';

import { useState } from 'react';
import { Heart, Eye, MessageCircle, Share2 } from 'lucide-react';

interface BlogPostActionsProps {
  postId: string;
  initialLikes: number;
  initialViews: number;
  commentCount: number;
}

export default function BlogPostActions({
  postId,
  initialLikes,
  initialViews,
  commentCount,
}: BlogPostActionsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [views] = useState(initialViews);

  const handleLike = async () => {
    if (liked) return;
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      if (res.ok) {
        setLikes((prev) => prev + 1);
        setLiked(true);
      }
    } catch (e) {
      console.error('Like failed', e);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch (e) {
      console.error('Share failed', e);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-4">
      <button
        onClick={handleLike}
        className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-all text-sm ${
          liked
            ? 'bg-red-100 text-red-600'
            : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
        }`}
      >
        <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
        <span className="font-medium">{likes}</span>
      </button>

      <div className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-gray-100 rounded-full text-gray-600 text-sm">
        <Eye size={18} />
        <span className="font-medium">{views}</span>
      </div>

      <div className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-gray-100 rounded-full text-gray-600 text-sm">
        <MessageCircle size={18} />
        <span className="font-medium">{commentCount}</span>
      </div>

      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors text-sm ml-auto"
      >
        <Share2 size={18} />
        <span className="font-medium">Share</span>
      </button>
    </div>
  );
}
