import { Cloud } from "lucide-react";

/**
 * Stand-in only: proves "Configure in Web" is a real link, not a dead
 * button. The dashboard itself — cloud/self-hosted picker, relay config,
 * org policy — is a separate surface and out of scope for this mockup.
 */
export default function SyncDashboardStub() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      <Cloud className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
      <p className="text-[15px] font-medium text-foreground">
        Superwhisper Web · Sync settings
      </p>
      <p className="max-w-[360px] text-[13px] leading-relaxed text-muted-foreground">
        Cloud vs. self-hosted, relay address, and org-wide sync policy would
        live here — one dashboard for every device on the account, not
        redesigned per OS. Not built out in this mockup.
      </p>
    </div>
  );
}
