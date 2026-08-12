"use client";

import { CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLANS } from "@/app/settings/data";
import { PanelIntro, GhostButton } from "@/components/settings/shared";

export function PlansPanel({ current = "pro" }: { current?: string }) {
  return (
    <div className="flex flex-col gap-5">
      <PanelIntro
        title="Plans"
        description="Upgrades apply right away. Downgrades take effect on Sep 4, 2026, when the current period ends."
      />

      <div className="flex flex-col gap-2">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === current;
          return (
            <div
              key={plan.id}
              className={cn(
                "hairline flex items-start gap-4 rounded-[10px] bg-card px-4 py-3.5",
                isCurrent && "ring-1 ring-foreground/15",
              )}
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="flex items-center gap-1.5 text-[14px] font-semibold text-foreground">
                  {plan.name}
                  {isCurrent && (
                    <span className="rounded-[4px] bg-fill-strong px-1.5 py-px text-[10px] font-semibold tracking-wide text-foreground/80 uppercase">
                      Current
                    </span>
                  )}
                </span>
                <ul className="flex flex-col gap-1">
                  {plan.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-center gap-1.5 text-[13px] text-muted-foreground"
                    >
                      <CircleCheck
                        className="h-3 w-3 shrink-0 text-muted-foreground/60"
                        strokeWidth={2}
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2">
                <div className="flex flex-col items-end">
                  <span className="text-[14px] font-semibold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-[12px] text-muted-foreground">
                    {plan.cadence}
                  </span>
                </div>
                {isCurrent ? (
                  <span className="text-[13px] text-muted-foreground">
                    In use
                  </span>
                ) : (
                  <GhostButton>
                    {plan.id === "enterprise"
                      ? "Contact sales"
                      : plan.id === "free"
                        ? "Downgrade"
                        : "Upgrade"}
                  </GhostButton>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
