import { isOwner } from "@/lib/auth";
import { slugify } from "@/lib/items";
import { db } from "@/lib/mongodb";

export async function POST(req: Request) {
  if (!(await isOwner())) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const b = await req.json().catch(() => null);
  const title = typeof b?.title === "string" ? b.title.trim().slice(0, 150) : "";
  const body = typeof b?.body === "string" ? b.body.slice(0, 50000) : "";
  // only accept cover images that are present in cloudinary
  const imageUrl =
    typeof b?.imageUrl === "string" && b.imageUrl.startsWith("https://res.cloudinary.com/") ? b.imageUrl : undefined;
  if (!title || !body.trim()) return Response.json({ error: "Title and text are required" }, { status: 400 });

  const col = (await db()).collection("items");
  const base = slugify(title) || "article";
  let slug = base, n = 2;
  while (await col.findOne({ type: "article", slug })) slug = `${base}-${n++}`; // keep URLs unique

  const r = await col.insertOne({ type: "article", title, body, slug, imageUrl, createdAt: new Date() });
  return Response.json({ id: r.insertedId.toString(), slug });
}