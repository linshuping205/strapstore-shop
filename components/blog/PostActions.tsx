'use client';

import { useState, useEffect } from 'react';
import { Heart, Eye, MessageCircle } from 'lucide-react';

interface PostActionsProps {
  postId: string;
  initialLikes: number;
  initialViews: number;
  commentCount: number;
}

export default function PostActions({ postId, initialLikes, initialViews, commentCount }: PostActionsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [views, setViews] = useState(initialViews);

  // Track view on mount
  useEffect(() => {
    fetch(`/api/posts/${postId}/view`, { method: 'POST' }).then((res) => {
      if (res.ok) res.json().then((data) => setViews(data.views));
    });
  }, [postId]);

  const handleLike = async () => {
    if (liked) return;
    const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setLikes(data.likes);
      setLiked(true);
    }
  };

  return (
    <div className="flex items-center gap-6 py-4 border-t border-b border-gray-100 mb-8">
      <button
        onClick={handleLike}
        className={`flex items-center gap-2 transition-all ${
          liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
        }`}
      >
        <Heart size={20} className={liked ? 'fill-red-500' : ''} />
        <span className="text-sm font-medium">{likes}</span>
      </button>
      <div className="flex items-center gap-2 text-gray-500">
        <Eye size={20} />
        <span className="text-sm font-medium">{views}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-500">
        <MessageCircle size={20} />
        <span className="text-sm font-medium">{commentCount}</span>
      </div>
    </div>
  );
}
