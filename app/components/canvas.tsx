"use client";

import { Item } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadImage } from "@/lib/upload";
import Link from "next/link";

const DRAG_THRESHOLD = 8; // pixels the pointer must move before it counts as a drag

export default function Canvas({ items, owner = false }: { items: Item[]; owner?: boolean }) {
  const [cam, setCam] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [zoomed, setZoomed] = useState<Item | null>(null); // which item is open in the lightbox
  const viewRef = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null); // where the pointer went down
  const lastPointer = useRef({ x: 0, y: 0 });
  const pointerType = useRef<string>("mouse");
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("")
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("")
  const [menu,setMenu] = useState<{sx:number;sy:number;wx:number;wy:number} | null>(null); //screen popups position

  //repositioning the art on canvas
  const[selected,setSelected] = useState<{item:Item;sx:number;sy:number} | null>(null);
  const[moving,setMoving]=useState<Item | null>(null);
  const didDrag = useRef(false);

  const tidy = (url:string) =>  //we trim the image here for extra borders
    url.toLowerCase().endsWith(".png") ? url.replace("/upload/", "/upload/e_trim/") : url;
  
  async function removeItem(it:Item){
    if(!confirm(`Delete "${it.title || "this piece"}"?`)) return;
    const res = await fetch(`/api/items/${it.id}`,{method:"DELETE"});
    if (!res.ok) alert("Could not delete");
    setSelected(null);
    router.refresh();
  }

  async function placeItem(e:React.MouseEvent){
    if (!moving || didDrag.current) return;
    const r = viewRef.current!.getBoundingClientRect();
    const wx = e.clientX - r.left - r.width / 2 - cam.x; // screen -> world
    const wy = e.clientY - r.top - r.height / 2 - cam.y;
    const it = moving;
    setMoving(null);
    const res = await fetch(`/api/items/${it.id}`,{
      method:"PATCH",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({x:Math.round(wx-it.w/2),y:Math.round(wy-it.h/2)})
    });
    if(!res.ok) alert("Could not move");
    router.refresh();
  }

  //image uploads logic here

  async function addArt(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !menu) return;
    setBusy(true); setMsg("");

    try {
      const img = await uploadImage(file);
      const w = 300, h = Math.round((w * img.height) / img.width);
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "art", title, imageUrl: img.url, w, h,
          x: Math.round(menu.wx - w / 2),
          y: Math.round(menu.wy - h / 2),
        }),
      });
      if (!res.ok) throw new Error("Could not save");
      setFile(null); setTitle(""); router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/admin/login")
  }

  useEffect(() => {
    const el = viewRef.current!;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setCam((c) => ({ x: c.x - e.deltaX, y: c.y - e.deltaY }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Escape closes the lightbox.
  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoomed(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomed]);

  // Escape closes the lightbox.
  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoomed(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomed]);

  // Escape closes the add-art popup.
  useEffect(() => {
    if (!menu && !selected && !moving) return;
    const onKey = (e: KeyboardEvent) => 
      {if(e.key === "Escape") {setMenu(null);setSelected(null);setMoving(null);}};
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu,selected,moving]);


  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    didDrag.current = false;
    setSelected(null);
    setMenu(null);
    pointerType.current = e.pointerType; // "mouse" | "touch" | "pen"
    start.current = { x: e.clientX, y: e.clientY }; // just remember; no capture yet
    lastPointer.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!start.current) return;
    if (!dragging) {
      const moved = Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y);
      if (moved < DRAG_THRESHOLD) return; // still just a click
      e.currentTarget.setPointerCapture(e.pointerId); // now it's a real drag
      setDragging(true);
      didDrag.current = true;
    }
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    setCam((c) => ({ x: c.x + dx, y: c.y + dy }));
  };
  const onPointerUp = () => {
    start.current = null;
    setDragging(false);
  };

  const onContextMenu = (e:React.MouseEvent) => {
    if (!owner) return;
    e.preventDefault();
    const r = viewRef.current!.getBoundingClientRect();
  setMenu({
    sx: e.clientX, sy: e.clientY,
    wx: e.clientX - r.left - r.width / 2 - cam.x,
    wy: e.clientY - r.top - r.height / 2 - cam.y,
  });
  }


  return (
    <>
      <div
        ref={viewRef}
        onPointerDown={onPointerDown}
        onContextMenu={onContextMenu}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={placeItem}
        className="fixed inset-0 overflow-hidden"
        style={{
          background: "var(--background)",
          color: "var(--foreground)",
          cursor: moving ? "crosshair" : dragging ? "grabbing" : "grab",
          touchAction: "none",
          backgroundImage: "radial-gradient(rgba(128,128,128,.35) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          backgroundPosition: `calc(50% + ${cam.x}px) calc(50% + ${cam.y}px)`,
        }}
      >
        <div className="absolute left-1/2 top-1/2" style={{ transform: `translate(${cam.x}px, ${cam.y}px)` }}>
          {items.map((it) => (
            <figure
              key={it.id}
              onClick={(e) => {
                if(moving) return;
                if (owner) {setSelected({item:it,sx:e.clientX,sy:e.clientY});return;}
                if (pointerType.current !== "mouse") setZoomed(it);                
                if (pointerType.current !== "mouse") setZoomed(it)}}
              
              onDoubleClick={() => {
                if (moving) return;
                setSelected(null);
                setZoomed(it);
                setZoomed(it)
              }}

              className="absolute m-0 cursor-zoom-in select-none"
              style={{ left: it.x, top: it.y, width: it.w }}
            >

              {it.imageUrl ? (
                <img
                  src={tidy(it.imageUrl)}
                  alt={it.title}
                  draggable={false}
                  style={{ width: "100%", height: "auto", display: "block"}}
                />
              ) : (
                <div style={{ height: it.h, background: it.color ?? "#e5e1da" }} />
              )}
              <figcaption className="mt-2 text-center text-[11px] tracking-wide text-muted">{it.title}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* Lightbox: a sibling of the canvas, so its clicks never reach the canvas's drag handlers. */}
      {zoomed && (
        <div
          role="dialog"
          aria-label={zoomed.title}
          onClick={() => setZoomed(null)} // clicking the backdrop closes it
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "color-mix(in srgb, var(--background) 94%, transparent)" }}
        >
          <button
            onClick={() => setZoomed(null)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-xl"
            style={{ background: "var(--foreground)", color: "var(--background)" }}
          >
            ×
          </button>
          <figure onClick={(e) => e.stopPropagation()} className="m-0 text-center"> {/* clicks on the art don't close */}
            {zoomed.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tidy(zoomed.imageUrl)}
                alt={zoomed.title}
                style={{ maxWidth: "88vw", maxHeight: "75dvh", objectFit: "contain" }}
              />
            ) : (
              <div
                style={{
                  aspectRatio: `${zoomed.w} / ${zoomed.h}`,
                  width: `min(80vw, calc(75dvh * ${zoomed.w / zoomed.h}))`,
                  background: zoomed.color ?? "#e5e1da",
                }}
              />
            )}
            <figcaption className="mt-3 text-sm">{zoomed.title}</figcaption>
          </figure>
        </div>
      )}

      {owner && selected && !moving && (
        <div
          className="fixed z-40 flex gap-2 rounded border p-2 text-xs"
          style={{
            left: Math.min(selected.sx, window.innerWidth - 220),
            top: Math.min(selected.sy, window.innerHeight - 60),
            background: "var(--background)",
          }}
        >
          <button onClick={() => { setMoving(selected.item); setSelected(null); }} className="rounded border px-3 py-1.5">Move</button>
          <button onClick={() => removeItem(selected.item)} className="rounded border px-3 py-1.5">Delete</button>
          <button onClick={() => setSelected(null)} aria-label="Close" className="px-2">×</button>
        </div>
      )}

      {owner && moving && (
        <div className="fixed bottom-16 left-1/2 z-40 -translate-x-1/2 rounded border px-4 py-2 text-xs"
            style={{ background: "var(--background)" }}>
          Click where `{moving.title || "this piece"}` should go. Esc to cancel.
        </div>
      )}

      {owner && menu && (
        <form
          onSubmit={addArt}
          className="fixed z-40 flex w-64 flex-col gap-2 rounded border p-3 text-xs"
          style={{
            left:Math.min(menu.sx,window.innerWidth -270),
            top:Math.min(menu.sy,window.innerHeight - 200),
            background: "var(--background)",
          }}
        >
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)}/>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title(Optional)"
                  className="rounded border bg-transparent px-2 py-1.5"
          />
          <div className="flex gap-2">
            <button disabled={!file || busy} className="flex-1 rounded border px-3 py-1.5 disabled:opacity-50">
              {busy ? "Uploading.." : "Add art here"}
            </button>
            <button type="button" onClick={() => setMenu(null)} className="rounded border px-3 py-1.5">Cancel</button>
          </div>
            {msg && <p>{msg}</p>}
        </form>
      )}


      {owner && (
        <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2 text-xs">
          <span>Owner mode</span>
          <button
            onClick={() => { setMsg(""); setMenu({ sx: window.innerWidth / 2 - 128, sy: window.innerHeight / 2 - 100, wx: -cam.x, wy: -cam.y }); }}
            className="rounded border px-3 py-1.5"
          >
            Add art
          </button>
          <Link href="/" className="rounded border px-3 py-1.5">View site</Link>
          <Link href="/admin/articles" className="rounded border px-3 py-1.5">Art</Link>
          <button onClick={logout} className="rounded border px-3 py-1.5">Log out</button>
        </div>
      )}


    </>
  );
}