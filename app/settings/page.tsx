"use client";

import { useState } from "react";
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
  HardDrive,
  Sparkles,
  Lock,
  X,
  type LucideIcon,
} from "lucide-react";
import { MacWindow } from "@/components/mac-window";
import { SettingsWindow } from "@/components/settings-window";
import { DetailModal } from "@/components/detail-modal";
import { SettingsSection, SettingsRow } from "@/components/settings-parts";
import { InlineEdit } from "@/components/inline-edit";
import { Switch } from "@/components/ui/switch";
import { SegmentedControl } from "@/components/segmented-control";
import { cn } from "@/lib/utils";

type WhatsNewItem = {
  id: string;
  date: string;
  title: string;
  summary: string;
  body: string;
};

const WHATS_NEW_SEED: WhatsNewItem[] = [
  {
    id: "s1-voice",
    date: "Apr 8",
    title: "S1 Voice & Language",
    summary: "Our fastest cloud model yet.",
    body: "S1 Voice is built and hosted by Superwhisper — it's our fastest cloud model yet, with native support for 40+ languages and automatic language detection mid-sentence.",
  },
  {
    id: "vocab-sync",
    date: "Mar 22",
    title: "Vocabulary sync",
    summary: "Your words now sync everywhere.",
    body: "Custom vocabulary and text replacements now sync automatically across every Mac and iPhone signed into your Superwhisper account.",
  },
];

type DailyKey = "home" | "vocabulary";
type SettingsKey = "general" | "shortcuts" | "sound" | "models" | "advanced";

const DAILY_USE: { key: DailyKey; label: string; icon: LucideIcon }[] = [
  { key: "home", label: "Home", icon: HomeIcon },
  { key: "vocabulary", label: "Vocabulary", icon: BookOpen },
];

const SETTINGS_TABS: { key: SettingsKey; label: string; icon: LucideIcon }[] = [
  { key: "general", label: "General", icon: SettingsIcon },
  { key: "shortcuts", label: "Shortcuts", icon: Keyboard },
  { key: "sound", label: "Sound", icon: Volume2 },
  { key: "models", label: "Models", icon: BrainCircuit },
  { key: "advanced", label: "Advanced", icon: Wrench },
];

