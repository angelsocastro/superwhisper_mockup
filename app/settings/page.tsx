"use client";

import { useState, useSyncExternalStore } from "react";
import {
  Home as HomeIcon,
  BookOpen,
  Keyboard,
  Settings as SettingsIcon,
  Volume2,
  BrainCircuit,
  History as HistoryIcon,
  Cloud,
  Sparkles,
  GripVertical,
  ChevronUp,
  Check,
  Lock,
  EyeOff,
  X,
  ChevronRight,
  Search,
  SlidersHorizontal,
  KeyRound,
  Star,
  Download,
  AlignLeft,
  AudioLines,
  PanelLeft,
  Headphones,
  Share,
  RotateCcw,
  Plus,
  Trash2,
  Pencil,
  Info,
  Upload,
  Map,
  Mail,
  Globe,
  MessageCircle,
  Lightbulb,
  Asterisk,
  Type,
  CircleCheck,
  Circle,
  ChevronDown,
  Building2,
  Minus,
  Laptop,
  Monitor,
  Smartphone,
  CircleUser,
  CreditCard,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { MacWindow, TrafficLights } from "@/components/mac-window";
import { SettingsWindow, type SettingsTab } from "@/components/settings-window";
import { DetailModal } from "@/components/detail-modal";
import { SettingsSection, SettingsRow } from "@/components/settings-parts";
import { InlineEdit } from "@/components/inline-edit";
import { PopupButton } from "@/components/popup-button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { SegmentedControl } from "@/components/segmented-control";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                    data                                     */
/* -------------------------------------------------------------------------- */

type WhatsNewItem = {
  id: string;
  /** Days before today, so the mockup never shows a stale release date. */
  daysAgo: number;
  title: string;
  summary: string;
  body: string;
};

/**
 * Formatted at render time rather than module scope: a long-lived dev server
 * would otherwise freeze the date at boot and desync from the client.
 */
function formatDaysAgo(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const WHATS_NEW_SEED: WhatsNewItem[] = [
  {
    id: "s1-voice",
    daysAgo: 4,
    title: "S1 Voice & Language",
    summary: "Our fastest cloud model yet.",
    body: "S1 Voice is built and hosted by Superwhisper — it's our fastest cloud model yet, with native support for 40+ languages and automatic language detection mid-sentence.",
  },
  {
    id: "vocab-sync",
    daysAgo: 23,
    title: "Vocabulary sync",
    summary: "Your words now sync everywhere.",
    body: "Custom vocabulary and text replacements now sync automatically across every Mac and iPhone signed into your Superwhisper account.",
  },
];

/* --- Super is the base. A mode is a diff against it, never a full config. --- */

const ALL_LANGUAGES = [
  "English",
  "Spanish",
  "German",
  "French",
  "Portuguese",
  "Dutch",
  "Italian",
  "Japanese",
  "Chinese",
];

type BaseSettings = {
  languages: string[];
  autocapitalize: boolean;
  removeFillers: boolean;
  pasteResult: boolean;
  autoSend: boolean;
  clipboard: string;
  simulateKeypresses: boolean;
  systemAudio: boolean;
  identifySpeakers: boolean;
  saveAudio: boolean;
  saveToHistory: boolean;
  copyToClipboard: boolean;
  voiceModel: string;
  languageModel: string;
  playback: string;
};

const BASE_DEFAULTS: BaseSettings = {
  languages: ["Spanish", "English"],
  autocapitalize: true,
  removeFillers: true,
  pasteResult: true,
  autoSend: false,
  clipboard: "Default",
  simulateKeypresses: false,
  systemAudio: false,
  identifySpeakers: false,
  saveAudio: true,
  saveToHistory: true,
  copyToClipboard: true,
  voiceModel: "S1-Voice",
  languageModel: "Sonnet 4.5",
  playback: "Pause",
};

type SettingKey = keyof BaseSettings;

type SettingDef = {
  key: SettingKey;
  label: string;
  group: string;
  kind: "switch" | "choice" | "languages";
  choices?: string[];
};

/** Every setting is overridable by construction — which is what stops
 *  "make X per-mode" from being a feature request nine times over. */
const SETTING_DEFS: SettingDef[] = [
  { key: "languages", label: "Languages", group: "Language", kind: "languages" },
  { key: "autocapitalize", label: "Autocapitalize", group: "Formatting", kind: "switch" },
  { key: "removeFillers", label: "Remove filler words", group: "Formatting", kind: "switch" },
  { key: "pasteResult", label: "Paste result text", group: "Output", kind: "switch" },
  { key: "autoSend", label: "Hold shift to auto-send", group: "Output", kind: "switch" },
  { key: "clipboard", label: "Clipboard behaviour", group: "Output", kind: "choice", choices: ["Default", "Preserve", "Skip"] },
  { key: "simulateKeypresses", label: "Simulate keypresses", group: "Output", kind: "switch" },
  { key: "systemAudio", label: "Record from system audio", group: "Capture", kind: "switch" },
  { key: "identifySpeakers", label: "Identify speakers", group: "Capture", kind: "switch" },
  { key: "playback", label: "Playback when recording", group: "Capture", kind: "choice", choices: ["Pause", "Mute", "Keep playing"] },
  { key: "saveAudio", label: "Save audio recordings", group: "Privacy", kind: "switch" },
  { key: "saveToHistory", label: "Save to history", group: "Privacy", kind: "switch" },
  { key: "copyToClipboard", label: "Copy result to clipboard", group: "Privacy", kind: "switch" },
  { key: "voiceModel", label: "Voice model", group: "Models", kind: "choice", choices: ["S1-Voice", "Cohere Transcribe", "Nova 3"] },
  { key: "languageModel", label: "Language model", group: "Models", kind: "choice", choices: ["Sonnet 4.5", "Haiku 4.5", "S1-Language"] },
];

function formatSettingValue(value: BaseSettings[SettingKey]): string {
  if (typeof value === "boolean") return value ? "On" : "Off";
  if (Array.isArray(value)) return value.join(", ");
  return value;
}

type ModeItem = {
  id: string;
  name: string;
  apps: string[];
  /** Only what this mode changes. Anything absent follows Super. */
  overrides: Partial<BaseSettings>;
  active?: boolean;
};

const MODES_SEED: ModeItem[] = [
  {
    id: "email",
    name: "Email",
    apps: ["Mail", "Spark"],
    overrides: { languages: ["English"], autoSend: true },
  },
  {
    id: "meetings",
    name: "Meetings",
    apps: ["Zoom"],
    overrides: { systemAudio: true, identifySpeakers: true, pasteResult: false },
  },
];

type Provider = "sw" | "anthropic" | "cohere" | "deepgram";

const PROVIDER_STYLE: Record<Provider, { label: string; className: string }> = {
  sw: { label: "S", className: "bg-white text-black" },
  anthropic: { label: "A", className: "bg-[#d4a27f] text-[#2b1a10]" },
  cohere: {
    label: "C",
    className:
      "bg-gradient-to-br from-[#39c5a0] via-[#a78bfa] to-[#f472b6] text-white",
  },
  deepgram: { label: "D", className: "bg-[#e8443a] text-white" },
};

type ModelRow = {
  id: string;
  name: string;
  provider: Provider;
  kind: "language" | "voice";
  speed: number;
  size?: string;
  isNew?: boolean;
};

const MODEL_LIBRARY: ModelRow[] = [
  {
    id: "s1-language",
    name: "S1-Language",
    provider: "sw",
    kind: "language",
    speed: 5,
    isNew: true,
  },
  {
    id: "s1-mini",
    name: "S1-Mini",
    provider: "sw",
    kind: "language",
    speed: 4,
    size: "462 MB",
  },
  {
    id: "s1-voice",
    name: "S1-Voice",
    provider: "sw",
    kind: "voice",
    speed: 5,
    isNew: true,
  },
  {
    id: "haiku",
    name: "Haiku 4.5",
    provider: "anthropic",
    kind: "language",
    speed: 5,
  },
  {
    id: "sonnet45",
    name: "Sonnet 4.5",
    provider: "anthropic",
    kind: "language",
    speed: 4,
  },
  {
    id: "sonnet46",
    name: "Sonnet 4.6",
    provider: "anthropic",
    kind: "language",
    speed: 4,
  },
  {
    id: "sonnet5",
    name: "Sonnet 5",
    provider: "anthropic",
    kind: "language",
    speed: 5,
  },
  {
    id: "cohere",
    name: "Cohere Transcribe",
    provider: "cohere",
    kind: "voice",
    speed: 4,
    size: "1.3 GB",
  },
  {
    id: "nova2",
    name: "Nova 2",
    provider: "deepgram",
    kind: "voice",
    speed: 3,
  },
  {
    id: "nova3",
    name: "Nova 3",
    provider: "deepgram",
    kind: "voice",
    speed: 4,
  },
  {
    id: "nova-medical",
    name: "Nova Medical",
    provider: "deepgram",
    kind: "voice",
    speed: 3,
  },
];

const HISTORY_GROUPS: { label: string; items: string[] }[] = [
  {
    label: "Today",
    items: [
      "Remind the team the deploy is at 4pm.",
      "Draft a reply saying I'll follow up tomorrow.",
      "Add a section about pricing to the proposal and keep the tone friendly.",
    ],
  },
  {
    label: "Yesterday",
    items: [
      "Add oat milk and coffee to the grocery list.",
      "Tell Marta I'm running ten minutes late.",
    ],
  },
];

type ThemePref = "auto" | "light" | "dark";

const DARK_SCHEME = "(prefers-color-scheme: dark)";

function subscribeToScheme(onChange: () => void) {
  const mq = window.matchMedia(DARK_SCHEME);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Resolves the Theme preference to an actual appearance. "auto" tracks the OS
 * setting live, the way a real Mac app would. The server snapshot is `false`
 * so the first paint matches the markup and hydration stays clean.
 */
function useResolvedTheme(pref: ThemePref) {
  const systemDark = useSyncExternalStore(
    subscribeToScheme,
    () => window.matchMedia(DARK_SCHEME).matches,
    () => false,
  );

  if (pref === "light") return "light";
  if (pref === "dark") return "dark";
  return systemDark ? "dark" : "light";
}

type DailyKey = "home" | "vocabulary";
type SettingsKey =
  | "account"
  | "billing"
  | "general"
  | "dictation"
  | "shortcuts"
  | "sound"
  | "privacy"
  | "models"
  | "modes";
/**
 * How the signed-in account was provisioned. Not a user preference — it follows
 * from how they authenticated, so the app only reads it.
 */
type AccountKind = "individual" | "org";
/** Only owners and admins can act on the organization's subscription. */
type OrgRole = "owner" | "admin" | "member";

type Account = {
  kind: AccountKind;
  email: string;
  /** Present when kind === "org". */
  org?: { name: string; role: OrgRole };
};

/** Stand-in for whatever the session endpoint returns. */
const ACCOUNTS: Record<string, Account> = {
  individual: { kind: "individual", email: "angel@example.com" },
  member: {
    kind: "org",
    email: "angel@acme.com",
    org: { name: "Acme Inc", role: "member" },
  },
  admin: {
    kind: "org",
    email: "angel@acme.com",
    org: { name: "Acme Inc", role: "admin" },
  },
};

type DeviceItem = {
  id: string;
  name: string;
  detail: string;
  icon: LucideIcon;
  current?: boolean;
};

const DEVICES_SEED: DeviceItem[] = [
  {
    id: "mbp",
    name: "MacBook Pro",
    detail: "Signed in Feb 12, 2026 · active now",
    icon: Laptop,
    current: true,
  },
  {
    id: "imac",
    name: "iMac",
    detail: "Signed in Nov 3, 2025 · last used 6 days ago",
    icon: Monitor,
  },
  {
    id: "iphone",
    name: "iPhone 17 Pro",
    detail: "Signed in Jan 8, 2026 · last used yesterday",
    icon: Smartphone,
  },
];

const ROLE_LABEL: Record<OrgRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

/** Owners and admins hold the payment relationship; members never do. */
function canManageBilling(account: Account) {
  return account.kind === "individual" || account.org?.role !== "member";
}

const ACCOUNT_FIXTURES: { key: string; label: string }[] = [
  { key: "individual", label: "Personal" },
  { key: "member", label: "Org · Member" },
  { key: "admin", label: "Org · Admin" },
];

/**
 * Mockup-only chrome that sits outside the app window: swaps the signed-in
 * account so all three sign-in shapes can be reviewed. Not part of the design.
 */
function AccountFixtureSwitcher({
  value,
  onChange,
}: {
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="fixed top-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/70 px-2 py-1.5 backdrop-blur-md">
      <span className="pl-1.5 text-[10px] font-medium tracking-wide text-white/40 uppercase">
        Signed in as
      </span>
      {ACCOUNT_FIXTURES.map((f) => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
            value === f.key
              ? "bg-white text-black"
              : "text-white/60 hover:bg-white/10 hover:text-white",
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
type Subpage =
  | { kind: "system" }
  | { kind: "plans" }
  | { kind: "modeDetail"; modeId: string }
  | null;

const DAILY_USE: { key: DailyKey; label: string; icon: LucideIcon }[] = [
  { key: "home", label: "Home", icon: HomeIcon },
  { key: "vocabulary", label: "Vocabulary", icon: BookOpen },
];

const SETTINGS_TABS: (SettingsTab & { key: SettingsKey })[] = [
  { key: "account", label: "Account", icon: CircleUser, group: 0 },
  { key: "billing", label: "Billing", icon: CreditCard, group: 0 },
  { key: "general", label: "General", icon: SettingsIcon, group: 1 },
  { key: "dictation", label: "Dictation", icon: Type, group: 1 },
  { key: "shortcuts", label: "Shortcuts", icon: Keyboard, group: 1 },
  { key: "sound", label: "Sound", icon: Volume2, group: 1 },
  { key: "privacy", label: "Privacy", icon: Lock, group: 1 },
  { key: "models", label: "Models", icon: BrainCircuit, group: 2 },
  { key: "modes", label: "Modes", icon: Sparkles, group: 2 },
];

/* -------------------------------------------------------------------------- */
/*                                shared bits                                  */
/* -------------------------------------------------------------------------- */

function InfoDot() {
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
function HoverTip({ label }: { label: string }) {
  return (
    <span className="hairline pointer-events-none absolute left-full z-30 ml-2 whitespace-nowrap rounded-[6px] bg-popover px-2 py-1 text-[12px] font-medium text-popover-foreground opacity-0 shadow-[0_4px_12px_-2px_rgb(0_0_0/0.35)] transition-opacity delay-500 duration-100 group-hover:opacity-100">
      {label}
    </span>
  );
}

/**
 * A shortlist of languages beats both a fixed one (rigid) and "Automatic"
 * (unreliable): naming the two you actually speak narrows detection from a
 * hundred candidates to two.
 */
function LanguageChips({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const available = ALL_LANGUAGES.filter((l) => !value.includes(l));

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {value.map((lang) => (
        <span
          key={lang}
          className="hairline flex items-center gap-1 rounded-[6px] bg-fill-hover py-1 pr-1 pl-2 text-[12px] font-medium text-foreground"
        >
          {lang}
          {value.length > 1 && (
            <button
              onClick={() => onChange(value.filter((l) => l !== lang))}
              aria-label={`Remove ${lang}`}
              className="flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-fill-strong hover:text-foreground"
            >
              <X className="h-3 w-3" strokeWidth={2.5} />
            </button>
          )}
        </span>
      ))}

      {adding && available.length > 0 ? (
        <span className="hairline flex flex-wrap items-center gap-1 rounded-[6px] bg-card p-1">
          {available.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                onChange([...value, lang]);
                setAdding(false);
              }}
              className="rounded-[4px] px-1.5 py-0.5 text-[12px] text-foreground/85 transition-colors hover:bg-fill-hover"
            >
              {lang}
            </button>
          ))}
        </span>
      ) : (
        available.length > 0 && (
          <button
            onClick={() => setAdding(true)}
            className="hairline flex items-center gap-1 rounded-[6px] bg-fill px-2 py-1 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
          >
            <Plus className="h-3 w-3" strokeWidth={2.5} />
            Add
          </button>
        )
      )}
    </div>
  );
}

/** Renders whichever control a setting needs, for base and overrides alike. */
function SettingControl({
  def,
  value,
  onChange,
}: {
  def: SettingDef;
  value: BaseSettings[SettingKey];
  onChange: (next: BaseSettings[SettingKey]) => void;
}) {
  if (def.kind === "languages") {
    return (
      <LanguageChips
        value={value as string[]}
        onChange={(next) => onChange(next)}
      />
    );
  }
  if (def.kind === "switch") {
    return (
      <Switch
        size="sm"
        checked={value as boolean}
        onCheckedChange={(c) => onChange(c === true)}
      />
    );
  }
  return <PopupButton value={value as string} />;
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="hairline rounded-[5px] bg-fill-hover px-2 py-1 text-[11px] font-medium">
      {children}
    </kbd>
  );
}

function GhostButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="hairline rounded-[6px] bg-fill-hover px-2.5 py-1 text-[12px] font-medium text-foreground transition-colors hover:bg-fill-strong"
    >
      {children}
    </button>
  );
}

/** A row that navigates deeper, macOS-style: label left, chevron right. */
function NavRow({
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

/* -------------------------------------------------------------------------- */
/*                                  sidebar                                    */
/* -------------------------------------------------------------------------- */

function WhatsNewStack({
  items,
  onOpen,
}: {
  items: WhatsNewItem[];
  onOpen: (item: WhatsNewItem) => void;
}) {
  if (items.length === 0) return null;
  const visible = items.slice(0, 3);
  const OFFSET = 7;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 px-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
        <Sparkles className="h-3 w-3" strokeWidth={2} />
        What&rsquo;s new
      </span>
      <div
        className="relative"
        style={{ height: `${48 + (visible.length - 1) * OFFSET}px` }}
      >
        {visible.map((item, i) => (
          <button
            key={item.id}
            onClick={() => i === 0 && onOpen(item)}
            aria-hidden={i !== 0}
            tabIndex={i === 0 ? 0 : -1}
            className={cn(
              "hairline absolute flex flex-col gap-0.5 rounded-[8px] bg-raised px-2.5 py-2 text-left shadow-[0_8px_18px_-6px_rgb(0_0_0/0.55)] transition-all duration-300 ease-out",
              i === 0
                ? "cursor-pointer hover:bg-raised-hover"
                : "pointer-events-none",
            )}
            style={{
              top: `${i * OFFSET}px`,
              left: `${i * 5}px`,
              right: `${i * 5}px`,
              zIndex: visible.length - i,
              opacity: 1 - i * 0.3,
              transform: `scale(${1 - i * 0.035})`,
            }}
          >
            <span className="text-[10px] font-medium text-muted-foreground">
              {formatDaysAgo(item.daysAgo)}
            </span>
            <span className="text-[12px] leading-snug font-medium text-foreground/90">
              {item.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DailyNav({
  active,
  onSelect,
  onOpenSettings,
  onOpenAccount,
  whatsNew,
  onOpenWhatsNew,
  collapsed,
  onToggleCollapsed,
}: {
  active: DailyKey;
  onSelect: (key: DailyKey) => void;
  onOpenSettings: () => void;
  onOpenAccount: () => void;
  whatsNew: WhatsNewItem[];
  onOpenWhatsNew: (item: WhatsNewItem) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const collapseButton = (
    <button
      onClick={onToggleCollapsed}
      aria-label="Toggle sidebar"
      className="group relative flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
    >
      <PanelLeft className="h-[16px] w-[16px]" strokeWidth={2} />
      {collapsed && <HoverTip label="Show sidebar" />}
    </button>
  );

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col pb-1 transition-[width] duration-200 ease-out",
        collapsed ? "w-[68px] items-center px-2" : "w-[230px] px-2",
      )}
    >
      {/* The traffic lights are pinned to the window's top-left by macOS, so
          this column has to absorb them — which is what frees the content
          pane to run flush to the top on the right. */}
      <div
        className={cn(
          "flex h-11 shrink-0 items-center",
          collapsed ? "w-full justify-center" : "w-full gap-3 px-1.5",
        )}
      >
        <TrafficLights />
        {!collapsed && collapseButton}
      </div>

      {collapsed && <div className="mb-1">{collapseButton}</div>}

      <div className="flex w-full flex-col gap-1">
        {DAILY_USE.map((item) => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={cn(
              "group relative flex items-center rounded-[7px] py-1.5 text-left text-[13px] font-medium transition-colors",
              collapsed ? "justify-center px-0" : "gap-2.5 px-2",
              active === item.key
                ? "bg-fill-strong text-foreground"
                : "text-foreground/80 hover:bg-fill-hover",
            )}
          >
            <item.icon className="h-[17px] w-[17px] shrink-0" strokeWidth={2} />
            {collapsed ? <HoverTip label={item.label} /> : item.label}
          </button>
        ))}
      </div>

      <div className="mt-auto flex w-full flex-col gap-4">
        {!collapsed && (
          <WhatsNewStack items={whatsNew} onOpen={onOpenWhatsNew} />
        )}

        <div
          className={cn(
            "flex items-center border-t border-line pt-4",
            collapsed ? "flex-col gap-2" : "gap-2",
          )}
        >
          <button
            onClick={onOpenAccount}
            aria-label={collapsed ? "Account" : undefined}
            className={cn(
              "group relative flex items-center rounded-[6px] py-1 text-left transition-colors hover:bg-fill-hover",
              collapsed ? "justify-center px-1" : "min-w-0 flex-1 gap-2 px-1",
            )}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-fill-hover text-[11px] font-semibold">
              A
            </div>
            {collapsed ? (
              <HoverTip label="Superwhisper PRO" />
            ) : (
              <span className="truncate text-[12px] font-medium text-foreground/80">
                Superwhisper <span className="text-muted-foreground">PRO</span>
              </span>
            )}
          </button>
          <button
            onClick={onOpenSettings}
            aria-label="Open Settings"
            className="group relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
          >
            <SettingsIcon className="h-[15px] w-[15px]" strokeWidth={2} />
            {collapsed && <HoverTip label="Settings" />}
          </button>
        </div>
      </div>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 setup guide                                 */
/* -------------------------------------------------------------------------- */

type SetupTask = { id: string; label: string; done: boolean };

const SETUP_SEED: SetupTask[] = [
  { id: "record", label: "Try your first dictation", done: true },
  { id: "language", label: "Pick your language", done: true },
  { id: "shortcuts", label: "Customize your shortcuts", done: false },
  { id: "vocabulary", label: "Add a word to your vocabulary", done: false },
];

function SetupGuide({
  tasks,
  onToggle,
  onClose,
}: {
  tasks: SetupTask[];
  onToggle: (id: string) => void;
  onClose: () => void;
}) {
  const done = tasks.filter((t) => t.done).length;
  const pct = Math.round((done / tasks.length) * 100);
  const allDone = done === tasks.length;

  return (
    <div className="hairline absolute right-3 bottom-11 z-30 w-[286px] overflow-hidden rounded-[10px] bg-popover shadow-[0_20px_44px_-12px_rgb(0_0_0/0.5)]">
      <div className="flex items-center gap-1 px-3.5 pt-3">
        <span className="flex-1 text-[13px] font-semibold text-foreground">
          Setup guide
        </span>
        <button
          onClick={onClose}
          aria-label="Close setup guide"
          className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
        >
          <X className="h-[15px] w-[15px]" strokeWidth={2} />
        </button>
      </div>

      <div className="flex items-center gap-2 px-3.5 pt-2 pb-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-fill-strong">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="shrink-0 text-[11px] font-medium text-muted-foreground tabular-nums">
          {done}/{tasks.length}
        </span>
      </div>

      <div className="flex flex-col pb-2">
          {allDone && (
            <p className="px-3.5 pb-2 text-[12px] leading-relaxed text-muted-foreground">
              That&rsquo;s everything — you&rsquo;re set up.
            </p>
          )}
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => onToggle(task.id)}
              className="flex items-center gap-2.5 px-3.5 py-1.5 text-left transition-colors hover:bg-fill"
            >
              {task.done ? (
                <CircleCheck
                  className="h-4 w-4 shrink-0 text-primary"
                  strokeWidth={2}
                />
              ) : (
                <Circle
                  className="h-4 w-4 shrink-0 text-muted-foreground/50"
                  strokeWidth={2}
                />
              )}
              <span
                className={cn(
                  "text-[13px]",
                  task.done
                    ? "text-muted-foreground line-through"
                    : "text-foreground",
                )}
              >
                {task.label}
              </span>
            </button>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Home                                     */
/* -------------------------------------------------------------------------- */

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[20px] font-semibold tracking-tight text-foreground">
        {value}
      </span>
      <span className="text-[12px] text-muted-foreground">{label}</span>
    </div>
  );
}

function LocalModelBanner({ onOpenModels }: { onOpenModels: () => void }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="hairline relative flex h-[128px] items-end overflow-hidden rounded-[14px]">
      {/* dusk-mountain-style photographic background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#4c3966] via-[#9c5877] to-[#d68f5c]" />
      <div
        className="absolute inset-x-0 bottom-0 h-[70%] bg-[#2f2242]/80"
        style={{
          clipPath:
            "polygon(0% 100%, 0% 55%, 18% 32%, 34% 52%, 50% 15%, 66% 46%, 82% 28%, 100% 48%, 100% 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[45%] bg-[#1c1428]/85"
        style={{
          clipPath:
            "polygon(0% 100%, 0% 70%, 22% 48%, 42% 66%, 58% 34%, 74% 58%, 90% 40%, 100% 62%, 100% 100%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2} />
      </button>

      <div className="relative z-10 flex w-full items-center justify-between gap-4 px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-white/70 uppercase">
            <Lock className="h-3 w-3" strokeWidth={2} />
            Private by design
          </span>
          <p className="text-[15px] font-semibold text-white">
            Nothing leaves your Mac.
          </p>
        </div>
        <button
          onClick={onOpenModels}
          className="shrink-0 rounded-full bg-white/15 px-3.5 py-1.5 text-[12px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25"
        >
          Switch model →
        </button>
      </div>
    </div>
  );
}

function HomePanel({ onOpenModels }: { onOpenModels: () => void }) {
  const [query, setQuery] = useState("");

  const groups = HISTORY_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((t) =>
      t.toLowerCase().includes(query.trim().toLowerCase()),
    ),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <PopupButton value="All time" />
          <button
            aria-label="Export stats"
            className="flex h-6 w-6 items-center justify-center rounded-[6px] text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
          >
            <Share className="h-[15px] w-[15px]" strokeWidth={2} />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-6">
          <StatTile value="84 WPM" label="Average speed" />
          <StatTile value="8,637" label="Words" />
          <StatTile value="6" label="Apps used" />
          <StatTile value="1 hour" label="Saved all time" />
        </div>
      </section>

      <LocalModelBanner onOpenModels={onOpenModels} />

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="flex shrink-0 items-center gap-2 text-[15px] font-semibold text-foreground">
            <HistoryIcon
              className="h-4 w-4 text-muted-foreground"
              strokeWidth={2}
            />
            History
          </h2>
          <div className="hairline flex min-w-0 flex-1 items-center gap-2 rounded-[7px] bg-fill px-2.5 py-1.5">
            <Search
              className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
              strokeWidth={2}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search history"
              className="min-w-0 flex-1 bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="hairline rounded-[10px] bg-card px-4 py-6 text-center text-[12px] text-muted-foreground">
            No dictations match &ldquo;{query}&rdquo;.
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
                {group.label}
              </span>
              <div className="flex flex-col gap-1.5">
                {group.items.map((text) => (
                  <div
                    key={text}
                    className="hairline rounded-[9px] bg-card px-3.5 py-2.5 text-[13px] leading-snug text-foreground/90"
                  >
                    {text}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Vocabulary                                  */
/* -------------------------------------------------------------------------- */

type VocabEntry = { id: string; word: string; to?: string };

let vocabIdCounter = 0;
function nextVocabId() {
  vocabIdCounter += 1;
  return `new-${vocabIdCounter}`;
}

function VocabularyPanel() {
  const [entries, setEntries] = useState<VocabEntry[]>([
    { id: "seed-call", word: "call" },
    { id: "seed-controll", word: "controll" },
    { id: "seed-json", word: "json" },
    { id: "seed-jsons", word: "jsons" },
    { id: "seed-livekit", word: "livekit" },
    { id: "seed-mockups", word: "mockups" },
    { id: "seed-super-whisper", word: "super whisper", to: "Superwhisper" },
    { id: "seed-superwhisper", word: "Superwhisper" },
    { id: "seed-telnyx", word: "telnyx" },
  ]);
  const [draft, setDraft] = useState("");
  const [replacementDraft, setReplacementDraft] = useState<string | null>(null);

  const addWord = () => {
    const word = draft.trim();
    if (!word) return;
    setEntries((prev) => [{ id: nextVocabId(), word }, ...prev]);
    setDraft("");
    setReplacementDraft(null);
  };

  const addReplacement = () => {
    const word = draft.trim();
    const to = (replacementDraft ?? "").trim();
    if (!word || !to) return;
    setEntries((prev) => [{ id: nextVocabId(), word, to }, ...prev]);
    setDraft("");
    setReplacementDraft(null);
  };

  const updateWord = (id: string, word: string) =>
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, word } : e)));

  const updateTarget = (id: string, to: string) =>
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, to } : e)));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[15px] font-semibold text-foreground">
            Vocabulary
          </h2>
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            Add names, jargon, or shorthand — plain words are recognized as-is,
            and words with an arrow are expanded automatically as you dictate.
            Click any entry to edit it in place.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            aria-label="Import list"
            title="Import list"
            className="flex h-7 w-7 items-center justify-center rounded-[6px] text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
          >
            <Upload className="h-[15px] w-[15px]" strokeWidth={2} />
          </button>
          <button
            aria-label="Export list"
            title="Export list"
            className="flex h-7 w-7 items-center justify-center rounded-[6px] text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
          >
            <Share className="h-[15px] w-[15px]" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="hairline overflow-hidden rounded-[10px] bg-card">
        <div className="hairline-b flex flex-col gap-2 px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                if (replacementDraft !== null) addReplacement();
                else addWord();
              }}
              placeholder="New word or replacement"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              onClick={addWord}
              disabled={!draft.trim()}
              className="shrink-0 text-[12px] font-medium text-primary hover:brightness-125 disabled:pointer-events-none disabled:opacity-40"
            >
              Add word
            </button>
          </div>

          {replacementDraft === null ? (
            <button
              onClick={() => setReplacementDraft("")}
              disabled={!draft.trim()}
              className="self-start text-[12px] font-medium text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              + Add as a replacement instead
            </button>
          ) : (
            <div className="flex items-center gap-2 pl-1">
              <span className="text-[12px] text-muted-foreground">→</span>
              <input
                autoFocus
                value={replacementDraft}
                onChange={(e) => setReplacementDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addReplacement();
                  if (e.key === "Escape") setReplacementDraft(null);
                }}
                placeholder="Replace with…"
                className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                onClick={addReplacement}
                disabled={!draft.trim() || !replacementDraft.trim()}
                className="shrink-0 text-[12px] font-medium text-primary hover:brightness-125 disabled:pointer-events-none disabled:opacity-40"
              >
                Add
              </button>
              <button
                onClick={() => setReplacementDraft(null)}
                className="shrink-0 text-[12px] font-medium text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {entries.length === 0 && (
          <div className="px-4 py-6 text-center text-[12px] text-muted-foreground">
            No words yet.
          </div>
        )}
        {entries.map((entry, i) => (
          <SettingsRow
            key={entry.id}
            label={
              <InlineEdit
                value={entry.word}
                onChange={(word) => updateWord(entry.id, word)}
              />
            }
            description={
              entry.to !== undefined ? (
                <span className="flex items-center gap-1">
                  →
                  <InlineEdit
                    value={entry.to}
                    onChange={(to) => updateTarget(entry.id, to)}
                  />
                </span>
              ) : undefined
            }
            last={i === entries.length - 1}
            control={
              <button
                onClick={() =>
                  setEntries((prev) => prev.filter((e) => e.id !== entry.id))
                }
                className="text-[12px] font-medium text-muted-foreground hover:text-foreground"
              >
                Remove
              </button>
            }
          />
        ))}
      </div>
    </div>
  );
}

