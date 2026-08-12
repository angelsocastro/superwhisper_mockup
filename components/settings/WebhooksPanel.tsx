"use client";

import { useState } from "react";
import { Lock, ExternalLink, Webhook } from "lucide-react";
import { SettingsSection, SettingsRow } from "@/components/settings-parts";
import { InlineEdit } from "@/components/inline-edit";
import { DetailModal } from "@/components/detail-modal";
import type { Account, WebhookEndpoint } from "@/app/settings/types";
import { PanelIntro, GhostButton } from "@/components/settings/shared";

export function WebhooksPanel({
  account,
  endpoints,
  onAddEndpoint,
  onUpdateEndpoint,
  onRemoveEndpoint,
}: {
  account: Account;
  endpoints: WebhookEndpoint[];
  onAddEndpoint: (label: string, url: string) => void;
  onUpdateEndpoint: (id: string, field: "label" | "url", value: string) => void;
  onRemoveEndpoint: (id: string) => void;
}) {
  const org = account.org;
  /** Same split as Sync: fleet-wide config is web-only for governance, but
   *  an individual's own endpoints are theirs to edit right here. */
  const webManaged = !!org;
  const locked = org?.role === "member";

  const [addOpen, setAddOpen] = useState(false);
  const [labelDraft, setLabelDraft] = useState("");
  const [urlDraft, setUrlDraft] = useState("");

  const openAdd = () => {
    setLabelDraft("");
    setUrlDraft("");
    setAddOpen(true);
  };

  const submitAdd = () => {
    const label = labelDraft.trim();
    const url = urlDraft.trim();
    if (!label || !url) return;
    onAddEndpoint(label, url);
    setAddOpen(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <PanelIntro
        title="Webhooks"
        description="Your transcripts, delivered to wherever your system of record already lives."
      />

      <ul className="flex flex-col gap-1.5 px-1 text-[13px] leading-relaxed text-muted-foreground">
        <li>
          · Log every client call into your CRM the moment you hang up.
        </li>
        <li>
          · Archive meeting transcripts straight into your compliance system.
        </li>
        <li>
          · Turn voice notes into nodes in your own knowledge graph.
        </li>
      </ul>

      <SettingsSection
        title="Endpoints"
        description={
          webManaged
            ? locked
              ? `Set by ${org!.name}'s workspace admin — also viewable in Superwhisper Web.`
              : `You're setting this for all of ${org!.name}. Managed in Superwhisper Web for the audit trail.`
            : "Any mode can route to one of these from its own Overrides list."
        }
      >
        {endpoints.length === 0 ? (
          <div className="px-4 py-6 text-center text-[13px] text-muted-foreground">
            No endpoints yet.
          </div>
        ) : (
          endpoints.map((ep, i) => (
            <SettingsRow
              key={ep.id}
              icon={<Webhook className="h-4 w-4" strokeWidth={2} />}
              label={
                webManaged ? (
                  ep.label
                ) : (
                  <InlineEdit
                    value={ep.label}
                    onChange={(v) => onUpdateEndpoint(ep.id, "label", v)}
                  />
                )
              }
              description={
                <span className="font-mono">
                  {webManaged ? (
                    ep.url
                  ) : (
                    <InlineEdit
                      value={ep.url}
                      onChange={(v) => onUpdateEndpoint(ep.id, "url", v)}
                    />
                  )}
                </span>
              }
              last={i === endpoints.length - 1}
              control={
                webManaged ? (
                  <></>
                ) : (
                  <button
                    onClick={() => onRemoveEndpoint(ep.id)}
                    className="text-[13px] font-medium text-muted-foreground hover:text-foreground"
                  >
                    Remove
                  </button>
                )
              }
            />
          ))
        )}
      </SettingsSection>

      <div className="flex justify-end">
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
            <a href="/dashboard/webhooks" target="_blank" rel="noopener noreferrer">
              <GhostButton>
                <span className="flex items-center gap-1.5">
                  Manage endpoints in Web
                  <ExternalLink className="h-3 w-3" strokeWidth={2} />
                </span>
              </GhostButton>
            </a>
          )
        ) : (
          <GhostButton onClick={openAdd}>+ Add endpoint</GhostButton>
        )}
      </div>

      {addOpen && (
        <DetailModal width="360px" onClose={() => setAddOpen(false)}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-[16px] font-semibold text-foreground">
                Add an endpoint
              </h2>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                Any mode can route to this from its own Overrides list.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="endpoint-label"
                className="text-[12px] font-medium text-muted-foreground"
              >
                Label
              </label>
              <input
                id="endpoint-label"
                autoFocus
                value={labelDraft}
                onChange={(e) => setLabelDraft(e.target.value)}
                placeholder="e.g. Compliance archive"
                className="hairline rounded-[7px] bg-fill px-3 py-2 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="endpoint-url"
                className="text-[12px] font-medium text-muted-foreground"
              >
                URL
              </label>
              <input
                id="endpoint-url"
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                placeholder="https://hooks.example.com/superwhisper"
                className="hairline rounded-[7px] bg-fill px-3 py-2 font-mono text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <GhostButton
              onClick={submitAdd}
              className="justify-center bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Add endpoint
            </GhostButton>
          </div>
        </DetailModal>
      )}
    </div>
  );
}
