import Canvas from "../components/canvas";
import { getItems } from "@/lib/items";

export const dynamic = "force-dynamic";

export default async function Art() {
  return (
    <>
      <Canvas items={await getItems()} />
      <p className="pointer-events-none fixed bottom-6 left-1/2 z-30 -translate-x-1/2 text-center text-xs tracking-wide text-muted">
        <span className="pointer-coarse:hidden">double-click any art to take a closer look</span>
        <span className="hidden pointer-coarse:inline">tap any art to take a closer look</span>
      </p>
    </>
  );
}