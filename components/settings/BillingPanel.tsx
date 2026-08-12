"use client";

import { useState } from "react";
import { Minus, Plus, ExternalLink } from "lucide-react";
import { SettingsSection, SettingsRow } from "@/components/settings-parts";
import type { Account } from "@/app/settings/types";
import { GhostButton } from "@/components/settings/shared";

export function BillingPanel({
  account,
  onOpenPlans,
}: {
  account: Account;
  onOpenPlans: () => void;
}) {
  const org = account.org;
  const [seats, setSeats] = useState(25);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <div className="hairline flex items-center gap-4 rounded-[10px] bg-card px-4 py-3.5">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-center gap-1.5 text-[14px] font-semibold text-foreground">
            {org ? "Enterprise" : "Pro"}
            <span className="rounded-[4px] bg-fill-strong px-1.5 py-px text-[10px] font-semibold tracking-wide text-foreground/80 uppercase">
              Active
            </span>
          </span>
          <span className="text-[13px] leading-snug text-muted-foreground">
            {org
              ? `${org.name} · 12 of ${seats} seats used · renews Sep 4, 2026`
              : "$8.49/month · renews Sep 4, 2026"}
          </span>
        </div>
        {!org && <GhostButton onClick={onOpenPlans}>Change plan</GhostButton>}
      </div>

      {org ? (
        <SettingsSection
          title="Organization billing"
          description="Invoices, payment method and tax details live in the admin portal."
        >
          <SettingsRow
            label="Seats"
            description={`$12/seat · billed monthly. 12 in use, ${seats - 12} spare.`}
            control={
              <div className="hairline flex items-center gap-1 rounded-[6px] bg-fill-hover px-1">
                <button
                  aria-label="Remove a seat"
                  disabled={seats <= 12}
                  onClick={() => setSeats((s) => Math.max(12, s - 1))}
                  className="flex h-6 w-6 items-center justify-center rounded-[4px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                >
                  <Minus className="h-3 w-3" strokeWidth={2.5} />
                </button>
                <span className="min-w-6 text-center text-[13px] font-medium tabular-nums">
                  {seats}
                </span>
                <button
                  aria-label="Add a seat"
                  onClick={() => setSeats((s) => s + 1)}
                  className="flex h-6 w-6 items-center justify-center rounded-[4px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Plus className="h-3 w-3" strokeWidth={2.5} />
                </button>
              </div>
            }
          />
          <SettingsRow
            label="Payment method"
            description="Visa •••• 5904 — expires 08/28"
            control={
              <GhostButton>
                <span className="flex items-center gap-1.5">
                  Update
                  <ExternalLink className="h-3 w-3" strokeWidth={2} />
                </span>
              </GhostButton>
            }
          />
          <SettingsRow
            label="Invoices"
            description="Download past receipts and tax details."
            last
            control={
              <GhostButton>
                <span className="flex items-center gap-1.5">
                  Open admin portal
                  <ExternalLink className="h-3 w-3" strokeWidth={2} />
                </span>
              </GhostButton>
            }
          />
        </SettingsSection>
      ) : (
        <>
          <SettingsSection
            title="Payment"
            description="Invoices, payment method and tax details open in your browser."
          >
            <SettingsRow
              label="Payment method"
              description="Visa •••• 5904 — expires 08/28"
              control={<GhostButton>Update</GhostButton>}
            />
            <SettingsRow
              label="Billing email"
              description="angel@example.com"
              control={<GhostButton>Change</GhostButton>}
            />
            <SettingsRow
              label="Invoices"
              description="Download past receipts and tax details."
              last
              control={
                <GhostButton>
                  <span className="flex items-center gap-1.5">
                    Open portal
                    <ExternalLink className="h-3 w-3" strokeWidth={2} />
                  </span>
                </GhostButton>
              }
            />
          </SettingsSection>

          <SettingsSection title="Subscription">
            <SettingsRow
              label="Cancel subscription"
              description={
                confirmingCancel
                  ? "You keep Pro until Sep 4, 2026, then drop to the free tier. Local models keep working."
                  : "Pro stays active until Sep 4, 2026."
              }
              last
              control={
                confirmingCancel ? (
                  <div className="flex items-center gap-1.5">
                    <GhostButton onClick={() => setConfirmingCancel(false)}>
                      Keep Pro
                    </GhostButton>
                    <button
                      onClick={() => setConfirmingCancel(false)}
                      className="rounded-[6px] bg-destructive/15 px-2.5 py-1 text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/25"
                    >
                      Confirm cancel
                    </button>
                  </div>
                ) : (
                  <GhostButton onClick={() => setConfirmingCancel(true)}>
                    Cancel
                  </GhostButton>
                )
              }
            />
          </SettingsSection>
        </>
      )}
    </div>
  );
}
