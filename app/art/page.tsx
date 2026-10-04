import Canvas from "../components/canvas";
import Gallery from "../components/Gallery";
import { getItems } from "@/lib/items";

export const dynamic = "force-dynamic";

export default async function Art() {
  const items = await getItems();
  return (
    <>
      {/* laptops and larger: the pannable canvas */}
      <div className="hidden md:block">
        <Canvas items={items} />
        <p className="pointer-events-none fixed bottom-6 left-1/2 z-30 -translate-x-1/2 text-center text-xs tracking-wide text-muted">
          <span className="pointer-coarse:hidden">double-click any art to take a closer look</span>
          <span className="hidden pointer-coarse:inline">tap any art to take a closer look</span>
        </p>
      </div>

      {/* phones: a simple stack */}
      <div className="md:hidden">
        <Gallery items={items} />
      </div>
    </>
  );
}