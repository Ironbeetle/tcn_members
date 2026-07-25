"use client";
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

interface FullPageSliderProps {
  children: React.ReactNode[];
  autoScroll?: boolean;
  autoScrollDelay?: number;
}

export const FullPageSlider: React.FC<FullPageSliderProps> = ({
  children,
  autoScroll = false,
  autoScrollDelay = 5000,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    duration: 25,
  });

  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  
  // Use ref to avoid recreating interval constantly
  const autoScrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // OPTIMIZED: Initialize carousel and set up event listeners (runs once)
  useEffect(() => {
    if (!emblaApi) return;

    const onInit = () => {
      setScrollSnaps(emblaApi.scrollSnapList());
    };

    // Only subscribe to these events once
    emblaApi.on('init', onInit);
    emblaApi.on('reInit', onInit);

    // Call init in case it wasn't already
    if (!scrollSnaps.length) {
      onInit();
    }

    // Cleanup: Remove all listeners when component unmounts or emblaApi changes
    return () => {
      emblaApi.off('init', onInit);
      emblaApi.off('reInit', onInit);
    };
  }, [emblaApi]); // Only depends on emblaApi

  // OPTIMIZED: Separate effect for auto-scroll with ref to prevent recreating interval
  useEffect(() => {
    // Clear existing interval
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }

    if (!autoScroll || !emblaApi) return;

    // Set new interval only if autoScroll is enabled
    autoScrollIntervalRef.current = setInterval(() => {
      emblaApi.scrollNext();
    }, autoScrollDelay);

    // Cleanup
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
    };
  }, [autoScroll, emblaApi, autoScrollDelay]); // All necessary dependencies

  // OPTIMIZED: Memoized click handlers
  const handlePrevClick = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
    }
  }, [emblaApi]);

  const handleNextClick = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
    }
  }, [emblaApi]);

  return (
    <div className="full-page-slider relative w-full h-full overflow-hidden">
      <div ref={emblaRef} className="w-full h-full">
        <div className="flex h-full">
          {React.Children.map(children, (child, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 w-full h-full overflow-y-auto overflow-x-hidden hide-scrollbar"
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Bounce Animation Styles */}
      <style>{`
        @keyframes bounce-down {
          0%, 100% {
            transform: translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateY(12px);
            opacity: 0.7;
          }
        }
        .bounce-arrow-scroll {
          animation: bounce-down 2s infinite;
        }
      `}</style>

      {/* Left Navigation Button with Scroll Indicator Below */}
      <div className="hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 z-50 flex-col items-center gap-6">
        {/* Left Chevron Button */}
        <button
          onClick={handlePrevClick}
          className="bg-amber-900/80 hover:bg-amber-800 text-white p-3 lg:p-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
          aria-label="Previous slide"
        >
          <ChevronLeft size={28} className="lg:w-8 lg:h-8" />
        </button>

        {/* Down Arrow Indicator Below - Bigger and Darker */}
        <div className="flex flex-col items-center">
          scroll
          <ChevronDown 
            size={44} 
            className="text-amber-700 bounce-arrow-scroll drop-shadow-lg"
            strokeWidth={2.5}
          />
        </div>
      </div>

      {/* Right Navigation Button */}
      <button
        onClick={handleNextClick}
        className="hidden lg:flex fixed right-4 top-1/2 -translate-y-1/2 z-50 bg-amber-900/80 hover:bg-amber-800 text-white p-3 lg:p-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
        aria-label="Next slide"
      >
        <ChevronRight size={28} className="lg:w-8 lg:h-8" />
      </button>

      {/* Mobile Navigation Hint */}
      <div className="lg:hidden fixed bottom-12 left-1/2 -translate-x-1/2 z-40 text-stone-300 text-sm pointer-events-none">
        Swipe to navigate
      </div>
    </div>
  );
};