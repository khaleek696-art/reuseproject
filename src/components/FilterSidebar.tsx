"use client";

import React from "react";
import { Filter, RotateCcw, ShieldCheck, MapPin, IndianRupee } from "lucide-react";
import { Condition } from "@/lib/types";

export interface FilterState {
  maxDistance: number;
  minPrice: number;
  maxPrice: number;
  freeOnly: boolean;
  minTrust: number;
  conditions: Condition[];
  sortBy: "nearest" | "price_low" | "price_high" | "trust" | "newest";
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  totalResultsCount: number;
}

export function FilterSidebar({
  filters,
  onChange,
  onReset,
  totalResultsCount,
}: FilterSidebarProps) {
  const handleConditionToggle = (condition: Condition) => {
    const exists = filters.conditions.includes(condition);
    const updated = exists
      ? filters.conditions.filter((c) => c !== condition)
      : [...filters.conditions, condition];
    onChange({ ...filters, conditions: updated });
  };

  return (
    <div className="w-full rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-emerald-600" />
          <h3 className="font-bold text-sm text-slate-900">Filters & Sort</h3>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
            {totalResultsCount} items
          </span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
          title="Reset all filters"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset</span>
        </button>
      </div>

      <div className="space-y-6 pt-5">
        {/* Sort By Dropdown */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onChange({
                ...filters,
                sortBy: e.target.value as FilterState["sortBy"],
              })
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none"
          >
            <option value="nearest">📍 Nearest First</option>
            <option value="price_low">💰 Price: Low to High</option>
            <option value="price_high">💎 Price: High to Low</option>
            <option value="trust">⭐ Best Match (Highest PeerTrust)</option>
            <option value="newest">✨ Newest First</option>
          </select>
        </div>

        {/* Distance Slider (Step 3: Distance Filter) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
              Radius
            </span>
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              Within {filters.maxDistance} km
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={15}
            step={1}
            value={filters.maxDistance}
            onChange={(e) =>
              onChange({ ...filters, maxDistance: Number(e.target.value) })
            }
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
            <span>1 km (Walk)</span>
            <span>5 km</span>
            <span>15 km (Pune Metro)</span>
          </div>
        </div>

        {/* Price Filter (Step 4: Price Filter) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <IndianRupee className="h-3.5 w-3.5 text-emerald-600" />
              Max Price / Day
            </span>
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {filters.freeOnly ? "FREE ONLY" : `Up to ₹${filters.maxPrice}`}
            </span>
          </div>

          <div className="mb-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filters.freeOnly}
                onChange={(e) =>
                  onChange({ ...filters, freeOnly: e.target.checked })
                }
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 h-4 w-4"
              />
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                🎁 100% Free Items Only
              </span>
            </label>
          </div>

          {!filters.freeOnly && (
            <div>
              <input
                type="range"
                min={0}
                max={1000}
                step={50}
                value={filters.maxPrice}
                onChange={(e) =>
                  onChange({ ...filters, maxPrice: Number(e.target.value) })
                }
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                <span>₹0 (Free)</span>
                <span>₹500</span>
                <span>₹1000+</span>
              </div>
            </div>
          )}
        </div>

        {/* PeerTrust Filter (Step 5: Trust Filter) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
              Min PeerTrust
            </span>
            <span className="text-xs font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
              ⭐ {filters.minTrust.toFixed(1)}+
            </span>
          </div>
          <input
            type="range"
            min={2.0}
            max={4.8}
            step={0.1}
            value={filters.minTrust}
            onChange={(e) =>
              onChange({ ...filters, minTrust: Number(e.target.value) })
            }
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
            <span>2.0 (New)</span>
            <span>3.5 (Trusted)</span>
            <span>4.8 (Elite)</span>
          </div>
        </div>

        {/* Condition Checkboxes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
            Condition
          </label>
          <div className="space-y-2">
            {[
              { id: "brand_new" as Condition, label: "Brand New" },
              { id: "like_new" as Condition, label: "Like New" },
              { id: "good" as Condition, label: "Good Condition" },
              { id: "fair" as Condition, label: "Fair / Functional" },
            ].map((cond) => {
              const checked = filters.conditions.includes(cond.id);
              return (
                <label
                  key={cond.id}
                  className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleConditionToggle(cond.id)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 h-3.5 w-3.5"
                  />
                  <span>{cond.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
