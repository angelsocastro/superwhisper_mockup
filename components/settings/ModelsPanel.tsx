"use client";

import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  KeyRound,
  Plus,
  Star,
  AlignLeft,
  AudioLines,
  Download,
  Cloud,
} from "lucide-react";
import { PopupButton } from "@/components/popup-button";
import { cn } from "@/lib/utils";
import { MODEL_LIBRARY, PROVIDER_STYLE } from "@/app/settings/data";
import { PanelIntro } from "@/components/settings/shared";

function SpeedBars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-[3px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-[2px] w-[7px] rounded-full",
            i < value ? "bg-foreground/45" : "bg-foreground/12",
          )}
        />
      ))}
    </div>
  );
}

export function ModelsPanel() {
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>(["s1-voice"]);

  const rows = MODEL_LIBRARY.filter((m) =>
    m.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const toggleFavorite = (id: string) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );

  return (
    <div className="flex flex-col gap-8">
      <PanelIntro
        title="Models"
        description="Every model available. Which one a mode uses is set on that mode."
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="hairline flex min-w-0 flex-1 items-center gap-2 rounded-[7px] bg-fill px-2.5 py-1.5">
            <Search
              className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
              strokeWidth={2}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search models"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <button
            aria-label="Filter"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
          >
            <SlidersHorizontal className="h-[15px] w-[15px]" strokeWidth={2} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <PopupButton value="All providers" />
          <button
            aria-label="Add API key"
            title="Add your own API key"
            className="hairline flex h-7 items-center gap-1.5 rounded-[6px] bg-fill-hover px-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-fill-strong"
          >
            <KeyRound className="h-[13px] w-[13px]" strokeWidth={2} />
            <Plus className="h-3 w-3" strokeWidth={2.5} />
          </button>
        </div>

        <div className="hairline overflow-hidden rounded-[10px] bg-card">
          <div className="hairline-b grid grid-cols-[1fr_44px_74px_64px] items-center gap-2 px-3 py-2 text-[12px] font-medium text-muted-foreground">
            <span className="pl-6">Model name</span>
            <span>Type</span>
            <span>Speed / Acc.</span>
            <span className="text-right">Cloud/Offline</span>
          </div>

          {rows.length === 0 && (
            <div className="px-4 py-6 text-center text-[13px] text-muted-foreground">
              No models match &ldquo;{query}&rdquo;.
            </div>
          )}

          {rows.map((model, i) => {
            const provider = PROVIDER_STYLE[model.provider];
            const isFav = favorites.includes(model.id);
            return (
              <div
                key={model.id}
                className={cn(
                  "grid grid-cols-[1fr_44px_74px_64px] items-center gap-2 px-3 py-2 transition-colors hover:bg-fill",
                  i !== rows.length - 1 && "border-b border-line",
                )}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <button
                    onClick={() => toggleFavorite(model.id)}
                    aria-label={isFav ? "Unfavorite" : "Favorite"}
                    className="shrink-0 text-muted-foreground/60 transition-colors hover:text-foreground"
                  >
                    <Star
                      className={cn(
                        "h-3.5 w-3.5",
                        isFav && "fill-[#febc2e] text-[#febc2e]",
                      )}
                      strokeWidth={2}
                    />
                  </button>
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] text-[10px] font-bold",
                      provider.className,
                    )}
                  >
                    {provider.label}
                  </span>
                  <span className="truncate text-[12.5px] text-foreground">
                    {model.name}
                  </span>
                  {model.isNew && (
                    <span className="shrink-0 rounded-[3px] bg-fill-strong px-1 py-px text-[10px] font-semibold tracking-wide text-foreground/80 uppercase">
                      New
                    </span>
                  )}
                </div>

                <span className="text-muted-foreground">
                  {model.kind === "language" ? (
                    <AlignLeft className="h-3.5 w-3.5" strokeWidth={2} />
                  ) : (
                    <AudioLines className="h-3.5 w-3.5" strokeWidth={2} />
                  )}
                </span>

                <SpeedBars value={model.speed} />

                <div className="flex items-center justify-end gap-1.5">
                  {model.size ? (
                    <>
                      <span className="text-[12px] text-muted-foreground">
                        {model.size}
                      </span>
                      <button
                        aria-label={`Download ${model.name}`}
                        className="flex h-4 w-4 items-center justify-center rounded-full bg-fill-hover text-foreground/70 transition-colors hover:bg-fill-strong hover:text-foreground"
                      >
                        <Download className="h-2.5 w-2.5" strokeWidth={2.5} />
                      </button>
                    </>
                  ) : (
                    <Cloud
                      className="h-3.5 w-3.5 text-muted-foreground"
                      strokeWidth={1.75}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
