"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, Link2, CheckCircle2, TrendingUp } from "lucide-react";

const CYCLE_STAGES = [
  {
    id: 1,
    name: "Plan",
    description: "Generate 30-day content calendar",
    icon: FileText,
    color: "#8B5CF6",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    id: 2,
    name: "Create",
    description: "AI writes SEO-optimized articles",
    icon: Upload,
    color: "#3B82F6",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    id: 3,
    name: "Publish",
    description: "Auto-publish to your CMS",
    icon: TrendingUp,
    color: "#10B981",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    id: 4,
    name: "Promote",
    description: "Build high-quality backlinks",
    icon: Link2,
    color: "#F59E0B",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: 5,
    name: "Validate",
    description: "QA checks & performance tracking",
    icon: CheckCircle2,
    color: "#06B6D4",
    gradient: "from-cyan-500 to-teal-600",
  },
];

export function SEOCycleVisual() {
  const [activeStage, setActiveStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % CYCLE_STAGES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const radius = 140;
  const centerX = 200;
  const centerY = 200;

  return (
    <div className="relative w-full rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-[#0F172A] mb-1">The SEO Cycle</h2>
            <p className="text-sm text-[#475467]">Your automated ranking engine</p>
          </div>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB] transition-colors text-sm font-medium shadow-sm"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>

        <div className="flex items-center justify-center">
          {/* Circular visualization */}
          <div className="relative" style={{ width: 400, height: 400 }}>
            <svg width="400" height="400" className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="2"
              />

              {/* Animated progress arc */}
              <motion.circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * radius}`}
                animate={{
                  strokeDashoffset: [
                    2 * Math.PI * radius,
                    2 * Math.PI * radius * (1 - (activeStage + 1) / CYCLE_STAGES.length),
                  ],
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />

              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="50%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStage}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center"
                  >
                    <div
                      className={`w-20 h-20 rounded-full bg-gradient-to-br ${CYCLE_STAGES[activeStage].gradient} flex items-center justify-center mb-3 shadow-md`}
                    >
                      {(() => {
                        const Icon = CYCLE_STAGES[activeStage].icon;
                        return <Icon className="w-10 h-10 text-white" />;
                      })()}
                    </div>
                    <div className="text-3xl font-bold text-[#0F172A] mb-1">
                      {CYCLE_STAGES[activeStage].name}
                    </div>
                    <div className="text-sm text-[#475467] max-w-[200px]">
                      {CYCLE_STAGES[activeStage].description}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Stage indicators around the circle */}
            {CYCLE_STAGES.map((stage, index) => {
              const angle = (index / CYCLE_STAGES.length) * 2 * Math.PI - Math.PI / 2;
              const x = centerX + (radius + 30) * Math.cos(angle);
              const y = centerY + (radius + 30) * Math.sin(angle);

              return (
                <motion.div
                  key={stage.id}
                  className="absolute"
                  style={{
                    left: x,
                    top: y,
                    transform: "translate(-50%, -50%)",
                  }}
                  animate={{
                    scale: activeStage === index ? 1.2 : 1,
                    opacity: activeStage === index ? 1 : 0.4,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <button
                    onClick={() => {
                      setActiveStage(index);
                      setIsPlaying(false);
                    }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      activeStage === index
                        ? `bg-gradient-to-br ${stage.gradient} shadow-lg`
                        : "bg-white border border-[#E5E7EB] shadow-sm"
                    }`}
                  >
                    {(() => {
                      const Icon = stage.icon;
                      return (
                        <Icon
                          className="w-6 h-6"
                          style={{ color: activeStage === index ? "#FFFFFF" : stage.color }}
                        />
                      );
                    })()}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}