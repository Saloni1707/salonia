import Link from "next/link";
import { getArticles } from "@/lib/items";

export const dynamic = "force-dynamic";

export default async function Home() {
  const articles = await getArticles();
  return (
    <main className="mx-auto max-w-2xl px-6 pb-32 pt-32">
      <header className="mb-20">
        <h1 className="font-serif text-5xl italic leading-tight">my internet vault</h1>
        <p className="mt-3 text-sm tracking-wide text-muted">
          I&apos;m a techie creating my own space, being a naive writer and artist
        </p>
      </header>
      {articles.length === 0 && <p className="text-sm text-muted">Nothing here yet.</p>}
      <ol className="flex flex-col gap-16">
        {articles.map((a, i) => (
          <li key={a.id}>
            <Link href={`/articles/${a.slug}`} className="group flex items-start gap-6">
              <span className="w-8 pt-1 font-serif text-lg italic text-muted">({i + 1})</span>
              {a.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.imageUrl} alt="" className="h-32 w-28 object-cover" />
              )}
              <div className="pt-1">
                <h2 className="font-serif text-3xl leading-tight group-hover:italic">{a.title}</h2>
                <time className="mt-2 block text-xs tracking-wide text-muted">
                  {new Date(a.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </time>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}