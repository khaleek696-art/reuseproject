import React from "react";
import Link from "next/link";
import { Recycle, ShieldCheck, Heart, Sparkles, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8 2xl:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-sm">
                <Recycle className="h-5 w-5" />
              </div>
              <span className="font-black text-xl tracking-tight text-slate-900">
                RE<span className="text-emerald-600">:</span>USE
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              Don&apos;t buy more. Share what already exists. Hyper-local, peer-verified resource sharing powered by AI smart matching and trust scoring.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                Zero Single-Use Waste
              </span>
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/explore"
                  className="hover:text-emerald-600 transition-colors"
                >
                  Browse Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/matches"
                  className="hover:text-emerald-600 transition-colors flex items-center gap-1.5"
                >
                  <span>AI Smart Matcher</span>
                  <span className="rounded bg-emerald-100 px-1 text-[10px] font-bold text-emerald-800">
                    Live
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-emerald-600 transition-colors"
                >
                  Community Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard?tab=impact"
                  className="hover:text-emerald-600 transition-colors"
                >
                  CO₂ & Eco Impact Tracker
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Active Campus Hubs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Campus Hubs (Pune)
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
                <span>MIT World Peace University (Kothrud)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
                <span>COEP Tech University (Shivajinagar)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
                <span>Symbiosis International (SB Road & Lavale)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
                <span>SPPU Campus & Fergusson College</span>
              </li>
            </ul>
          </div>

          {/* Column 4: PeerTrust Assurance */}
          <div className="space-y-3 rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-slate-900">
                Safe & Community Verified
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every peer is verified with college IDs & phone numbers. Secure OTP handovers prevent disputes.
            </p>
            <div className="text-[11px] font-medium text-slate-500 pt-1 border-t border-slate-200">
              Built for circular economy & zero waste.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} RE:USE Platform. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-500">
            <span>Crafted with</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
            <span>for Sustainable Campus Communities</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
