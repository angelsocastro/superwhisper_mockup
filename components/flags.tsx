"use client";

import { useId } from "react";

export const ALL_LANGUAGES = [
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

/** Maps a browser locale prefix (navigator.language) to one of our
 *  languages — used to detect a sensible default instead of silently
 *  assuming English. */
export const LOCALE_TO_LANGUAGE: Record<string, string> = {
  en: "English",
  es: "Spanish",
  de: "German",
  fr: "French",
  pt: "Portuguese",
  nl: "Dutch",
  it: "Italian",
  ja: "Japanese",
  zh: "Chinese",
};

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

export function FlagIcon({ lang, size = 16 }: { lang: string; size?: number }) {
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
