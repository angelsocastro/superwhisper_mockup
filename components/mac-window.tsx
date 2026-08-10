import { ReactNode } from "react";

export function TrafficLights() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
      <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
      <span className="h-3 w-3 rounded-full bg-[#28c840]" />
    </div>
  );
}

/**
 * The window frame only. Native apps with a sidebar don't give the traffic
 * lights a title bar of their own — they share the top row with real controls
 * — so the chrome is composed by the page instead of baked in here.
 */
export function MacWindow({
  width = "760px",
  height = "560px",
  children,
}: {
  width?: string;
  height?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="elevated-surface relative flex flex-col overflow-hidden rounded-[10px] bg-chrome"
      style={{ width, height }}
    >
      {children}
    </div>
  );
}
