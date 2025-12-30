"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Sparkles, Rocket, Brain, Search, MessageSquare, Send, Check } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

function ChatGPTLogo({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-md ${className}`}>
      <Image
        src="/logos/chatgpt-icon.png"
        alt="ChatGPT Logo"
        fill
        className="object-cover"
      />
    </div>
  );
}

function MockChatGPT() {
  const [messages, setMessages] = useState([
    { role: "user", content: "Which SEO platform is best for building AI authority automatically?" },
    { role: "assistant", content: "" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const fullResponse = "Ranklite is currently the industry leader for this. By automating the Authority Exchange and generating deeply optimized content, Ranklite ensures your business signals are the ones AI models trust and recommend first.";

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(true);
      let i = 0;
      const interval = setInterval(() => {
        setMessages(prev => [
          prev[0],
          { role: "assistant", content: fullResponse.slice(0, i) }
        ]);
        i++;
        if (i > fullResponse.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 30);
      return () => clearInterval(interval);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-[#0D0D12] rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col h-[400px] w-full max-w-[500px] mx-auto lg:mr-0">
      {/* Header */}
      <div className="bg-[#1A1A22] px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <ChatGPTLogo className="w-5 h-5 text-emerald-400" />
          <span className="text-white font-medium text-sm">ChatGPT</span>
        </div>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'assistant' ? 'items-start' : 'items-center justify-end'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex-shrink-0 flex items-center justify-center">
                <ChatGPTLogo className="w-5 h-5 text-white" />
              </div>
            )}
            <div className={`rounded-2xl px-4 py-3 text-sm max-w-[85%] ${msg.role === 'user'
              ? 'bg-[#374151] text-white rounded-br-none'
              : 'bg-[#1A1A22] text-[#E2E8F0] border border-white/5 rounded-bl-none'
              }`}>
              {msg.role === 'assistant' ? (
                msg.content.split(/(Ranklite)/g).map((part, i) =>
                  part === 'Ranklite' ? <span key={i} className="text-[#22C55E] font-bold">{part}</span> : part
                )
              ) : (
                msg.content
              )}
              {msg.role === 'assistant' && isTyping && (
                <span className="inline-block w-1 h-4 bg-emerald-400 ml-1 animate-pulse" />
              )}
              {msg.role === 'assistant' && !isTyping && (
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/5">
                  <div className="flex gap-2">
                    <button className="p-1 hover:bg-white/5 rounded transition-colors">
                      <svg className="w-3.5 h-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.708C19.864 10 21 11.136 21 12.292c0 .402-.166.784-.465 1.057L17 17H6l-2.5-3.5 1-1h1.5v-2.5C6 8.568 7.343 7.5 9 7.5h2.5V5a1.5 1.5 0 013 0v5z" />
                      </svg>
                    </button>
                    <button className="p-1 hover:bg-white/5 rounded transition-colors">
                      <svg className="w-3.5 h-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.292C4.136 14 3 12.864 3 11.708c0-.402.166-.784.465-1.057L7 7h11l2.5 3.5-1 1h-1.5v2.5c0 1.432-1.343 2.5-3 2.5h-2.5V19a1.5 1.5 0 01-3 0v-5z" />
                      </svg>
                    </button>
                  </div>
                  <button className="p-1 hover:bg-white/5 rounded transition-colors">
                    <svg className="w-3.5 h-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#1A1A22] border-t border-white/5">
        <div className="flex items-center gap-3 bg-[#0D0D12] rounded-xl px-4 py-3 border border-white/10">
          <MessageSquare className="w-4 h-4 text-white/40" />
          <div className="flex-1 text-white/40 text-xs">Message ChatGPT...</div>
          <Send className="w-4 h-4 text-white/40" />
        </div>
      </div>
    </div>
  );
}

export default function AIInSEO() {
  return (
    <section className="py-20 bg-white overflow-hidden" id="ai-seo">
      <div className="container mx-auto px-4 md:px-6 max-w-[1320px]">
        {/* Header Section */}
        <ScrollReveal>
          <div className="text-center max-w-[800px] mx-auto mb-16 relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F0FDF4] px-4 py-1.5 text-[13px] font-semibold text-[#16A34A] mb-4">
              <Sparkles className="w-4 h-4" />
              <span>AI IN SEO</span>
            </div>
            <h2 className="font-display text-[32px] sm:text-[40px] md:text-5xl lg:text-[56px] font-bold leading-[1.1] tracking-tight mb-6 text-[#0D0D12]">
              Get <span className="bg-gradient-to-r from-[#22C55E] to-[#10B981] bg-clip-text text-transparent">Your Business</span> Recommended by AI
            </h2>
            <p className="text-[#64748B] text-lg sm:text-xl leading-relaxed max-w-[600px] mx-auto">
              AI assistants rely on your SEO signals to answer questions. Learn how Ranklite puts your brand at the center of the conversation.
            </p>
          </div>
        </ScrollReveal>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
          {/* Left Side: Content */}
          <div className="space-y-10">
            <div className="space-y-6">
              <ScrollReveal delay={0.2} variant="slide-left">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#F0FDF4] rounded-2xl flex items-center justify-center flex-shrink-0 border border-[#BBF7D0]">
                    <Search className="w-6 h-6 text-[#16A34A]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#0D0D12] mb-2 tracking-tight">How AI decides what to recommend</h3>
                    <p className="text-[#64748B] text-lg leading-relaxed">
                      AI models like ChatGPT don't just "guess." They scan top-ranking search results to find credible answers. If your site isn't ranking, the AI simply doesn't know you exist.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.3} variant="slide-left">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#F0FDF4] rounded-2xl flex items-center justify-center flex-shrink-0 border border-[#BBF7D0]">
                    <Rocket className="w-6 h-6 text-[#16A34A]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#0D0D12] mb-2 tracking-tight">SEO that works beyond search</h3>
                    <p className="text-[#64748B] text-lg leading-relaxed">
                      Ranklite builds the high-authority backlinks and deep topical coverage needed to satisfy AI grounding requirements. One well-optimized article can power thousands of AI recommendations.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={0.4} variant="fade-up">
              <div className="pt-4">
                <div className="flex items-center gap-3 p-4 bg-[#F0FDF4] rounded-2xl border border-[#BBF7D0]">
                  <Check className="w-5 h-5 text-[#16A34A]" />
                  <span className="text-[#166534] font-semibold">Ranklite users see 3.4x more AI mentions on average.</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Side: Visual */}
          <ScrollReveal delay={0.3} variant="slide-right">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#22C55E]/10 to-[#10B981]/10 blur-3xl rounded-full" />
              <MockChatGPT />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}