"use client";

import { useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { SettingsSection, SettingsRow } from "@/components/settings-parts";
import { InlineEdit } from "@/components/inline-edit";
import { Switch } from "@/components/ui/switch";
import { SETTING_DEFS } from "@/app/settings/data";
import type { BaseSettings, ModeItem, SettingKey, WebhookEndpoint } from "@/app/settings/types";
import {
  PanelIntro,
  GhostButton,
  InfoDot,
  SettingControl,
  SamplePreview,
  formatSettingValue,
} from "@/components/settings/shared";

export function ModeDetailPanel({
  mode,
  base,
  previewText,
  endpoints,
  onSetOverride,
  onClearOverride,
  onSetInstructions,
  onToggleMode,
  onRename,
}: {
  mode: ModeItem;
  base: BaseSettings;
  previewText: string;
  endpoints: WebhookEndpoint[];
  onSetOverride: (key: SettingKey, value: BaseSettings[SettingKey]) => void;
  onClearOverride: (key: SettingKey) => void;
  onSetInstructions: (value: string) => void;
  onToggleMode: (enabled: boolean) => void;
  onRename: (name: string) => void;
}) {
  const [picking, setPicking] = useState(false);

  /** In the order each was added, not SETTING_DEFS' fixed order — a newly
   *  added override belongs at the bottom, not wherever its group happens
   *  to fall. Object key order follows insertion order in JS, so this is
   *  just reading it off mode.overrides directly. */
  const overridden = (Object.keys(mode.overrides) as SettingKey[])
    .map((key) => SETTING_DEFS.find((d) => d.key === key)!)
    .filter(Boolean);
  const available = SETTING_DEFS.filter(
    (d) => !d.superOnly && !(d.key in mode.overrides),
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <PanelIntro
          title={<InlineEdit value={mode.name} onChange={onRename} />}
          description={
            overridden.length === 0 ? (
              <>Follows Super — nothing overridden yet.</>
            ) : (
              <>
                Overrides {overridden.length}{" "}
                {overridden.length === 1 ? "setting" : "settings"}.
              </>
            )
          }
        />
        <label className="flex shrink-0 items-center gap-2 pt-0.5">
          <span className="text-[13px] font-medium text-muted-foreground">
            Auto
          </span>
          <Switch
            size="sm"
            checked={mode.enabled}
            onCheckedChange={(c) => onToggleMode(c === true)}
          />
        </label>
      </div>

      <SamplePreview base={base} mode={mode} previewText={previewText} />

      {/* What makes this mode this mode. */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="mode-instructions"
            className="text-[14px] font-medium text-foreground"
          >
            Custom instructions
          </label>
          <textarea
            id="mode-instructions"
            value={mode.instructions}
            onChange={(e) => onSetInstructions(e.target.value)}
            rows={3}
            placeholder="Adjust the transcript to your style using natural language."
            className="hairline min-h-[76px] resize-y rounded-[8px] bg-card px-3 py-2.5 text-[14px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </section>

      <SettingsSection title="Activation">
        <SettingsRow
          label={
            <span>
              Activate for apps
              <InfoDot />
            </span>
          }
          description={
            mode.apps.length > 0 ? mode.apps.join(", ") : undefined
          }
          control={<GhostButton>Add apps and sites</GhostButton>}
        />
        <SettingsRow
          label="Keyboard shortcut"
          description="Start a recording in this mode"
          last
          control={
            <span className="text-[13px] text-muted-foreground/60">
              Record shortcut
            </span>
          }
        />
      </SettingsSection>

      {/* Overrides — this holds the diff against Super. Never scattered to
          Dictation/Privacy/Models; those hold Super's own copy, this holds
          only what this mode changes. */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[16px] font-semibold text-foreground">
          Overrides
        </h2>

        {overridden.length > 0 ? (
          <div className="hairline overflow-hidden rounded-[10px] bg-card">
            {overridden.map((def, i) => (
              <SettingsRow
                key={def.key}
                label={def.label}
                description={`${def.group} · Super uses ${formatSettingValue(
                  base[def.key]
                )}`}
                last={i === overridden.length - 1}
                control={
                  <div className="flex items-center gap-2">
                    <SettingControl
                      def={def}
                      value={
                        mode.overrides[def.key] as BaseSettings[SettingKey]
                      }
                      onChange={(v) => onSetOverride(def.key, v)}
                      endpoints={endpoints}
                    />
                    <button
                      onClick={() => onClearOverride(def.key)}
                      aria-label={`Reset ${def.label}`}
                      title="Follow Super again"
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-fill-hover hover:text-foreground"
                    >
                      <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                  </div>
                }
              />
            ))}
          </div>
        ) : (
          !picking && (
            <p className="text-[13px] text-muted-foreground">
              Nothing overridden yet — everything follows Super.
            </p>
          )
        )}

        {picking ? (
          <div className="hairline flex flex-col gap-3 rounded-[10px] bg-card p-3">
            {[...new Set(available.map((d) => d.group))].map((group) => (
              <div key={group} className="flex flex-col gap-1">
                <span className="px-1 text-[12px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
                  {group}
                </span>
                {available
                  .filter((d) => d.group === group)
                  .map((def) => (
                    <button
                      key={def.key}
                      onClick={() => {
                        const current = base[def.key];
                        onSetOverride(
                          def.key,
                          typeof current === "boolean" ? !current : current
                        );
                        setPicking(false);
                      }}
                      className="flex items-center justify-between rounded-[6px] px-1.5 py-1 text-left transition-colors hover:bg-fill-hover"
                    >
                      <span className="text-[14px] text-foreground">
                        {def.label}
                      </span>
                      <span className="text-[13px] text-muted-foreground">
                        {formatSettingValue(base[def.key])}
                      </span>
                    </button>
                  ))}
              </div>
            ))}
            <button
              onClick={() => setPicking(false)}
              className="self-start px-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        ) : (
          available.length > 0 && (
            <GhostButton onClick={() => setPicking(true)}>
              + Add an override
            </GhostButton>
          )
        )}
      </section>

      <div className="hairline overflow-hidden rounded-[10px] bg-card">
        <SettingsRow
          label="Delete this mode"
          last
          control={
            <button
              aria-label="Delete this mode"
              className="flex h-6 w-6 items-center justify-center rounded-full text-destructive transition-colors hover:bg-destructive/15"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2} />
            </button>
          }
        />
      </div>
    </div>
  );
}
