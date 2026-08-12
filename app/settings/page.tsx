"use client";

import { useState } from "react";
import { ChevronLeft, Sparkles, Pin, Headphones, CircleCheck } from "lucide-react";
import { MacWindow } from "@/components/mac-window";
import { SettingsWindow } from "@/components/settings-window";
import { DetailModal } from "@/components/detail-modal";
import { cn } from "@/lib/utils";

import {
  WHATS_NEW_SEED,
  BASE_DEFAULTS,
  MODES_SEED,
  ACCOUNTS,
  SETTINGS_TABS,
  SETUP_SEED,
  WEBHOOK_ENDPOINTS_SEED,
  MICS_SEED,
} from "@/app/settings/data";
import type {
  DailyKey,
  ThemePref,
  SettingsKey,
  Subpage,
  ModesSubpage,
  WhatsNewItem,
  ModeItem,
  WebhookEndpoint,
  BaseSettings,
  SettingKey,
  MicDevice,
  SetupTask,
} from "@/app/settings/types";

import {
  canManageBilling,
  useResolvedTheme,
  nextModeId,
  nextEndpointId,
  formatDaysAgo,
} from "@/components/settings/shared";
import { DailyNav, AccountFixtureSwitcher } from "@/components/settings/DailyNav";
import { SetupGuide } from "@/components/settings/SetupGuide";
import { ModePopover, MicPopover } from "@/components/settings/popovers";

import { HomePanel } from "@/components/settings/daily/HomePanel";
import { DictionaryPanel } from "@/components/settings/DictionaryPanel";
import { ModesPanel, SuperDetailPanel } from "@/components/settings/daily/ModesPanel";
import { ModeDetailPanel } from "@/components/settings/daily/ModeDetailPanel";
import { GeneralPanel } from "@/components/settings/GeneralPanel";
import { SyncPanel } from "@/components/settings/SyncPanel";
import { WebhooksPanel } from "@/components/settings/WebhooksPanel";
import { PrivacyPanel } from "@/components/settings/PrivacyPanel";
import { ShortcutsPanel } from "@/components/settings/ShortcutsPanel";
import { SoundPanel } from "@/components/settings/SoundPanel";
import { ModelsPanel } from "@/components/settings/ModelsPanel";
import { SystemPanel } from "@/components/settings/SystemPanel";
import { AccountPanel } from "@/components/settings/AccountPanel";
import { BillingPanel } from "@/components/settings/BillingPanel";
import { PlansPanel } from "@/components/settings/PlansPanel";

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
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>(
    WEBHOOK_ENDPOINTS_SEED,
  );

  const addEndpoint = (label: string, url: string) =>
    setEndpoints((prev) => [
      ...prev,
      { id: nextEndpointId(), label, url },
    ]);

  const updateEndpoint = (
    id: string,
    field: "label" | "url",
    value: string,
  ) =>
    setEndpoints((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );

  const removeEndpoint = (id: string) =>
    setEndpoints((prev) => prev.filter((e) => e.id !== id));
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

  /** Blank, not enabled by default — you build it, you switch it on. Opens
   *  straight to its own page since there's nothing to look at on the list
   *  yet. */
  const createMode = () => {
    const id = nextModeId();
    setModes((prev) => [
      ...prev,
      {
        id,
        name: "New mode",
        apps: [],
        instructions: "",
        overrides: {},
        enabled: false,
        builtIn: false,
      },
    ]);
    setModesSubpage({ kind: "modeDetail", modeId: id });
  };

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
      ) : settingsTab === "sync" ? (
        <SyncPanel account={account} base={base} onChange={setBaseValue} />
      ) : settingsTab === "webhooks" ? (
        <WebhooksPanel
          account={account}
          endpoints={endpoints}
          onAddEndpoint={addEndpoint}
          onUpdateEndpoint={updateEndpoint}
          onRemoveEndpoint={removeEndpoint}
        />
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
      <SuperDetailPanel
        base={base}
        managed={isManaged}
        onChange={setBaseValue}
        endpoints={endpoints}
      />
    );
  } else if (modesDetailMode) {
    modesBody = (
      <ModeDetailPanel
        mode={modesDetailMode}
        base={base}
        previewText={previewText}
        endpoints={endpoints}
        onSetOverride={(k, v) => setOverride(modesDetailMode.id, k, v)}
        onClearOverride={(k) => clearOverride(modesDetailMode.id, k)}
        onSetInstructions={(v) => setModeInstructions(modesDetailMode.id, v)}
        onToggleMode={(enabled) => toggleMode(modesDetailMode.id, enabled)}
        onRename={(name) => renameMode(modesDetailMode.id, name)}
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
        onCreateMode={createMode}
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
