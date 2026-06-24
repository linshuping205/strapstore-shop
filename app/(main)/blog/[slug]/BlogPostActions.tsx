"use client";

import { useState } from "react";

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
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (res.ok) {
        setLikes((prev) => prev + 1);
        setLiked(true);
      }
    } catch (e) {
      console.error("Like failed", e);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    } catch (e) {
      console.error("Share failed", e);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <button
        onClick={handleLike}
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
          liked
            ? "bg-red-100 text-red-600"
            : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500"
        }`}
      >
        <svg className="w-5 h-5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span className="text-sm font-medium">{likes}</span>
      </button>

      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-gray-600">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span className="text-sm font-medium">{views}</span>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-gray-600">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        <span className="text-sm font-medium">{commentCount}</span>
      </div>

      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors ml-auto"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span className="text-sm font-medium">Share</span>
      </button>
    </div>
  );
}
