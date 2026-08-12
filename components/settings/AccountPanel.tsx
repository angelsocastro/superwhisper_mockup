"use client";

import { useState } from "react";
import {
  Pencil,
  Building2,
  Map,
  Mail,
  Globe,
  MessageCircle,
  X,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { SettingsSection, SettingsRow } from "@/components/settings-parts";
import { DEVICES_SEED, ROLE_LABEL } from "@/app/settings/data";
import type { Account, DeviceItem } from "@/app/settings/types";
import { GhostButton } from "@/components/settings/shared";

export function AccountPanel({ account }: { account: Account }) {
  const org = account.org;
  const [devices, setDevices] = useState<DeviceItem[]>(DEVICES_SEED);

  const signOutDevice = (id: string) =>
    setDevices((prev) => prev.filter((d) => d.id !== id));

  const links: { label: string; icon: LucideIcon }[] = [
    { label: "Roadmap", icon: Map },
    { label: "Email", icon: Mail },
    { label: "Website", icon: Globe },
    { label: "Discord", icon: MessageCircle },
    { label: "X", icon: X },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-fill-hover text-[16px] font-semibold">
          A
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-center gap-1.5 text-[16px] font-semibold text-foreground">
            {account.email}
            {!org && (
              <button
                aria-label="Edit email"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            )}
          </span>
          <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            {org ? org.name : "Superwhisper"}
            <span className="rounded-[4px] bg-fill-strong px-1.5 py-px text-[10px] font-semibold tracking-wide text-foreground/80 uppercase">
              {org ? ROLE_LABEL[org.role] : "Pro"}
            </span>
          </span>
        </div>
      </div>

      {org && (
        <SettingsSection title="Organization">
          <SettingsRow
            icon={<Building2 className="h-4 w-4" strokeWidth={2} />}
            label={org.name}
            description={
              org.role === "member"
                ? "Enterprise seat provided by your organization. Members, policies and billing are handled by an owner."
                : "Members, policies and invoices live in the admin portal."
            }
            last
            control={
              org.role === "member" ? (
                <span className="text-[13px] text-muted-foreground">
                  Seat active
                </span>
              ) : (
                <GhostButton>
                  <span className="flex items-center gap-1.5">
                    Open admin portal
                    <ExternalLink className="h-3 w-3" strokeWidth={2} />
                  </span>
                </GhostButton>
              )
            }
          />
        </SettingsSection>
      )}

      <SettingsSection
        title="Devices"
        description={`${devices.length} of 5 devices signed into this account.`}
      >
        {devices.map((device, i) => (
          <SettingsRow
            key={device.id}
            icon={
              <device.icon className="h-[15px] w-[15px]" strokeWidth={1.75} />
            }
            label={
              <span className="flex items-center gap-1.5">
                {device.name}
                {device.current && (
                  <span className="rounded-[4px] bg-fill-strong px-1.5 py-px text-[10px] font-semibold tracking-wide text-foreground/80 uppercase">
                    This Mac
                  </span>
                )}
              </span>
            }
            description={device.detail}
            last={i === devices.length - 1}
            control={
              <button
                onClick={() => signOutDevice(device.id)}
                className="rounded-[6px] px-2 py-1 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
              >
                Sign out
              </button>
            }
          />
        ))}
      </SettingsSection>

      <section className="flex flex-col gap-3">
        <h2 className="text-[16px] font-semibold text-foreground">
          Community & support
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {links.map((l) => (
            <button
              key={l.label}
              className="hairline flex items-center gap-1.5 rounded-full bg-fill-hover px-2.5 py-1 text-[13px] font-medium text-foreground transition-colors hover:bg-fill-strong"
            >
              <l.icon
                className="h-3.5 w-3.5 text-muted-foreground"
                strokeWidth={2}
              />
              {l.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