const TITLES: Record<DailyKey, string> = {
  home: "Superwhisper",
  vocabulary: "Vocabulary",
};

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
              "hairline absolute flex flex-col gap-0.5 rounded-[8px] bg-[oklch(0.25_0_0)] px-2.5 py-2 text-left shadow-[0_8px_18px_-6px_rgb(0_0_0/0.55)] transition-all duration-300 ease-out",
              i === 0
                ? "cursor-pointer hover:bg-[oklch(0.28_0_0)]"
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
              {item.date}
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
  whatsNew,
  onOpenWhatsNew,
}: {
  active: DailyKey;
  onSelect: (key: DailyKey) => void;
  onOpenSettings: () => void;
  whatsNew: WhatsNewItem[];
  onOpenWhatsNew: (item: WhatsNewItem) => void;
}) {
  return (
    <aside className="flex w-[230px] shrink-0 flex-col px-3 py-6">
      <div className="flex flex-col gap-1">
        {DAILY_USE.map((item) => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={cn(
              "flex items-center gap-2.5 rounded-[6px] px-2.5 py-1.5 text-left text-[13px] font-medium transition-colors",
              active === item.key
                ? "bg-primary text-primary-foreground"
                : "text-foreground/75 hover:bg-white/[0.06]"
            )}
          >
            <item.icon className="h-[15px] w-[15px] shrink-0" strokeWidth={2} />
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-4">
        <WhatsNewStack items={whatsNew} onOpen={onOpenWhatsNew} />

        <div className="flex items-center gap-2 border-t border-white/[0.06] pt-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.08] text-[11px] font-semibold">
            A
          </div>
          <span className="flex-1 text-[12px] font-medium text-foreground/80">
            Superwhisper <span className="text-muted-foreground">PRO</span>
          </span>
          <button
            onClick={onOpenSettings}
            aria-label="Open Settings"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground"
          >
            <SettingsIcon className="h-[15px] w-[15px]" strokeWidth={2} />
          </button>
        </div>
      </div>
    </aside>
  );
}

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
  const history = [
    { text: "Remind the team the deploy is at 4pm.", time: "2m ago" },
    { text: "Draft a reply saying I'll follow up tomorrow.", time: "1h ago" },
    { text: "Add oat milk and coffee to the grocery list.", time: "Yesterday" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-5">
        <div className="grid grid-cols-4 gap-6">
          <StatTile value="84 WPM" label="Average speed" />
          <StatTile value="8,211" label="Words" />
          <StatTile value="6" label="Apps used" />
          <StatTile value="1 hour" label="Saved" />
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
            control={
              <kbd className="hairline rounded-[5px] bg-white/[0.06] px-2 py-1 text-[11px] font-medium">
                fn fn
              </kbd>
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
        <h2 className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
          <HistoryIcon className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
          History
        </h2>
        <div className="hairline overflow-hidden rounded-[10px] bg-card">
          {history.map((item, i) => (
            <SettingsRow
              key={item.text}
              label={item.text}
              description={item.time}
              last={i === history.length - 1}
              control={null}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

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
  const [replacementDraft, setReplacementDraft] = useState<string | null>(
    null
  );

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
    <SettingsSection
      title="Vocabulary"
      description="Add names, jargon, or shorthand — plain words are recognized as-is, and words with an arrow are expanded automatically as you dictate. Click any entry to edit it in place."
    >
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
    </SettingsSection>
  );
}

function ShortcutsPanel() {
  const rows = [
    { label: "Start dictation", combo: "fn fn" },
    { label: "Cancel dictation", combo: "esc" },
    { label: "Toggle push-to-talk", combo: "⌥ space" },
    { label: "Change mode", combo: "⌥ ⇧ K" },
  ];
  return (
    <SettingsSection
      title="Shortcuts"
      description="Global keyboard shortcuts that work anywhere on your Mac."
    >
      {rows.map((r, i) => (
        <SettingsRow
          key={r.label}
          label={r.label}
          last={i === rows.length - 1}
          control={
            <kbd className="hairline rounded-[5px] bg-white/[0.06] px-2 py-1 text-[11px] font-medium">
              {r.combo}
            </kbd>
          }
        />
      ))}
    </SettingsSection>
  );
}

const DAILY_PANELS: Record<
  DailyKey,
  (props: { onOpenModels: () => void }) => React.ReactNode
> = {
  home: HomePanel,
  vocabulary: VocabularyPanel,
};

function GeneralPanel() {
  const [theme, setTheme] = useState("auto");
  const [recordingWindow, setRecordingWindow] = useState("mini");

  return (
    <div className="flex flex-col gap-8">
      <SettingsSection title="Appearance">
        <SettingsRow
          label="Theme"
          control={
            <SegmentedControl
              value={theme}
              onValueChange={setTheme}
              options={[
                { value: "auto", label: "Auto" },
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
              ]}
            />
          }
        />
        <SettingsRow
          label="Recording window"
          last
          control={
            <SegmentedControl
              value={recordingWindow}
              onValueChange={setRecordingWindow}
              options={[
                { value: "classic", label: "Classic" },
                { value: "mini", label: "Mini" },
                { value: "none", label: "None" },
              ]}
            />
          }
        />
      </SettingsSection>

      <SettingsSection title="Behavior">
        <SettingsRow
          label="Launch on login"
          control={<Switch size="sm" defaultChecked={false} />}
        />
        <SettingsRow
          label="Automatically check for updates"
          control={<Switch size="sm" defaultChecked />}
        />
        <SettingsRow
          label="Keep recordings for"
          last
          control={
            <span className="text-[12px] text-muted-foreground">
              Forever
            </span>
          }
        />
      </SettingsSection>
    </div>
  );
}

function SoundPanel() {
  const [soundStyle, setSoundStyle] = useState("classic");

  return (
    <div className="flex flex-col gap-8">
      <SettingsSection title="Recording">
        <SettingsRow
          label="Automatically increase microphone volume"
          control={<Switch size="sm" defaultChecked />}
        />
        <SettingsRow
          label="Silence removal"
          control={<Switch size="sm" defaultChecked={false} />}
        />
        <SettingsRow
          label="Playback when recording"
          last
          control={
            <span className="text-[12px] text-muted-foreground">Pause</span>
          }
        />
      </SettingsSection>

      <SettingsSection title="Sound effects">
        <SettingsRow
          label="Style"
          last
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
      </SettingsSection>
    </div>
  );
}

function ModelsPanel() {
  return (
    <SettingsSection
      title="Models"
      description="Super picks the best cloud model for you automatically. Switch to an on-device model if you'd rather keep everything local."
    >
      <SettingsRow
        label="S1-Voice"
        description="Fastest, built and hosted by Superwhisper"
        last={false}
        control={<Cloud className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />}
      />
      <SettingsRow
        label="Sonnet 5"
        description="Most accurate for complex dictation"
        control={<Cloud className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />}
      />
      <SettingsRow
        label="Cohere Transcribe"
        description="Runs fully on-device, works offline"
        last
        control={
          <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <HardDrive className="h-4 w-4" strokeWidth={1.75} />
            1.3 GB
          </span>
        }
      />
    </SettingsSection>
  );
}

function AdvancedPanel() {
  const [modesEnabled, setModesEnabled] = useState(false);
  const [modelTier, setModelTier] = useState("cloud");

  return (
    <div className="flex flex-col gap-8">
      <SettingsSection
        title="Transcription"
        description="Cloud is fastest and most accurate when you're online."
      >
        <SettingsRow
          label="Preferred model"
          last
          control={
            <SegmentedControl
              value={modelTier}
              onValueChange={setModelTier}
              options={[
                { value: "cloud", label: "Cloud" },
                { value: "onDevice", label: "On-device" },
              ]}
            />
          }
        />
      </SettingsSection>

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
          <SettingsRow
            label="Manage Modes"
            description="Create or edit app-specific Modes"
            last
            control={
              <button className="text-[12px] font-medium text-primary hover:brightness-125">
                Open
              </button>
            }
          />
        )}
      </SettingsSection>
    </div>
  );
}

const SETTINGS_PANELS: Record<SettingsKey, () => React.ReactNode> = {
  general: GeneralPanel,
  shortcuts: ShortcutsPanel,
  sound: SoundPanel,
  models: ModelsPanel,
  advanced: AdvancedPanel,
};

const SETTINGS_TITLES: Record<SettingsKey, string> = {
  general: "General",
  shortcuts: "Shortcuts",
  sound: "Sound",
  models: "Models",
  advanced: "Advanced",
};

export default function SettingsPage() {
  const [active, setActive] = useState<DailyKey>("home");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsKey>("general");
  const [whatsNewItem, setWhatsNewItem] = useState<WhatsNewItem | null>(null);
  const [whatsNewStack, setWhatsNewStack] =
    useState<WhatsNewItem[]>(WHATS_NEW_SEED);

  const DailyPanel = DAILY_PANELS[active];
  const SettingsPanel = SETTINGS_PANELS[settingsTab];

  const openWhatsNew = (item: WhatsNewItem) => {
    setWhatsNewItem(item);
    setWhatsNewStack((prev) => prev.filter((i) => i.id !== item.id));
  };

  const openModelsSettings = () => {
    setSettingsTab("models");
    setSettingsOpen(true);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[oklch(0.1_0_0)] p-10">
      <MacWindow title={TITLES[active]} width="1020px" height="700px">
        <div className="flex h-full gap-2 bg-[oklch(0.15_0_0)] p-2">
          <DailyNav
            active={active}
            onSelect={setActive}
            onOpenSettings={() => setSettingsOpen(true)}
            whatsNew={whatsNewStack}
            onOpenWhatsNew={openWhatsNew}
          />
          <div className="hairline min-w-0 flex-1 overflow-hidden rounded-[10px] bg-background">
            <div className="h-full overflow-y-auto px-14 py-12">
              <div className="mx-auto flex max-w-[560px] flex-col gap-8">
                <DailyPanel onOpenModels={openModelsSettings} />
              </div>
            </div>
          </div>
        </div>

        {settingsOpen && (
          <SettingsWindow
            title={SETTINGS_TITLES[settingsTab]}
            tabs={SETTINGS_TABS}
            active={settingsTab}
            onTabChange={(key) => setSettingsTab(key as SettingsKey)}
            onClose={() => setSettingsOpen(false)}
          >
            <SettingsPanel />
          </SettingsWindow>
        )}

        {whatsNewItem && (
          <DetailModal
            title="What's New"
            width="440px"
            onClose={() => setWhatsNewItem(null)}
          >
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-medium text-muted-foreground">
                {whatsNewItem.date}
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
