"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export function SegmentedControl({
  value,
  onValueChange,
  options,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onValueChange(v as string)}
      className={cn("w-fit", className)}
    >
      <TabsList className="h-8 rounded-[8px] bg-black/25 p-[2px]">
        {options.map((option) => (
          <TabsTrigger
            key={option.value}
            value={option.value}
            className="rounded-[6px] px-3 text-[12px] font-medium data-active:!bg-[oklch(0.42_0_0)] data-active:!text-foreground data-active:shadow-[0_1px_2px_rgb(0_0_0/0.4)]"
          >
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
