import React from "react";
import {
  Compass,
  Plane,
  Building2,
  Utensils,
  Train,
  ShoppingBag,
  Landmark,
  Lock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { JourneyLocation } from "../types";

interface Props {
  locations: JourneyLocation[];
  onSelectLocation: (locId: string) => void;
  onStartLesson: () => void;
}

export const MissionsJourneyView: React.FC<Props> = ({
  locations,
  onSelectLocation,
  onStartLesson,
}) => {
  const getLocationIcon = (iconName: string, className = "w-6 h-6") => {
    switch (iconName) {
      case "Plane":
        return <Plane className={className} />;
      case "Building2":
        return <Building2 className={className} />;
      case "Utensils":
        return <Utensils className={className} />;
      case "Train":
        return <Train className={className} />;
      case "ShoppingBag":
        return <ShoppingBag className={className} />;
      case "Landmark":
      default:
        return <Landmark className={className} />;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              Journey Module
            </span>
            <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full border border-amber-200">
              Sequential Unlock System (USP)
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Tokyo Exploration Journey Map
          </h2>
          <p className="text-xs text-slate-500">
            "People learn language best when they are trying to accomplish something inside a
            place, not when they are matching flashcards in a void."
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-500">Missions Completed</div>
          <div className="text-xl font-black text-indigo-600">5 / 18 Complete (35%)</div>
        </div>
      </div>

      {/* Sequential Location Cards */}
      <div className="space-y-4">
        {locations.map((loc, idx) => {
          const isCompleted = loc.status === "completed";
          const isInProgress = loc.status === "in_progress";
          const isLocked = loc.status === "locked";

          return (
            <div
              key={loc.id}
              className={`p-6 rounded-3xl border transition-all ${
                isCompleted
                  ? "bg-white border-emerald-200 shadow-xs"
                  : isInProgress
                  ? "bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-md"
                  : "bg-slate-50/80 border-slate-200/80 opacity-70"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                      isCompleted
                        ? "bg-emerald-600 text-white"
                        : isInProgress
                        ? "bg-indigo-600 text-white shadow-indigo-200 shadow-md"
                        : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {getLocationIcon(loc.iconName)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        STAGE 0{loc.order}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {loc.japaneseName}
                      </span>
                      {isCompleted && (
                        <span className="text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Mastered
                        </span>
                      )}
                      {isInProgress && (
                        <span className="text-[11px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                          Active Mission
                        </span>
                      )}
                      {isLocked && (
                        <span className="text-[11px] bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Locked
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-black text-slate-900">{loc.name}</h3>
                    <p className="text-xs text-slate-500 max-w-xl">{loc.description}</p>
                  </div>
                </div>

                {/* Progress bar & action */}
                <div className="flex items-center gap-4 min-w-[220px] justify-between md:justify-end">
                  <div className="text-left md:text-right">
                    <div className="text-xs font-bold text-slate-800">
                      {loc.completedMissions} / {loc.totalMissions} Missions
                    </div>
                    <div className="w-32 bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full ${
                          isCompleted
                            ? "bg-emerald-500"
                            : isInProgress
                            ? "bg-indigo-600"
                            : "bg-slate-300"
                        }`}
                        style={{
                          width: `${(loc.completedMissions / loc.totalMissions) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    {isInProgress && (
                      <button
                        onClick={onStartLesson}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-200 transition-all"
                      >
                        Resume
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isCompleted && (
                      <button
                        onClick={onStartLesson}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                      >
                        Review
                      </button>
                    )}
                    {isLocked && (
                      <div className="p-2.5 bg-slate-100 rounded-xl text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
