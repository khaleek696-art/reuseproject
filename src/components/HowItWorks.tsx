import React from "react";
import { PlusCircle, Sparkles, KeyRound, Trees } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "List or Request an Item",
      description:
        "Post what you have lying idle in your hostel or specify what gear you need for an upcoming project or event.",
      icon: PlusCircle,
      accent: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
    {
      num: "02",
      title: "AI Smart Match Engine",
      description:
        "Our 5-factor matching algorithm evaluates distance, time overlap, budget, credibility, and category relevance in milliseconds.",
      icon: Sparkles,
      accent: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
    },
    {
      num: "03",
      title: "Secure OTP Handover",
      description:
        "Meet at a verified campus landmark (e.g. MIT Gate or library). Exchange the item safely using time-stamped OTP verification.",
      icon: KeyRound,
      accent: "from-amber-500 to-orange-600",
      bg: "bg-amber-50",
      text: "text-amber-700",
    },
    {
      num: "04",
      title: "PeerTrust & Impact Growth",
      description:
        "Earn PeerTrust badges, boost your campus reputation, and watch your personal CO₂ avoidance meter tick upward!",
      icon: Trees,
      accent: "from-green-500 to-emerald-600",
      bg: "bg-green-50",
      text: "text-green-700",
    },
  ];

  return (
    <div className="w-full">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="rounded-none bg-[#065f46]/30 px-3 py-1 text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#8bd6b6] border border-[#8bd6b6]/30">
          How Circular Sharing Works
        </span>
        <h2 className="mt-3 text-xl sm:text-2xl font-bold text-white font-pixel tracking-wider uppercase">
          Sharing Made as Easy as Ordering Food
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#bec9c2] font-mono">
          Zero friction, 100% peer accountability. Designed specifically for university students and neighborhood communities.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className="relative flex flex-col rounded-none border-2 border-[#2a2a2a] bg-[#1c1b1b] p-6 shadow-[0_4px_0_0_#0f0f0f] hover:border-[#8bd6b6] transition-all duration-200"
            >
              {/* Step number badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-pixel font-bold text-[#353534] tracking-wider">
                  {step.num}
                </span>
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-none bg-[#141414] border-2 border-[#2a2a2a] text-[#8bd6b6] shadow-[0_2px_0_0_#0f0f0f]"
                >
                  <Icon className="h-6 w-6" />
                </div>
              </div>

              <h3 className="text-xs sm:text-sm font-['Silkscreen'] uppercase tracking-wider text-white mb-2">
                {step.title}
              </h3>
              <p className="text-xs text-[#bec9c2] font-mono leading-relaxed">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
// RE:USE — Modular Circular Economy Architecture
