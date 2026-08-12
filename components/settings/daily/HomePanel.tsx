"use client";

import { useState } from "react";
import {
  Mic,
  Download,
  History as HistoryIcon,
  Search,
  Play,
  Copy,
  ChevronDown,
  Trash2,
  X,
  Lock,
} from "lucide-react";
import { PopupButton } from "@/components/popup-button";
import { SegmentedControl } from "@/components/segmented-control";
import { cn } from "@/lib/utils";
import { HISTORY_GROUPS } from "@/app/settings/data";
import type { HistoryItem } from "@/app/settings/types";
import { Kbd, GhostButton } from "@/components/settings/shared";

export function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[21px] font-semibold tracking-tight text-foreground">
        {value}
      </span>
      <span className="text-[13px] text-muted-foreground">{label}</span>
    </div>
  );
}

export function LocalModelBanner({ onOpenModels }: { onOpenModels: () => void }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="hairline relative flex h-[128px] items-end overflow-hidden rounded-[14px]">
      {/* dusk-mountain-style photographic background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#4c3966] via-[#9c5877] to-[#d68f5c]" />
      <div
        className="absolute inset-x-0 bottom-0 h-[70%] bg-[#2f2242]/80"
        style={{
          clipPath:
            "polygon(0% 100%, 0% 55%, 18% 32%, 34% 52%, 50% 15%, 66% 46%, 82% 28%, 100% 48%, 100% 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[45%] bg-[#1c1428]/85"
        style={{
          clipPath:
            "polygon(0% 100%, 0% 70%, 22% 48%, 42% 66%, 58% 34%, 74% 58%, 90% 40%, 100% 62%, 100% 100%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2} />
      </button>

      <div className="relative z-10 flex w-full items-center justify-between gap-4 px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1.5 text-[12px] font-semibold tracking-wide text-white/70 uppercase">
            <Lock className="h-3 w-3" strokeWidth={2} />
            Private by design
          </span>
          <p className="text-[16px] font-semibold text-white">
            Nothing leaves your Mac.
          </p>
        </div>
        <button
          onClick={onOpenModels}
          className="shrink-0 rounded-full bg-white/15 px-3.5 py-1.5 text-[13px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25"
        >
          Switch model →
        </button>
      </div>
    </div>
  );
}

export function Waveform() {
  const bars = [4, 9, 6, 12, 7, 10, 5, 13, 8, 6, 11, 7, 9, 5, 10, 6, 12, 8, 5, 9];
  return (
    <div className="flex flex-1 items-center gap-[2px]">
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-[2px] shrink-0 rounded-full bg-foreground/25"
          style={{ height: h }}
        />
      ))}
    </div>
  );
}

/**
 * Clicking copies — getting the text back is the job people come here for.
 * Everything else waits behind a disclosure, and the variant switcher only
 * appears when there's actually a second version to look at: a four-second
 * dictation has no segments and often no AI edit to undo.
 */
export function HistoryRow({ item }: { item: HistoryItem }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState<"clean" | "original" | "segments">(
    "clean"
  );

  const hasOriginal = !!item.original && item.original !== item.text;
  const hasSegments = (item.segments?.length ?? 0) > 1;
  const showVariants = hasOriginal || hasSegments;

  const copy = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="hairline group overflow-hidden rounded-[9px] bg-card">
      <div className="flex items-center gap-2 px-3.5 py-2.5">
        <button
          onClick={copy}
          title="Click to copy"
          className="min-w-0 flex-1 text-left text-[14px] leading-snug text-foreground/90"
        >
          {item.text}
        </button>

        <span
          className={cn(
            "shrink-0 text-[12px] font-medium text-primary transition-opacity",
            copied ? "opacity-100" : "opacity-0"
          )}
        >
          Copied
        </span>

        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <button
            onClick={copy}
            aria-label="Copy"
            className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
          >
            <Copy className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Hide details" : "Show details"}
            className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
          >
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>

      {open && (
        <div className="flex flex-col gap-3 border-t border-line px-3.5 py-3">
          <div className="hairline flex items-center gap-2.5 rounded-[7px] bg-fill px-2.5 py-2">
            <button
              aria-label="Play"
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            >
              <Play className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
            <Waveform />
            <span className="shrink-0 text-[12px] text-muted-foreground tabular-nums">
              0:{String(item.seconds).padStart(2, "0")}
            </span>
          </div>

          {showVariants && (
            <>
              <SegmentedControl
                value={variant}
                onValueChange={(v) =>
                  setVariant(v as "clean" | "original" | "segments")
                }
                options={[
                  { value: "clean", label: "Cleaned up" },
                  ...(hasOriginal
                    ? [{ value: "original", label: "Original" }]
                    : []),
                  ...(hasSegments
                    ? [{ value: "segments", label: "Timestamps" }]
                    : []),
                ]}
              />

              {variant === "original" && (
                <p className="text-[14px] leading-relaxed text-muted-foreground">
                  {item.original}
                </p>
              )}
              {variant === "segments" && (
                <div className="flex flex-col gap-2">
                  {item.segments!.map((seg) => (
                    <div key={seg.at} className="flex gap-3">
                      <span className="shrink-0 text-[13px] text-muted-foreground tabular-nums">
                        {seg.at}
                      </span>
                      <span className="text-[14px] leading-snug text-foreground/90">
                        {seg.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="flex items-center gap-1">
            <GhostButton>Re-run</GhostButton>
            <button
              aria-label="Delete"
              className="ml-auto flex h-7 w-7 items-center justify-center rounded-[6px] text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * The one thing Home leads with — what to do right now, not how you've done
 * so far. Stats and history are worth having, but they're a look backward;
 * this is the look forward, so it comes first.
 */
export function DictationHero({ modeName }: { modeName: string }) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/12">
        <Mic className="h-[18px] w-[18px] text-primary" strokeWidth={2} />
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="flex items-center gap-2 text-[22px] font-semibold tracking-tight text-foreground">
          Hold <Kbd>Fn</Kbd> to dictate
        </p>
        <p className="truncate text-[14px] text-muted-foreground">
          Into {modeName}
        </p>
      </div>
    </div>
  );
}

export function HomePanel({
  onOpenModels,
  activeModeName,
}: {
  onOpenModels: () => void;
  activeModeName: string;
}) {
  const [query, setQuery] = useState("");

  const groups = HISTORY_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((it) =>
      it.text.toLowerCase().includes(query.trim().toLowerCase()),
    ),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-10">
      <DictationHero modeName={activeModeName} />

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <PopupButton value="All time" />
          <button
            aria-label="Export stats"
            className="flex h-6 w-6 items-center justify-center rounded-[6px] text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
          >
            <Download className="h-[15px] w-[15px]" strokeWidth={2} />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-6">
          <StatTile value="84 WPM" label="Average speed" />
          <StatTile value="8,637" label="Words" />
          <StatTile value="6" label="Apps used" />
          <StatTile value="1 hour" label="Saved all time" />
        </div>
      </section>

      <LocalModelBanner onOpenModels={onOpenModels} />

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="flex shrink-0 items-center gap-2 text-[16px] font-semibold text-foreground">
            <HistoryIcon
              className="h-4 w-4 text-muted-foreground"
              strokeWidth={2}
            />
            History
          </h2>
          <div className="hairline flex min-w-0 flex-1 items-center gap-2 rounded-[7px] bg-fill px-2.5 py-1.5">
            <Search
              className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
              strokeWidth={2}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search history"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="hairline rounded-[10px] bg-card px-4 py-6 text-center text-[13px] text-muted-foreground">
            No dictations match &ldquo;{query}&rdquo;.
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-2">
              <span className="text-[12px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
                {group.label}
              </span>
              <div className="flex flex-col gap-1.5">
                {group.items.map((item) => (
                  <HistoryRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
