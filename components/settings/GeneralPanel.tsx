"use client";

import { useState } from "react";
import { EyeOff } from "lucide-react";
import { SettingsSection, SettingsRow } from "@/components/settings-parts";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { ThemePref } from "@/app/settings/types";
import { InfoDot, GhostButton, NavRow } from "@/components/settings/shared";

const THEME_BACKGROUNDS: Record<string, string> = {
  auto: "bg-gradient-to-br from-[#1b2a52] via-[#3454a8] to-[#dfe6f5]",
  light: "bg-gradient-to-br from-[#bcd3f5] via-[#e3ecfb] to-[#f8fafd]",
  dark: "bg-gradient-to-br from-[#0a0e1f] via-[#141b36] to-[#242f57]",
};

function OptionSwatch({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5">
      <div
        className={cn(
          "relative flex h-12 w-[72px] items-start justify-end overflow-hidden rounded-[8px] p-1 transition-shadow",
          active && "ring-2 ring-primary ring-offset-2 ring-offset-card",
        )}
      >
        {children}
      </div>
      <span
        className={cn(
          "text-[12px] font-medium",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </button>
  );
}

function ThemeSwatch({
  value,
  active,
  onClick,
}: {
  value: "auto" | "light" | "dark";
  active: boolean;
  onClick: () => void;
}) {
  const labels: Record<string, string> = {
    auto: "Auto",
    light: "Light",
    dark: "Dark",
  };
  return (
    <OptionSwatch active={active} onClick={onClick} label={labels[value]}>
      <div className={cn("absolute inset-0", THEME_BACKGROUNDS[value])} />
      <div className="relative flex h-5 w-11 flex-col overflow-hidden rounded-[3px] bg-white shadow-[0_2px_6px_rgb(0_0_0/0.35)]">
        <div className="flex items-center gap-[2px] bg-black/[0.06] px-[3px] py-[2px]">
          <span className="h-[3px] w-[3px] rounded-full bg-[#ff5f57]" />
          <span className="h-[3px] w-[3px] rounded-full bg-[#febc2e]" />
          <span className="h-[3px] w-[3px] rounded-full bg-[#28c840]" />
        </div>
      </div>
    </OptionSwatch>
  );
}

function RecordingWindowSwatch({
  value,
  active,
  onClick,
}: {
  value: "classic" | "mini" | "none";
  active: boolean;
  onClick: () => void;
}) {
  const labels: Record<string, string> = {
    classic: "Classic",
    mini: "Mini",
    none: "None",
  };
  return (
    <OptionSwatch active={active} onClick={onClick} label={labels[value]}>
      <div className="absolute inset-0 flex items-center justify-center bg-[#161616]">
        {value === "classic" && (
          <div className="flex items-center gap-[2px]">
            {[5, 9, 4, 11, 6, 9, 4].map((h, i) => (
              <span
                key={i}
                className="w-[2px] rounded-full bg-white/70"
                style={{ height: h }}
              />
            ))}
          </div>
        )}
        {value === "mini" && (
          <div className="flex items-center gap-[3px] rounded-full bg-white/10 px-2.5 py-1.5">
            {[3, 5, 3].map((h, i) => (
              <span
                key={i}
                className="w-[2px] rounded-full bg-white/70"
                style={{ height: h }}
              />
            ))}
          </div>
        )}
        {value === "none" && (
          <EyeOff className="h-3.5 w-3.5 text-white/40" strokeWidth={2} />
        )}
      </div>
    </OptionSwatch>
  );
}

export function GeneralPanel({
  onOpenSystem,
  theme,
  setTheme,
}: {
  onOpenSystem: () => void;
  theme: ThemePref;
  setTheme: (t: ThemePref) => void;
}) {
  const [recordingWindow, setRecordingWindow] = useState<
    "classic" | "mini" | "none"
  >("mini");

  return (
    <div className="flex flex-col gap-8">
      <SettingsSection title="Appearance">
        <div className="flex items-start gap-4 px-4 py-3.5">
          <span className="w-[104px] shrink-0 pt-3 text-[14px] font-medium text-foreground">
            Theme
          </span>
          <div className="flex flex-1 items-start justify-end gap-3">
            {(["auto", "light", "dark"] as const).map((v) => (
              <ThemeSwatch
                key={v}
                value={v}
                active={theme === v}
                onClick={() => setTheme(v)}
              />
            ))}
          </div>
        </div>
        <Separator className="ml-4 bg-line" />
        <div className="flex items-start gap-4 px-4 py-3.5">
          <span className="w-[104px] shrink-0 pt-3 text-[14px] font-medium text-foreground">
            Recording window
          </span>
          <div className="flex flex-1 items-start justify-end gap-3">
            {(["classic", "mini", "none"] as const).map((v) => (
              <RecordingWindowSwatch
                key={v}
                value={v}
                active={recordingWindow === v}
                onClick={() => setRecordingWindow(v)}
              />
            ))}
          </div>
        </div>
        <Separator className="ml-4 bg-line" />
        <SettingsRow
          label={
            <span>
              Always show
              <InfoDot />
            </span>
          }
          last
          control={<Switch size="sm" defaultChecked={false} />}
        />
      </SettingsSection>

      <SettingsSection title="Startup & updates">
        <SettingsRow
          label={
            <span>
              Launch on login
              <InfoDot />
            </span>
          }
          control={<Switch size="sm" defaultChecked={false} />}
        />
        <SettingsRow
          label="Update application"
          control={<GhostButton>Check for Updates…</GhostButton>}
        />
        <SettingsRow
          label={
            <span>
              Automatically check for updates
              <InfoDot />
            </span>
          }
          last
          control={<Switch size="sm" defaultChecked />}
        />
      </SettingsSection>

      <div className="hairline overflow-hidden rounded-[10px] bg-card">
        <NavRow label="System & integrations" onClick={onOpenSystem} />
      </div>
    </div>
  );
}
