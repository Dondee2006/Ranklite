"use client";

import { useState } from "react";
import { Play, Pause } from "lucide-react";

export default function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    const video = document.getElementById("demo-video") as HTMLVideoElement;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section className="relative py-12 lg:py-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <svg className="absolute top-0 left-0 right-0 w-full rotate-180" viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none">
          <path d="M0,50 C360,100 720,0 1080,50 C1260,75 1380,60 1440,50 L1440,100 L0,100 Z" fill="#F0FDF4" fillOpacity="0.5" />
        </svg>
      </div>

      <div className="container mx-auto px-5 md:px-8">
        <div className="relative mx-auto max-w-[1000px]">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[#22C55E]/20 via-[#10B981]/10 to-[#22C55E]/20 opacity-50 blur-2xl" />
          
          <div className="relative overflow-hidden rounded-2xl bg-white p-2.5 shadow-2xl shadow-black/[0.08] ring-1 ring-black/[0.05] md:rounded-3xl md:p-3">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-[#1A1F2E] to-[#0F1218] md:rounded-2xl">
              <video
                id="demo-video"
                className="h-full w-full object-cover"
                preload="metadata"
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                src="https://pub-5a7d08eae9024d328c732fce3a432bcd.r2.dev/Outrank%20Video%20with%20Tibo%20-%20720p.mp4"
              >
                Your browser does not support the video tag.
              </video>
              
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                  <button
                    onClick={handlePlay}
                    className="group flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-2xl transition-all hover:scale-105 active:scale-95 md:h-24 md:w-24"
                    aria-label="Play video"
                  >
                    <Play className="h-8 w-8 translate-x-0.5 text-[#22C55E] md:h-10 md:w-10" fill="currentColor" />
                  </button>
                </div>
              )}

              {isPlaying && (
                <button
                  onClick={handlePlay}
                  className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-all hover:bg-white"
                  aria-label="Pause video"
                >
                  <Pause className="h-5 w-5 text-[#1A1F2E]" fill="currentColor" />
                </button>
              )}
            </div>
          </div>

          <div className="absolute -bottom-3 -left-3 hidden h-16 w-16 rounded-2xl bg-[#10B981]/10 lg:block" />
          <div className="absolute -right-4 -top-4 hidden h-20 w-20 rounded-full bg-[#22C55E]/10 lg:block" />
        </div>
      </div>
    </section>
  );
}