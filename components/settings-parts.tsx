import { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";

export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div className="hairline overflow-hidden rounded-[10px] bg-card">
        {children}
      </div>
    </section>
  );
}

export function SettingsRow({
  icon,
  label,
  description,
  control,
  last = false,
}: {
  icon?: ReactNode;
  label: ReactNode;
  description?: ReactNode;
  control: ReactNode;
  last?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 px-4 py-3.5">
        {icon && (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center text-muted-foreground">
            {icon}
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[13px] font-medium text-foreground">
            {label}
          </span>
          {description && (
            <span className="text-[12px] leading-snug text-muted-foreground">
              {description}
            </span>
          )}
        </div>
        <div className="shrink-0">{control}</div>
      </div>
      {!last && <Separator className="ml-4 bg-white/[0.06]" />}
    </div>
  );
}
