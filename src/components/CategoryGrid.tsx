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
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#8bd6b6]">
            Campus Inventory Mesh
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-pixel tracking-wider mt-1">
            BROWSE INVENTORY SLOTS
          </h2>
        </div>
        <Link
          href="/explore"
          className="group hidden sm:flex items-center gap-1.5 text-xs font-bold font-headline-sm uppercase tracking-wider text-[#8bd6b6] hover:text-[#7bd8b1] transition-colors"
        >
          <span>View All Categories</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {CATEGORIES.map((cat) => {
          const Icon = iconMap[cat.id] || Camera;
          const isSelected = selectedCategory === cat.id;

          const content = (
            <div
              className={`card-hover-lift group flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl transition-all border cursor-pointer ${
                isSelected
                  ? "border-[#047857] bg-[#065f46] text-white shadow-[inset_2px_2px_0_#003828,0_4px_0_0_#003828]"
                  : "border-[#201f1f] bg-[#0e0e0e] hover:bg-[#1a1a1a] hover:border-[#353534] shadow-[inset_2px_2px_0_#0a0a0a,0_4px_0_0_#060606]"
              }`}
            >
              <div
                className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl mb-2.5 transition-transform group-hover:scale-110 ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-[#1c1b1b] border border-[#2a2a2a] text-[#8bd6b6]"
                }`}
              >
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span
                className={`text-xs font-bold font-headline-sm uppercase tracking-wider line-clamp-1 leading-snug ${
                  isSelected ? "text-white" : "text-[#e5e2e1]"
                }`}
              >
                {cat.name}
              </span>
              <span
                className={`text-[10px] font-mono mt-1 ${
                  isSelected ? "text-emerald-100" : "text-[#89938d]"
                }`}
              >
                {cat.count} items
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
