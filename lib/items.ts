import { db } from "./mongodb";
import type { Item, Article } from "./types";

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export async function getItems(): Promise<Item[]> {
  const docs = await (await db()).collection("items").find({type:"art"}).sort({ _id: 1 }).toArray();
  // MongoDB's _id is an ObjectId object; the browser can't receive that, so turn it into a string.
  return docs.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest })) as Item[];
}

export async function getArticles(): Promise<Article[]> {
  const docs = await ((await (db())).collection("items").find({ type: "article" }).sort({ _id: 1 }).toArray());
  return docs.map((d) => ({
    id: d._id.toString(),
    slug: d.slug ?? slugify(d.title),
    title: d.title,
    body: d.body ?? "",
    imageUrl: d.imageUrl,
    createdAt: (d.createAt ?? d._id.getTimestamp()).toISOString(),
  }));
}

export async function getArticle(slug: string) {
  return (await getArticles()).find((a) => a.slug === slug) ?? null;
}