"use client";

import { useState } from "react";
import { GripVertical, ChevronUp, ChevronDown, Volume2 } from "lucide-react";
import { SettingsSection, SettingsRow } from "@/components/settings-parts";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { SegmentedControl } from "@/components/segmented-control";
import { PopupButton } from "@/components/popup-button";
import { cn } from "@/lib/utils";
import type { MicDevice } from "@/app/settings/types";
import { InfoDot } from "@/components/settings/shared";

/**
 * A ranked fallback rather than one fixed device. Roughly ten roadmap
 * requests are the same complaint — plugging in or undocking loses the
 * choice — which a single "default microphone" can't express.
 */
function MicPriorityList({
  mics,
  onReorder,
}: {
  mics: MicDevice[];
  onReorder: (from: number, to: number) => void;
}) {
  const activeId = mics.find((m) => m.connected)?.id;

  return (
    <div className="flex flex-col">
      {mics.map((mic, i) => (
        <div
          key={mic.id}
          className={cn(
            "flex items-center gap-2.5 px-4 py-2.5",
            i !== mics.length - 1 && "border-b border-line"
          )}
        >
          <GripVertical
            className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground/50"
            strokeWidth={2}
          />
          <span className="w-4 shrink-0 text-[13px] text-muted-foreground tabular-nums">
            {i + 1}
          </span>
          <span className="flex-1 text-[14px] font-medium text-foreground">
            {mic.name}
          </span>

          {mic.id === activeId && (
            <span className="shrink-0 rounded-[4px] bg-primary/15 px-1.5 py-px text-[11px] font-semibold tracking-wide text-primary uppercase">
              In use
            </span>
          )}
          <span
            className={cn(
              "shrink-0 text-[12px]",
              mic.connected ? "text-muted-foreground" : "text-muted-foreground/50"
            )}
          >
            {mic.connected ? "Connected" : "Not connected"}
          </span>

          <div className="flex shrink-0 items-center">
            <button
              onClick={() => onReorder(i, i - 1)}
              disabled={i === 0}
              aria-label={`Move ${mic.name} up`}
              className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground disabled:pointer-events-none disabled:opacity-25"
            >
              <ChevronUp className="h-4 w-4" strokeWidth={2} />
            </button>
            <button
              onClick={() => onReorder(i, i + 1)}
              disabled={i === mics.length - 1}
              aria-label={`Move ${mic.name} down`}
              className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground disabled:pointer-events-none disabled:opacity-25"
            >
              <ChevronDown className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SoundPanel({
  mics,
  onReorderMics,
}: {
  mics: MicDevice[];
  onReorderMics: (from: number, to: number) => void;
}) {
  const [soundStyle, setSoundStyle] = useState("classic");
  const [volume, setVolume] = useState([85]);

  return (
    <div className="flex flex-col gap-8">
      <SettingsSection
        title="Microphone priority"
        description="Records with the first one connected."
      >
        <MicPriorityList mics={mics} onReorder={onReorderMics} />
      </SettingsSection>

      <SettingsSection
        title="Input"
        description="How your voice is captured and cleaned up before transcription."
      >
        <SettingsRow
          label={
            <span>
              Automatically increase microphone volume
              <InfoDot />
            </span>
          }
          control={<Switch size="sm" defaultChecked />}
        />
        <SettingsRow
          label={
            <span>
              Dynamic normalization
              <InfoDot />
            </span>
          }
          control={<Switch size="sm" defaultChecked={false} />}
        />
        <SettingsRow
          label={
            <span>
              Silence removal
              <InfoDot />
            </span>
          }
          last
          control={<Switch size="sm" defaultChecked={false} />}
        />
      </SettingsSection>

      <SettingsSection title="While recording">
        <SettingsRow
          label={
            <span>
              Playback when recording
              <InfoDot />
            </span>
          }
          description="What happens to audio already playing on your Mac."
          last
          control={<PopupButton value="Pause" />}
        />
      </SettingsSection>

      <SettingsSection title="Sound effects">
        <SettingsRow
          label="Sound effects"
          control={
            <SegmentedControl
              value={soundStyle}
              onValueChange={setSoundStyle}
              options={[
                { value: "simple", label: "Simple" },
                { value: "classic", label: "Classic" },
                { value: "off", label: "Off" },
              ]}
            />
          }
        />
        <SettingsRow
          label="Volume"
          last
          control={
            <div className="flex w-[180px] items-center gap-2">
              <Volume2
                className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                strokeWidth={2}
              />
              <Slider
                value={volume}
                onValueChange={(v) =>
                  setVolume(Array.isArray(v) ? [...v] : [v as number])
                }
                max={100}
                step={1}
                className="flex-1"
              />
              <Volume2
                className="h-4 w-4 shrink-0 text-muted-foreground"
                strokeWidth={2}
              />
            </div>
          }
        />
      </SettingsSection>
    </div>
  );
}
