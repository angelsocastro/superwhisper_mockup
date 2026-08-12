import type { LucideIcon } from "lucide-react";

export type WhatsNewItem = {
  id: string;
  /** Days before today, so the mockup never shows a stale release date. */
  daysAgo: number;
  title: string;
  summary: string;
  body: string;
};

/* --- Super is the base. A mode is a diff against it, never a full config. --- */

export type BaseSettings = {
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
  syncDictionary: boolean;
  syncModes: boolean;
  syncHistory: boolean;
  syncAudio: boolean;
  webhookEndpoint: string;
  webhookTranscript: boolean;
  webhookAppContext: boolean;
  webhookAudio: boolean;
};

export type SettingKey = keyof BaseSettings;

export type SettingDef = {
  key: SettingKey;
  label: string;
  group: string;
  kind: "switch" | "choice" | "languages" | "endpoint";
  choices?: string[];
  /** Org admins can pin this — editing shows a lock instead of a control. */
  locked?: boolean;
  /** Account-wide by nature — there's one Dictionary, one set of Modes, not
   *  one per mode — so no mode can override it, unlike everything else. */
  superOnly?: boolean;
};

export type ModeItem = {
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

export type Provider = "sw" | "anthropic" | "cohere" | "deepgram";

export type ModelRow = {
  id: string;
  name: string;
  provider: Provider;
  kind: "language" | "voice";
  speed: number;
  size?: string;
  isNew?: boolean;
};

export type HistoryItem = {
  id: string;
  /** What landed in the app after the language model cleaned it up. */
  text: string;
  /** The raw transcript, only kept when the model actually changed something. */
  original?: string;
  seconds: number;
  /** Only long recordings have anything to segment. */
  segments?: { at: string; text: string }[];
};

export type ThemePref = "auto" | "light" | "dark";

export type DailyKey = "home" | "modes" | "vocabulary";
export type SettingsKey =
  | "account"
  | "billing"
  | "general"
  | "shortcuts"
  | "sound"
  | "sync"
  | "webhooks"
  | "privacy"
  | "models";
/**
 * How the signed-in account was provisioned. Not a user preference — it follows
 * from how they authenticated, so the app only reads it.
 */
export type AccountKind = "individual" | "org";
/** Only owners and admins can act on the organization's subscription. */
export type OrgRole = "owner" | "admin" | "member";

export type Account = {
  kind: AccountKind;
  email: string;
  /** Present when kind === "org". */
  org?: { name: string; role: OrgRole };
};

export type DeviceItem = {
  id: string;
  name: string;
  detail: string;
  icon: LucideIcon;
  current?: boolean;
};

export type Subpage = { kind: "system" } | { kind: "plans" } | null;

/** Modes is its own nav-level flow now, not a Settings sub-page — this is
 *  the equivalent of Subpage for the daily "Modes" tab. */
export type ModesSubpage =
  | { kind: "modeDetail"; modeId: string }
  | { kind: "superDetail" }
  | null;

export type SetupTask = {
  id: string;
  label: string;
  done: boolean;
  icon: LucideIcon;
};

/** A term is one entry — the correction is an optional attribute of it,
 *  not a separate category. "super whisper" and its fix "Superwhisper"
 *  are the same term, not two different kinds of thing. */
export type TermEntry = { id: string; word: string; correction?: string };

/** A different mechanic entirely: a short trigger phrase that expands to
 *  a long block of text (an email, an address, a sign-off) — not a
 *  pronunciation fix, so it doesn't belong in the same list as terms. */
export type ShortcutEntry = { id: string; trigger: string; replacement: string };

export type DictionaryTab = "terms" | "shortcuts";

export type SyncMode = "off" | "cloud" | "self";

export type WebhookEndpoint = { id: string; label: string; url: string };

export type MicDevice = { id: string; name: string; connected: boolean };
