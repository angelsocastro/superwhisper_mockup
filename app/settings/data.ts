import {
  Home as HomeIcon,
  BookOpen,
  Keyboard,
  Mic,
  Settings as SettingsIcon,
  Volume2,
  BrainCircuit,
  Cloud,
  Sparkles,
  Lock,
  Laptop,
  Monitor,
  Smartphone,
  Webhook,
  CircleUser,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import type { SettingsTab } from "@/components/settings-window";
import type {
  WhatsNewItem,
  BaseSettings,
  SettingDef,
  ModeItem,
  Provider,
  ModelRow,
  HistoryItem,
  Account,
  DeviceItem,
  OrgRole,
  DailyKey,
  SettingsKey,
  SetupTask,
  ShortcutEntry,
  WebhookEndpoint,
  MicDevice,
} from "./types";

export const WHATS_NEW_SEED: WhatsNewItem[] = [
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

export const BASE_DEFAULTS: BaseSettings = {
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
  syncDictionary: true,
  syncModes: true,
  syncHistory: true,
  syncAudio: false,
  webhookEndpoint: "Off",
  webhookTranscript: true,
  webhookAppContext: true,
  webhookAudio: false,
};

/** Every setting is overridable by construction — which is what stops
 *  "make X per-mode" from being a feature request nine times over.
 *  superOnly is the one escape hatch, for settings that don't describe
 *  per-dictation behavior at all (there's one Dictionary, not one per mode). */
export const SETTING_DEFS: SettingDef[] = [
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
  { key: "syncDictionary", label: "Dictionary", group: "Account-wide", kind: "switch", superOnly: true },
  { key: "syncModes", label: "Modes", group: "Account-wide", kind: "switch", superOnly: true },
  { key: "syncHistory", label: "History (text)", group: "Sync", kind: "switch" },
  { key: "syncAudio", label: "Audio recordings", group: "Sync", kind: "switch" },
  { key: "webhookEndpoint", label: "Webhook endpoint", group: "Delivery", kind: "endpoint" },
  { key: "webhookTranscript", label: "Transcript text", group: "Delivery", kind: "switch" },
  { key: "webhookAppContext", label: "App context", group: "Delivery", kind: "switch" },
  { key: "webhookAudio", label: "Audio recording", group: "Delivery", kind: "switch" },
];

export const MODES_SEED: ModeItem[] = [
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
      webhookEndpoint: "Compliance archive",
    },
    enabled: false,
    builtIn: true,
  },
];

export const PROVIDER_STYLE: Record<Provider, { label: string; className: string }> = {
  sw: { label: "S", className: "bg-white text-black" },
  anthropic: { label: "A", className: "bg-[#d4a27f] text-[#2b1a10]" },
  cohere: {
    label: "C",
    className:
      "bg-gradient-to-br from-[#39c5a0] via-[#a78bfa] to-[#f472b6] text-white",
  },
  deepgram: { label: "D", className: "bg-[#e8443a] text-white" },
};

export const MODEL_LIBRARY: ModelRow[] = [
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

export const HISTORY_GROUPS: { label: string; items: HistoryItem[] }[] = [
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

export const DARK_SCHEME = "(prefers-color-scheme: dark)";

/** Stand-in for whatever the session endpoint returns. */
export const ACCOUNTS: Record<string, Account> = {
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

export const DEVICES_SEED: DeviceItem[] = [
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

export const ROLE_LABEL: Record<OrgRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

export const ACCOUNT_FIXTURES: { key: string; label: string }[] = [
  { key: "individual", label: "Personal" },
  { key: "member", label: "Org · Member" },
  { key: "admin", label: "Org · Admin" },
];

export const DAILY_USE: { key: DailyKey; label: string; icon: LucideIcon }[] = [
  { key: "home", label: "Home", icon: HomeIcon },
  { key: "modes", label: "Modes", icon: Sparkles },
  { key: "vocabulary", label: "Dictionary", icon: BookOpen },
];

export const SETTINGS_TABS: (SettingsTab & { key: SettingsKey })[] = [
  { key: "account", label: "Account", icon: CircleUser, group: 0 },
  { key: "billing", label: "Billing", icon: CreditCard, group: 0 },
  { key: "sync", label: "Sync", icon: Cloud, group: 1 },
  { key: "webhooks", label: "Webhooks", icon: Webhook, group: 1 },
  { key: "general", label: "General", icon: SettingsIcon, group: 2 },
  { key: "shortcuts", label: "Shortcuts", icon: Keyboard, group: 2 },
  { key: "sound", label: "Sound", icon: Volume2, group: 2 },
  { key: "privacy", label: "Privacy", icon: Lock, group: 2 },
  { key: "models", label: "Models", icon: BrainCircuit, group: 3 },
];

export const SETUP_SEED: SetupTask[] = [
  { id: "record", label: "Try your first dictation", done: true, icon: Mic },
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

export const SHORTCUTS_SEED: ShortcutEntry[] = [
  { id: "seed-email", trigger: "my email", replacement: "angel@example.com" },
  { id: "seed-signoff", trigger: "my sign off", replacement: "Best,\nAngel" },
];

export const SYNC_DEFS = SETTING_DEFS.filter(
  (d) => d.group === "Sync" || d.group === "Account-wide",
);

/** For an individual account this is just their own list, editable inline
 *  below. For an org it's fleet-wide config, so the seed instead stands in
 *  for whatever Superwhisper Web already has — see WebhooksPanel's
 *  webManaged branch. Modes pick among these locally either way (see
 *  ModeDetailPanel's "Delivery" section). */
export const WEBHOOK_ENDPOINTS_SEED: WebhookEndpoint[] = [
  {
    id: "default",
    label: "Default",
    url: "https://hooks.acme.internal/superwhisper",
  },
  {
    id: "compliance",
    label: "Compliance archive",
    url: "https://hooks.acme.internal/compliance",
  },
  {
    id: "personal",
    label: "Personal Zapier",
    url: "https://hooks.zapier.com/hooks/catch/xyz",
  },
];

export const MICS_SEED: MicDevice[] = [
  { id: "shure", name: "Shure MV7", connected: false },
  { id: "airpods", name: "AirPods Pro", connected: true },
  { id: "builtin", name: "MacBook Air Microphone", connected: true },
];

export const PLANS: {
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
