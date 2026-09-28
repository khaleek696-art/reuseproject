import React from "react";
import { Search, X, Sparkles } from "lucide-react";

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
          className="w-full rounded-2xl border border-slate-900/[0.1] bg-white py-3.5 pl-11 pr-24 text-sm font-medium text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-950 focus:outline-none focus:ring-4 focus:ring-slate-950/5 transition-all"
        />

        <div className="absolute right-2.5 flex items-center gap-1.5">
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <button
            type="submit"
            className="flex items-center gap-1 rounded-xl bg-slate-950 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-900 active:scale-95 transition-all shadow-2xs"
          >
            <span>Search</span>
          </button>
        </div>
      </form>

      {/* Suggested Quick Terms */}
      {showSuggestions && (
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            <Sparkles className="h-3 w-3 text-emerald-500" />
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
              className="shrink-0 rounded-full border border-slate-200/90 bg-white px-3 py-1 text-slate-700 font-medium hover:border-slate-900 hover:bg-slate-950 hover:text-white transition-all shadow-2xs text-[11px]"
            >
              {term}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
