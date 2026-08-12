"use client";

import { Settings as SettingsIcon, Asterisk } from "lucide-react";
import { SettingsSection, SettingsRow } from "@/components/settings-parts";
import { Switch } from "@/components/ui/switch";
import { PopupButton } from "@/components/popup-button";
import { InfoDot } from "@/components/settings/shared";

function GearSwitch({ defaultChecked = false }: { defaultChecked?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <button
        aria-label="Options"
        className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-fill-hover hover:text-foreground"
      >
        <SettingsIcon className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      <Switch size="sm" defaultChecked={defaultChecked} />
    </div>
  );
}

export function SystemPanel() {
  return (
    <div className="flex flex-col gap-8">
      <SettingsSection
        title="Application"
        description="How Superwhisper behaves as a Mac app."
      >
        <SettingsRow
          label={
            <span>
              Show in Dock
              <InfoDot />
            </span>
          }
          control={<Switch size="sm" defaultChecked />}
        />
        <SettingsRow
          label={
            <span>
              Start Recording on Menubar Click
              <InfoDot />
            </span>
          }
          control={<Switch size="sm" defaultChecked={false} />}
        />
        <SettingsRow
          label={
            <span>
              Always close
              <InfoDot />
            </span>
          }
          control={<Switch size="sm" defaultChecked={false} />}
        />
        <SettingsRow
          label={
            <span>
              Voice model active duration
              <InfoDot />
            </span>
          }
          description="How long a downloaded model stays warm in memory."
          last
          control={<PopupButton value="1 minute" />}
        />
      </SettingsSection>

      <SettingsSection
        title="Sync"
        description="Keeps modes and your personal dictionary the same on every Mac."
      >
        <SettingsRow
          label={
            <span>
              Filesync enabled
              <InfoDot />
            </span>
          }
          description="The folder itself lives under Privacy."
          last
          control={<GearSwitch />}
        />
      </SettingsSection>

      <SettingsSection
        title="Integrations"
        description="Plugins and experimental features."
      >
        <SettingsRow
          icon={
            <span className="flex h-5 w-5 items-center justify-center rounded-[5px] bg-[#d97757] text-white">
              <Asterisk className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
          }
          label="Claude Code"
          control={
            <span className="text-[13px] text-muted-foreground">Installed</span>
          }
        />
        <SettingsRow
          label={
            <span>
              Show experimental models
              <InfoDot />
            </span>
          }
          last
          control={<GearSwitch defaultChecked />}
        />
      </SettingsSection>
    </div>
  );
}
