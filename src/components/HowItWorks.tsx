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
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">
          How Circular Sharing Works
        </span>
        <h2 className="mt-3 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Sharing Made as Easy as Ordering Food
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-500">
          Zero friction, 100% peer accountability. Designed specifically for university students and neighborhood communities.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className="relative flex flex-col rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs hover:shadow-md transition-all duration-200"
            >
              {/* Step number badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-black text-slate-200 tracking-tighter">
                  {step.num}
                </span>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${step.accent} text-white shadow-sm`}
                >
                  <Icon className="h-6 w-6" />
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2">
                {step.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
