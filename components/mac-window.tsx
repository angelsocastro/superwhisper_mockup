import { ReactNode } from "react";

function TrafficLights() {
  return (
    <div className="flex items-center gap-2">
      <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
      <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
      <span className="h-3 w-3 rounded-full bg-[#28c840]" />
    </div>
  );
}

export function MacWindow({
  title,
  width = "760px",
  height = "560px",
  children,
  titleBarExtra,
}: {
  title: string;
  width?: string;
  height?: string;
  children: ReactNode;
  titleBarExtra?: ReactNode;
}) {
  return (
    <div
      className="hairline relative flex flex-col overflow-hidden rounded-[10px] bg-card shadow-[0_30px_60px_-15px_rgb(0_0_0/0.6)]"
      style={{ width, height }}
    >
      <div className="hairline-b relative flex h-11 shrink-0 items-center bg-titlebar px-4">
        <TrafficLights />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[13px] font-medium text-foreground/70">
          {title}
        </div>
        {titleBarExtra && (
          <div className="ml-auto flex items-center">{titleBarExtra}</div>
        )}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
