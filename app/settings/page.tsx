"use client";

import { useState, useSyncExternalStore, useRef, useId } from "react";
import { createPortal } from "react-dom";
import {
  Home as HomeIcon,
  BookOpen,
  Keyboard,
  Mic,
  ChevronLeft,
  Settings as SettingsIcon,
  Volume2,
  BrainCircuit,
  History as HistoryIcon,
  Cloud,
  Sparkles,
  GripVertical,
  ChevronUp,
  Check,
  Copy,
  Play,
  Pin,
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
  RotateCcw,
  Plus,
  Trash2,
  Pencil,
  Info,
  Map,
  Mail,
  Globe,
  MessageCircle,
  Asterisk,
  CircleCheck,
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
    title: "Dictionary sync",
    summary: "Your words now sync everywhere.",
    body: "Your personal dictionary — terms and corrections alike — now syncs automatically across every Mac and iPhone signed into your Superwhisper account.",
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

/** Simplified flag artwork, not vexillographically exact — legible at 16px
 *  is the only bar. Drawn flat so a clipPath can crop each to a circle. */
const FLAG_SVG: Record<string, React.ReactNode> = {
  English: (
    <>
      <rect width="20" height="20" fill="#B22234" />
      <rect y="1.5" width="20" height="1.5" fill="#fff" />
      <rect y="4.6" width="20" height="1.5" fill="#fff" />
      <rect y="7.7" width="20" height="1.5" fill="#fff" />
      <rect y="10.8" width="20" height="1.5" fill="#fff" />
      <rect y="13.8" width="20" height="1.5" fill="#fff" />
      <rect y="16.9" width="20" height="1.5" fill="#fff" />
      <rect width="9" height="10.8" fill="#3C3B6E" />
    </>
  ),
  Spanish: (
    <>
      <rect width="20" height="20" fill="#AA151B" />
      <rect y="5" width="20" height="10" fill="#F1BF00" />
    </>
  ),
  German: (
    <>
      <rect width="20" height="6.7" fill="#000" />
      <rect y="6.7" width="20" height="6.7" fill="#DD0000" />
      <rect y="13.3" width="20" height="6.7" fill="#FFCE00" />
    </>
  ),
  French: (
    <>
      <rect width="6.7" height="20" fill="#0055A4" />
      <rect x="6.7" width="6.7" height="20" fill="#fff" />
      <rect x="13.3" width="6.7" height="20" fill="#EF4135" />
    </>
  ),
  Portuguese: (
    <>
      <rect width="20" height="20" fill="#FF0000" />
      <rect width="8" height="20" fill="#046A38" />
    </>
  ),
  Dutch: (
    <>
      <rect width="20" height="6.7" fill="#AE1C28" />
      <rect y="6.7" width="20" height="6.7" fill="#fff" />
      <rect y="13.3" width="20" height="6.7" fill="#21468B" />
    </>
  ),
  Italian: (
    <>
      <rect width="6.7" height="20" fill="#009246" />
      <rect x="6.7" width="6.7" height="20" fill="#fff" />
      <rect x="13.3" width="6.7" height="20" fill="#CE2B37" />
    </>
  ),
  Japanese: (
    <>
      <rect width="20" height="20" fill="#fff" />
      <circle cx="10" cy="10" r="6" fill="#BC002D" />
    </>
  ),
  Chinese: (
    <>
      <rect width="20" height="20" fill="#DE2910" />
      <circle cx="6" cy="6" r="2.2" fill="#FFDE00" />
      <circle cx="11" cy="3.2" r="0.8" fill="#FFDE00" />
      <circle cx="13" cy="5.5" r="0.8" fill="#FFDE00" />
      <circle cx="13" cy="8.5" r="0.8" fill="#FFDE00" />
      <circle cx="11" cy="10.5" r="0.8" fill="#FFDE00" />
    </>
  ),
};

function FlagIcon({ lang, size = 16 }: { lang: string; size?: number }) {
  const clipId = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      className="shrink-0"
      aria-hidden="true"
    >
      <clipPath id={clipId}>
        <circle cx="10" cy="10" r="10" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        {FLAG_SVG[lang] ?? <circle cx="10" cy="10" r="10" fill="var(--line)" />}
      </g>
      <circle
        cx="10"
        cy="10"
        r="9.5"
        fill="none"
        stroke="var(--hairline-c)"
        strokeWidth="1"
      />
    </svg>
  );
}

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
  voiceModel: "Recommended (S1-Voice)",
  languageModel: "Recommended (S1-Language)",
  playback: "Pause",
};

type SettingKey = keyof BaseSettings;

type SettingDef = {
  key: SettingKey;
  label: string;
  group: string;
  kind: "switch" | "choice" | "languages";
  choices?: string[];
  /** Org admins can pin this — editing shows a lock instead of a control. */
  locked?: boolean;
};

/** Every setting is overridable by construction — which is what stops
 *  "make X per-mode" from being a feature request nine times over. */
const SETTING_DEFS: SettingDef[] = [
  { key: "voiceModel", label: "Voice model", group: "Models", kind: "choice", choices: ["Recommended (S1-Voice)", "S1-Voice", "Cohere Transcribe", "Nova 3"] },
  { key: "languageModel", label: "Language model", group: "Models", kind: "choice", choices: ["Recommended (S1-Language)", "Sonnet 4.5", "Haiku 4.5", "S1-Language"] },
  { key: "languages", label: "Languages", group: "Language", kind: "languages" },
  { key: "autocapitalize", label: "Autocapitalize", group: "Formatting", kind: "switch" },
  { key: "removeFillers", label: "Remove filler words", group: "Formatting", kind: "switch" },
  { key: "pasteResult", label: "Paste result text", group: "Output", kind: "switch" },
  { key: "autoSend", label: "Hold shift to auto-send", group: "Output", kind: "switch" },
  { key: "clipboard", label: "Clipboard behaviour", group: "Output", kind: "choice", choices: ["Default", "Preserve", "Skip"] },
  { key: "simulateKeypresses", label: "Simulate keypresses", group: "Output", kind: "switch" },
  { key: "systemAudio", label: "Record from system audio", group: "Capture", kind: "switch", locked: true },
  { key: "identifySpeakers", label: "Identify speakers", group: "Capture", kind: "switch", locked: true },
  { key: "playback", label: "Playback when recording", group: "Capture", kind: "choice", choices: ["Pause", "Mute", "Keep playing"] },
  { key: "saveAudio", label: "Save audio recordings", group: "Privacy", kind: "switch" },
  { key: "saveToHistory", label: "Save to history", group: "Privacy", kind: "switch" },
  { key: "copyToClipboard", label: "Copy result to clipboard", group: "Privacy", kind: "switch" },
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
  /** What the mode actually asks the language model to do. The core
   *  identity of a mode — the rest are overrides on top of it. */
  instructions: string;
  /** Only what this mode changes. Anything absent follows Super. */
  overrides: Partial<BaseSettings>;
  /** Ships configured and switched off — you enable it, you don't build it. */
  enabled: boolean;
  /** Shipped modes can be reset; ones you made can be deleted. */
  builtIn: boolean;
};

