import React from "react";
import { Search, X, Sparkles, Mic } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (term: string) => void;
  placeholder?: string;
  showSuggestions?: boolean;
}

const POPULAR_SEARCHES = [
  "Canon DSLR",
  "MacBook M1",
  "Epson Projector",
  "Impact Drill",
  "CLRS Algorithms",
  "Decathlon Bike",
  "Air Fryer",
  "Podcast Studio",
];

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search cameras, projectors, books, tools, laptops...",
  showSuggestions = true,
}: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleOpenVoice = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-voice-assistant"));
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="pointer-events-none absolute left-4 text-slate-400">
          <Search className="h-4 w-4" />
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-[#2a2a2a] bg-[#1c1b1b] py-3.5 pl-11 pr-32 text-sm font-medium text-[#e5e2e1] shadow-[inset_2px_2px_0_#0a0a0a] placeholder:text-[#89938d] focus:border-[#8bd6b6] focus:outline-none transition-all"
        />

        <div className="absolute right-2.5 flex items-center gap-1.5">
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-[#2a2a2a] hover:text-white transition-colors"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Voice Search Mic Button */}
          <button
            type="button"
            onClick={handleOpenVoice}
            className="flex items-center justify-center rounded-lg bg-[#1a231f] hover:bg-[#065f46] p-1.5 text-[#8bd6b6] hover:text-white border border-emerald-500/30 transition-all cursor-pointer group"
            title="Search with Voice (ElevenLabs AI)"
          >
            <Mic className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>

          <button
            type="submit"
            className="flex items-center gap-1 rounded-lg bg-[#065f46] hover:bg-[#047857] px-3.5 py-1.5 text-xs font-bold font-headline-sm uppercase tracking-wider text-white border border-[#047857] shadow-[0_2px_0_0_#003828] active:translate-y-0.5 transition-all cursor-pointer"
          >
            <span>Search</span>
          </button>
        </div>
      </form>

      {/* Suggested Quick Terms */}
      {showSuggestions && (
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#8bd6b6] shrink-0">
            <Sparkles className="h-3 w-3 text-[#8bd6b6]" />
            Trending:
          </span>
          {POPULAR_SEARCHES.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                onChange(term);
                if (onSearch) onSearch(term);
              }}
              className="shrink-0 rounded-lg border border-[#2a2a2a] bg-[#1c1b1b] px-3 py-1 text-[#bec9c2] font-mono text-[11px] hover:border-[#047857] hover:bg-[#065f46] hover:text-white transition-all shadow-[0_2px_0_0_#0e0e0e]"
            >
              {term}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
// RE:USE — Modular Circular Economy Architecture
