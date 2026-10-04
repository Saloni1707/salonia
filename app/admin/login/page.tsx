"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
    const router = useRouter();
    const [pw, setPw] = useState("");
    const [err, setErr] = useState("");

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        const r = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: pw }),
        });
        if (r.ok) { router.push("/admin"); router.refresh(); }
        else setErr(r.status === 401 ? "Wrong password" : r.status === 429 ? "Too many attempts. Try again later." : "Server error");
    }

    return (
        <main className="flex min-h-screen items-center justify-center">
            <form onSubmit={submit} className="flex flex-col gap-3 text-sm">
                <input
                    type="password" autoFocus value={pw} onChange={(e) => setPw(e.target.value)}
                    placeholder="Password" className="rounded border bg-transparent px-3 py-2"
                />
                <button className="rounded border px-3 py-3">Enter</button>
                {err && <p>{err}</p>}
            </form>
        </main>
    );
}