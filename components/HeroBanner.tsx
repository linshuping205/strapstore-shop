'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';

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
    <section className="relative h-[75vh] min-h-[480px] flex items-center justify-center overflow-hidden px-10 pt-[70px]">
      <div className="absolute top-[70px] left-10 right-10 bottom-0 rounded overflow-hidden bg-gray-900">
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
        <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/40 to-white/60" />
      </div>

      <div className="relative z-10 text-center max-w-[900px] px-6 animate-[fadeInUp_1s_ease-out]">
        <span className="inline-block text-xs tracking-[4px] uppercase text-accent font-semibold mb-6 relative">
          <span className="absolute top-1/2 -right-[56px] w-10 h-px bg-accent/40" />
          <span className="absolute top-1/2 -left-[56px] w-10 h-px bg-accent/40" />
          Artisan Watch Straps
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-[clamp(2.2rem,4.5vw,4rem)] font-normal leading-tight mb-6 tracking-tight">
          Crafted for the <em className="italic text-accent">Discerning</em> Wrist
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-9 font-light leading-relaxed">
          Hand-selected leathers, surgical-grade rubber, and brushed stainless steel. Every strap tells a story of precision engineering.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/products/" className="inline-flex items-center justify-center px-8 py-3.5 bg-accent text-white text-xs font-semibold tracking-[2px] uppercase rounded hover:bg-yellow-700 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(201,169,110,0.28)] transition-all">
            Explore Collection
          </Link>
          <Link href="/blog/" className="inline-flex items-center justify-center px-8 py-3.5 bg-transparent text-gray-900 text-xs font-semibold tracking-[2px] uppercase rounded border border-gray-900 hover:bg-gray-900 hover:text-white hover:-translate-y-0.5 transition-all">
            Read Journal
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
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
