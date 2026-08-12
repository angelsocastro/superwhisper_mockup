"use client";

import { Sparkles, ChevronRight } from "lucide-react";
import { SettingsSection, SettingsRow } from "@/components/settings-parts";
import type { BaseSettings, ModeItem, SettingKey, WebhookEndpoint } from "@/app/settings/types";
import { SETTING_DEFS } from "@/app/settings/data";
import {
  PanelIntro,
  GhostButton,
  InfoDot,
  SettingControl,
  PolicyLocked,
  renderSample,
  resolveMode,
} from "@/components/settings/shared";

/**
 * Super's page — the one place its settings live. There's no other tab
 * these ever also appear on: Super IS the definition, not a summary of it,
 * the same way a custom mode's overrides only ever live on that mode.
 */
export function SuperDetailPanel({
  base,
  managed,
  onChange,
  endpoints,
}: {
  base: BaseSettings;
  managed: boolean;
  onChange: (key: SettingKey, value: BaseSettings[SettingKey]) => void;
  endpoints: WebhookEndpoint[];
}) {
  const groups = [...new Set(SETTING_DEFS.map((d) => d.group))];

  return (
    <div className="flex flex-col gap-8">
      <PanelIntro
        title="Super"
        description="This is what everyone gets unless a mode overrides it."
      />

      {groups.map((group) => (
        <SettingsSection key={group} title={group}>
          {SETTING_DEFS.filter((d) => d.group === group).map((def, i, arr) => {
            const control = (
              <SettingControl
                def={def}
                value={base[def.key]}
                onChange={(v) => onChange(def.key, v)}
                endpoints={endpoints}
              />
            );
            return (
              <SettingsRow
                key={def.key}
                label={
                  <span>
                    {def.label}
                    <InfoDot />
                  </span>
                }
                last={i === arr.length - 1}
                control={
                  def.locked ? (
                    <PolicyLocked locked={managed}>{control}</PolicyLocked>
                  ) : (
                    control
                  )
                }
              />
            );
          })}
        </SettingsSection>
      ))}
    </div>
  );
}

export function ModesPanel({
  modes,
  base,
  previewText,
  onPreviewTextChange,
  onOpenMode,
  onOpenSuper,
  onCreateMode,
}: {
  modes: ModeItem[];
  base: BaseSettings;
  previewText: string;
  onPreviewTextChange: (value: string) => void;
  onOpenMode: (id: string) => void;
  onOpenSuper: () => void;
  onCreateMode: () => void;
}) {
  const on = modes.filter((m) => m.enabled).length;

  return (
    <div className="flex flex-col gap-8">
      <PanelIntro
        title="Modes"
        description={
          <>
            A mode overrides Super only for the apps you point it at.{" "}
            {on} of {modes.length} are on.
          </>
        }
      />

      <input
        name="mode-preview-text"
        value={previewText}
        onChange={(e) => onPreviewTextChange(e.target.value)}
        placeholder="Try dictating something — see how each mode changes it"
        className="hairline rounded-[8px] bg-card px-3.5 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
      />

      <section className="flex flex-col gap-4">
        {/* Pinned, not a toggle: this is the thing modes are diffs against,
            not one more thing that can be switched off. */}
        <div
          onClick={onOpenSuper}
          className="hairline flex items-center gap-3 rounded-[9px] bg-card px-3.5 py-3 transition-colors hover:bg-fill"
        >
          <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] bg-primary/15 text-primary">
            <Sparkles className="h-3 w-3" strokeWidth={2.5} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-[14px] font-medium text-foreground">
              Super
            </span>
            <span className="truncate text-[13px] text-muted-foreground">
              The base — everyone gets this unless a mode below overrides it
            </span>
          </div>
          <span className="shrink-0 rounded-[4px] bg-fill-strong px-1.5 py-px text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Base
          </span>
          <ChevronRight
            className="h-4 w-4 shrink-0 text-muted-foreground"
            strokeWidth={2}
          />
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-foreground">
            Custom modes
          </h2>
          <GhostButton onClick={onCreateMode}>+ Create mode</GhostButton>
        </div>

        <div className="flex flex-col gap-2">
          {modes.map((mode) => {
            const count = Object.keys(mode.overrides).length;
            return (
              <div
                key={mode.id}
                onClick={() => onOpenMode(mode.id)}
                className="hairline flex items-center gap-3 rounded-[9px] bg-card px-3.5 py-3 transition-colors hover:bg-fill"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-[14px] font-medium text-foreground">
                    {mode.name}
                  </span>
                  <span className="truncate text-[13px] text-muted-foreground">
                    {mode.apps.join(", ")} · {count}{" "}
                    {count === 1 ? "override" : "overrides"}
                  </span>
                  {previewText.trim() !== "" && (
                    <span className="truncate text-[13px] text-foreground/55 italic">
                      {renderSample(resolveMode(base, mode), previewText)}
                    </span>
                  )}
                </div>
                {!mode.enabled && (
                  <span className="shrink-0 rounded-[4px] bg-fill-strong px-1.5 py-px text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                    No Auto
                  </span>
                )}
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  strokeWidth={2}
                />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
