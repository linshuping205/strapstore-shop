'use client';

import { useRef, useState } from 'react';

export default function HeroBanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

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
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1920&q=80"
          className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover opacity-90"
        >
          <source src="https://cdn.pixabay.com/video/2024/03/18/204582-925146042_large.mp4" type="video/mp4" />
        </video>
      </div>

      {/* 视频控制按钮 - 放在右下角 */}
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
