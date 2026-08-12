import { Webhook } from "lucide-react";

/**
 * Stand-in only: proves "Configure in Web" is a real link, not a dead
 * button. The dashboard itself — endpoint URL, signing secret, retry
 * policy, delivery log — is a separate surface and out of scope here.
 */
export default function WebhooksDashboardStub() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      <Webhook className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
      <p className="text-[15px] font-medium text-foreground">
        Superwhisper Web · Webhook settings
      </p>
      <p className="max-w-[360px] text-[13px] leading-relaxed text-muted-foreground">
        Endpoint URL, signing secret, retry policy and delivery log would
        live here — one dashboard for every device on the account, not
        redesigned per OS. Not built out in this mockup.
      </p>
    </div>
  );
}