const DAILY_PANELS: Record<
  DailyKey,
  (props: { onOpenModels: () => void }) => React.ReactNode
> = {
  home: HomePanel,
  vocabulary: VocabularyPanel,
};

/* -------------------------------------------------------------------------- */
/*                              appearance swatches                            */
/* -------------------------------------------------------------------------- */

const THEME_BACKGROUNDS: Record<string, string> = {
  auto: "bg-gradient-to-br from-[#1b2a52] via-[#3454a8] to-[#dfe6f5]",
  light: "bg-gradient-to-br from-[#bcd3f5] via-[#e3ecfb] to-[#f8fafd]",
  dark: "bg-gradient-to-br from-[#0a0e1f] via-[#141b36] to-[#242f57]",
};

function OptionSwatch({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5">
      <div
        className={cn(
          "relative flex h-12 w-[72px] items-start justify-end overflow-hidden rounded-[8px] p-1 transition-shadow",
          active && "ring-2 ring-primary ring-offset-2 ring-offset-card",
        )}
      >
        {children}
      </div>
      <span
        className={cn(
          "text-[11px] font-medium",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </button>
  );
}

function ThemeSwatch({
  value,
  active,
  onClick,
}: {
  value: "auto" | "light" | "dark";
  active: boolean;
  onClick: () => void;
}) {
  const labels: Record<string, string> = {
    auto: "Auto",
    light: "Light",
    dark: "Dark",
  };
  return (
    <OptionSwatch active={active} onClick={onClick} label={labels[value]}>
      <div className={cn("absolute inset-0", THEME_BACKGROUNDS[value])} />
      <div className="relative flex h-5 w-11 flex-col overflow-hidden rounded-[3px] bg-white shadow-[0_2px_6px_rgb(0_0_0/0.35)]">
        <div className="flex items-center gap-[2px] bg-black/[0.06] px-[3px] py-[2px]">
          <span className="h-[3px] w-[3px] rounded-full bg-[#ff5f57]" />
          <span className="h-[3px] w-[3px] rounded-full bg-[#febc2e]" />
          <span className="h-[3px] w-[3px] rounded-full bg-[#28c840]" />
        </div>
      </div>
    </OptionSwatch>
  );
}

function RecordingWindowSwatch({
  value,
  active,
  onClick,
}: {
  value: "classic" | "mini" | "none";
  active: boolean;
  onClick: () => void;
}) {
  const labels: Record<string, string> = {
    classic: "Classic",
    mini: "Mini",
    none: "None",
  };
  return (
    <OptionSwatch active={active} onClick={onClick} label={labels[value]}>
      <div className="absolute inset-0 flex items-center justify-center bg-[#161616]">
        {value === "classic" && (
          <div className="flex items-center gap-[2px]">
            {[5, 9, 4, 11, 6, 9, 4].map((h, i) => (
              <span
                key={i}
                className="w-[2px] rounded-full bg-white/70"
                style={{ height: h }}
              />
            ))}
          </div>
        )}
        {value === "mini" && (
          <div className="flex items-center gap-[3px] rounded-full bg-white/10 px-2.5 py-1.5">
            {[3, 5, 3].map((h, i) => (
              <span
                key={i}
                className="w-[2px] rounded-full bg-white/70"
                style={{ height: h }}
              />
            ))}
          </div>
        )}
        {value === "none" && (
          <EyeOff className="h-3.5 w-3.5 text-white/40" strokeWidth={2} />
        )}
      </div>
    </OptionSwatch>
  );
}

/* -------------------------------------------------------------------------- */
/*                              settings: General                              */
/* -------------------------------------------------------------------------- */

function GeneralPanel({
  onOpenSystem,
  theme,
  setTheme,
}: {
  onOpenSystem: () => void;
  theme: ThemePref;
  setTheme: (t: ThemePref) => void;
}) {
  const [recordingWindow, setRecordingWindow] = useState<
    "classic" | "mini" | "none"
  >("mini");

  return (
    <div className="flex flex-col gap-8">
      <SettingsSection title="Appearance">
        <div className="flex items-start gap-4 px-4 py-3.5">
          <span className="w-[104px] shrink-0 pt-3 text-[13px] font-medium text-foreground">
            Theme
          </span>
          <div className="flex flex-1 items-start justify-end gap-3">
            {(["auto", "light", "dark"] as const).map((v) => (
              <ThemeSwatch
                key={v}
                value={v}
                active={theme === v}
                onClick={() => setTheme(v)}
              />
            ))}
          </div>
        </div>
        <Separator className="ml-4 bg-line" />
        <div className="flex items-start gap-4 px-4 py-3.5">
          <span className="w-[104px] shrink-0 pt-3 text-[13px] font-medium text-foreground">
            Recording window
          </span>
          <div className="flex flex-1 items-start justify-end gap-3">
            {(["classic", "mini", "none"] as const).map((v) => (
              <RecordingWindowSwatch
                key={v}
                value={v}
                active={recordingWindow === v}
                onClick={() => setRecordingWindow(v)}
              />
            ))}
          </div>
        </div>
        <Separator className="ml-4 bg-line" />
        <SettingsRow
          label={
            <span>
              Always show
              <InfoDot />
            </span>
          }
          last
          control={<Switch size="sm" defaultChecked={false} />}
        />
      </SettingsSection>

      <SettingsSection title="Startup & updates">
        <SettingsRow
          label={
            <span>
              Launch on login
              <InfoDot />
            </span>
          }
          control={<Switch size="sm" defaultChecked={false} />}
        />
        <SettingsRow
          label="Update application"
          control={<GhostButton>Check for Updates…</GhostButton>}
        />
        <SettingsRow
          label={
            <span>
              Automatically check for updates
              <InfoDot />
            </span>
          }
          last
          control={<Switch size="sm" defaultChecked />}
        />
      </SettingsSection>

      <div className="hairline overflow-hidden rounded-[10px] bg-card">
        <NavRow label="System & integrations" onClick={onOpenSystem} />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             settings: Dictation                             */
/* -------------------------------------------------------------------------- */

/** A switch paired with a gear, the way the app exposes sub-options. */
/** Wraps a control that an organization policy has frozen for this member. */
function PolicyLocked({
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

function DictationPanel({
  managed,
  base,
  onChange,
}: {
  managed: boolean;
  base: BaseSettings;
  onChange: (key: SettingKey, value: BaseSettings[SettingKey]) => void;
}) {
  /** Renders a base setting from the shared registry, so Dictation and a
   *  mode's overrides can never drift apart. */
  const row = (key: SettingKey, opts?: { description?: string; last?: boolean; locked?: boolean }) => {
    const def = SETTING_DEFS.find((d) => d.key === key)!;
    const control = (
      <SettingControl
        def={def}
        value={base[key]}
        onChange={(v) => onChange(key, v)}
      />
    );
    return (
      <SettingsRow
        label={
          <span>
            {def.label}
            <InfoDot />
          </span>
        }
        description={opts?.description}
        last={opts?.last}
        control={
          opts?.locked ? (
            <PolicyLocked locked={managed}>{control}</PolicyLocked>
          ) : (
            control
          )
        }
      />
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <p className="text-[12px] leading-relaxed text-muted-foreground">
        These are Super&rsquo;s defaults — what applies whenever no mode says
        otherwise.
      </p>

      <SettingsSection
        title="Language"
        description="Name the languages you actually speak. Superwhisper picks between them per recording, which is more reliable than detecting across every language there is."
      >
        {row("languages", { last: true })}
      </SettingsSection>

      <SettingsSection
        title="Formatting"
        description="How your words are cleaned up before they land in the app."
      >
        {row("autocapitalize")}
        {row("removeFillers", {
          description: "Drops “um”, “eh”, and false starts.",
          last: true,
        })}
      </SettingsSection>

      <SettingsSection
        title="Output"
        description="Where the finished text goes and how it gets there."
      >
        {row("pasteResult")}
        {row("autoSend")}
        {row("clipboard")}
        {row("simulateKeypresses", {
          description: "For apps that don't accept a normal paste.",
          last: true,
        })}
      </SettingsSection>

      <SettingsSection
        title="Capture"
        description={
          managed
            ? "What Superwhisper listens to besides your microphone. Some options are set by your organization."
            : "What Superwhisper listens to besides your microphone."
        }
      >
        {row("systemAudio", { locked: true })}
        {row("identifySpeakers", {
          description: "Labels who said what in multi-person recordings.",
          last: true,
          locked: true,
        })}
      </SettingsSection>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              settings: Privacy                              */
/* -------------------------------------------------------------------------- */

function PrivacyPanel({
  base,
  onChange,
  modes,
}: {
  base: BaseSettings;
  onChange: (key: SettingKey, value: BaseSettings[SettingKey]) => void;
  modes: ModeItem[];
}) {
  const excluded = modes.filter((m) => m.overrides.saveToHistory === false);

  return (
    <div className="flex flex-col gap-8">
      <SettingsSection
        title="What gets kept"
        description="Nothing is uploaded unless you pick a cloud model. These control what stays on this Mac afterwards."
      >
        <SettingsRow
          label={
            <span>
              Save audio recordings
              <InfoDot />
            </span>
          }
          description={
            base.saveAudio
              ? "The original audio is kept alongside the transcript."
              : "Off — only the text is kept, the audio is discarded."
          }
          control={
            <Switch
              size="sm"
              checked={base.saveAudio}
              onCheckedChange={(c) => onChange("saveAudio", c === true)}
            />
          }
        />
        <SettingsRow
          label={
            <span>
              Save to history
              <InfoDot />
            </span>
          }
          description={
            excluded.length > 0
              ? `${excluded.length} mode${
                  excluded.length === 1 ? "" : "s"
                } override this (${excluded.map((m) => m.name).join(", ")})`
              : "Any mode can override this to stay out of history."
          }
          control={
            <Switch
              size="sm"
              checked={base.saveToHistory}
              onCheckedChange={(c) => onChange("saveToHistory", c === true)}
            />
          }
        />
        <SettingsRow
          label={
            <span>
              Keep history for
              <InfoDot />
            </span>
          }
          last
          control={<PopupButton value="Forever" />}
        />
      </SettingsSection>

      <SettingsSection
        title="Clipboard"
        description="Superwhisper copies each result so you can paste it again."
      >
        <SettingsRow
          label={
            <span>
              Copy result to clipboard
              <InfoDot />
            </span>
          }
          description="Turn off if a clipboard manager is picking up every dictation."
          last
          control={
            <Switch
              size="sm"
              checked={base.copyToClipboard}
              onCheckedChange={(c) => onChange("copyToClipboard", c === true)}
            />
          }
        />
      </SettingsSection>

      <SettingsSection
        title="Files"
        description="Where recordings and transcripts live on disk."
      >
        <SettingsRow
          label={
            <span className="font-mono text-[12px] text-muted-foreground">
              /Users/angelsocastro/superwhisper
            </span>
          }
          control={<GhostButton>Change folder…</GhostButton>}
        />
        <SettingsRow
          label={
            <span>
              Error logging
              <InfoDot />
            </span>
          }
          description="Send anonymous crash reports to help fix bugs."
          last
          control={<Switch size="sm" defaultChecked={false} />}
        />
      </SettingsSection>

      <div className="hairline overflow-hidden rounded-[10px] bg-card">
        <SettingsRow
          label="Delete all history"
          description="Removes every transcript and recording from this Mac."
          last
          control={
            <button className="hairline rounded-[6px] bg-destructive/12 px-2.5 py-1 text-[12px] font-medium text-destructive transition-colors hover:bg-destructive/20">
              Delete…
            </button>
          }
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             settings: Shortcuts                             */
/* -------------------------------------------------------------------------- */

function ShortcutRow({
  label,
  description,
  combo,
  clearable = false,
  last = false,
}: {
  label: string;
  description: string;
  combo?: string;
  clearable?: boolean;
  last?: boolean;
}) {
  return (
    <SettingsRow
      label={label}
      description={description}
      last={last}
      control={
        <div className="flex items-center gap-2">
          <button
            aria-label={`Reset ${label}`}
            title="Reset to default"
            className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-fill-hover hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" strokeWidth={2} />
          </button>
          {combo ? (
            <div className="flex items-center gap-1.5">
              {clearable && (
                <button
                  aria-label={`Clear ${label}`}
                  className="flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-fill-hover hover:text-foreground"
                >
                  <X className="h-3 w-3" strokeWidth={2} />
                </button>
              )}
              <Kbd>{combo}</Kbd>
            </div>
          ) : (
            <span className="text-[12px] text-muted-foreground/60">
              Record shortcut
            </span>
          )}
        </div>
      }
    />
  );
}

/** One flat list: the rows are homogeneous, so headings over them would only
 *  add chrome — two of the old groups held a single shortcut each. */
function ShortcutsPanel() {
  return (
    <SettingsSection
      title="Shortcuts"
      description="Global shortcuts that work anywhere on your Mac."
    >
      <ShortcutRow
        label="Toggle Recording"
        description="Starts and stops recordings"
        combo="⌥ Space"
      />
      <ShortcutRow
        label="Cancel Recording"
        description="Discards the active recording"
        combo="esc"
      />
      <ShortcutRow
        label="Push to talk"
        description="Hold to record, release when done"
        combo="Fn"
        clearable
      />
      <ShortcutRow
        label="Mouse shortcut"
        description="Tap to toggle, or hold and release when done"
      />
      <ShortcutRow
        label="Change mode"
        description="Activates the mode switcher"
        combo="⌥ ⇧ K"
        last
      />
    </SettingsSection>
  );
}

/* -------------------------------------------------------------------------- */
/*                               settings: Sound                               */
/* -------------------------------------------------------------------------- */

type MicDevice = { id: string; name: string; connected: boolean };

const MICS_SEED: MicDevice[] = [
  { id: "shure", name: "Shure MV7", connected: false },
  { id: "airpods", name: "AirPods Pro", connected: true },
  { id: "builtin", name: "MacBook Air Microphone", connected: true },
];

/**
 * Quick switcher for the device to record with right now. The ranked list in
 * Sound decides what gets picked automatically; this is the "not that one,
 * this one" case, so it stays a menu rather than a settings trip.
 */
function MicPopover({
  mics,
  activeId,
  onPick,
  onOpenSettings,
  onClose,
}: {
  mics: MicDevice[];
  activeId?: string;
  onPick: (id: string) => void;
  onOpenSettings: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="absolute inset-0 z-50 bg-black/25" onClick={onClose} />
      <div className="hairline absolute right-3 bottom-10 z-50 w-[248px] overflow-hidden rounded-[10px] bg-popover/85 py-1 shadow-[0_24px_60px_-12px_rgb(0_0_0/0.7)] backdrop-blur-xl backdrop-saturate-150">
        {mics.map((mic) => (
          <button
            key={mic.id}
            disabled={!mic.connected}
            onClick={() => {
              onPick(mic.id);
              onClose();
            }}
            className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left transition-colors hover:bg-fill-hover disabled:pointer-events-none disabled:opacity-40"
          >
            <Check
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-foreground",
                mic.id !== activeId && "opacity-0"
              )}
              strokeWidth={2.5}
            />
            <span className="flex-1 truncate text-[13px] text-foreground">
              {mic.name}
            </span>
            {!mic.connected && (
              <span className="shrink-0 text-[11px] text-muted-foreground">
                Not connected
              </span>
            )}
          </button>
        ))}

        <div className="my-1 h-px bg-line" />

        <button
          onClick={() => {
            onOpenSettings();
            onClose();
          }}
          className="flex w-full items-center px-2.5 py-1.5 text-left transition-colors hover:bg-fill-hover"
        >
          <span className="pl-[22px] text-[13px] text-foreground">
            Microphone settings…
          </span>
        </button>
      </div>
    </>
  );
}

/**
 * A ranked fallback rather than one fixed device. Roughly ten roadmap
 * requests are the same complaint — plugging in or undocking loses the
 * choice — which a single "default microphone" can't express.
 */
function MicPriorityList({
  mics,
  onReorder,
}: {
  mics: MicDevice[];
  onReorder: (from: number, to: number) => void;
}) {
  const activeId = mics.find((m) => m.connected)?.id;

  return (
    <div className="flex flex-col">
      {mics.map((mic, i) => (
        <div
          key={mic.id}
          className={cn(
            "flex items-center gap-2.5 px-4 py-2.5",
            i !== mics.length - 1 && "border-b border-line"
          )}
        >
          <GripVertical
            className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground/50"
            strokeWidth={2}
          />
          <span className="w-4 shrink-0 text-[12px] text-muted-foreground tabular-nums">
            {i + 1}
          </span>
          <span className="flex-1 text-[13px] font-medium text-foreground">
            {mic.name}
          </span>

          {mic.id === activeId && (
            <span className="shrink-0 rounded-[4px] bg-primary/15 px-1.5 py-px text-[10px] font-semibold tracking-wide text-primary uppercase">
              In use
            </span>
          )}
          <span
            className={cn(
              "shrink-0 text-[11px]",
              mic.connected ? "text-muted-foreground" : "text-muted-foreground/50"
            )}
          >
            {mic.connected ? "Connected" : "Not connected"}
          </span>

          <div className="flex shrink-0 items-center">
            <button
              onClick={() => onReorder(i, i - 1)}
              disabled={i === 0}
              aria-label={`Move ${mic.name} up`}
              className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground disabled:pointer-events-none disabled:opacity-25"
            >
              <ChevronUp className="h-4 w-4" strokeWidth={2} />
            </button>
            <button
              onClick={() => onReorder(i, i + 1)}
              disabled={i === mics.length - 1}
              aria-label={`Move ${mic.name} down`}
              className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground disabled:pointer-events-none disabled:opacity-25"
            >
              <ChevronDown className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function SoundPanel({
  mics,
  onReorderMics,
}: {
  mics: MicDevice[];
  onReorderMics: (from: number, to: number) => void;
}) {
  const [soundStyle, setSoundStyle] = useState("classic");
  const [volume, setVolume] = useState([85]);

  return (
    <div className="flex flex-col gap-8">
      <SettingsSection
        title="Microphone priority"
        description="Superwhisper records with the first one that's connected, so docking or swapping headphones doesn't lose your choice."
      >
        <MicPriorityList mics={mics} onReorder={onReorderMics} />
      </SettingsSection>

      <SettingsSection
        title="Input"
        description="How your voice is captured and cleaned up before transcription."
      >
        <SettingsRow
          label={
            <span>
              Automatically increase microphone volume
              <InfoDot />
            </span>
          }
          control={<Switch size="sm" defaultChecked />}
        />
        <SettingsRow
          label={
            <span>
              Dynamic normalization
              <InfoDot />
            </span>
          }
          control={<Switch size="sm" defaultChecked={false} />}
        />
        <SettingsRow
          label={
            <span>
              Silence removal
              <InfoDot />
            </span>
          }
          last
          control={<Switch size="sm" defaultChecked={false} />}
        />
      </SettingsSection>

      <SettingsSection title="While recording">
        <SettingsRow
          label={
            <span>
              Playback when recording
              <InfoDot />
            </span>
          }
          description="What happens to audio already playing on your Mac."
          last
          control={<PopupButton value="Pause" />}
        />
      </SettingsSection>

      <SettingsSection title="Sound effects">
        <SettingsRow
          label="Sound effects"
          control={
            <SegmentedControl
              value={soundStyle}
              onValueChange={setSoundStyle}
              options={[
                { value: "simple", label: "Simple" },
                { value: "classic", label: "Classic" },
                { value: "off", label: "Off" },
              ]}
            />
          }
        />
        <SettingsRow
          label="Volume"
          last
          control={
            <div className="flex w-[180px] items-center gap-2">
              <Volume2
                className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                strokeWidth={2}
              />
              <Slider
                value={volume}
                onValueChange={(v) =>
                  setVolume(Array.isArray(v) ? [...v] : [v as number])
                }
                max={100}
                step={1}
                className="flex-1"
              />
              <Volume2
                className="h-4 w-4 shrink-0 text-muted-foreground"
                strokeWidth={2}
              />
            </div>
          }
        />
      </SettingsSection>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           settings: Models library                          */
/* -------------------------------------------------------------------------- */

function SpeedBars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-[3px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-[2px] w-[7px] rounded-full",
            i < value ? "bg-foreground/45" : "bg-foreground/12",
          )}
        />
      ))}
    </div>
  );
}

function ModelsPanel() {
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>(["s1-voice"]);

  const rows = MODEL_LIBRARY.filter((m) =>
    m.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const toggleFavorite = (id: string) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );

  return (
    <div className="flex flex-col gap-8">
      <SettingsSection
        title="In use"
        description="What Super picks for you right now. You don't have to change any of this."
      >
        <SettingsRow
          label="Voice model"
          description="Turns your speech into raw text"
          control={<PopupButton value="S1-Voice" />}
        />
        <SettingsRow
          label="Language model"
          description="Cleans up wording, punctuation and formatting"
          last
          control={<PopupButton value="Sonnet 4.5" />}
        />
      </SettingsSection>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[15px] font-semibold text-foreground">
            Model library
          </h2>
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            Every model available to you. Offline ones download to your Mac and
            keep working without internet.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hairline flex min-w-0 flex-1 items-center gap-2 rounded-[7px] bg-fill px-2.5 py-1.5">
            <Search
              className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
              strokeWidth={2}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search models"
              className="min-w-0 flex-1 bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <button
            aria-label="Filter"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
          >
            <SlidersHorizontal className="h-[15px] w-[15px]" strokeWidth={2} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <PopupButton value="All providers" />
          <button
            aria-label="Add API key"
            title="Add your own API key"
            className="hairline flex h-7 items-center gap-1.5 rounded-[6px] bg-fill-hover px-2.5 text-[12px] font-medium text-foreground transition-colors hover:bg-fill-strong"
          >
            <KeyRound className="h-[13px] w-[13px]" strokeWidth={2} />
            <Plus className="h-3 w-3" strokeWidth={2.5} />
          </button>
        </div>

        <div className="hairline overflow-hidden rounded-[10px] bg-card">
          <div className="hairline-b grid grid-cols-[1fr_44px_74px_64px] items-center gap-2 px-3 py-2 text-[11px] font-medium text-muted-foreground">
            <span className="pl-6">Model name</span>
            <span>Type</span>
            <span>Speed / Acc.</span>
            <span className="text-right">Cloud/Offline</span>
          </div>

          {rows.length === 0 && (
            <div className="px-4 py-6 text-center text-[12px] text-muted-foreground">
              No models match &ldquo;{query}&rdquo;.
            </div>
          )}

          {rows.map((model, i) => {
            const provider = PROVIDER_STYLE[model.provider];
            const isFav = favorites.includes(model.id);
            return (
              <div
                key={model.id}
                className={cn(
                  "grid grid-cols-[1fr_44px_74px_64px] items-center gap-2 px-3 py-2 transition-colors hover:bg-fill",
                  i !== rows.length - 1 && "border-b border-line",
                )}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <button
                    onClick={() => toggleFavorite(model.id)}
                    aria-label={isFav ? "Unfavorite" : "Favorite"}
                    className="shrink-0 text-muted-foreground/60 transition-colors hover:text-foreground"
                  >
                    <Star
                      className={cn(
                        "h-3.5 w-3.5",
                        isFav && "fill-[#febc2e] text-[#febc2e]",
                      )}
                      strokeWidth={2}
                    />
                  </button>
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] text-[9px] font-bold",
                      provider.className,
                    )}
                  >
                    {provider.label}
                  </span>
                  <span className="truncate text-[12.5px] text-foreground">
                    {model.name}
                  </span>
                  {model.isNew && (
                    <span className="shrink-0 rounded-[3px] bg-fill-strong px-1 py-px text-[9px] font-semibold tracking-wide text-foreground/80 uppercase">
                      New
                    </span>
                  )}
                </div>

                <span className="text-muted-foreground">
                  {model.kind === "language" ? (
                    <AlignLeft className="h-3.5 w-3.5" strokeWidth={2} />
                  ) : (
                    <AudioLines className="h-3.5 w-3.5" strokeWidth={2} />
                  )}
                </span>

                <SpeedBars value={model.speed} />

                <div className="flex items-center justify-end gap-1.5">
                  {model.size ? (
                    <>
                      <span className="text-[11px] text-muted-foreground">
                        {model.size}
                      </span>
                      <button
                        aria-label={`Download ${model.name}`}
                        className="flex h-4 w-4 items-center justify-center rounded-full bg-fill-hover text-foreground/70 transition-colors hover:bg-fill-strong hover:text-foreground"
                      >
                        <Download className="h-2.5 w-2.5" strokeWidth={2.5} />
                      </button>
                    </>
                  ) : (
                    <Cloud
                      className="h-3.5 w-3.5 text-muted-foreground"
                      strokeWidth={1.75}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             settings: Advanced                              */
/* -------------------------------------------------------------------------- */

/** The Modes list lives inline here rather than behind a nav row: the pane
 *  held a single toggle otherwise, and Modes sat three levels deep. */
function ModesPanel({
  modesEnabled,
  setModesEnabled,
  modes,
  onOpenMode,
  onRename,
}: {
  modesEnabled: boolean;
  setModesEnabled: (v: boolean) => void;
  modes: ModeItem[];
  onOpenMode: (id: string) => void;
  onRename: (id: string, name: string) => void;
}) {
  const [tipDismissed, setTipDismissed] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <SettingsSection
        title="Modes"
        description="Modes let you define custom behaviors per app. This is a fallback for when a cloud model isn't reachable — Super covers everyday use without it."
      >
        <SettingsRow
          label="Enable custom Modes"
          description={
            modesEnabled
              ? "Modes are available as a manual override."
              : "Off — Super is used for everything, including offline."
          }
          last
          control={
            <Switch
              size="sm"
              checked={modesEnabled}
              onCheckedChange={(c) => setModesEnabled(c === true)}
            />
          }
        />
      </SettingsSection>

      {modesEnabled && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-foreground">
              Your modes
            </h2>
            <GhostButton>+ Create mode</GhostButton>
          </div>

          <div className="flex flex-col gap-2">
            {modes.map((mode) => (
              <div
                key={mode.id}
                className="hairline flex items-center gap-2.5 rounded-[9px] bg-card px-3.5 py-3"
              >
                <Sparkles
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  strokeWidth={2}
                />
                <span className="text-[13px] font-medium text-foreground">
                  <InlineEdit
                    value={mode.name}
                    onChange={(name) => onRename(mode.id, name)}
                  />
                </span>
                {mode.active && (
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#28c840]"
                    title="Active mode"
                  />
                )}
                <div className="ml-auto flex shrink-0 items-center gap-2.5">
                  <span className="text-[12px] text-muted-foreground">
                    {Object.keys(mode.overrides).length === 0
                      ? "Follows Super"
                      : `${Object.keys(mode.overrides).length} override${
                          Object.keys(mode.overrides).length === 1 ? "" : "s"
                        }`}
                  </span>
                  <button
                    onClick={() => onOpenMode(mode.id)}
                    aria-label={`Open ${mode.name}`}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
                  >
                    <ChevronRight className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!tipDismissed && (
            <div className="hairline flex items-start gap-3 rounded-[10px] bg-card px-4 py-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#febc2e]/15 text-[#febc2e]">
                <Lightbulb className="h-4 w-4" strokeWidth={2} />
              </span>
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-[13px] font-medium text-foreground">
                  Auto-switch with activation
                </span>
                <span className="text-[12px] leading-relaxed text-muted-foreground">
                  Link a mode to specific apps or websites so Superwhisper picks
                  the right one automatically when you record.
                </span>
              </div>
              <button
                onClick={() => setTipDismissed(true)}
                className="shrink-0 text-[12px] font-medium text-muted-foreground hover:text-foreground"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                   sub-page: System & integrations (advanced)                */
/* -------------------------------------------------------------------------- */

function SystemPanel() {
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
        description="Keeps modes, vocabulary and text replacements the same on every Mac."
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
            <span className="text-[12px] text-muted-foreground">Installed</span>
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

/* -------------------------------------------------------------------------- */
/*                          sub-pages: Modes list/detail                       */
/* -------------------------------------------------------------------------- */

function ModeDetailPanel({
  mode,
  base,
  onSetOverride,
  onClearOverride,
}: {
  mode: ModeItem;
  base: BaseSettings;
  onSetOverride: (key: SettingKey, value: BaseSettings[SettingKey]) => void;
  onClearOverride: (key: SettingKey) => void;
}) {
  const [picking, setPicking] = useState(false);

  const overridden = SETTING_DEFS.filter((d) => d.key in mode.overrides);
  const available = SETTING_DEFS.filter((d) => !(d.key in mode.overrides));

  return (
    <div className="flex flex-col gap-8">
      <p className="text-[12px] leading-relaxed text-muted-foreground">
        {overridden.length === 0 ? (
          <>This mode changes nothing yet — it follows Super entirely.</>
        ) : (
          <>
            Overrides {overridden.length}{" "}
            {overridden.length === 1 ? "setting" : "settings"}. Everything else
            follows Super.
          </>
        )}
      </p>

      <section className="flex flex-col gap-4">
        <h2 className="text-[15px] font-semibold text-foreground">
          Overriding
        </h2>

        {overridden.length > 0 && (
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
                      value={mode.overrides[def.key] as BaseSettings[SettingKey]}
                      onChange={(v) => onSetOverride(def.key, v)}
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
        )}

        {picking ? (
          <div className="hairline flex flex-col gap-3 rounded-[10px] bg-card p-3">
            {[...new Set(available.map((d) => d.group))].map((group) => (
              <div key={group} className="flex flex-col gap-1">
                <span className="px-1 text-[11px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
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
                      <span className="text-[13px] text-foreground">
                        {def.label}
                      </span>
                      <span className="text-[12px] text-muted-foreground">
                        {formatSettingValue(base[def.key])}
                      </span>
                    </button>
                  ))}
              </div>
            ))}
            <button
              onClick={() => setPicking(false)}
              className="self-start px-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground"
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
            <span className="text-[12px] text-muted-foreground/60">
              Record shortcut
            </span>
          }
        />
      </SettingsSection>

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

/* -------------------------------------------------------------------------- */
/*                                  Account                                    */
/* -------------------------------------------------------------------------- */

function AccountPanel({ account }: { account: Account }) {
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
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-fill-hover text-[15px] font-semibold">
          A
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-center gap-1.5 text-[15px] font-semibold text-foreground">
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
          <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            {org ? org.name : "Superwhisper"}
            <span className="rounded-[4px] bg-fill-strong px-1.5 py-px text-[9px] font-semibold tracking-wide text-foreground/80 uppercase">
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
                <span className="text-[12px] text-muted-foreground">
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
                  <span className="rounded-[4px] bg-fill-strong px-1.5 py-px text-[9px] font-semibold tracking-wide text-foreground/80 uppercase">
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
                className="rounded-[6px] px-2 py-1 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
              >
                Sign out
              </button>
            }
          />
        ))}
      </SettingsSection>

      <section className="flex flex-col gap-3">
        <h2 className="text-[15px] font-semibold text-foreground">
          Community & support
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {links.map((l) => (
            <button
              key={l.label}
              className="hairline flex items-center gap-1.5 rounded-full bg-fill-hover px-2.5 py-1 text-[12px] font-medium text-foreground transition-colors hover:bg-fill-strong"
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

/* -------------------------------------------------------------------------- */
/*                                  Billing                                    */
/* -------------------------------------------------------------------------- */

function BillingPanel({
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
          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
            {org ? "Enterprise" : "Pro"}
            <span className="rounded-[4px] bg-fill-strong px-1.5 py-px text-[9px] font-semibold tracking-wide text-foreground/80 uppercase">
              Active
            </span>
          </span>
          <span className="text-[12px] leading-snug text-muted-foreground">
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
                <span className="min-w-6 text-center text-[12px] font-medium tabular-nums">
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
                      className="rounded-[6px] bg-destructive/15 px-2.5 py-1 text-[12px] font-medium text-destructive transition-colors hover:bg-destructive/25"
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

/* -------------------------------------------------------------------------- */
/*                              sub-page: Plans                                */
/* -------------------------------------------------------------------------- */

const PLANS: {
  id: string;
  name: string;
  price: string;
  cadence: string;
  points: string[];
}[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    cadence: "forever",
    points: ["Local models only", "Unlimited dictation", "One device"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$8.49",
    cadence: "per month",
    points: ["Cloud and local models", "Custom modes", "Up to 5 devices"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    cadence: "billed yearly",
    points: ["SSO and SCIM", "Org-wide policies", "SOC 2 and DPA"],
  },
];

function PlansPanel({ current = "pro" }: { current?: string }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-[12px] leading-relaxed text-muted-foreground">
        Upgrades apply right away. Downgrades take effect on Sep 4, 2026, when
        the current period ends.
      </p>

      <div className="flex flex-col gap-2">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === current;
          return (
            <div
              key={plan.id}
              className={cn(
                "hairline flex items-start gap-4 rounded-[10px] bg-card px-4 py-3.5",
                isCurrent && "ring-1 ring-foreground/15",
              )}
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
                  {plan.name}
                  {isCurrent && (
                    <span className="rounded-[4px] bg-fill-strong px-1.5 py-px text-[9px] font-semibold tracking-wide text-foreground/80 uppercase">
                      Current
                    </span>
                  )}
                </span>
                <ul className="flex flex-col gap-1">
                  {plan.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-center gap-1.5 text-[12px] text-muted-foreground"
                    >
                      <CircleCheck
                        className="h-3 w-3 shrink-0 text-muted-foreground/60"
                        strokeWidth={2}
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2">
                <div className="flex flex-col items-end">
                  <span className="text-[13px] font-semibold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {plan.cadence}
                  </span>
                </div>
                {isCurrent ? (
                  <span className="text-[12px] text-muted-foreground">
                    In use
                  </span>
                ) : (
                  <GhostButton>
                    {plan.id === "enterprise"
                      ? "Contact sales"
                      : plan.id === "free"
                        ? "Downgrade"
                        : "Upgrade"}
                  </GhostButton>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    shell                                    */
/* -------------------------------------------------------------------------- */

export default function SettingsPage() {
  const [active, setActive] = useState<DailyKey>("home");
  const [theme, setTheme] = useState<ThemePref>("dark");
  const appearance = useResolvedTheme(theme);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsKey>("general");
  const [accountFixture, setAccountFixture] = useState("individual");
  const account = ACCOUNTS[accountFixture];
  const isManaged = account.kind === "org";
  /** Members have no payment relationship, so Billing never shows for them. */
  const visibleTabs = canManageBilling(account)
    ? SETTINGS_TABS
    : SETTINGS_TABS.filter((t) => t.key !== "billing");
  const [subpage, setSubpage] = useState<Subpage>(null);
  const [whatsNewItem, setWhatsNewItem] = useState<WhatsNewItem | null>(null);
  const [whatsNewStack, setWhatsNewStack] =
    useState<WhatsNewItem[]>(WHATS_NEW_SEED);
  const [modesEnabled, setModesEnabled] = useState(false);
  const [modes, setModes] = useState<ModeItem[]>(MODES_SEED);
  const [base, setBase] = useState<BaseSettings>(BASE_DEFAULTS);
  const [mics, setMics] = useState<MicDevice[]>(MICS_SEED);
  const [pickedMicId, setPickedMicId] = useState<string | null>(null);
  const [micMenuOpen, setMicMenuOpen] = useState(false);

  /** An explicit pick wins while it lasts; otherwise the ranking decides. */
  const activeMic =
    mics.find((m) => m.id === pickedMicId && m.connected) ??
    mics.find((m) => m.connected);

  const reorderMics = (from: number, to: number) =>
    setMics((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });

  const setBaseValue = (key: SettingKey, value: BaseSettings[SettingKey]) =>
    setBase((prev) => ({ ...prev, [key]: value }));

  const setOverride = (
    modeId: string,
    key: SettingKey,
    value: BaseSettings[SettingKey]
  ) =>
    setModes((prev) =>
      prev.map((m) =>
        m.id === modeId
          ? { ...m, overrides: { ...m.overrides, [key]: value } }
          : m
      )
    );

  const clearOverride = (modeId: string, key: SettingKey) =>
    setModes((prev) =>
      prev.map((m) => {
        if (m.id !== modeId) return m;
        const next = { ...m.overrides };
        delete next[key];
        return { ...m, overrides: next };
      })
    );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [setupTasks, setSetupTasks] = useState<SetupTask[]>(SETUP_SEED);
  const [setupOpen, setSetupOpen] = useState(true);

  const setupDone = setupTasks.filter((t) => t.done).length;
  const allSetupDone = setupDone === setupTasks.length;

  const toggleSetupTask = (id: string) =>
    setSetupTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );

  const DailyPanel = DAILY_PANELS[active];

  const openWhatsNew = (item: WhatsNewItem) => {
    setWhatsNewItem(item);
    setWhatsNewStack((prev) => prev.filter((i) => i.id !== item.id));
  };

  const openSettingsAt = (tab: SettingsKey) => {
    setSettingsTab(tab);
    setSubpage(null);
    setSettingsOpen(true);
  };

  const renameMode = (id: string, name: string) =>
    setModes((prev) => prev.map((m) => (m.id === id ? { ...m, name } : m)));

  const detailMode =
    subpage?.kind === "modeDetail"
      ? modes.find((m) => m.id === subpage.modeId)
      : undefined;

  // Which pane the settings window shows, plus its back target.
  let settingsBody: React.ReactNode;
  let onBack: (() => void) | undefined;
  const paneKey = subpage
    ? subpage.kind === "modeDetail"
      ? `mode:${subpage.modeId}`
      : subpage.kind
    : settingsTab;

  if (subpage?.kind === "system") {
    settingsBody = <SystemPanel />;
    onBack = () => setSubpage(null);
  } else if (subpage?.kind === "plans") {
    settingsBody = <PlansPanel />;
    onBack = () => setSubpage(null);
  } else if (detailMode) {
    settingsBody = (
      <ModeDetailPanel
        mode={detailMode}
        base={base}
        onSetOverride={(k, v) => setOverride(detailMode.id, k, v)}
        onClearOverride={(k) => clearOverride(detailMode.id, k)}
      />
    );
    onBack = () => setSubpage(null);
  } else {
    settingsBody =
      settingsTab === "account" ? (
        <AccountPanel account={account} />
      ) : settingsTab === "billing" && canManageBilling(account) ? (
        <BillingPanel
          account={account}
          onOpenPlans={() => setSubpage({ kind: "plans" })}
        />
      ) : settingsTab === "general" ? (
        <GeneralPanel
          onOpenSystem={() => setSubpage({ kind: "system" })}
          theme={theme}
          setTheme={setTheme}
        />
      ) : settingsTab === "dictation" ? (
        <DictationPanel managed={isManaged} base={base} onChange={setBaseValue} />
      ) : settingsTab === "shortcuts" ? (
        <ShortcutsPanel />
      ) : settingsTab === "privacy" ? (
        <PrivacyPanel base={base} onChange={setBaseValue} modes={modes} />
      ) : settingsTab === "sound" ? (
        <SoundPanel mics={mics} onReorderMics={reorderMics} />
      ) : settingsTab === "models" ? (
        <ModelsPanel />
      ) : (
        <ModesPanel
          modesEnabled={modesEnabled}
          setModesEnabled={setModesEnabled}
          modes={modes}
          onOpenMode={(id) => setSubpage({ kind: "modeDetail", modeId: id })}
          onRename={renameMode}
        />
      );
  }

  return (
    <main
      className={cn(
        "flex min-h-screen items-center justify-center bg-desk p-10 transition-colors duration-300",
        appearance === "dark" && "dark",
      )}
    >
      <AccountFixtureSwitcher
        value={accountFixture}
        onChange={setAccountFixture}
      />

      <MacWindow width="1020px" height="700px">
        <div className="flex min-h-0 flex-1 gap-2 p-2">
          <DailyNav
            active={active}
            onSelect={setActive}
            onOpenSettings={() => openSettingsAt("general")}
            onOpenAccount={() => openSettingsAt("account")}
            whatsNew={whatsNewStack}
            onOpenWhatsNew={openWhatsNew}
            collapsed={!sidebarOpen}
            onToggleCollapsed={() => setSidebarOpen((v) => !v)}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {/* Workbench pane: bordered on all sides and floating in the
                chrome. It starts at the top of the window rather than below a
                title strip — the sidebar absorbs the traffic lights instead. */}
            <div className="hairline min-h-0 flex-1 overflow-y-auto rounded-[10px] bg-background px-14 py-12">
              <div className="mx-auto flex max-w-[560px] flex-col gap-8">
                <DailyPanel onOpenModels={() => openSettingsAt("models")} />
              </div>
            </div>

            {/* Status bar sits in the chrome gutter, outside the pane, so the
                sidebar can run the full height of the window. */}
            <div className="flex h-8 shrink-0 items-center justify-end gap-1 px-1">
              {!setupOpen && !allSetupDone && (
                <button
                  onClick={() => setSetupOpen(true)}
                  className="flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
                >
                  <CircleCheck className="h-[13px] w-[13px]" strokeWidth={2} />
                  Setup guide
                  <span className="tabular-nums">
                    {setupDone}/{setupTasks.length}
                  </span>
                </button>
              )}
              <button
                onClick={() => setMicMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
              >
                {activeMic?.name ?? "No microphone"}
                <Headphones className="h-[13px] w-[13px]" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {micMenuOpen && (
          <MicPopover
            mics={mics}
            activeId={activeMic?.id}
            onPick={setPickedMicId}
            onOpenSettings={() => openSettingsAt("sound")}
            onClose={() => setMicMenuOpen(false)}
          />
        )}

        {setupOpen && (
          <SetupGuide
            tasks={setupTasks}
            onToggle={toggleSetupTask}
            onClose={() => setSetupOpen(false)}
          />
        )}

        {settingsOpen && (
          <SettingsWindow
            paneKey={paneKey}
            tabs={visibleTabs}
            active={settingsTab}
            onTabChange={(key) => {
              setSubpage(null);
              setSettingsTab(key as SettingsKey);
            }}
            onClose={() => {
              setSettingsOpen(false);
              setSubpage(null);
            }}
            onBack={onBack}
          >
            {settingsBody}
          </SettingsWindow>
        )}

        {whatsNewItem && (
          <DetailModal width="440px" onClose={() => setWhatsNewItem(null)}>
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-medium text-muted-foreground">
                {formatDaysAgo(whatsNewItem.daysAgo)}
              </span>
              <h2 className="text-[17px] font-semibold text-foreground">
                {whatsNewItem.title}
              </h2>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {whatsNewItem.body}
              </p>
              <button
                onClick={() => setWhatsNewItem(null)}
                className="mt-3 h-8 w-fit rounded-[7px] bg-primary px-4 text-[12px] font-semibold text-primary-foreground hover:brightness-110"
              >
                Got it
              </button>
            </div>
          </DetailModal>
        )}
      </MacWindow>
    </main>
  );
}
