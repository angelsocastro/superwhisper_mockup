"use client";

import { useState, useSyncExternalStore } from "react";
import {
  Home as HomeIcon,
  BookOpen,
  Keyboard,
  Settings as SettingsIcon,
  Volume2,
  BrainCircuit,
  Wrench,
  History as HistoryIcon,
  Mic,
  Cloud,
  Sparkles,
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
  QrCode,
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
  CircleUser,
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

type ModeItem = {
  id: string;
  name: string;
  preset: string;
  language: string;
  voiceModel: string;
  languageModel: string;
  active?: boolean;
};

const MODES_SEED: ModeItem[] = [
  {
    id: "super",
    name: "Super",
    preset: "Super",
    language: "Spanish",
    voiceModel: "Ultra",
    languageModel: "Sonnet 4.5",
    active: true,
  },
  {
    id: "english",
    name: "English",
    preset: "Default",
    language: "English",
    voiceModel: "Ultra",
    languageModel: "S1-Language",
  },
];

type Provider = "sw" | "anthropic" | "cohere" | "deepgram";

const PROVIDER_STYLE: Record<Provider, { label: string; className: string }> = {
  sw: { label: "S", className: "bg-white text-black" },
  anthropic: { label: "A", className: "bg-[#d4a27f] text-[#2b1a10]" },
  cohere: {
    label: "C",
    className: "bg-gradient-to-br from-[#39c5a0] via-[#a78bfa] to-[#f472b6] text-white",
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
  { id: "s1-language", name: "S1-Language", provider: "sw", kind: "language", speed: 5, isNew: true },
  { id: "s1-mini", name: "S1-Mini", provider: "sw", kind: "language", speed: 4, size: "462 MB" },
  { id: "s1-voice", name: "S1-Voice", provider: "sw", kind: "voice", speed: 5, isNew: true },
  { id: "haiku", name: "Haiku 4.5", provider: "anthropic", kind: "language", speed: 5 },
  { id: "sonnet45", name: "Sonnet 4.5", provider: "anthropic", kind: "language", speed: 4 },
  { id: "sonnet46", name: "Sonnet 4.6", provider: "anthropic", kind: "language", speed: 4 },
  { id: "sonnet5", name: "Sonnet 5", provider: "anthropic", kind: "language", speed: 5 },
  { id: "cohere", name: "Cohere Transcribe", provider: "cohere", kind: "voice", speed: 4, size: "1.3 GB" },
  { id: "nova2", name: "Nova 2", provider: "deepgram", kind: "voice", speed: 3 },
  { id: "nova3", name: "Nova 3", provider: "deepgram", kind: "voice", speed: 4 },
  { id: "nova-medical", name: "Nova Medical", provider: "deepgram", kind: "voice", speed: 3 },
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
    () => false
  );

  if (pref === "light") return "light";
  if (pref === "dark") return "dark";
  return systemDark ? "dark" : "light";
}

type DailyKey = "home" | "vocabulary";
type SettingsKey =
  | "account"
  | "general"
  | "dictation"
  | "shortcuts"
  | "sound"
  | "models"
  | "advanced";
type Subpage =
  | { kind: "system" }
  | { kind: "modesList" }
  | { kind: "modeDetail"; modeId: string }
  | null;

const DAILY_USE: { key: DailyKey; label: string; icon: LucideIcon }[] = [
  { key: "home", label: "Home", icon: HomeIcon },
  { key: "vocabulary", label: "Vocabulary", icon: BookOpen },
];

const SETTINGS_TABS: (SettingsTab & { key: SettingsKey })[] = [
  { key: "account", label: "Account", icon: CircleUser, group: 0 },
  { key: "general", label: "General", icon: SettingsIcon, group: 1 },
  { key: "dictation", label: "Dictation", icon: Type, group: 1 },
  { key: "shortcuts", label: "Shortcuts", icon: Keyboard, group: 1 },
  { key: "sound", label: "Sound", icon: Volume2, group: 1 },
  { key: "models", label: "Models", icon: BrainCircuit, group: 2 },
  { key: "advanced", label: "Advanced", icon: Wrench, group: 2 },
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
                : "pointer-events-none"
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
}: {
  active: DailyKey;
  onSelect: (key: DailyKey) => void;
  onOpenSettings: () => void;
  onOpenAccount: () => void;
  whatsNew: WhatsNewItem[];
  onOpenWhatsNew: (item: WhatsNewItem) => void;
  collapsed: boolean;
}) {
  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col px-2 pt-1 pb-4 transition-[width] duration-200 ease-out",
        collapsed ? "w-[52px] items-center" : "w-[230px]"
      )}
    >
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
                : "text-foreground/80 hover:bg-fill-hover"
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
            collapsed ? "flex-col gap-2" : "gap-2"
          )}
        >
          <button
            onClick={onOpenAccount}
            aria-label={collapsed ? "Account" : undefined}
            className={cn(
              "group relative flex items-center rounded-[6px] py-1 text-left transition-colors hover:bg-fill-hover",
              collapsed ? "justify-center px-1" : "min-w-0 flex-1 gap-2 px-1"
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

function HomePanel({
  onOpenModels,
  onOpenShortcuts,
}: {
  onOpenModels: () => void;
  onOpenShortcuts: () => void;
}) {
  const [query, setQuery] = useState("");

  const groups = HISTORY_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((t) =>
      t.toLowerCase().includes(query.trim().toLowerCase())
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
        <h2 className="text-[15px] font-semibold text-foreground">
          Get started
        </h2>
        <div className="hairline overflow-hidden rounded-[10px] bg-card">
          <SettingsRow
            icon={<Mic className="h-4 w-4" strokeWidth={2} />}
            label="Start recording"
            description="Turn your voice into text with a single click."
            control={<Kbd>fn fn</Kbd>}
          />
          <SettingsRow
            icon={<Keyboard className="h-4 w-4" strokeWidth={2} />}
            label="Customize your shortcuts"
            description="Change the keyboard shortcuts for Superwhisper."
            onClick={onOpenShortcuts}
            control={
              <ChevronRight
                className="h-4 w-4 text-muted-foreground"
                strokeWidth={2}
              />
            }
          />
          <SettingsRow
            icon={<BookOpen className="h-4 w-4" strokeWidth={2} />}
            label="Add vocabulary"
            description="Teach Superwhisper custom words, names, or industry terms."
            control={null}
            last
          />
        </div>
      </section>

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
  (props: {
    onOpenModels: () => void;
    onOpenShortcuts: () => void;
  }) => React.ReactNode
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
          active && "ring-2 ring-primary ring-offset-2 ring-offset-card"
        )}
      >
        {children}
      </div>
      <span
        className={cn(
          "text-[11px] font-medium",
          active ? "text-foreground" : "text-muted-foreground"
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

      <SettingsSection
        title="Privacy & data"
        description="Recordings stay on this Mac unless you pick a cloud model."
      >
        <SettingsRow
          label={
            <span>
              Keep recordings for
              <InfoDot />
            </span>
          }
          control={<PopupButton value="Forever" />}
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
        <NavRow label="System & integrations" onClick={onOpenSystem} />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             settings: Dictation                             */
/* -------------------------------------------------------------------------- */

/** A switch paired with a gear, the way the app exposes sub-options. */
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

function DictationPanel() {
  return (
    <div className="flex flex-col gap-8">
      <SettingsSection
        title="Language"
        description="What you speak. Super handles the rest."
      >
        <SettingsRow
          label="Primary language"
          last={false}
          control={<PopupButton value="Spanish" />}
        />
        <SettingsRow
          label={
            <span>
              Detect language automatically
              <InfoDot />
            </span>
          }
          description="Switch language mid-sentence without changing this setting."
          last
          control={<Switch size="sm" defaultChecked />}
        />
      </SettingsSection>

      <SettingsSection
        title="Formatting"
        description="How your words are cleaned up before they land in the app."
      >
        <SettingsRow
          label={
            <span>
              Autocapitalize
              <InfoDot />
            </span>
          }
          control={<Switch size="sm" defaultChecked />}
        />
        <SettingsRow
          label={
            <span>
              Remove filler words
              <InfoDot />
            </span>
          }
          description="Drops “um”, “eh”, and false starts."
          last
          control={<Switch size="sm" defaultChecked />}
        />
      </SettingsSection>

      <SettingsSection
        title="Output"
        description="Where the finished text goes and how it gets there."
      >
        <SettingsRow
          label={
            <span>
              Paste result text
              <InfoDot />
            </span>
          }
          control={<Switch size="sm" defaultChecked />}
        />
        <SettingsRow
          label={
            <span>
              Hold shift to auto-send after paste
              <InfoDot />
            </span>
          }
          control={<GearSwitch />}
        />
        <SettingsRow
          label={
            <span>
              Clipboard behaviour
              <InfoDot />
            </span>
          }
          control={<PopupButton value="Default" />}
        />
        <SettingsRow
          label={
            <span>
              Simulate keypresses
              <InfoDot />
            </span>
          }
          description="For apps that don't accept a normal paste."
          last
          control={<GearSwitch />}
        />
      </SettingsSection>

      <SettingsSection
        title="Capture"
        description="What Superwhisper listens to besides your microphone."
      >
        <SettingsRow
          label={
            <span>
              Record from system audio
              <InfoDot />
            </span>
          }
          control={<Switch size="sm" defaultChecked={false} />}
        />
        <SettingsRow
          label={
            <span>
              Identify speakers
              <InfoDot />
            </span>
          }
          description="Labels who said what in multi-person recordings."
          last
          control={<Switch size="sm" defaultChecked={false} />}
        />
      </SettingsSection>
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

function ShortcutsPanel() {
  return (
    <div className="flex flex-col gap-8">
      <SettingsSection
        title="Recording"
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
          last
        />
      </SettingsSection>

      <SettingsSection title="Pointer">
        <ShortcutRow
          label="Mouse shortcut"
          description="Tap to toggle, or hold and release when done"
          last
        />
      </SettingsSection>

      <SettingsSection title="Modes">
        <ShortcutRow
          label="Change mode"
          description="Activates the mode switcher"
          combo="⌥ ⇧ K"
          last
        />
      </SettingsSection>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               settings: Sound                               */
/* -------------------------------------------------------------------------- */

function SoundPanel() {
  const [soundStyle, setSoundStyle] = useState("classic");
  const [volume, setVolume] = useState([85]);

  return (
    <div className="flex flex-col gap-8">
      <SettingsSection
        title="Microphone"
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
            i < value ? "bg-foreground/45" : "bg-foreground/12"
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
    m.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  const toggleFavorite = (id: string) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
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
                i !== rows.length - 1 && "border-b border-line"
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
                      isFav && "fill-[#febc2e] text-[#febc2e]"
                    )}
                    strokeWidth={2}
                  />
                </button>
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] text-[9px] font-bold",
                    provider.className
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

function AdvancedPanel({
  modesEnabled,
  setModesEnabled,
  onOpenModes,
}: {
  modesEnabled: boolean;
  setModesEnabled: (v: boolean) => void;
  onOpenModes: () => void;
}) {
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
          last={!modesEnabled}
          control={
            <Switch
              size="sm"
              checked={modesEnabled}
              onCheckedChange={(c) => setModesEnabled(c === true)}
            />
          }
        />
        {modesEnabled && (
          <NavRow label="Manage Modes" onClick={onOpenModes} />
        )}
      </SettingsSection>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                   sub-page: System & integrations (advanced)                */
/* -------------------------------------------------------------------------- */

function SystemPanel() {
  return (
    <div className="flex flex-col gap-8">
      <SettingsSection title="Application">
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
          last
          control={<Switch size="sm" defaultChecked={false} />}
        />
      </SettingsSection>

      <SettingsSection title="Voice model">
        <SettingsRow
          label={
            <span>
              Voice model active duration
              <InfoDot />
            </span>
          }
          last
          control={<PopupButton value="1 minute" />}
        />
      </SettingsSection>

      <SettingsSection title="App folder location">
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
              Filesync enabled
              <InfoDot />
            </span>
          }
          last
          control={
            <div className="flex items-center gap-2">
              <button
                aria-label="Filesync options"
                className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-fill-hover hover:text-foreground"
              >
                <SettingsIcon className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
              <Switch size="sm" defaultChecked={false} />
            </div>
          }
        />
      </SettingsSection>

      <SettingsSection title="Agent Plugins">
        <SettingsRow
          icon={
            <span className="flex h-5 w-5 items-center justify-center rounded-[5px] bg-[#d97757] text-white">
              <Asterisk className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
          }
          label="Claude Code"
          last
          control={
            <span className="text-[12px] text-muted-foreground">Installed</span>
          }
        />
      </SettingsSection>

      <SettingsSection title="AI Models">
        <SettingsRow
          label={
            <span>
              Show experimental models
              <InfoDot />
            </span>
          }
          last
          control={
            <div className="flex items-center gap-2">
              <button
                aria-label="Experimental model options"
                className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-fill-hover hover:text-foreground"
              >
                <SettingsIcon className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
              <Switch size="sm" defaultChecked />
            </div>
          }
        />
      </SettingsSection>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          sub-pages: Modes list/detail                       */
/* -------------------------------------------------------------------------- */

function ModesListPanel({
  modes,
  onOpenMode,
  onRename,
}: {
  modes: ModeItem[];
  onOpenMode: (id: string) => void;
  onRename: (id: string, name: string) => void;
}) {
  const [tipDismissed, setTipDismissed] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center text-[15px] font-semibold text-foreground">
          Modes
          <InfoDot />
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
            <div className="ml-auto flex shrink-0 items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-[5px] bg-[#d4a27f] text-[9px] font-bold text-[#2b1a10]">
                A
              </span>
              <span className="flex h-5 w-5 items-center justify-center rounded-[5px] bg-white text-[9px] font-bold text-black">
                S
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
        <div className="hairline mt-2 flex items-start gap-3 rounded-[10px] bg-card px-4 py-3.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#febc2e]/15 text-[#febc2e]">
            <Lightbulb className="h-4 w-4" strokeWidth={2} />
          </span>
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-[13px] font-medium text-foreground">
              Auto-switch with activation
            </span>
            <span className="text-[12px] leading-relaxed text-muted-foreground">
              Link a mode to specific apps or websites so Superwhisper picks the
              right one automatically when you record.
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
  );
}

function ModeDetailPanel({ mode }: { mode: ModeItem }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <SettingsSection title="Preset">
        <SettingsRow
          label={
            <span>
              Preset
              <InfoDot />
            </span>
          }
          last
          control={<PopupButton value={mode.preset} />}
        />
      </SettingsSection>

      <SettingsSection title="Models">
        <SettingsRow
          label="Language"
          control={<PopupButton value={mode.language} />}
        />
        <SettingsRow
          label={
            <span>
              Voice Model
              <InfoDot />
            </span>
          }
          control={<PopupButton value={mode.voiceModel} />}
        />
        <SettingsRow
          label={
            <span>
              Language Model
              <InfoDot />
            </span>
          }
          last
          control={<PopupButton value={mode.languageModel} />}
        />
      </SettingsSection>

      <SettingsSection title="Activation">
        <SettingsRow
          label={
            <span>
              Activate for apps
              <InfoDot />
            </span>
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

      <div className="flex flex-col gap-4">
        <button
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex w-fit items-center gap-1.5 text-[13px] font-medium text-foreground/80 transition-colors hover:text-foreground"
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform",
              showAdvanced && "rotate-90"
            )}
            strokeWidth={2}
          />
          Advanced settings
        </button>

        {showAdvanced && (
          <div className="flex flex-col gap-8">
            <div className="hairline overflow-hidden rounded-[10px] bg-card">
              <SettingsRow
                label={
                  <span>
                    Playback when recording
                    <InfoDot />
                  </span>
                }
                control={<PopupButton value="Pause (Default)" />}
              />
              <SettingsRow
                label={
                  <span>
                    Record from system audio
                    <InfoDot />
                  </span>
                }
                control={<Switch size="sm" defaultChecked={false} />}
              />
              <SettingsRow
                label={
                  <span>
                    Identify Speakers
                    <InfoDot />
                  </span>
                }
                last
                control={<Switch size="sm" defaultChecked={false} />}
              />
            </div>

            <div className="hairline overflow-hidden rounded-[10px] bg-card">
              <SettingsRow
                label={
                  <span>
                    Autocapitalize Insert
                    <InfoDot />
                  </span>
                }
                control={<Switch size="sm" defaultChecked />}
              />
              <SettingsRow
                label={
                  <span>
                    Auto paste
                    <InfoDot />
                  </span>
                }
                last
                control={<PopupButton value="On (Default)" />}
              />
            </div>

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
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Account                                    */
/* -------------------------------------------------------------------------- */

function AccountPanel() {
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
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1.5 text-[15px] font-semibold text-foreground">
            angel@caudalflow.com
            <button
              aria-label="Edit email"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </span>
          <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            Superwhisper
            <span className="rounded-[4px] bg-fill-strong px-1.5 py-px text-[9px] font-semibold tracking-wide text-foreground/80 uppercase">
              Pro
            </span>
          </span>
        </div>
      </div>

      <SettingsSection title="License">
        <SettingsRow
          label="License key"
          description="•••••••• — •••• — •••• — •••• — ••••••••5904"
          control={
            <button
              aria-label="Show QR code"
              title="Show QR code"
              className="flex h-7 w-7 items-center justify-center rounded-[6px] text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
            >
              <QrCode className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>
          }
        />
        <SettingsRow
          label="Billing"
          description="Manage your plan, invoices and payment method."
          control={<GhostButton>Manage billing</GhostButton>}
        />
        <SettingsRow
          label="This device"
          description="Frees the seat so you can activate another Mac."
          last
          control={<GhostButton>Unlink device</GhostButton>}
        />
      </SettingsSection>

      <SettingsSection title="Community & support">
        {links.map((l, i) => (
          <SettingsRow
            key={l.label}
            icon={<l.icon className="h-4 w-4" strokeWidth={2} />}
            label={l.label}
            last={i === links.length - 1}
            control={
              <ChevronRight
                className="h-4 w-4 text-muted-foreground"
                strokeWidth={2}
              />
            }
            onClick={() => {}}
          />
        ))}
      </SettingsSection>
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
  const [subpage, setSubpage] = useState<Subpage>(null);
  const [whatsNewItem, setWhatsNewItem] = useState<WhatsNewItem | null>(null);
  const [whatsNewStack, setWhatsNewStack] =
    useState<WhatsNewItem[]>(WHATS_NEW_SEED);
  const [modesEnabled, setModesEnabled] = useState(false);
  const [modes, setModes] = useState<ModeItem[]>(MODES_SEED);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
  } else if (subpage?.kind === "modesList") {
    settingsBody = (
      <ModesListPanel
        modes={modes}
        onOpenMode={(id) => setSubpage({ kind: "modeDetail", modeId: id })}
        onRename={renameMode}
      />
    );
    onBack = () => setSubpage(null);
  } else if (detailMode) {
    settingsBody = <ModeDetailPanel mode={detailMode} />;
    onBack = () => setSubpage({ kind: "modesList" });
  } else {
    settingsBody =
      settingsTab === "account" ? (
        <AccountPanel />
      ) : settingsTab === "general" ? (
        <GeneralPanel
          onOpenSystem={() => setSubpage({ kind: "system" })}
          theme={theme}
          setTheme={setTheme}
        />
      ) : settingsTab === "dictation" ? (
        <DictationPanel />
      ) : settingsTab === "shortcuts" ? (
        <ShortcutsPanel />
      ) : settingsTab === "sound" ? (
        <SoundPanel />
      ) : settingsTab === "models" ? (
        <ModelsPanel />
      ) : (
        <AdvancedPanel
          modesEnabled={modesEnabled}
          setModesEnabled={setModesEnabled}
          onOpenModes={() => setSubpage({ kind: "modesList" })}
        />
      );
  }

  return (
    <main
      className={cn(
        "flex min-h-screen items-center justify-center bg-desk p-10 transition-colors duration-300",
        appearance === "dark" && "dark"
      )}
    >
      <MacWindow width="1020px" height="700px">
        {/* Traffic lights share the top row with real controls, the way apps
            with a sidebar do — no title bar of their own, no centred title. */}
        <div className="flex h-11 shrink-0 items-center gap-1 px-4">
          <TrafficLights />
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle sidebar"
            className="ml-3 flex h-7 w-7 items-center justify-center rounded-[6px] text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
          >
            <PanelLeft className="h-[16px] w-[16px]" strokeWidth={2} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 gap-2 px-2 pb-2">
          <DailyNav
            active={active}
            onSelect={setActive}
            onOpenSettings={() => openSettingsAt("general")}
            onOpenAccount={() => openSettingsAt("account")}
            whatsNew={whatsNewStack}
            onOpenWhatsNew={openWhatsNew}
            collapsed={!sidebarOpen}
          />
          <div className="hairline flex min-w-0 flex-1 flex-col overflow-hidden rounded-[10px] bg-background">
            <div className="min-h-0 flex-1 overflow-y-auto px-14 py-12">
              <div className="mx-auto flex max-w-[560px] flex-col gap-8">
                <DailyPanel
                  onOpenModels={() => openSettingsAt("models")}
                  onOpenShortcuts={() => openSettingsAt("shortcuts")}
                />
              </div>
            </div>
            {/* Status bar: the input device is ambient state, not a command,
                so it reads better parked at the bottom than in the toolbar. */}
            <div className="hairline-t flex h-9 shrink-0 items-center justify-end px-3">
              <button className="flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground">
                MacBook Air Microphone
                <Headphones className="h-[13px] w-[13px]" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {settingsOpen && (
          <SettingsWindow
            paneKey={paneKey}
            tabs={SETTINGS_TABS}
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
          <DetailModal
            width="440px"
            onClose={() => setWhatsNewItem(null)}
          >
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
