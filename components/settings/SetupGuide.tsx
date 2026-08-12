"use client";

import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SetupTask } from "@/app/settings/types";

export function SetupGuide({
  tasks,
  onToggle,
  onClose,
}: {
  tasks: SetupTask[];
  onToggle: (id: string) => void;
  onClose: () => void;
}) {
  const done = tasks.filter((t) => t.done).length;
  const pct = Math.round((done / tasks.length) * 100);
  const allDone = done === tasks.length;
  const nextId = tasks.find((t) => !t.done)?.id;

  return (
    <div className="elevated-popover absolute right-3 bottom-11 z-30 w-[286px] overflow-hidden rounded-[10px] bg-popover">
      <div className="flex items-center gap-1 px-3.5 pt-3">
        <span className="flex-1 text-[14px] font-semibold text-foreground">
          Setup guide
        </span>
        <button
          onClick={onClose}
          aria-label="Close setup guide"
          className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
        >
          <X className="h-[15px] w-[15px]" strokeWidth={2} />
        </button>
      </div>

      <div className="flex items-center gap-2 px-3.5 pt-2 pb-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-fill-strong">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="shrink-0 text-[12px] font-medium text-muted-foreground tabular-nums">
          {done}/{tasks.length}
        </span>
      </div>

      <div className="flex flex-col pb-2">
          {allDone && (
            <p className="px-3.5 pb-2 text-[13px] leading-relaxed text-muted-foreground">
              That&rsquo;s everything — you&rsquo;re set up.
            </p>
          )}
          {tasks.map((task) => {
            const isNext = task.id === nextId;
            return (
              <button
                key={task.id}
                onClick={() => onToggle(task.id)}
                className="flex items-center gap-2.5 px-3.5 py-1.5 text-left transition-colors hover:bg-fill"
              >
                <span
                  className={cn(
                    "relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                    task.done || isNext
                      ? "bg-primary/12 text-primary"
                      : "bg-fill-strong text-muted-foreground/60",
                  )}
                >
                  <task.icon className="h-3.5 w-3.5" strokeWidth={2} />
                  {task.done && (
                    <span className="absolute -right-0.5 -bottom-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-primary ring-2 ring-popover">
                      <Check
                        className="h-[7px] w-[7px] text-primary-foreground"
                        strokeWidth={3.5}
                      />
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "flex-1 text-[14px]",
                    task.done
                      ? "text-muted-foreground line-through"
                      : "text-foreground",
                  )}
                >
                  {task.label}
                </span>
                {isNext && (
                  <span className="shrink-0 text-[11px] font-semibold tracking-wide text-primary/80 uppercase">
                    Next
                  </span>
                )}
              </button>
            );
          })}
      </div>
    </div>
  );
}
