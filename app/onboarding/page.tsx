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

/** Segments, not a smooth fill — each tick is a real step, so the bar
 *  also answers "how many are left," not just "how far along." */
function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex w-full gap-1.5">
      {STEPS.map((s, i) => (
        <div key={s} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className={cn(
              "h-full rounded-full transition-colors duration-300",
              i <= step ? "bg-[var(--primary)]" : "bg-transparent",
            )}
          />
        </div>
      ))}
    </div>
  );
}

/** The signature: a quiet bar of "listening" that runs through every step,
 *  not just a one-off decoration on Welcome — the one thing true about
 *  Superwhisper on every screen is that it's built to hear you. */
function AmbientWaveform() {
  const heights = [5, 9, 4, 12, 7, 10, 3, 8, 11, 5, 9, 4, 7, 10, 5, 8, 4, 9, 6, 8, 3, 7, 11, 5, 8, 4, 9, 6, 10, 5];
  return (
    <div className="flex h-5 items-end justify-center gap-[3px]" aria-hidden="true">
      {heights.map((h, i) => (
        <span
          key={i}
          className="w-[2.5px] shrink-0 rounded-full bg-[var(--primary)] motion-safe:animate-[ob-wave_2.6s_ease-in-out_infinite]"
          style={{
            height: h,
            opacity: 0.22 + (i % 5) * 0.06,
            animationDelay: `${i * 0.06}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes ob-wave {
          0%, 100% { transform: scaleY(0.55); }
          50% { transform: scaleY(1); }
        }
      `}</style>
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
      className="w-full rounded-[12px] bg-[var(--primary)] py-3.5 text-[15px] font-semibold text-[#0a1622] transition-colors hover:bg-[var(--primary-hover)]"
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
    <main className="dark flex min-h-screen items-center justify-center bg-[#020203] p-6">
      <div
        className={cn(
          "relative flex h-[600px] w-[520px] flex-col gap-7 overflow-hidden rounded-[20px] border px-9 pt-7 pb-8 shadow-[0_70px_140px_-30px_rgb(0_0_0/0.95)]",
          current === "welcome"
            ? "border-white/[0.08]"
            : "border-white/[0.06] bg-[#09090b]",
        )}
      >
        {current === "welcome" && <WelcomeDrape />}

        <div className="relative flex h-full flex-col gap-7">
          <div className="flex shrink-0 flex-col gap-7">
            <ProgressBar step={step} />
            <AmbientWaveform />
          </div>

          <div className="flex flex-1 flex-col justify-center overflow-y-auto">

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
              <div className="flex items-center gap-2 rounded-[10px] border border-[var(--primary)]/25 bg-[var(--primary)]/10 px-3.5 py-2.5 text-[13px] text-[color:var(--primary-tint)]">
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
                        ? "border-[var(--primary)]/50 bg-[var(--primary)]/10 text-white"
                        : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]",
                    )}
                  >
                    <FlagIcon lang={lang} size={16} />
                    <span className="min-w-0 flex-1 truncate">{lang}</span>
                    {checked && (
                      <Check
                        className="h-3.5 w-3.5 shrink-0 text-[var(--primary)]"
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
              <button className="w-fit text-[13px] font-medium text-[var(--primary)] hover:underline">
                Learn how privacy is at the heart of Superwhisper ›
              </button>
            </div>

            <div className="flex flex-col divide-y divide-white/10 rounded-[12px] border border-white/10">
              <div className="flex items-center gap-3.5 px-4 py-4">
                <Mic className="h-5 w-5 shrink-0 text-[var(--primary)]" strokeWidth={2} />
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
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/15">
              <Check className="h-6 w-6 text-[var(--primary)]" strokeWidth={2.5} />
            </div>
            <h1 className="text-[22px] font-bold text-white">
              You&rsquo;re all set
            </h1>
            <p className="max-w-[340px] text-[14px] leading-relaxed text-white/60">
              Recognizing {languages.join(", ")}. Change it anytime from
              Modes → Super.
            </p>
            <Link href="/settings" className="mt-4 w-full">
              <span className="block w-full rounded-[12px] bg-[var(--primary)] py-3.5 text-center text-[15px] font-semibold text-[#0a1622] transition-colors hover:bg-[var(--primary-hover)]">
                Open Superwhisper
              </span>
            </Link>
          </div>
        )}
          </div>
        </div>
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
        <button className="w-fit text-[13px] font-medium text-[var(--primary)] hover:underline">
          Learn how privacy is at the heart of Superwhisper ›
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setChoice("cloud")}
          className={cn(
            "flex flex-col items-center gap-2 rounded-[14px] border px-4 py-8 transition-colors",
            choice === "cloud"
              ? "border-[var(--primary)] bg-[var(--primary)]/10"
              : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
          )}
        >
          <Cloud
            className={cn(
              "h-8 w-8",
              choice === "cloud" ? "text-[var(--primary)]" : "text-white/50",
            )}
            strokeWidth={1.5}
          />
          <span
            className={cn(
              "text-[14px] font-semibold",
              choice === "cloud" ? "text-[var(--primary)]" : "text-white/70",
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
              ? "border-[var(--primary)] bg-[var(--primary)]/10"
              : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
          )}
        >
          <WifiOff
            className={cn(
              "h-8 w-8",
              choice === "local" ? "text-[var(--primary)]" : "text-white/50",
            )}
            strokeWidth={1.5}
          />
          <span
            className={cn(
              "text-[14px] font-semibold",
              choice === "local" ? "text-[var(--primary)]" : "text-white/70",
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

/** Folded black silk/carbon catching hard light — sharp creases, not a
 *  soft gradient blob, matching the real Welcome screen's photographic
 *  backdrop. Two conic-gradients (folds fanning from two off-canvas
 *  points) instead of one flat glow. */
function WelcomeDrape() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background: [
          "conic-gradient(from 205deg at 12% -15%," +
            "transparent 0deg, transparent 5deg," +
            "rgba(255,255,255,0.14) 6.5deg, rgba(255,255,255,0.14) 8.5deg," +
            "transparent 10deg, transparent 27deg," +
            "rgba(255,255,255,0.22) 28.5deg, rgba(255,255,255,0.22) 31.5deg," +
            "transparent 33deg, transparent 57deg," +
            "rgba(210,216,226,0.16) 58.5deg, rgba(210,216,226,0.16) 62deg," +
            "transparent 63.5deg, transparent 360deg)",
          "conic-gradient(from 30deg at 92% 118%," +
            "transparent 0deg, transparent 9deg," +
            "rgba(255,255,255,0.11) 10.5deg, rgba(255,255,255,0.11) 13deg," +
            "transparent 14.5deg, transparent 39deg," +
            "rgba(255,255,255,0.18) 40.5deg, rgba(255,255,255,0.18) 43.5deg," +
            "transparent 45deg, transparent 360deg)",
          "radial-gradient(130% 100% at 50% 10%, rgba(35,37,42,0.7), transparent 65%)",
          "#050506",
        ].join(", "),
      }}
    />
  );
}
