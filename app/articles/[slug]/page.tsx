import { notFound } from "next/navigation";
import { getArticle } from "@/lib/items";
import RichText from "../../components/RichText";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) notFound();
  return (
    <article className="mx-auto max-w-2xl px-6 pb-32 pt-32">
    <Link href="/" className="mb-10 block w-fit text-sm tracking-wide text-muted hover:text-foreground">
      ← back
    </Link>
    <time className="block text-xs tracking-wide text-muted">
      {new Date(a.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
    </time>
      <h1 className="mb-10 mt-3 font-serif text-6xl italic leading-[1.05]">{a.title}</h1>
      {a.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={a.imageUrl} alt="" className="mb-12 w-full" />
      )}
      <div className="whitespace-pre-wrap font-serif text-2xl leading-10">
        <RichText text={a.body} />
      </div>
    </article>
  );
}