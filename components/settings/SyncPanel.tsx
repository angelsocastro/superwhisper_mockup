"use client";

import { useState } from "react";
import { Lock, ExternalLink } from "lucide-react";
import { SettingsSection, SettingsRow } from "@/components/settings-parts";
import { Separator } from "@/components/ui/separator";
import { SegmentedControl } from "@/components/segmented-control";
import { SYNC_DEFS } from "@/app/settings/data";
import type { Account, BaseSettings, SettingKey, SyncMode } from "@/app/settings/types";
import { PanelIntro, GhostButton, SettingControl } from "@/components/settings/shared";

export function SyncPanel({
  account,
  base,
  onChange,
}: {
  account: Account;
  base: BaseSettings;
  onChange: (key: SettingKey, value: BaseSettings[SettingKey]) => void;
}) {
  const org = account.org;
  /** Only org-wide policy is web-only, and only for the admin setting it —
   *  a member has nothing to edit anywhere, and an individual has no fleet
   *  to govern, so there's no reason to send either of them off-app. */
  const webManaged = !!org;
  const locked = org?.role === "member";

  const [syncMode, setSyncMode] = useState<SyncMode>(org ? "self" : "cloud");
  const [relay, setRelay] = useState(
    org ? "wss://sync.acme.internal:8443" : "",
  );

  return (
    <div className="flex flex-col gap-8">
      <PanelIntro
        title="Sync"
        description="Keep your dictionary, modes and history in step across every device."
      />

      <SettingsSection
        title="Sync mode"
        description={
          webManaged
            ? locked
              ? `Set by ${org!.name}'s workspace admin — also viewable in Superwhisper Web.`
              : `You're setting this for all of ${org!.name}. Managed in Superwhisper Web for the audit trail; nothing to edit here.`
            : "Also editable in Superwhisper Web if you're not at this Mac."
        }
      >
        <div className="flex items-center gap-4 px-4 py-3.5">
          <span className="flex-1 text-[14px] font-medium text-foreground">
            Where synced data lives
          </span>
          {webManaged ? (
            locked ? (
              <span
                className="flex items-center gap-1.5 text-[13px] text-muted-foreground"
                title={`Managed by ${org!.name}'s workspace admin.`}
              >
                <Lock className="h-3.5 w-3.5" strokeWidth={2} />
                Managed by {org!.name}
              </span>
            ) : (
              <a href="/dashboard/sync" target="_blank" rel="noopener noreferrer">
                <GhostButton>
                  <span className="flex items-center gap-1.5">
                    Configure in Web
                    <ExternalLink className="h-3 w-3" strokeWidth={2} />
                  </span>
                </GhostButton>
              </a>
            )
          ) : (
            <SegmentedControl
              value={syncMode}
              onValueChange={(v) => setSyncMode(v as SyncMode)}
              options={[
                { value: "off", label: "Off" },
                { value: "cloud", label: "Cloud" },
                { value: "self", label: "Self-hosted" },
              ]}
            />
          )}
        </div>

        {!webManaged && syncMode === "self" && (
          <>
            <Separator className="ml-4 bg-line" />
            <div className="flex flex-col gap-2.5 px-4 py-3.5">
              <span className="text-[14px] font-medium text-foreground">
                Relay address
              </span>
              <div className="flex items-center gap-2">
                <input
                  value={relay}
                  onChange={(e) => setRelay(e.target.value)}
                  placeholder="wss://sync.your-server.com:8443"
                  className="hairline min-w-0 flex-1 rounded-[7px] bg-fill px-3 py-2 font-mono text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <GhostButton>Test</GhostButton>
              </div>
              <p className="text-[12px] leading-relaxed text-muted-foreground">
                A relay you run yourself — a Docker image, one command. Your account exchanges pairing keys only; the data itself never touches Superwhisper&rsquo;s servers.
              </p>
            </div>
          </>
        )}
      </SettingsSection>

      <SettingsSection
        title="Account-wide"
        description="One Dictionary, one set of Modes — synced whole, not something any single mode can opt out of."
      >
        {SYNC_DEFS.filter((d) => d.superOnly).map((def, i, arr) => (
          <SettingsRow
            key={def.key}
            label={def.label}
            last={i === arr.length - 1}
            control={
              <SettingControl
                def={def}
                value={base[def.key]}
                onChange={(v) => onChange(def.key, v)}
              />
            }
          />
        ))}
      </SettingsSection>

      <SettingsSection
        title="Per-dictation default"
        description="What a mode syncs unless it narrows this itself, under its own Overrides list."
      >
        {SYNC_DEFS.filter((d) => !d.superOnly).map((def, i, arr) => (
          <SettingsRow
            key={def.key}
            label={def.label}
            last={i === arr.length - 1}
            control={
              <SettingControl
                def={def}
                value={base[def.key]}
                onChange={(v) => onChange(def.key, v)}
              />
            }
          />
        ))}
      </SettingsSection>
    </div>
  );
}
