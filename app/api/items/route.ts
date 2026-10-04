//we use this to save a new piece of art

import { isOwner } from "@/lib/auth";
import { db } from "@/lib/mongodb";
import { error } from "console";

export async function POST(req: Request) {
    if (!(await isOwner())) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const b = await req.json().catch(() => null);

    if (!b || b.type !== "art" || typeof b.imageUrl !== "string" || !b.imageUrl.startsWith("https://res.cloudinary.com/")) {
        return Response.json({ error: "Bad Request" }, { status: 400 });
    }

    const doc = {
        type: "art",
        title: String(b.title ?? "").slice(0, 120),
        imageUrl: b.imageUrl,
        x: Number(b.x) || 0, y: Number(b.y) || 0,
        w: Number(b.w) || 300, h: Number(b.h) || 300,
        createdAt: new Date(),
    };
    const r = await ((await db()).collection("items").insertOne(doc));
    return Response.json({ id: r.insertedId.toString() })
}