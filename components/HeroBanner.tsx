'use client';

import { useRef, useState, useEffect } from 'react';

export default function HeroBanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    // Load immediately — hero video is above the fold, should not delay
    const video = videoRef.current;
    if (video) {
      video.load();
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onProgress = () => {
      if (video.buffered.length > 0) {
        const buffered = video.buffered.end(0);
        const duration = video.duration || 1;
        setLoadProgress(Math.min((buffered / duration) * 100, 100));
      }
    };

    video.addEventListener('progress', onProgress);
    return () => video.removeEventListener('progress', onProgress);
  }, []);

  const handleCanPlay = () => {
    setVideoLoaded(true);
    setLoadProgress(100);
    if (videoRef.current && isPlaying) {
      videoRef.current.play().catch(() => { /* auto-play blocked */ });
    }
  };

  const handleWaiting = () => {
    setVideoLoaded(false);
  };

  const handlePlaying = () => {
    setVideoLoaded(true);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="relative h-[75vh] min-h-[480px] flex items-end justify-center overflow-hidden px-10 pt-0">
      <div className="absolute top-0 left-10 right-10 bottom-0 rounded overflow-hidden bg-gray-900">
        {/* Skeleton / Loading State */}
        {!videoLoaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-900">
            <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
            <div className="text-white/60 text-sm font-light tracking-wide">Loading video...</div>
            <div className="w-48 h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-white/40 rounded-full transition-all duration-300"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="metadata"
          poster="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1920&q=80&auto=format"
          onCanPlay={handleCanPlay}
          onWaiting={handleWaiting}
          onPlaying={handlePlaying}
          className={`absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover transition-opacity duration-700 ${
            videoLoaded ? 'opacity-90' : 'opacity-0'
          }`}
        >
          {/* Small size for faster loading, fallback to medium */}
          <source src="https://cdn.pixabay.com/video/2024/03/18/204582-925146042_small.mp4" type="video/mp4" />
          <source src="https://cdn.pixabay.com/video/2024/03/18/204582-925146042_medium.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Video Controls */}
      <div className="absolute bottom-8 right-20 z-20 flex gap-3">
        <button
          onClick={togglePlay}
          className="w-11 h-11 rounded-full border border-gray-900/30 bg-white/60 backdrop-blur-md flex items-center justify-center hover:bg-white/90 hover:border-accent hover:text-accent hover:scale-105 transition-all"
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
        >
          {isPlaying ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>
        <button
          onClick={toggleMute}
          className="w-11 h-11 rounded-full border border-gray-900/30 bg-white/60 backdrop-blur-md flex items-center justify-center hover:bg-white/90 hover:border-accent hover:text-accent hover:scale-105 transition-all"
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        >
          {isMuted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>
      </div>
    </section>
  );
}
