"use client";

import { useState, useSyncExternalStore, useRef } from "react";
import { createPortal } from "react-dom";
import { Info, ChevronDown, ChevronRight, Check, Lock } from "lucide-react";
import { SettingsRow } from "@/components/settings-parts";
import { PopupButton } from "@/components/popup-button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ALL_LANGUAGES, FlagIcon } from "@/components/flags";
import { cn } from "@/lib/utils";
import { DARK_SCHEME } from "@/app/settings/data";
import type {
  Account,
  BaseSettings,
  ModeItem as ModeItemLike,
  SettingDef,
  SettingKey,
  ThemePref,
  WebhookEndpoint,
} from "@/app/settings/types";

/**
 * Formatted at render time rather than module scope: a long-lived dev server
 * would otherwise freeze the date at boot and desync from the client.
 */
export function formatDaysAgo(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatSettingValue(value: BaseSettings[SettingKey]): string {
  if (typeof value === "boolean") return value ? "On" : "Off";
  if (Array.isArray(value)) return value.join(", ");
  return value;
}

let modeIdCounter = 0;
export function nextModeId() {
  modeIdCounter += 1;
  return `new-mode-${modeIdCounter}`;
}

let vocabIdCounter = 0;
export function nextVocabId() {
  vocabIdCounter += 1;
  return `new-${vocabIdCounter}`;
}

let endpointIdCounter = 0;
export function nextEndpointId() {
  endpointIdCounter += 1;
  return `endpoint-${endpointIdCounter}`;
}

/** Owners and admins hold the payment relationship; members never do. */
export function canManageBilling(account: Account) {
  return account.kind === "individual" || account.org?.role !== "member";
}

export function subscribeToScheme(onChange: () => void) {
  const mq = window.matchMedia(DARK_SCHEME);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Resolves the Theme preference to an actual appearance. "auto" tracks the OS
 * setting live, the way a real Mac app would. The server snapshot is `false`
 * so the first paint matches the markup and hydration stays clean.
 */
export function useResolvedTheme(pref: ThemePref) {
  const systemDark = useSyncExternalStore(
    subscribeToScheme,
    () => window.matchMedia(DARK_SCHEME).matches,
    () => false,
  );

  if (pref === "light") return "light";
  if (pref === "dark") return "dark";
  return systemDark ? "dark" : "light";
}

export function InfoDot() {
  return (
    <Info
      className="ml-1 inline h-3 w-3 shrink-0 align-[-1px] text-muted-foreground/60"
      strokeWidth={2}
    />
  );
}

/**
 * macOS help tag: only meaningful while a rail is collapsed to icons.
 * Delayed so it doesn't flash as the pointer crosses the rail.
 */
export function HoverTip({ label }: { label: string }) {
  return (
    <span className="hairline pointer-events-none absolute left-full z-30 ml-2 whitespace-nowrap rounded-[6px] bg-popover px-2 py-1 text-[13px] font-medium text-popover-foreground opacity-0 shadow-[0_4px_12px_-2px_rgb(0_0_0/0.35)] transition-opacity delay-500 duration-100 group-hover:opacity-100">
      {label}
    </span>
  );
}

/**
 * A shortlist of languages beats both a fixed one (rigid) and "Automatic"
 * (unreliable): naming the two you actually speak narrows detection from a
 * hundred candidates to two. Flags stand in for the names — a glance at two
 * circles reads faster than "English, Spanish" does.
 *
 * The panel is portaled to #app-root (not document.body — that would
 * escape the .dark class the whole app's theme tokens are scoped under)
 * and positioned with a measured fixed rect instead of `absolute` in
 * normal flow: every settings row sits inside a SettingsSection card with
 * `overflow-hidden` (for the rounded corners), which would otherwise clip
 * the dropdown or bury it behind later cards in the same stack.
 */
export function LanguageSelect({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ top: number; right: number } | null>(
    null,
  );
  const buttonRef = useRef<HTMLButtonElement>(null);

  const openMenu = () => {
    const r = buttonRef.current?.getBoundingClientRect();
    if (r) setRect({ top: r.bottom + 6, right: window.innerWidth - r.right });
    setOpen(true);
  };

  const toggle = (lang: string) => {
    if (value.includes(lang)) {
      if (value.length > 1) onChange(value.filter((l) => l !== lang));
    } else {
      onChange([...value, lang]);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => (open ? setOpen(false) : openMenu())}
        className="hairline flex items-center gap-1 rounded-[7px] bg-fill px-2.5 py-1.5 transition-colors hover:bg-fill-hover"
      >
        {value.map((lang) => (
          <FlagIcon key={lang} lang={lang} />
        ))}
        <ChevronDown
          className="ml-0.5 h-3.5 w-3.5 text-muted-foreground"
          strokeWidth={2}
        />
      </button>

      {open &&
        rect &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[100]"
              onClick={() => setOpen(false)}
            />
            <div
              style={{ top: rect.top, right: rect.right }}
              className="hairline elevated-popover fixed z-[101] w-[200px] overflow-hidden rounded-[10px] bg-popover py-1"
            >
              {ALL_LANGUAGES.map((lang) => {
                const checked = value.includes(lang);
                return (
                  <button
                    key={lang}
                    onClick={() => toggle(lang)}
                    className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left transition-colors hover:bg-fill-hover"
                  >
                    <FlagIcon lang={lang} size={18} />
                    <span className="flex-1 text-[14px] text-foreground">
                      {lang}
                    </span>
                    {checked && (
                      <Check
                        className="h-3.5 w-3.5 text-primary"
                        strokeWidth={2.5}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </>,
          document.getElementById("app-root") ?? document.body,
        )}
    </>
  );
}

/** Renders whichever control a setting needs, for base and overrides alike.
 *  `endpoints` only matters for the "endpoint" kind — everything else
 *  ignores it, so callers that never touch webhooks can omit it. */
export function SettingControl({
  def,
  value,
  onChange,
  endpoints = [],
}: {
  def: SettingDef;
  value: BaseSettings[SettingKey];
  onChange: (next: BaseSettings[SettingKey]) => void;
  endpoints?: WebhookEndpoint[];
}) {
  if (def.kind === "languages") {
    return (
      <LanguageSelect
        value={value as string[]}
        onChange={(next) => onChange(next)}
      />
    );
  }
  if (def.kind === "switch") {
    return (
      <Switch
        size="sm"
        checked={(value as boolean) ?? false}
        onCheckedChange={(c) => onChange(c === true)}
      />
    );
  }
  if (def.kind === "endpoint") {
    return (
      <select
        value={(value as string) ?? "Off"}
        onChange={(e) => onChange(e.target.value)}
        className="hairline rounded-[6px] bg-fill-hover px-2.5 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-fill-strong focus:outline-none"
      >
        <option value="Off">Off</option>
        {endpoints.map((ep) => (
          <option key={ep.id} value={ep.label}>
            {ep.label}
          </option>
        ))}
      </select>
    );
  }
  return <PopupButton value={value as string} />;
}

/**
 * Every settings panel starts with a title — never with a loose paragraph
 * floating at the top with nothing labeling the page. The sidebar highlight
 * alone isn't enough once you're on a sub-page (Super, a mode, a plan list)
 * where nothing in the nav names where you actually are.
 */
export function PanelIntro({
  title,
  description,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <h1 className="text-[20px] font-bold tracking-tight text-foreground">
        {title}
      </h1>
      {description && (
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="hairline rounded-[5px] bg-fill-hover px-2 py-1 text-[12px] font-medium">
      {children}
    </kbd>
  );
}

export function GhostButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "hairline rounded-[6px] bg-fill-hover px-2.5 py-1 text-[13px] font-medium text-foreground transition-colors hover:bg-fill-strong",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** A row that navigates deeper, macOS-style: label left, chevron right. */
export function NavRow({
  label,
  onClick,
  last = true,
}: {
  label: string;
  onClick: () => void;
  last?: boolean;
}) {
  return (
    <SettingsRow
      label={label}
      last={last}
      control={
        <ChevronRight
          className="h-4 w-4 text-muted-foreground"
          strokeWidth={2}
        />
      }
      onClick={onClick}
    />
  );
}

/** Resolves a mode against the base — the same merge the app would do. */
export function resolveMode(base: BaseSettings, mode?: ModeItemLike): BaseSettings {
  return mode ? { ...base, ...mode.overrides } : base;
}

/**
 * Renders typed-in text under a given set of settings — reading the result
 * beats reading "Autocapitalize: On → Off". No sample ships baked in: this
 * only shows anything once someone actually types something to try.
 */
export function renderSample(settings: BaseSettings, text: string): string {
  let out = text;
  if (settings.removeFillers) {
    out = out.replace(/\b(um|eh)\s/gi, "");
  }
  if (settings.autocapitalize && out.length > 0) {
    out = out.charAt(0).toUpperCase() + out.slice(1);
    if (!/[.!?]$/.test(out)) out += ".";
  }
  return out;
}

export function SamplePreview({
  base,
  mode,
  previewText,
}: {
  base: BaseSettings;
  mode: ModeItemLike;
  previewText: string;
}) {
  if (previewText.trim() === "") return null;

  const withMode = renderSample(resolveMode(base, mode), previewText);
  const asSuper = renderSample(base, previewText);
  const identical = withMode === asSuper;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[16px] font-semibold text-foreground">
        How it comes out
      </h2>
      <div className="hairline overflow-hidden rounded-[10px] bg-card">
        <div className="flex flex-col gap-1.5 px-4 py-3">
          <span className="text-[12px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
            As Super
          </span>
          <p className="text-[14px] leading-relaxed text-muted-foreground italic">
            {asSuper}
          </p>
        </div>
        <Separator className="ml-4 bg-line" />
        <div className="flex flex-col gap-1.5 px-4 py-3">
          <span className="text-[12px] font-semibold tracking-wide text-primary uppercase">
            In this mode
          </span>
          <p className="text-[14px] leading-relaxed text-foreground italic">
            {withMode}
          </p>
        </div>
      </div>
      {identical && (
        <p className="text-[13px] text-muted-foreground">
          Same as Super — this mode&rsquo;s overrides don&rsquo;t change how the
          text reads.
        </p>
      )}
    </section>
  );
}

/** Wraps a control that an organization policy has frozen for this member. */
export function PolicyLocked({
  locked,
  children,
}: {
  locked: boolean;
  children: React.ReactNode;
}) {
  if (!locked) return <>{children}</>;
  return (
    <div
      className="flex items-center gap-1.5"
      title="Managed by your organization"
    >
      <Lock className="h-3 w-3 text-muted-foreground" strokeWidth={2} />
      <div className="pointer-events-none opacity-40">{children}</div>
    </div>
  );
}
