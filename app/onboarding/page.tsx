"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mic, Accessibility, Cloud, WifiOff, Check } from "lucide-react";
import { ALL_LANGUAGES, LOCALE_TO_LANGUAGE, FlagIcon } from "@/components/flags";
import { cn } from "@/lib/utils";

/**
 * Replicates Superwhisper's real onboarding (Welcome → Permissions → Pro →
 * Model) with one screen added: Language. Real Superwhisper never asks —
 * it silently assumes English and only shows through trial and error once
 * something transcribes wrong. This step detects a default from the OS
 * locale, shows it, and makes it editable before you ever dictate.
 */

const STEPS = ["welcome", "language", "permissions", "pro", "model", "done"] as const;
type Step = (typeof STEPS)[number];

function detectLanguage(): string {
  if (typeof navigator === "undefined") return "English";
  const prefix = navigator.language?.split("-")[0]?.toLowerCase();
  return LOCALE_TO_LANGUAGE[prefix] ?? "English";
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-[#58a6ff] transition-[width] duration-300 ease-out"
        style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
      />
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-[12px] bg-[#58a6ff] py-3.5 text-[15px] font-semibold text-[#0a1622] transition-colors hover:bg-[#7ab8ff]"
    >
      {children}
    </button>
  );
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [detected, setDetected] = useState<string | null>(null);

  // navigator.language only exists client-side — deliberately deferred to
  // an effect rather than computed at render, so the server-rendered HTML
  // and the client's first paint agree (both start at "English") and the
  // detected value applies a beat later instead of causing a hydration
  // mismatch.
  useEffect(() => {
    const lang = detectLanguage();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDetected(lang);
    setLanguages([lang]);
  }, []);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang)
        ? prev.length > 1
          ? prev.filter((l) => l !== lang)
          : prev
        : [...prev, lang],
    );
  };

  const current: Step = STEPS[step];

  return (
    <main className="dark flex min-h-screen items-center justify-center bg-[#0b0c0e] p-6">
      <div
        className={cn(
          "relative flex w-[520px] flex-col gap-7 overflow-hidden rounded-[20px] border border-white/10 bg-[#1b1c1f] px-9 pt-7 pb-8 shadow-[0_60px_120px_-30px_rgb(0_0_0/0.9)]",
        )}
      >
        {current === "welcome" && <WelcomeSwirl />}

        <ProgressBar step={step} />

        {current === "welcome" && (
          <div className="relative flex flex-col items-center gap-4 py-10 text-center">
            <h1 className="text-[26px] font-bold text-white">
              Welcome to Superwhisper
            </h1>
            <p className="max-w-[360px] text-[14px] leading-relaxed text-white/60">
              We&rsquo;ll guide you through set up and make sure Superwhisper
              works the way you want.
            </p>
            <p className="text-[13px] text-white/40">
              Estimated time: less than 2 minutes
            </p>
            <div className="mt-6 flex w-full flex-col items-center gap-4">
              <PrimaryButton onClick={next}>Get Started</PrimaryButton>
              <button className="text-[13px] text-white/50 hover:text-white/80">
                My company uses Superwhisper
              </button>
            </div>
          </div>
        )}

        {current === "language" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-[22px] font-bold text-white">
                Which languages do you speak?
              </h1>
              <p className="text-[14px] leading-relaxed text-white/60">
                Superwhisper listens for these specifically — naming a
                shortlist beats guessing from every language there is.
                Switching between them mid-sentence works too.
              </p>
            </div>

            {detected && (
              <div className="flex items-center gap-2 rounded-[10px] border border-[#58a6ff]/25 bg-[#58a6ff]/10 px-3.5 py-2.5 text-[13px] text-[#9cc9ff]">
                <FlagIcon lang={detected} size={16} />
                Detected from your Mac: {detected}. Add more below if you
                mix languages.
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              {ALL_LANGUAGES.map((lang) => {
                const checked = languages.includes(lang);
                return (
                  <button
                    key={lang}
                    onClick={() => toggleLanguage(lang)}
                    className={cn(
                      "flex items-center gap-2 rounded-[10px] border px-3 py-2.5 text-left text-[13px] font-medium transition-colors",
                      checked
                        ? "border-[#58a6ff]/50 bg-[#58a6ff]/10 text-white"
                        : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]",
                    )}
                  >
                    <FlagIcon lang={lang} size={16} />
                    <span className="min-w-0 flex-1 truncate">{lang}</span>
                    {checked && (
                      <Check
                        className="h-3.5 w-3.5 shrink-0 text-[#58a6ff]"
                        strokeWidth={2.5}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <PrimaryButton onClick={next}>Continue</PrimaryButton>
          </div>
        )}

        {current === "permissions" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-[22px] font-bold text-white">
                Let&rsquo;s set up permissions
              </h1>
              <button className="w-fit text-[13px] font-medium text-[#58a6ff] hover:underline">
                Learn how privacy is at the heart of Superwhisper ›
              </button>
            </div>

            <div className="flex flex-col divide-y divide-white/10 rounded-[12px] border border-white/10">
              <div className="flex items-center gap-3.5 px-4 py-4">
                <Mic className="h-5 w-5 shrink-0 text-[#58a6ff]" strokeWidth={2} />
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-white">
                    Allow Microphone Access
                  </p>
                  <p className="text-[12.5px] leading-snug text-white/50">
                    Required to capture audio for transcription. Only used
                    when dictation is active.
                  </p>
                </div>
                <button className="shrink-0 rounded-[7px] bg-white/10 px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-white/15">
                  Allow
                </button>
              </div>
              <div className="flex items-center gap-3.5 px-4 py-4">
                <Accessibility
                  className="h-5 w-5 shrink-0 text-white/40"
                  strokeWidth={2}
                />
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-white/50">
                    Allow Accessibility Access
                  </p>
                  <p className="text-[12.5px] leading-snug text-white/35">
                    Required to paste text into apps & interact with your
                    system. Only used when needed.
                  </p>
                </div>
                <button className="shrink-0 rounded-[7px] bg-white/10 px-3 py-1.5 text-[12.5px] font-medium text-white/70 hover:bg-white/15">
                  Allow
                </button>
              </div>
            </div>

            <PrimaryButton onClick={next}>Continue Setup</PrimaryButton>
          </div>
        )}

        {current === "pro" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-[22px] font-bold text-white">
                Unlock all Pro Features
              </h1>
              <p className="text-[14px] text-white/60">
                Advanced tools for a refined workflow.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col items-center justify-center gap-1 rounded-[12px] border border-white/10 bg-white/[0.03] px-3 py-5 text-center">
                <span className="text-[20px] font-bold text-white/90">
                  30 Days
                </span>
                <span className="text-[12.5px] text-white/50">
                  Money-back guarantee
                </span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 rounded-[12px] border border-white/10 bg-white/[0.03] px-3 py-5 text-center">
                <Cloud className="mb-1 h-6 w-6 text-white/70" strokeWidth={1.5} />
                <span className="text-[12.5px] text-white/50">
                  Unlimited use of Cloud models
                </span>
              </div>
              <div className="col-span-2 flex items-center justify-center rounded-[12px] border border-white/10 bg-white/[0.03] px-3 py-3.5 text-center text-[13px] font-medium text-white/70">
                Priority support
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <PrimaryButton onClick={next}>Get Superwhisper Pro</PrimaryButton>
              <button
                onClick={next}
                className="w-full rounded-[12px] bg-white/10 py-3.5 text-[15px] font-semibold text-white hover:bg-white/15"
              >
                I already have a license
              </button>
              <button
                onClick={next}
                className="text-[13px] text-white/40 hover:text-white/70"
              >
                Maybe later
              </button>
            </div>
          </div>
        )}

        {current === "model" && <ModelStep onNext={next} />}

        {current === "done" && (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#58a6ff]/15">
              <Check className="h-6 w-6 text-[#58a6ff]" strokeWidth={2.5} />
            </div>
            <h1 className="text-[22px] font-bold text-white">
              You&rsquo;re all set
            </h1>
            <p className="max-w-[340px] text-[14px] leading-relaxed text-white/60">
              Recognizing {languages.join(", ")}. Change it anytime from
              Modes → Super.
            </p>
            <Link href="/settings" className="mt-4 w-full">
              <span className="block w-full rounded-[12px] bg-[#58a6ff] py-3.5 text-center text-[15px] font-semibold text-[#0a1622] transition-colors hover:bg-[#7ab8ff]">
                Open Superwhisper
              </span>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

function ModelStep({ onNext }: { onNext: () => void }) {
  const [choice, setChoice] = useState<"cloud" | "local">("cloud");
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[22px] font-bold text-white">
          Select your preferred model
        </h1>
        <p className="text-[14px] leading-relaxed text-white/60">
          Faster performance with internet connection required. Your
          recordings go to the cloud to process but are never stored there.
        </p>
        <button className="w-fit text-[13px] font-medium text-[#58a6ff] hover:underline">
          Learn how privacy is at the heart of Superwhisper ›
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setChoice("cloud")}
          className={cn(
            "flex flex-col items-center gap-2 rounded-[14px] border px-4 py-8 transition-colors",
            choice === "cloud"
              ? "border-[#58a6ff] bg-[#58a6ff]/10"
              : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
          )}
        >
          <Cloud
            className={cn(
              "h-8 w-8",
              choice === "cloud" ? "text-[#58a6ff]" : "text-white/50",
            )}
            strokeWidth={1.5}
          />
          <span
            className={cn(
              "text-[14px] font-semibold",
              choice === "cloud" ? "text-[#58a6ff]" : "text-white/70",
            )}
          >
            Cloud
          </span>
        </button>
        <button
          onClick={() => setChoice("local")}
          className={cn(
            "flex flex-col items-center gap-2 rounded-[14px] border px-4 py-8 transition-colors",
            choice === "local"
              ? "border-[#58a6ff] bg-[#58a6ff]/10"
              : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
          )}
        >
          <WifiOff
            className={cn(
              "h-8 w-8",
              choice === "local" ? "text-[#58a6ff]" : "text-white/50",
            )}
            strokeWidth={1.5}
          />
          <span
            className={cn(
              "text-[14px] font-semibold",
              choice === "local" ? "text-[#58a6ff]" : "text-white/70",
            )}
          >
            Local
          </span>
        </button>
      </div>

      <PrimaryButton onClick={onNext}>Continue</PrimaryButton>
    </div>
  );
}

/** Approximate the glossy diagonal-light card background from the real
 *  Welcome screen — layered gradients, not a literal asset. */
function WelcomeSwirl() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[20px]">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "linear-gradient(135deg, transparent 20%, rgba(255,255,255,0.06) 35%, transparent 50%), linear-gradient(45deg, transparent 40%, rgba(88,166,255,0.08) 55%, transparent 70%)",
        }}
      />
      <div
        className="absolute -top-24 -right-24 h-64 w-64 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, #58a6ff, transparent 70%)" }}
      />
    </div>
  );
}
