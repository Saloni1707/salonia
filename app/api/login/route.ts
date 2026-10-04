import { passwordMatches, startSession } from "@/lib/auth";
import { tooMany, recordFail, clearFails } from "@/lib/ratelimit";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (await tooMany(ip)) return Response.json({ error: "Too many attempts" }, { status: 429 });

  const { password } = await req.json().catch(() => ({}));
  if (typeof password !== "string" || !passwordMatches(password)) {
    await recordFail(ip);
    return Response.json({ error: "Wrong password" }, { status: 401 });
  }
  await clearFails(ip);
  await startSession();
  return Response.json({ ok: true });
}