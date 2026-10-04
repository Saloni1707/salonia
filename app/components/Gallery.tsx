"use client";

import { useEffect, useState } from "react";
import type { Item } from "@/lib/types";

// Same PNG margin trim as the canvas, so captions sit right under the drawing.
const tidy = (url: string) =>
  url.toLowerCase().endsWith(".png") ? url.replace("/upload/", "/upload/e_trim/") : url;

export default function Gallery({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<Item | null>(null);

  // Escape closes the zoomed view, and the page behind it stops scrolling while it's open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  // Reading order: top to bottom, then left to right, the same way the canvas is laid out.
  const sorted = items.filter((i) => i.imageUrl).sort((a, b) => a.y - b.y || a.x - b.x);

  return (
    <>
      <main className="mx-auto flex max-w-xl flex-col gap-14 px-5 pb-24 pt-24">
        <p className="text-center text-xs tracking-wide text-muted">tap any art to take a closer look</p>
        {sorted.map((it) => (
          <figure key={it.id} className="m-0">
            <button
              type="button"
              onClick={() => setOpen(it)}
              aria-label={`View ${it.title || "artwork"} larger`}
              className="block w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tidy(it.imageUrl!)}
                alt={it.title}
                loading="lazy"
                decoding="async"
                className="block h-auto w-full"
              />
            </button>
            {it.title && (
              <figcaption className="mt-3 text-center text-[11px] tracking-wide text-muted">{it.title}</figcaption>
            )}
          </figure>
        ))}
      </main>

      {open && (
        <div
          role="dialog"
          aria-label={open.title}
          onClick={() => setOpen(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "color-mix(in srgb, var(--background) 94%, transparent)" }}
        >
          <button
            onClick={() => setOpen(null)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full text-xl"
            style={{ background: "var(--foreground)", color: "var(--background)" }}
          >
            ×
          </button>
          <figure onClick={(e) => e.stopPropagation()} className="m-0 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tidy(open.imageUrl!)}
              alt={open.title}
              style={{ maxWidth: "92vw", maxHeight: "80dvh", objectFit: "contain" }}
            />
            {open.title && <figcaption className="mt-3 text-sm">{open.title}</figcaption>}
          </figure>
        </div>
      )}
    </>
  );
}