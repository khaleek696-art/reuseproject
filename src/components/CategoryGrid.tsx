import React from "react";
import Link from "next/link";
import {
  Camera,
  Laptop,
  Monitor,
  Wrench,
  BookOpen,
  Bike,
  UtensilsCrossed,
  Home,
  ArrowRight,
} from "lucide-react";
import { CATEGORIES } from "@/data/mockData";
import { CategoryId } from "@/lib/types";

const iconMap: Record<CategoryId, React.ElementType> = {
  tech: Camera,
  laptop: Laptop,
  projector: Monitor,
  tools: Wrench,
  books: BookOpen,
  transport: Bike,
  food: UtensilsCrossed,
  spaces: Home,
};

interface CategoryGridProps {
  selectedCategory?: string;
  onSelectCategory?: (id: CategoryId) => void;
}

export function CategoryGrid({
  selectedCategory,
  onSelectCategory,
}: CategoryGridProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Campus Inventory
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Browse by Department
          </h2>
        </div>
        <Link
          href="/explore"
          className="group hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-emerald-700 transition-colors"
        >
          <span>View All 8 Categories</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {CATEGORIES.map((cat) => {
          const Icon = iconMap[cat.id] || Camera;
          const isSelected = selectedCategory === cat.id;

          const content = (
            <div
              className={`card-hover-lift group flex flex-col items-center text-center p-4 rounded-3xl transition-all border cursor-pointer ${
                isSelected
                  ? "border-slate-950 bg-slate-950 text-white shadow-md"
                  : "border-slate-900/[0.07] bg-white hover:border-slate-300 shadow-xs"
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl mb-3 transition-transform group-hover:scale-110 ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : `${cat.bgColor} ${cat.color}`
                }`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <span
                className={`text-xs font-bold line-clamp-1 leading-snug ${
                  isSelected ? "text-white" : "text-slate-900"
                }`}
              >
                {cat.name}
              </span>
              <span
                className={`text-[10px] font-semibold mt-1 ${
                  isSelected ? "text-slate-300" : "text-slate-400"
                }`}
              >
                {cat.count} listings
              </span>
            </div>
          );

          if (onSelectCategory) {
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="text-left w-full"
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={cat.id}
              href={`/explore?category=${cat.id}`}
              className="block"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
