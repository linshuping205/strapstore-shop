'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  name: string;
  hasDiscount: boolean;
  discount: number;
}

export default function ProductGallery({ images, name, hasDiscount, discount }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, xPercent: 0.5, yPercent: 0.5 });
  const mainImageRef = useRef<HTMLDivElement>(null);

  const mainImage = images[activeIndex] || images[0] || '';
  const totalImages = images.length;
  const thumbnails = images.slice(0, 6);
  const hasMore = totalImages > 6;

  // Magnifier settings
  const ZOOM_LEVEL = 2.5;
  const LENS_SIZE = 500;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = Math.max(0, Math.min(1, x / rect.width));
    const yPercent = Math.max(0, Math.min(1, y / rect.height));

    let lensX = x - LENS_SIZE / 2;
    let lensY = y - LENS_SIZE / 2;
    lensX = Math.max(0, Math.min(rect.width - LENS_SIZE, lensX));
    lensY = Math.max(0, Math.min(rect.height - LENS_SIZE, lensY));

    setZoomPos({ x: lensX, y: lensY, xPercent, yPercent });
  }, []);

  const prevImage = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalImages - 1));
  };

  const nextImage = () => {
    setActiveIndex((prev) => (prev < totalImages - 1 ? prev + 1 : 0));
  };

  const goToImage = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image + Zoom */}
      <div className="relative w-full">
        {/* Main Image - stays at original size, never changes */}
        <div
          ref={mainImageRef}
          className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden"
          onMouseEnter={() => setShowZoom(true)}
          onMouseLeave={() => setShowZoom(false)}
          onMouseMove={handleMouseMove}
        >
          {mainImage ? (
            <Image
              src={mainImage}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Lens overlay - only visible on hover, does NOT change main image size */}
          {showZoom && (
            <div
              className="absolute border-2 border-white/80 shadow-lg pointer-events-none"
              style={{
                left: zoomPos.x,
                top: zoomPos.y,
                width: LENS_SIZE,
                height: LENS_SIZE,
                background: 'rgba(255,255,255,0.1)',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.05)',
              }}
            />
          )}

          {/* Discount Badge */}
          {hasDiscount && discount > 0 && (
            <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              -{discount}%
            </span>
          )}

          {/* Navigation Arrows */}
          {totalImages > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={20} className="text-gray-700" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 hover:opacity-100 transition-opacity"
              >
                <ChevronRight size={20} className="text-gray-700" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {totalImages > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
              {activeIndex + 1} / {totalImages}
            </div>
          )}
        </div>

        {/* Zoom Result Panel - ABSOLUTE positioned, follows mouse position */}
        {showZoom && mainImage && (
          <div className="hidden lg:block absolute top-0 left-[calc(100%+16px)] w-[600px] h-[600px] bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 shadow-lg z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mainImage}
              alt="zoom view"
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                transform: `scale(${ZOOM_LEVEL})`,
                transformOrigin: `${zoomPos.xPercent * 100}% ${zoomPos.yPercent * 100}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      <div className="flex items-center gap-2">
        {thumbnails.map((img, i) => (
          <button
            key={i}
            onClick={() => goToImage(i)}
            className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
              i === activeIndex
                ? 'border-amber-500 ring-2 ring-amber-100'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Image
              src={img}
              alt={`${name} view ${i + 1}`}
              fill
              className="object-cover"
              sizes="64px"
              loading="lazy"
            />
          </button>
        ))}

        {hasMore && (
          <button
            onClick={() => goToImage(6)}
            className="flex-shrink-0 w-16 h-16 rounded-lg border-2 border-gray-200 bg-gray-50 flex items-center justify-center text-xs font-medium text-gray-500 hover:border-gray-300 transition-all"
          >
            +{totalImages - 6}
          </button>
        )}

        <button
          onClick={() => {
            const specsEl = document.getElementById('product-specs');
            if (specsEl) specsEl.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex-shrink-0 h-16 px-4 rounded-lg border-2 border-gray-200 bg-gray-50 flex items-center justify-center text-xs font-medium text-gray-600 hover:border-amber-400 hover:text-amber-600 transition-all"
        >
          参数
        </button>
      </div>
    </div>
  );
}
