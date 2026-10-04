"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadImage } from "@/lib/upload";
import RichText, { PENS, type Pen } from "./RichText";
import type { Article } from "@/lib/types";

export default function ArticleAdmin({ articles }: { articles: Article[] }) {
  const router = useRouter();
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [editing, setEditing] = useState<Article | null>(null); // the article being edited, or null for a new one
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  function reset() {
    setEditing(null); setTitle(""); setBody(""); setFile(null);
    setFileKey((k) => k + 1); setPreview(false); setMsg("");
  }

  function startEdit(a: Article) {
    setEditing(a); setTitle(a.title); setBody(a.body); setFile(null);
    setFileKey((k) => k + 1); setPreview(false); setMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function pen(color: Pen | null) {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    if (s === e) { setMsg("Select some text first."); return; }
    setMsg("");
    const plain = body.slice(s, e).replace(/\[\[(?:blue|red|pink):([\s\S]*?)\]\]/g, "$1");
    const next = color ? `[[${color}:${plain}]]` : plain;
    setBody(body.slice(0, s) + next + body.slice(e));
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(s, s + next.length); });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg("");
    try {
      const imageUrl = file ? (await uploadImage(file)).url : undefined; // no new file = keep the old cover
      const res = await fetch(editing ? `/api/articles/${editing.id}` : "/api/articles", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save");
      reset();
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function remove(a: Article) {
    if (!confirm(`Delete "${a.title}"?`)) return;
    const res = await fetch(`/api/articles/${a.id}`, { method: "DELETE" });
    if (!res.ok) alert("Could not delete");
    if (editing?.id === a.id) reset();
    router.refresh();
  }

  const words = body.trim() ? body.trim().split(/\s+/).length : 0;
  const tab = (on: boolean) => `rounded border px-3 py-1.5 ${on ? "" : "opacity-50"}`;

  return (
    <main className="mx-auto max-w-3xl px-6 pb-32 pt-24 text-sm">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="font-serif text-3xl italic">{editing ? "Edit" : "Write"}</h1>
        <a href="/admin" className="rounded border px-3 py-1.5">Back to canvas</a>
      </div>

      <form onSubmit={save} className="flex flex-col gap-6">
        <input
          value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title"
          className="border-b bg-transparent pb-3 font-serif text-5xl italic outline-none"
        />

        <label className="flex flex-col gap-2">
          {editing?.imageUrl ? "Cover image (current one stays unless you choose a new file)" : "Cover image (optional)"}
          <input key={fileKey} type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setPreview(false)} className={tab(!preview)}>Write</button>
          <button type="button" onClick={() => setPreview(true)} className={tab(preview)}>Preview</button>
          <span className="ml-auto opacity-60">Underline selection:</span>
          {(Object.keys(PENS) as Pen[]).map((c) => (
            <button
              key={c} type="button" disabled={preview}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pen(c)} aria-label={`Underline in ${c}`}
              className="flex items-center gap-2 rounded border px-3 py-1.5 capitalize disabled:opacity-40"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: PENS[c] }} />{c}
            </button>
          ))}
          <button
            type="button" disabled={preview} onMouseDown={(e) => e.preventDefault()} onClick={() => pen(null)}
            className="rounded border px-3 py-1.5 disabled:opacity-40"
          >
            Clear
          </button>
        </div>

        {preview ? (
          <div className="min-h-[65vh] whitespace-pre-wrap rounded border p-8 font-serif text-xl leading-9">
            {body.trim() ? <RichText text={body} /> : <span className="opacity-50">Nothing to preview yet.</span>}
          </div>
        ) : (
          <textarea
            ref={taRef} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Start writing…"
            className="min-h-[65vh] w-full resize-y rounded border bg-transparent p-8 font-serif text-xl leading-9 outline-none"
          />
        )}

        <div className="flex items-center gap-4">
          <button disabled={busy || !title.trim() || !body.trim()} className="rounded border px-6 py-2.5 disabled:opacity-50">
            {busy ? "Saving…" : editing ? "Save changes" : "Publish"}
          </button>
          {editing && (
            <button type="button" onClick={reset} className="rounded border px-4 py-2.5">Cancel edit</button>
          )}
          <span className="opacity-60">{words} words</span>
          {msg && <span>{msg}</span>}
        </div>
      </form>

      <h2 className="mb-4 mt-20 font-serif text-xl italic">Published</h2>
      <ul className="flex flex-col gap-2">
        {articles.map((a) => (
          <li key={a.id} className="flex items-center gap-3">
            <span className="flex-1 truncate">{a.title}</span>
            <a href={`/articles/${a.slug}`} className="rounded border px-3 py-1">View</a>
            <button onClick={() => startEdit(a)} className="rounded border px-3 py-1">Edit</button>
            <button onClick={() => remove(a)} className="rounded border px-3 py-1">Delete</button>
          </li>
        ))}
        {articles.length === 0 && <li className="opacity-60">Nothing yet.</li>}
      </ul>
    </main>
  );
}