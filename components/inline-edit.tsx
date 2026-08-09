"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Inline / in-place text editor. The value IS the displayed content —
 * no pencil icon, no separate form. Hover/focus reveals a subtle box;
 * click to edit; Enter or blur commits; Escape reverts.
 *
 * Only for short, low-risk free text (names, labels, tags). Not for
 * closed option sets (use a select) or validated/masked input (use a
 * regular field with explicit confirm).
 */
export function InlineEdit({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const commit = () => {
    const next = draft.trim();
    setEditing(false);
    if (next && next !== value) {
      onChange(next);
    } else {
      setDraft(value);
    }
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            cancel();
          }
        }}
        placeholder={placeholder}
        style={{ fieldSizing: "content" } as React.CSSProperties}
        className={cn(
          "-mx-1.5 -my-0.5 min-w-[120px] max-w-full rounded-[5px] border border-primary/50 bg-white/[0.07] px-1.5 py-0.5 text-inherit outline-none",
          className
        )}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={cn(
        "-mx-1.5 -my-0.5 max-w-full rounded-[5px] border border-transparent px-1.5 py-0.5 text-left text-inherit transition-colors hover:border-white/15 hover:bg-white/[0.05] focus-visible:border-primary/50 focus-visible:outline-none",
        className
      )}
    >
      {value || <span className="text-muted-foreground">{placeholder}</span>}
    </button>
  );
}
