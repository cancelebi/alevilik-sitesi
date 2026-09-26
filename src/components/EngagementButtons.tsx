'use client';

import { useState, useTransition } from 'react';
import { toggleLike, toggleBookmark } from '@/app/actions/engagement';
import { useRouter } from 'next/navigation';

interface EngagementButtonsProps {
  postId: string;
  initialLikes: number;
  isLikedInitially: boolean;
  isBookmarkedInitially: boolean;
  userId?: string; // If user is logged in
}

export default function EngagementButtons({ 
  postId, 
  initialLikes, 
  isLikedInitially, 
  isBookmarkedInitially,
  userId
}: EngagementButtonsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(isLikedInitially);
  const [isBookmarked, setIsBookmarked] = useState(isBookmarkedInitially);

  const handleLike = () => {
    if (!userId) {
      alert('Beğenmek için giriş yapmalısınız.');
      return;
    }
    
    // Optimistic UI
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

    startTransition(async () => {
      const res = await toggleLike(postId);
      if (res.error) {
        // Revert on error
        setIsLiked(isLiked);
        setLikesCount(likesCount);
        alert(res.error);
      }
    });
  };

  const handleBookmark = () => {
    if (!userId) {
      alert('Kaydetmek için giriş yapmalısınız.');
      return;
    }
    
    // Optimistic UI
    setIsBookmarked(!isBookmarked);

    startTransition(async () => {
      const res = await toggleBookmark(postId);
      if (res.error) {
        // Revert on error
        setIsBookmarked(isBookmarked);
        alert(res.error);
      }
    });
  };

  return (
    <div className="flex items-center gap-4 mt-8 mb-6 pb-6 border-b border-line-light">
      <button 
        onClick={handleLike}
        disabled={isPending}
        className={`flex items-center gap-2 text-sm font-semibold transition-all ${isLiked ? 'text-red-500' : 'text-dark-dim hover:text-red-400'}`}
      >
        <span className="text-xl">{isLiked ? '❤️' : '🤍'}</span> 
        <span>{likesCount} Beğeni</span>
      </button>

      <div className="w-px h-5 bg-line-light"></div>

      <button 
        onClick={handleBookmark}
        disabled={isPending}
        className={`flex items-center gap-2 text-sm font-semibold transition-all ${isBookmarked ? 'text-copper' : 'text-dark-dim hover:text-copper'}`}
      >
        <span className="text-xl">{isBookmarked ? '🔖' : '📑'}</span> 
        <span>{isBookmarked ? 'Kaydedildi' : 'Kaydet'}</span>
      </button>
    </div>
  );
}
