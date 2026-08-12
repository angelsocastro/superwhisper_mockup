"use client";

import { useState } from "react";
import { SettingsRow } from "@/components/settings-parts";
import { InlineEdit } from "@/components/inline-edit";
import { DetailModal } from "@/components/detail-modal";
import { Switch } from "@/components/ui/switch";
import { SegmentedControl } from "@/components/segmented-control";
import { SHORTCUTS_SEED } from "@/app/settings/data";
import type { TermEntry, ShortcutEntry, DictionaryTab } from "@/app/settings/types";
import { PanelIntro, GhostButton, nextVocabId } from "@/components/settings/shared";

export function DictionaryPanel() {
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
