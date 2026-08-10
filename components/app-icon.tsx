import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * macOS System Settings-style icon: a small rounded square filled with a
 * vertical gradient and a white glyph. Colour carries meaning here — vivid
 * tones for the things you touch daily, neutral greys for configuration —
 * which is the same split System Settings and Superwhisper itself use.
 */
export type IconTone =
  | "orange"
  | "blue"
  | "indigo"
  | "purple"
  | "pink"
  | "teal"
  | "gray"
  | "slate";

const TONES: Record<IconTone, string> = {
  orange: "bg-gradient-to-b from-[#ffb340] to-[#f5820b]",
  blue: "bg-gradient-to-b from-[#48a8ff] to-[#0a7cf0]",
  indigo: "bg-gradient-to-b from-[#8280ff] to-[#5952e0]",
  purple: "bg-gradient-to-b from-[#d18cf5] to-[#b44ceb]",
  pink: "bg-gradient-to-b from-[#ff6a86] to-[#f52c56]",
  teal: "bg-gradient-to-b from-[#4fd6c8] to-[#12b3a4]",
  gray: "bg-gradient-to-b from-[#9a9aa0] to-[#6d6d73]",
  slate: "bg-gradient-to-b from-[#74747a] to-[#4a4a4f]",
};

export function AppIcon({
  icon: Icon,
  tone,
  size = 22,
  className,
}: {
  icon: LucideIcon;
  tone: IconTone;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center shadow-[0_1px_2px_rgb(0_0_0/0.35),inset_0_0.5px_0_rgb(255_255_255/0.28)]",
        TONES[tone],
        className
      )}
      style={{ width: size, height: size, borderRadius: size * 0.28 }}
    >
      <Icon
        className="text-white"
        style={{ width: size * 0.6, height: size * 0.6 }}
        strokeWidth={2.4}
      />
    </span>
  );
}