const MODES_SEED: ModeItem[] = [
  {
    id: "personal",
    name: "Personal messages",
    apps: ["WhatsApp", "Telegram", "Messages"],
    instructions:
      "Keep it casual and short. Use contractions. No corporate tone.",
    overrides: { autocapitalize: false, autoSend: true },
    enabled: true,
    builtIn: true,
  },
  {
    id: "work",
    name: "Work messages",
    apps: ["Slack", "Teams"],
    instructions:
      "Professional but friendly. Fix grammar. Keep it as brief as Slack messages usually are.",
    overrides: { languages: ["English"] },
    enabled: true,
    builtIn: true,
  },
  {
    id: "email",
    name: "Email",
    apps: ["Mail", "Spark"],
    instructions:
      "Format as a proper email. Fix grammar and punctuation. Remove filler words like \"um\" and \"uh\".",
    overrides: { languages: ["English"], removeFillers: true },
    enabled: false,
    builtIn: true,
  },
  {
    id: "meetings",
    name: "Meetings",
    apps: ["Zoom"],
    instructions:
      "Summarize the key points as short bullet points. Keep names and action items exact.",
    overrides: {
      systemAudio: true,
      identifySpeakers: true,
      pasteResult: false,
      saveToHistory: true,
    },
    enabled: false,
    builtIn: true,
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

type HistoryItem = {
  id: string;
  /** What landed in the app after the language model cleaned it up. */
  text: string;
  /** The raw transcript, only kept when the model actually changed something. */
  original?: string;
  seconds: number;
  /** Only long recordings have anything to segment. */
  segments?: { at: string; text: string }[];
};

const HISTORY_GROUPS: { label: string; items: HistoryItem[] }[] = [
  {
    label: "Today",
    items: [
      {
        id: "h1",
        text: "Remind the team the deploy is at 4pm.",
        original: "remind the team the deploy is at 4pm",
        seconds: 4,
      },
      {
        id: "h2",
        text: "Draft a reply saying I'll follow up tomorrow.",
        seconds: 3,
      },
      {
        id: "h3",
        text: "Add a section about pricing to the proposal and keep the tone friendly.",
        original:
          "add a section about pricing to the proposal and um keep the tone friendly",
        seconds: 18,
        segments: [
          { at: "0:00", text: "Add a section about pricing to the proposal" },
          { at: "0:11", text: "and keep the tone friendly." },
        ],
      },
    ],
  },
  {
    label: "Yesterday",
    items: [
      {
        id: "h4",
        text: "Add oat milk and coffee to the grocery list.",
        seconds: 3,
      },
      {
        id: "h5",
        text: "Tell Marta I'm running ten minutes late.",
        seconds: 2,
      },
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

type DailyKey = "home" | "modes" | "vocabulary";
type SettingsKey =
  | "account"
  | "billing"
  | "general"
  | "shortcuts"
  | "sound"
  | "privacy"
  | "models";
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
      <span className="pl-1.5 text-[11px] font-medium tracking-wide text-white/40 uppercase">
        Signed in as
      </span>
      {ACCOUNT_FIXTURES.map((f) => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={cn(
            "rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors",
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
type Subpage = { kind: "system" } | { kind: "plans" } | null;

/** Modes is its own nav-level flow now, not a Settings sub-page — this is
 *  the equivalent of Subpage for the daily "Modes" tab. */
type ModesSubpage =
  | { kind: "modeDetail"; modeId: string }
  | { kind: "superDetail" }
  | null;

const DAILY_USE: { key: DailyKey; label: string; icon: LucideIcon }[] = [
  { key: "home", label: "Home", icon: HomeIcon },
  { key: "modes", label: "Modes", icon: Sparkles },
  { key: "vocabulary", label: "Dictionary", icon: BookOpen },
];

const SETTINGS_TABS: (SettingsTab & { key: SettingsKey })[] = [
  { key: "account", label: "Account", icon: CircleUser, group: 0 },
  { key: "billing", label: "Billing", icon: CreditCard, group: 0 },
  { key: "general", label: "General", icon: SettingsIcon, group: 1 },
  { key: "shortcuts", label: "Shortcuts", icon: Keyboard, group: 1 },
  { key: "sound", label: "Sound", icon: Volume2, group: 1 },
  { key: "privacy", label: "Privacy", icon: Lock, group: 1 },
  { key: "models", label: "Models", icon: BrainCircuit, group: 2 },
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
function LanguageSelect({
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
        checked={value as boolean}
        onCheckedChange={(c) => onChange(c === true)}
      />
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
function PanelIntro({
  title,
  description,
}: {
  title: string;
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

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="hairline rounded-[5px] bg-fill-hover px-2 py-1 text-[12px] font-medium">
      {children}
    </kbd>
  );
}

function GhostButton({
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
      <span className="flex items-center gap-1.5 px-1.5 text-[12px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
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
            <span className="text-[11px] font-medium text-muted-foreground">
              {formatDaysAgo(item.daysAgo)}
            </span>
            <span className="text-[13px] leading-snug font-medium text-foreground/90">
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
              "group relative flex items-center rounded-[7px] py-1.5 text-left text-[14px] font-medium transition-colors",
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
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-fill-hover text-[12px] font-semibold">
              A
            </div>
            {collapsed ? (
              <HoverTip label="Superwhisper PRO" />
            ) : (
              <span className="truncate text-[13px] font-medium text-foreground/80">
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

type SetupTask = {
  id: string;
  label: string;
  done: boolean;
  icon: LucideIcon;
};

const SETUP_SEED: SetupTask[] = [
  { id: "record", label: "Try your first dictation", done: true, icon: Mic },
  { id: "language", label: "Pick your language", done: true, icon: Globe },
  {
    id: "shortcuts",
    label: "Customize your shortcuts",
    done: false,
    icon: Keyboard,
  },
  {
    id: "vocabulary",
    label: "Add a word to your dictionary",
    done: false,
    icon: BookOpen,
  },
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
  const nextId = tasks.find((t) => !t.done)?.id;

  return (
    <div className="elevated-popover absolute right-3 bottom-11 z-30 w-[286px] overflow-hidden rounded-[10px] bg-popover">
      <div className="flex items-center gap-1 px-3.5 pt-3">
        <span className="flex-1 text-[14px] font-semibold text-foreground">
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
        <span className="shrink-0 text-[12px] font-medium text-muted-foreground tabular-nums">
          {done}/{tasks.length}
        </span>
      </div>

      <div className="flex flex-col pb-2">
          {allDone && (
            <p className="px-3.5 pb-2 text-[13px] leading-relaxed text-muted-foreground">
              That&rsquo;s everything — you&rsquo;re set up.
            </p>
          )}
          {tasks.map((task) => {
            const isNext = task.id === nextId;
            return (
              <button
                key={task.id}
                onClick={() => onToggle(task.id)}
                className="flex items-center gap-2.5 px-3.5 py-1.5 text-left transition-colors hover:bg-fill"
              >
                <span
                  className={cn(
                    "relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                    task.done || isNext
                      ? "bg-primary/12 text-primary"
                      : "bg-fill-strong text-muted-foreground/60",
                  )}
                >
                  <task.icon className="h-3.5 w-3.5" strokeWidth={2} />
                  {task.done && (
                    <span className="absolute -right-0.5 -bottom-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-primary ring-2 ring-popover">
                      <Check
                        className="h-[7px] w-[7px] text-primary-foreground"
                        strokeWidth={3.5}
                      />
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "flex-1 text-[14px]",
                    task.done
                      ? "text-muted-foreground line-through"
                      : "text-foreground",
                  )}
                >
                  {task.label}
                </span>
                {isNext && (
                  <span className="shrink-0 text-[11px] font-semibold tracking-wide text-primary/80 uppercase">
                    Next
                  </span>
                )}
              </button>
            );
          })}
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
      <span className="text-[21px] font-semibold tracking-tight text-foreground">
        {value}
      </span>
      <span className="text-[13px] text-muted-foreground">{label}</span>
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
          <span className="flex items-center gap-1.5 text-[12px] font-semibold tracking-wide text-white/70 uppercase">
            <Lock className="h-3 w-3" strokeWidth={2} />
            Private by design
          </span>
          <p className="text-[16px] font-semibold text-white">
            Nothing leaves your Mac.
          </p>
        </div>
        <button
          onClick={onOpenModels}
          className="shrink-0 rounded-full bg-white/15 px-3.5 py-1.5 text-[13px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25"
        >
          Switch model →
        </button>
      </div>
    </div>
  );
}

function Waveform() {
  const bars = [4, 9, 6, 12, 7, 10, 5, 13, 8, 6, 11, 7, 9, 5, 10, 6, 12, 8, 5, 9];
  return (
    <div className="flex flex-1 items-center gap-[2px]">
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-[2px] shrink-0 rounded-full bg-foreground/25"
          style={{ height: h }}
        />
      ))}
    </div>
  );
}

/**
 * Clicking copies — getting the text back is the job people come here for.
 * Everything else waits behind a disclosure, and the variant switcher only
 * appears when there's actually a second version to look at: a four-second
 * dictation has no segments and often no AI edit to undo.
 */
function HistoryRow({ item }: { item: HistoryItem }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState<"clean" | "original" | "segments">(
    "clean"
  );

  const hasOriginal = !!item.original && item.original !== item.text;
  const hasSegments = (item.segments?.length ?? 0) > 1;
  const showVariants = hasOriginal || hasSegments;

  const copy = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="hairline group overflow-hidden rounded-[9px] bg-card">
      <div className="flex items-center gap-2 px-3.5 py-2.5">
        <button
          onClick={copy}
          title="Click to copy"
          className="min-w-0 flex-1 text-left text-[14px] leading-snug text-foreground/90"
        >
          {item.text}
        </button>

        <span
          className={cn(
            "shrink-0 text-[12px] font-medium text-primary transition-opacity",
            copied ? "opacity-100" : "opacity-0"
          )}
        >
          Copied
        </span>

        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <button
            onClick={copy}
            aria-label="Copy"
            className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
          >
            <Copy className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Hide details" : "Show details"}
            className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
          >
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>

      {open && (
        <div className="flex flex-col gap-3 border-t border-line px-3.5 py-3">
          <div className="hairline flex items-center gap-2.5 rounded-[7px] bg-fill px-2.5 py-2">
            <button
              aria-label="Play"
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            >
              <Play className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
            <Waveform />
            <span className="shrink-0 text-[12px] text-muted-foreground tabular-nums">
              0:{String(item.seconds).padStart(2, "0")}
            </span>
          </div>

          {showVariants && (
            <>
              <SegmentedControl
                value={variant}
                onValueChange={(v) =>
                  setVariant(v as "clean" | "original" | "segments")
                }
                options={[
                  { value: "clean", label: "Cleaned up" },
                  ...(hasOriginal
                    ? [{ value: "original", label: "Original" }]
                    : []),
                  ...(hasSegments
                    ? [{ value: "segments", label: "Timestamps" }]
                    : []),
                ]}
              />

              {variant === "original" && (
                <p className="text-[14px] leading-relaxed text-muted-foreground">
                  {item.original}
                </p>
              )}
              {variant === "segments" && (
                <div className="flex flex-col gap-2">
                  {item.segments!.map((seg) => (
                    <div key={seg.at} className="flex gap-3">
                      <span className="shrink-0 text-[13px] text-muted-foreground tabular-nums">
                        {seg.at}
                      </span>
                      <span className="text-[14px] leading-snug text-foreground/90">
                        {seg.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="flex items-center gap-1">
            <GhostButton>Re-run</GhostButton>
            <button
              aria-label="Delete"
              className="ml-auto flex h-7 w-7 items-center justify-center rounded-[6px] text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * The one thing Home leads with — what to do right now, not how you've done
 * so far. Stats and history are worth having, but they're a look backward;
 * this is the look forward, so it comes first.
 */
function DictationHero({ modeName }: { modeName: string }) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/12">
        <Mic className="h-[18px] w-[18px] text-primary" strokeWidth={2} />
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="flex items-center gap-2 text-[22px] font-semibold tracking-tight text-foreground">
          Hold <Kbd>Fn</Kbd> to dictate
        </p>
        <p className="truncate text-[14px] text-muted-foreground">
          Into {modeName}
        </p>
      </div>
    </div>
  );
}

function HomePanel({
  onOpenModels,
  activeModeName,
}: {
  onOpenModels: () => void;
  activeModeName: string;
}) {
  const [query, setQuery] = useState("");

  const groups = HISTORY_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((it) =>
      it.text.toLowerCase().includes(query.trim().toLowerCase()),
    ),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-10">
      <DictationHero modeName={activeModeName} />

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <PopupButton value="All time" />
          <button
            aria-label="Export stats"
            className="flex h-6 w-6 items-center justify-center rounded-[6px] text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
          >
            <Download className="h-[15px] w-[15px]" strokeWidth={2} />
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
          <h2 className="flex shrink-0 items-center gap-2 text-[16px] font-semibold text-foreground">
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
              className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="hairline rounded-[10px] bg-card px-4 py-6 text-center text-[13px] text-muted-foreground">
            No dictations match &ldquo;{query}&rdquo;.
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-2">
              <span className="text-[12px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
                {group.label}
              </span>
              <div className="flex flex-col gap-1.5">
                {group.items.map((item) => (
                  <HistoryRow key={item.id} item={item} />
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
/*                                 Dictionary                                  */
/* -------------------------------------------------------------------------- */

/** A term is one entry — the correction is an optional attribute of it,
 *  not a separate category. "super whisper" and its fix "Superwhisper"
 *  are the same term, not two different kinds of thing. */
type TermEntry = { id: string; word: string; correction?: string };

/** A different mechanic entirely: a short trigger phrase that expands to
 *  a long block of text (an email, an address, a sign-off) — not a
 *  pronunciation fix, so it doesn't belong in the same list as terms. */
type ShortcutEntry = { id: string; trigger: string; replacement: string };

type DictionaryTab = "terms" | "shortcuts";

let vocabIdCounter = 0;
function nextVocabId() {
  vocabIdCounter += 1;
  return `new-${vocabIdCounter}`;
}

const SHORTCUTS_SEED: ShortcutEntry[] = [
  { id: "seed-email", trigger: "my email", replacement: "angel@example.com" },
  { id: "seed-signoff", trigger: "my sign off", replacement: "Best,\nAngel" },
];

function DictionaryPanel() {
  const [terms, setTerms] = useState<TermEntry[]>([
    { id: "seed-call", word: "call" },
    { id: "seed-controll", word: "controll" },
    { id: "seed-json", word: "json" },
    { id: "seed-jsons", word: "jsons" },
    { id: "seed-livekit", word: "livekit" },
    { id: "seed-mockups", word: "mockups" },
    { id: "seed-super-whisper", word: "super whisper", correction: "Superwhisper" },
    { id: "seed-superwhisper", word: "Superwhisper" },
    { id: "seed-telnyx", word: "telnyx" },
  ]);
  const [shortcuts, setShortcuts] = useState<ShortcutEntry[]>(SHORTCUTS_SEED);
  const [tab, setTab] = useState<DictionaryTab>("terms");
  const [addOpen, setAddOpen] = useState(false);

  const [termDraft, setTermDraft] = useState("");
  const [addCorrection, setAddCorrection] = useState(false);
  const [misspellingDraft, setMisspellingDraft] = useState("");
  const [correctionDraft, setCorrectionDraft] = useState("");

  const [triggerDraft, setTriggerDraft] = useState("");
  const [replacementDraft, setReplacementDraft] = useState("");

  const updateTermWord = (id: string, word: string) =>
    setTerms((prev) => prev.map((e) => (e.id === id ? { ...e, word } : e)));

  const updateTermCorrection = (id: string, correction: string) =>
    setTerms((prev) => prev.map((e) => (e.id === id ? { ...e, correction } : e)));

  const removeTerm = (id: string) =>
    setTerms((prev) => prev.filter((e) => e.id !== id));

  const updateShortcutTrigger = (id: string, trigger: string) =>
    setShortcuts((prev) => prev.map((e) => (e.id === id ? { ...e, trigger } : e)));

  const updateShortcutReplacement = (id: string, replacement: string) =>
    setShortcuts((prev) =>
      prev.map((e) => (e.id === id ? { ...e, replacement } : e)),
    );

  const removeShortcut = (id: string) =>
    setShortcuts((prev) => prev.filter((e) => e.id !== id));

  const openAdd = () => {
    setTermDraft("");
    setAddCorrection(false);
    setMisspellingDraft("");
    setCorrectionDraft("");
    setTriggerDraft("");
    setReplacementDraft("");
    setAddOpen(true);
  };

  const submitAdd = () => {
    if (tab === "terms") {
      if (addCorrection) {
        const word = misspellingDraft.trim();
        const correction = correctionDraft.trim();
        if (!word || !correction) return;
        setTerms((prev) => [{ id: nextVocabId(), word, correction }, ...prev]);
      } else {
        const word = termDraft.trim();
        if (!word) return;
        setTerms((prev) => [{ id: nextVocabId(), word }, ...prev]);
      }
    } else {
      const trigger = triggerDraft.trim();
      const replacement = replacementDraft.trim();
      if (!trigger || !replacement) return;
      setShortcuts((prev) => [
        { id: nextVocabId(), trigger, replacement },
        ...prev,
      ]);
    }
    setAddOpen(false);
  };

  const canSubmit =
    tab === "terms"
      ? addCorrection
        ? misspellingDraft.trim() && correctionDraft.trim()
        : termDraft.trim()
      : triggerDraft.trim() && replacementDraft.trim();

  return (
    <div className="flex flex-col gap-4">
      <PanelIntro
        title="Dictionary"
        description="Terms are heard as-is; shortcuts expand a short phrase into more."
      />

      <div className="flex items-center justify-between gap-4">
        <SegmentedControl
          value={tab}
          onValueChange={(v) => setTab(v as DictionaryTab)}
          options={[
            { value: "terms", label: `Terms (${terms.length})` },
            { value: "shortcuts", label: `Shortcuts (${shortcuts.length})` },
          ]}
        />
        <GhostButton
          onClick={openAdd}
          className="rounded-full bg-transparent px-3.5 py-1.5"
        >
          {tab === "terms" ? "+ Add term" : "+ Add shortcut"}
        </GhostButton>
      </div>

      {tab === "terms" ? (
        terms.length === 0 ? (
          <div className="hairline rounded-[10px] px-4 py-6 text-center text-[13px] text-muted-foreground">
            No terms yet.
          </div>
        ) : (
          <div className="hairline overflow-hidden rounded-[10px] bg-card">
            {terms.map((entry, i) => (
              <SettingsRow
                key={entry.id}
                label={
                  <InlineEdit
                    value={entry.word}
                    onChange={(word) => updateTermWord(entry.id, word)}
                  />
                }
                description={
                  entry.correction !== undefined ? (
                    <span className="flex items-center gap-1">
                      →
                      <InlineEdit
                        value={entry.correction}
                        onChange={(v) => updateTermCorrection(entry.id, v)}
                      />
                    </span>
                  ) : undefined
                }
                last={i === terms.length - 1}
                control={
                  <button
                    onClick={() => removeTerm(entry.id)}
                    className="text-[13px] font-medium text-muted-foreground hover:text-foreground"
                  >
                    Remove
                  </button>
                }
              />
            ))}
          </div>
        )
      ) : shortcuts.length === 0 ? (
        <div className="hairline rounded-[10px] px-4 py-6 text-center text-[13px] text-muted-foreground">
          No shortcuts yet.
        </div>
      ) : (
        <div className="hairline overflow-hidden rounded-[10px] bg-card">
          {shortcuts.map((entry, i) => (
            <SettingsRow
              key={entry.id}
              label={
                <InlineEdit
                  value={entry.trigger}
                  onChange={(v) => updateShortcutTrigger(entry.id, v)}
                />
              }
              description={
                <span className="flex items-center gap-1">
                  ↳
                  <InlineEdit
                    value={entry.replacement}
                    onChange={(v) => updateShortcutReplacement(entry.id, v)}
                  />
                </span>
              }
              last={i === shortcuts.length - 1}
              control={
                <button
                  onClick={() => removeShortcut(entry.id)}
                  className="text-[13px] font-medium text-muted-foreground hover:text-foreground"
                >
                  Remove
                </button>
              }
            />
          ))}
        </div>
      )}

      {addOpen && (
        <DetailModal width="360px" onClose={() => setAddOpen(false)}>
          {tab === "terms" ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-[16px] font-semibold text-foreground">
                  Add a term
                </h2>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  Names, slang, or custom terms Superwhisper should recognize.
                </p>
              </div>

              <label className="flex items-center gap-2.5">
                <Switch
                  size="sm"
                  checked={addCorrection}
                  onCheckedChange={(c) => setAddCorrection(c === true)}
                />
                <span className="text-[13px] font-medium text-foreground">
                  Add a correction
                </span>
              </label>

              {addCorrection ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="dictionary-misheard"
                      className="text-[12px] font-medium text-muted-foreground"
                    >
                      Misspelling
                    </label>
                    <input
                      id="dictionary-misheard"
                      autoFocus
                      value={misspellingDraft}
                      onChange={(e) => setMisspellingDraft(e.target.value)}
                      placeholder="e.g. super whisper"
                      className="hairline rounded-[7px] bg-fill px-3 py-2 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="dictionary-correction"
                      className="text-[12px] font-medium text-muted-foreground"
                    >
                      Correction
                    </label>
                    <input
                      id="dictionary-correction"
                      value={correctionDraft}
                      onChange={(e) => setCorrectionDraft(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submitAdd()}
                      placeholder="e.g. Superwhisper"
                      className="hairline rounded-[7px] bg-fill px-3 py-2 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <input
                  autoFocus
                  name="dictionary-term"
                  value={termDraft}
                  onChange={(e) => setTermDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitAdd()}
                  placeholder="The word you'll say"
                  className="hairline rounded-[7px] bg-fill px-3 py-2 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              )}

              <button
                onClick={submitAdd}
                disabled={!canSubmit}
                className="self-end rounded-[6px] bg-primary px-3.5 py-1.5 text-[13px] font-medium text-primary-foreground transition-colors hover:brightness-110 disabled:pointer-events-none disabled:opacity-40"
              >
                Add
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-[16px] font-semibold text-foreground">
                  Add a shortcut
                </h2>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  Say the trigger phrase and it expands to the full text —
                  handy for an email, address, or sign-off.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="dictionary-trigger"
                  className="text-[12px] font-medium text-muted-foreground"
                >
                  Original
                </label>
                <input
                  id="dictionary-trigger"
                  autoFocus
                  value={triggerDraft}
                  onChange={(e) => setTriggerDraft(e.target.value)}
                  placeholder="The phrase you'll say"
                  className="hairline rounded-[7px] bg-fill px-3 py-2 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="dictionary-replacement"
                  className="text-[12px] font-medium text-muted-foreground"
                >
                  Replacement
                </label>
                <textarea
                  id="dictionary-replacement"
                  value={replacementDraft}
                  onChange={(e) => setReplacementDraft(e.target.value)}
                  rows={3}
                  placeholder="What it should be replaced with"
                  className="hairline min-h-[76px] resize-y rounded-[7px] bg-fill px-3 py-2 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              <button
                onClick={submitAdd}
                disabled={!canSubmit}
                className="self-end rounded-[6px] bg-primary px-3.5 py-1.5 text-[13px] font-medium text-primary-foreground transition-colors hover:brightness-110 disabled:pointer-events-none disabled:opacity-40"
              >
                Add
              </button>
            </div>
          )}
        </DetailModal>
      )}
    </div>
  );
}

/** Modes isn't here — it renders its own list/detail flow directly in the
 *  workbench pane rather than a single stateless panel component. */
const DAILY_PANELS: Record<
  Exclude<DailyKey, "modes">,
  (props: {
    onOpenModels: () => void;
    activeModeName: string;
  }) => React.ReactNode
> = {
  home: HomePanel,
  vocabulary: DictionaryPanel,
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
          "text-[12px] font-medium",
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
          <span className="w-[104px] shrink-0 pt-3 text-[14px] font-medium text-foreground">
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
          <span className="w-[104px] shrink-0 pt-3 text-[14px] font-medium text-foreground">
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

/* -------------------------------------------------------------------------- */
/*                              settings: Privacy                              */
/* -------------------------------------------------------------------------- */

/**
 * Save audio / Save to history / Copy result to clipboard used to live
 * here too, duplicating rows Super and every mode already own. Trimmed to
 * the settings that are genuinely app-level — nothing here is overridable
 * per mode, so this is the one place they can live.
 */
function PrivacyPanel() {
  return (
    <div className="flex flex-col gap-8">
      <PanelIntro
        title="Privacy"
        description="Data handling no mode can override."
      />

      <SettingsSection
        title="History"
        description="How long the local record sticks around."
      >
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
        title="Files"
        description="Where recordings and transcripts live on disk."
      >
        <SettingsRow
          label={
            <span className="font-mono text-[13px] text-muted-foreground">
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
            <button className="hairline rounded-[6px] bg-destructive/12 px-2.5 py-1 text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/20">
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
            <span className="text-[13px] text-muted-foreground/60">
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
 * Auto and "no mode" only coincide when you're in an app nothing is mapped
 * to — which is most of the time, and why they read as the same thing. Auto
 * carries what it currently resolves to so the difference is visible.
 */
function ModePopover({
  modes,
  override,
  autoMode,
  onPick,
  onOpenSettings,
  onClose,
}: {
  modes: ModeItem[];
  override: string | null;
  autoMode?: ModeItem;
  onPick: (value: string | null) => void;
  onOpenSettings: () => void;
  onClose: () => void;
}) {
  const row = (
    label: string,
    checked: boolean,
    onClick: () => void,
    trailing?: string,
    disabled?: boolean
  ) => (
    <button
      key={label}
      disabled={disabled}
      onClick={() => {
        onClick();
        onClose();
      }}
      className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left transition-colors hover:bg-fill-hover disabled:pointer-events-none disabled:opacity-40"
    >
      <Check
        className={cn(
          "h-3.5 w-3.5 shrink-0 text-foreground",
          !checked && "opacity-0"
        )}
        strokeWidth={2.5}
      />
      <span className="flex-1 truncate text-[14px] text-foreground">
        {label}
      </span>
      {trailing && (
        <span className="shrink-0 text-[12px] text-muted-foreground">
          {trailing}
        </span>
      )}
    </button>
  );

  return (
    <>
      <div className="absolute inset-0 z-50 bg-black/25" onClick={onClose} />
      <div className="elevated-popover absolute right-3 bottom-10 z-50 w-[276px] overflow-hidden rounded-[10px] bg-popover/85 py-1 backdrop-blur-xl backdrop-saturate-150">
        {row(
          "Auto",
          override === null,
          () => onPick(null),
          autoMode ? autoMode.name : "Super"
        )}

        <div className="my-1 h-px bg-line" />

        {/* Super is one more row here too — same list as the custom modes,
            just first, the way it's pinned first in the Modes settings list. */}
        {row("Super", override === "super", () => onPick("super"), "Base")}
        {modes.map((mode) =>
          row(
            mode.name,
            override === mode.id,
            () => onPick(mode.id),
            mode.enabled ? undefined : "Off",
            !mode.enabled
          )
        )}

        <div className="my-1 h-px bg-line" />

        <button
          onClick={() => {
            onOpenSettings();
            onClose();
          }}
          className="flex w-full items-center px-2.5 py-1.5 text-left transition-colors hover:bg-fill-hover"
        >
          <span className="pl-[22px] text-[14px] text-foreground">
            Mode settings…
          </span>
        </button>
      </div>
    </>
  );
}

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
      <div className="elevated-popover absolute right-3 bottom-10 z-50 w-[248px] overflow-hidden rounded-[10px] bg-popover/85 py-1 backdrop-blur-xl backdrop-saturate-150">
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
            <span className="flex-1 truncate text-[14px] text-foreground">
              {mic.name}
            </span>
            {!mic.connected && (
              <span className="shrink-0 text-[12px] text-muted-foreground">
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
          <span className="pl-[22px] text-[14px] text-foreground">
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
          <span className="w-4 shrink-0 text-[13px] text-muted-foreground tabular-nums">
            {i + 1}
          </span>
          <span className="flex-1 text-[14px] font-medium text-foreground">
            {mic.name}
          </span>

          {mic.id === activeId && (
            <span className="shrink-0 rounded-[4px] bg-primary/15 px-1.5 py-px text-[11px] font-semibold tracking-wide text-primary uppercase">
              In use
            </span>
          )}
          <span
            className={cn(
              "shrink-0 text-[12px]",
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
        description="Records with the first one connected."
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
      <PanelIntro
        title="Models"
        description="Every model available. Which one a mode uses is set on that mode."
      />

      <div className="flex flex-col gap-4">
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
              className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
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
            className="hairline flex h-7 items-center gap-1.5 rounded-[6px] bg-fill-hover px-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-fill-strong"
          >
            <KeyRound className="h-[13px] w-[13px]" strokeWidth={2} />
            <Plus className="h-3 w-3" strokeWidth={2.5} />
          </button>
        </div>

        <div className="hairline overflow-hidden rounded-[10px] bg-card">
          <div className="hairline-b grid grid-cols-[1fr_44px_74px_64px] items-center gap-2 px-3 py-2 text-[12px] font-medium text-muted-foreground">
            <span className="pl-6">Model name</span>
            <span>Type</span>
            <span>Speed / Acc.</span>
            <span className="text-right">Cloud/Offline</span>
          </div>

          {rows.length === 0 && (
            <div className="px-4 py-6 text-center text-[13px] text-muted-foreground">
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
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] text-[10px] font-bold",
                      provider.className,
                    )}
                  >
                    {provider.label}
                  </span>
                  <span className="truncate text-[12.5px] text-foreground">
                    {model.name}
                  </span>
                  {model.isNew && (
                    <span className="shrink-0 rounded-[3px] bg-fill-strong px-1 py-px text-[10px] font-semibold tracking-wide text-foreground/80 uppercase">
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
                      <span className="text-[12px] text-muted-foreground">
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
/** Resolves a mode against the base — the same merge the app would do. */
function resolveMode(base: BaseSettings, mode?: ModeItem): BaseSettings {
  return mode ? { ...base, ...mode.overrides } : base;
}

/**
 * Renders typed-in text under a given set of settings — reading the result
 * beats reading "Autocapitalize: On → Off". No sample ships baked in: this
 * only shows anything once someone actually types something to try.
 */
function renderSample(settings: BaseSettings, text: string): string {
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

function SamplePreview({
  base,
  mode,
  previewText,
}: {
  base: BaseSettings;
  mode: ModeItem;
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

/**
 * Super's page — the one place its settings live. There's no other tab
 * these ever also appear on: Super IS the definition, not a summary of it,
 * the same way a custom mode's overrides only ever live on that mode.
 */
function SuperDetailPanel({
  base,
  managed,
  onChange,
}: {
  base: BaseSettings;
  managed: boolean;
  onChange: (key: SettingKey, value: BaseSettings[SettingKey]) => void;
}) {
  const groups = [...new Set(SETTING_DEFS.map((d) => d.group))];

  return (
    <div className="flex flex-col gap-8">
      <PanelIntro
        title="Super"
        description="This is what everyone gets unless a mode overrides it."
      />

      {groups.map((group) => (
        <SettingsSection key={group} title={group}>
          {SETTING_DEFS.filter((d) => d.group === group).map((def, i, arr) => {
            const control = (
              <SettingControl
                def={def}
                value={base[def.key]}
                onChange={(v) => onChange(def.key, v)}
              />
            );
            return (
              <SettingsRow
                key={def.key}
                label={
                  <span>
                    {def.label}
                    <InfoDot />
                  </span>
                }
                last={i === arr.length - 1}
                control={
                  def.locked ? (
                    <PolicyLocked locked={managed}>{control}</PolicyLocked>
                  ) : (
                    control
                  )
                }
              />
            );
          })}
        </SettingsSection>
      ))}
    </div>
  );
}

function ModesPanel({
  modes,
  base,
  previewText,
  onPreviewTextChange,
  onOpenMode,
  onOpenSuper,
  onRename,
}: {
  modes: ModeItem[];
  base: BaseSettings;
  previewText: string;
  onPreviewTextChange: (value: string) => void;
  onOpenMode: (id: string) => void;
  onOpenSuper: () => void;
  onRename: (id: string, name: string) => void;
}) {
  const on = modes.filter((m) => m.enabled).length;

  return (
    <div className="flex flex-col gap-8">
      <PanelIntro
        title="Modes"
        description={
          <>
            A mode overrides Super only for the apps you point it at.{" "}
            {on} of {modes.length} are on.
          </>
        }
      />

      <input
        name="mode-preview-text"
        value={previewText}
        onChange={(e) => onPreviewTextChange(e.target.value)}
        placeholder="Try dictating something — see how each mode changes it"
        className="hairline rounded-[8px] bg-card px-3.5 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
      />

      <section className="flex flex-col gap-4">
        {/* Pinned, not a toggle: this is the thing modes are diffs against,
            not one more thing that can be switched off. */}
        <div
          onClick={onOpenSuper}
          className="hairline flex cursor-pointer items-center gap-3 rounded-[9px] bg-card px-3.5 py-3 transition-colors hover:bg-fill"
        >
          <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] bg-primary/15 text-primary">
            <Sparkles className="h-3 w-3" strokeWidth={2.5} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-[14px] font-medium text-foreground">
              Super
            </span>
            <span className="truncate text-[13px] text-muted-foreground">
              The base — everyone gets this unless a mode below overrides it
            </span>
          </div>
          <span className="shrink-0 rounded-[4px] bg-fill-strong px-1.5 py-px text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Base
          </span>
          <ChevronRight
            className="h-4 w-4 shrink-0 text-muted-foreground"
            strokeWidth={2}
          />
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-foreground">
            Custom modes
          </h2>
          <GhostButton>+ Create mode</GhostButton>
        </div>

        <div className="flex flex-col gap-2">
          {modes.map((mode) => {
            const count = Object.keys(mode.overrides).length;
            return (
              <div
                key={mode.id}
                onClick={() => onOpenMode(mode.id)}
                className="hairline flex cursor-pointer items-center gap-3 rounded-[9px] bg-card px-3.5 py-3 transition-colors hover:bg-fill"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span
                    onClick={(e) => e.stopPropagation()}
                    className="min-w-0"
                  >
                    <InlineEdit
                      value={mode.name}
                      onChange={(name) => onRename(mode.id, name)}
                      className="whitespace-nowrap text-[14px] font-medium text-foreground"
                    />
                  </span>
                  <span className="truncate text-[13px] text-muted-foreground">
                    {mode.apps.join(", ")} · {count}{" "}
                    {count === 1 ? "override" : "overrides"}
                  </span>
                  {previewText.trim() !== "" && (
                    <span className="truncate text-[13px] text-foreground/55 italic">
                      {renderSample(resolveMode(base, mode), previewText)}
                    </span>
                  )}
                </div>
                {!mode.enabled && (
                  <span className="shrink-0 rounded-[4px] bg-fill-strong px-1.5 py-px text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                    No Auto
                  </span>
                )}
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  strokeWidth={2}
                />
              </div>
            );
          })}
        </div>
      </section>
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

/* -------------------------------------------------------------------------- */
/*                          sub-pages: Modes list/detail                       */
/* -------------------------------------------------------------------------- */

function ModeDetailPanel({
  mode,
  base,
  previewText,
  onSetOverride,
  onClearOverride,
  onSetInstructions,
  onToggleMode,
}: {
  mode: ModeItem;
  base: BaseSettings;
  previewText: string;
  onSetOverride: (key: SettingKey, value: BaseSettings[SettingKey]) => void;
  onClearOverride: (key: SettingKey) => void;
  onSetInstructions: (value: string) => void;
  onToggleMode: (enabled: boolean) => void;
}) {
  const [picking, setPicking] = useState(false);

  /** In the order each was added, not SETTING_DEFS' fixed order — a newly
   *  added override belongs at the bottom, not wherever its group happens
   *  to fall. Object key order follows insertion order in JS, so this is
   *  just reading it off mode.overrides directly. */
  const overridden = (Object.keys(mode.overrides) as SettingKey[])
    .map((key) => SETTING_DEFS.find((d) => d.key === key)!)
    .filter(Boolean);
  const available = SETTING_DEFS.filter((d) => !(d.key in mode.overrides));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <PanelIntro
          title={mode.name}
          description={
            overridden.length === 0 ? (
              <>Follows Super — nothing overridden yet.</>
            ) : (
              <>
                Overrides {overridden.length}{" "}
                {overridden.length === 1 ? "setting" : "settings"}.
              </>
            )
          }
        />
        <label className="flex shrink-0 items-center gap-2 pt-0.5">
          <span className="text-[13px] font-medium text-muted-foreground">
            Auto
          </span>
          <Switch
            size="sm"
            checked={mode.enabled}
            onCheckedChange={(c) => onToggleMode(c === true)}
          />
        </label>
      </div>

      <SamplePreview base={base} mode={mode} previewText={previewText} />

      {/* What makes this mode this mode. */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="mode-instructions"
            className="text-[14px] font-medium text-foreground"
          >
            Custom instructions
          </label>
          <textarea
            id="mode-instructions"
            value={mode.instructions}
            onChange={(e) => onSetInstructions(e.target.value)}
            rows={3}
            placeholder="Adjust the transcript to your style using natural language."
            className="hairline min-h-[76px] resize-y rounded-[8px] bg-card px-3 py-2.5 text-[14px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
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
            <span className="text-[13px] text-muted-foreground/60">
              Record shortcut
            </span>
          }
        />
      </SettingsSection>

      {/* Overrides — this holds the diff against Super. Never scattered to
          Dictation/Privacy/Models; those hold Super's own copy, this holds
          only what this mode changes. */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[16px] font-semibold text-foreground">
          Overrides
        </h2>

        {overridden.length > 0 ? (
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
                      value={
                        mode.overrides[def.key] as BaseSettings[SettingKey]
                      }
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
        ) : (
          !picking && (
            <p className="text-[13px] text-muted-foreground">
              Nothing overridden yet — everything follows Super.
            </p>
          )
        )}

        {picking ? (
          <div className="hairline flex flex-col gap-3 rounded-[10px] bg-card p-3">
            {[...new Set(available.map((d) => d.group))].map((group) => (
              <div key={group} className="flex flex-col gap-1">
                <span className="px-1 text-[12px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
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
                      <span className="text-[14px] text-foreground">
                        {def.label}
                      </span>
                      <span className="text-[13px] text-muted-foreground">
                        {formatSettingValue(base[def.key])}
                      </span>
                    </button>
                  ))}
              </div>
            ))}
            <button
              onClick={() => setPicking(false)}
              className="self-start px-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground"
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
      <PanelIntro
        title="Plans"
        description="Upgrades apply right away. Downgrades take effect on Sep 4, 2026, when the current period ends."
      />

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
                <span className="flex items-center gap-1.5 text-[14px] font-semibold text-foreground">
                  {plan.name}
                  {isCurrent && (
                    <span className="rounded-[4px] bg-fill-strong px-1.5 py-px text-[10px] font-semibold tracking-wide text-foreground/80 uppercase">
                      Current
                    </span>
                  )}
                </span>
                <ul className="flex flex-col gap-1">
                  {plan.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-center gap-1.5 text-[13px] text-muted-foreground"
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
                  <span className="text-[14px] font-semibold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-[12px] text-muted-foreground">
                    {plan.cadence}
                  </span>
                </div>
                {isCurrent ? (
                  <span className="text-[13px] text-muted-foreground">
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
  /** Modes' own drill-down — lives in the daily pane now, not Settings. */
  const [modesSubpage, setModesSubpage] = useState<ModesSubpage>(null);
  const [whatsNewItem, setWhatsNewItem] = useState<WhatsNewItem | null>(null);
  const [whatsNewStack, setWhatsNewStack] =
    useState<WhatsNewItem[]>(WHATS_NEW_SEED);
  const [modes, setModes] = useState<ModeItem[]>(MODES_SEED);
  const [base, setBase] = useState<BaseSettings>(BASE_DEFAULTS);
  const [mics, setMics] = useState<MicDevice[]>(MICS_SEED);
  const [pickedMicId, setPickedMicId] = useState<string | null>(null);
  /** null = let the app decide, "super" = pin the base, otherwise a mode id. */
  const [modeOverride, setModeOverride] = useState<string | null>(null);
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const [micMenuOpen, setMicMenuOpen] = useState(false);
  /** What someone typed to try out — shared across the Modes list and
   *  every mode's own preview, so it only has to be typed once. */
  const [previewText, setPreviewText] = useState("");

  const autoMode = modes.find((m) => m.enabled);
  const activeMode =
    modeOverride === null
      ? autoMode
      : modeOverride === "super"
        ? undefined
        : modes.find((m) => m.id === modeOverride);

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

  /** Only ever rendered when active !== "modes" — see the ternary below. */
  const DailyPanel = DAILY_PANELS[active as Exclude<DailyKey, "modes">];

  const openWhatsNew = (item: WhatsNewItem) => {
    setWhatsNewItem(item);
    setWhatsNewStack((prev) => prev.filter((i) => i.id !== item.id));
  };

  const openSettingsAt = (tab: SettingsKey) => {
    setSettingsTab(tab);
    setSubpage(null);
    setSettingsOpen(true);
  };

  const toggleMode = (id: string, enabled: boolean) =>
    setModes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled } : m))
    );

  const renameMode = (id: string, name: string) =>
    setModes((prev) => prev.map((m) => (m.id === id ? { ...m, name } : m)));

  const setModeInstructions = (id: string, instructions: string) =>
    setModes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, instructions } : m))
    );

  // Which pane the Settings modal shows, plus its back target. Modes left
  // this modal entirely — system/plans are the only sub-pages left here.
  let settingsBody: React.ReactNode;
  let onBack: (() => void) | undefined;
  const paneKey = subpage ? subpage.kind : settingsTab;

  if (subpage?.kind === "system") {
    settingsBody = <SystemPanel />;
    onBack = () => setSubpage(null);
  } else if (subpage?.kind === "plans") {
    settingsBody = <PlansPanel />;
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
      ) : settingsTab === "shortcuts" ? (
        <ShortcutsPanel />
      ) : settingsTab === "privacy" ? (
        <PrivacyPanel />
      ) : settingsTab === "sound" ? (
        <SoundPanel mics={mics} onReorderMics={reorderMics} />
      ) : (
        <ModelsPanel />
      );
  }

  // The daily "Modes" pane's own drill-down, rendered in the workbench
  // pane rather than the Settings modal — same data, same handlers
  // ModeDetailPanel/SuperDetailPanel always used, just a different host.
  const modesDetailMode =
    modesSubpage?.kind === "modeDetail"
      ? modes.find((m) => m.id === modesSubpage.modeId)
      : undefined;

  let modesBody: React.ReactNode;
  const modesPaneKey =
    modesSubpage?.kind === "modeDetail"
      ? `mode:${modesSubpage.modeId}`
      : (modesSubpage?.kind ?? "list");

  if (modesSubpage?.kind === "superDetail") {
    modesBody = (
      <SuperDetailPanel base={base} managed={isManaged} onChange={setBaseValue} />
    );
  } else if (modesDetailMode) {
    modesBody = (
      <ModeDetailPanel
        mode={modesDetailMode}
        base={base}
        previewText={previewText}
        onSetOverride={(k, v) => setOverride(modesDetailMode.id, k, v)}
        onClearOverride={(k) => clearOverride(modesDetailMode.id, k)}
        onSetInstructions={(v) => setModeInstructions(modesDetailMode.id, v)}
        onToggleMode={(enabled) => toggleMode(modesDetailMode.id, enabled)}
      />
    );
  } else {
    modesBody = (
      <ModesPanel
        modes={modes}
        base={base}
        previewText={previewText}
        onPreviewTextChange={setPreviewText}
        onOpenMode={(id) => setModesSubpage({ kind: "modeDetail", modeId: id })}
        onOpenSuper={() => setModesSubpage({ kind: "superDetail" })}
        onRename={renameMode}
      />
    );
  }

  return (
    <main
      id="app-root"
      className={cn(
        "flex min-h-screen items-center justify-center bg-desk p-10 transition-colors duration-300",
        appearance === "dark" && "dark",
      )}
    >
      <AccountFixtureSwitcher
        value={accountFixture}
        onChange={setAccountFixture}
      />

      <MacWindow width="1120px" height="760px">
        <div className="flex min-h-0 flex-1 gap-2 p-2">
          <DailyNav
            active={active}
            onSelect={(key) => {
              setActive(key);
              if (key === "modes") setModesSubpage(null);
            }}
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
            <div className="hairline-faint min-h-0 flex-1 overflow-y-auto rounded-[10px] bg-background px-16 py-14">
              <div
                key={active === "modes" ? modesPaneKey : active}
                className="mx-auto flex w-full max-w-[720px] flex-col gap-8"
              >
                {active === "modes" ? (
                  <>
                    {modesSubpage && (
                      <button
                        onClick={() => setModesSubpage(null)}
                        className="-ml-1 -mb-4 flex w-fit items-center gap-0.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                        Back
                      </button>
                    )}
                    {modesBody}
                  </>
                ) : (
                  <DailyPanel
                    onOpenModels={() => openSettingsAt("models")}
                    activeModeName={activeMode?.name ?? "Super"}
                  />
                )}
              </div>
            </div>

            {/* Status bar sits in the chrome gutter, outside the pane, so the
                sidebar can run the full height of the window. */}
            <div className="flex h-8 shrink-0 items-center justify-end gap-1 px-1">
              {/* The setup guide is temporary — it disappears once you're set
                  up — so it sits apart from the mode and microphone, which are
                  permanent facts about the next thing you dictate. */}
              {!setupOpen && !allSetupDone && (
                <button
                  onClick={() => setSetupOpen(true)}
                  className="flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
                >
                  <CircleCheck className="h-[13px] w-[13px]" strokeWidth={2} />
                  Setup guide
                  <span className="tabular-nums">
                    {setupDone}/{setupTasks.length}
                  </span>
                </button>
              )}
              {/* Which mode is live is a glanceable fact, not a place to
                  navigate to — so it sits here rather than in the sidebar. */}
              <button
                onClick={() => setModeMenuOpen((v) => !v)}
                title={
                  modeOverride === null
                    ? "Mode follows the app you're in"
                    : "Mode is pinned — click to go back to Auto"
                }
                className={cn(
                  "flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-[12px] font-medium transition-colors hover:bg-fill-hover hover:text-foreground",
                  modeOverride === null
                    ? "text-muted-foreground"
                    : "text-foreground"
                )}
              >
                {modeOverride === null ? (
                  <Sparkles className="h-[13px] w-[13px]" strokeWidth={2} />
                ) : (
                  <Pin className="h-[13px] w-[13px]" strokeWidth={2} />
                )}
                {activeMode?.name ?? "Super"}
              </button>
              <button
                onClick={() => setMicMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
              >
                {activeMic?.name ?? "No microphone"}
                <Headphones className="h-[13px] w-[13px]" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {modeMenuOpen && (
          <ModePopover
            modes={modes}
            override={modeOverride}
            autoMode={autoMode}
            onPick={setModeOverride}
            onOpenSettings={() => {
              setActive("modes");
              setModesSubpage(null);
            }}
            onClose={() => setModeMenuOpen(false)}
          />
        )}

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
              <span className="text-[12px] font-medium text-muted-foreground">
                {formatDaysAgo(whatsNewItem.daysAgo)}
              </span>
              <h2 className="text-[18px] font-semibold text-foreground">
                {whatsNewItem.title}
              </h2>
              <p className="text-[14px] leading-relaxed text-muted-foreground">
                {whatsNewItem.body}
              </p>
              <button
                onClick={() => setWhatsNewItem(null)}
                className="mt-3 h-8 w-fit rounded-[7px] bg-primary px-4 text-[13px] font-semibold text-primary-foreground hover:brightness-110"
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
