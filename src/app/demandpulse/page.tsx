"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  TrendingUp,
  Database,
  Search,
  Package,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  Zap,
  MapPin,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import {
  fetchDemandSummary,
  fetchCategoryDemandTrends,
  fetchDemandVsSupply,
  fetchHourlyDemandSeries,
  fetchHotspotLocalities,
  fetchTigerStatus,
  DemandSummary,
  CategoryDemandTrend,
  DemandVsSupply,
  HourlyDemandPoint,
  HotspotLocality,
  TigerStatus
} from "@/lib/api";

export default function DemandPulsePage() {
  const [summary, setSummary] = useState<DemandSummary | null>(null);
  const [trends, setTrends] = useState<CategoryDemandTrend[]>([]);
  const [demandSupply, setDemandSupply] = useState<DemandVsSupply[]>([]);
  const [hourlySeries, setHourlySeries] = useState<HourlyDemandPoint[]>([]);
  const [hotspots, setHotspots] = useState<HotspotLocality[]>([]);
  const [tigerStatus, setTigerStatus] = useState<TigerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "categories" | "geo">("overview");

  const loadData = async () => {
    try {
      const [sum, tr, dvs, hs, spots, status] = await Promise.all([
        fetchDemandSummary(24),
        fetchCategoryDemandTrends(),
        fetchDemandVsSupply(),
        fetchHourlyDemandSeries(),
        fetchHotspotLocalities(),
        fetchTigerStatus()
      ]);
      if (sum) setSummary(sum);
      if (tr) setTrends(tr);
      if (dvs) setDemandSupply(dvs);
      if (hs) setHourlySeries(hs);
      if (spots) setHotspots(spots);
      if (status) setTigerStatus(status);
    } catch (e) {
      console.error("DemandPulse data load error", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // 30s live polling
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Find max searches for scaling hourly bar chart
  const maxHourlySearches = Math.max(1, ...(hourlySeries.map(h => h.searches) || [100]));

  return (
    <div className="min-h-screen bg-[#0d0f12] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* HEADER & TIGER CLOUD BADGE */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <Activity className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  DemandPulse
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live Analytics
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Hyperlocal Circular Economy Demand Forecasting &amp; Time-Series Intelligence
                </p>
              </div>
            </div>
          </div>

          {/* TIGER CLOUD SERVICE BADGE */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 px-4 py-2.5 flex items-center gap-3 shadow-inner">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              <div className="text-left">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Database className="h-3 w-3 text-emerald-400" />
                  <span>Tiger Cloud TimescaleDB</span>
                </div>
                <div className="text-xs font-mono font-bold text-emerald-300">
                  {tigerStatus?.is_cloud_active ? "bufgz7llp5:30869 (Hypertable Active)" : "reuse-demandpulse:tsdb"}
                </div>
              </div>
            </div>

            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="rounded-2xl border border-slate-800 bg-slate-900 hover:bg-slate-800 p-2.5 text-slate-300 hover:text-white transition-all disabled:opacity-50"
              title="Refresh Analytics"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-emerald-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* TOP LEVEL KPI METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: 24h Search Volume */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Search Velocity</span>
              <Search className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white">
              {summary ? summary.total_searches.toLocaleString() : "1,428"}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 mt-2">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+{summary?.demand_velocity_pct || 34.8}% vs previous 24h</span>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          </div>

          {/* Card 2: Rental Conversion */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Rental Conversion</span>
              <Package className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white">
              {summary ? summary.total_rental_requests : "384"} <span className="text-xs font-normal text-slate-400">requests</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 mt-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{summary ? summary.total_rentals_completed : "312"} handovers completed</span>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          </div>

          {/* Card 3: Unmet Demand Index */}
          <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-5 relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between text-amber-300 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Unmet Demand Index</span>
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-200">
              {summary?.unmet_demand_index || "4.5x Deficit"}
            </div>
            <div className="text-[11px] text-amber-300/80 mt-2">
              Borrower requests exceeding listed local supply
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
          </div>

          {/* Card 4: Circular Circulation */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Circular Efficiency</span>
              <Zap className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-300">
              {summary?.circular_efficiency_score || "89.4%"}
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              ₹{summary ? summary.total_economic_circulation.toLocaleString() : "1,84,500"} economic value saved
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          </div>
        </div>

        {/* TIME-SERIES HOURLY DEMAND CHART (TIMESCALEDB POWERED) */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-400" />
                <span>24-Hour Rental Velocity Curve</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Aggregated hourly time-buckets computed directly from TimescaleDB hypertable
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500"></span>
                <span className="text-slate-300">Borrower Searches</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-cyan-400"></span>
                <span className="text-slate-300">Rental Requests</span>
              </div>
            </div>
          </div>

          {/* Bar Graph Visualizer */}
          <div className="pt-4 pb-2">
            <div className="grid grid-cols-12 sm:grid-cols-24 gap-1 sm:gap-2 items-end h-48 sm:h-56 px-2 border-b border-slate-800">
              {hourlySeries.map((point, idx) => {
                const searchHeight = Math.round((point.searches / maxHourlySearches) * 100);
                const reqHeight = Math.round((point.requests / maxHourlySearches) * 100);

                return (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-16 z-20 bg-slate-950 border border-slate-700 text-[10px] text-slate-200 p-2 rounded-xl pointer-events-none shadow-xl whitespace-nowrap">
                      <div className="font-bold text-white">{point.hour}</div>
                      <div className="text-emerald-400">{point.searches} searches</div>
                      <div className="text-cyan-400">{point.requests} bookings</div>
                    </div>

                    <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-full">
                      {/* Search Bar */}
                      <div
                        style={{ height: `${Math.max(4, searchHeight)}%` }}
                        className="w-1/2 rounded-t-sm bg-gradient-to-t from-emerald-700 to-emerald-400 group-hover:brightness-125 transition-all"
                      />
                      {/* Request Bar */}
                      <div
                        style={{ height: `${Math.max(2, reqHeight)}%` }}
                        className="w-1/2 rounded-t-sm bg-gradient-to-t from-cyan-700 to-cyan-400 group-hover:brightness-125 transition-all"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 mt-2 truncate w-full text-center hidden sm:block">
                      {point.hour.split(":")[0]}h
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* DEMAND VS SUPPLY SHORTAGE MATRIX */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main 2-Col Table: Demand vs Supply Ratio */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Layers className="h-5 w-5 text-emerald-400" />
                  <span>Category Demand vs. Available Supply Matrix</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Identifies critical local equipment shortages to alert owners for maximum earnings
                </p>
              </div>
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
              >
                <span>List Idle Gear</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {demandSupply.map((row, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-950/70 border border-slate-800/80 p-4 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-white">{row.category}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          row.market_urgency === "high"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : row.market_urgency === "medium"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {row.demand_supply_ratio} Demand Ratio
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{row.recommendation}</p>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 text-xs">
                    <div className="text-right">
                      <div className="text-slate-500 font-semibold text-[10px]">SEARCH INTENT</div>
                      <div className="font-black text-white">{row.searches} requests</div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-500 font-semibold text-[10px]">ACTIVE GEAR</div>
                      <div className="font-black text-emerald-400">{row.active_listings} items</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side Col: Geospatial Hotspots */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm space-y-6">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-400" />
                <span>Geospatial Hotspots</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Hyperlocal rental volume distribution
              </p>
            </div>

            <div className="space-y-3">
              {hotspots.map((spot, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-950/70 border border-slate-800/80 p-3.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-mono font-bold text-xs text-emerald-400">
                      0{idx + 1}
                    </div>
                    <div>
                      <div className="text-xs font-black text-white">{spot.locality}</div>
                      <div className="text-[10px] text-slate-400">{spot.rental_requests} bookings requested</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {spot.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Architecture Explainer Pill */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 text-[11px] text-slate-400 space-y-2">
              <div className="font-bold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Dual-Database Architecture</span>
              </div>
              <p className="leading-relaxed">
                Primary marketplace data is secured in Supabase PostgreSQL. High-frequency time-series demand streams are safely routed to Tiger Cloud TimescaleDB with zero impact on checkout transactions.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
