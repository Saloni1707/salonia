import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers"
import { createHash, timingSafeEqual } from "crypto";

const COOKIE = "owner";
const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET!);

//Hash both sides so they have equal length,then compare in constant time

export function passwordMatches(input: string) {
    const a = createHash("sha256").update(input).digest();
    const b = createHash("sha256").update(process.env.OWNER_PASSWORD!).digest();
    return timingSafeEqual(a, b);
}

export async function startSession() {
    const token = await new SignJWT({ role: "owner" })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("30d")
        .sign(secret());
    (await cookies()).set(COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
    });
}

export async function endSession() {
    (await cookies()).delete(COOKIE);
}

export async function isOwner() {
    const token = (await cookies()).get(COOKIE)?.value;
    if (!token) return false;
    try {
        await jwtVerify(token, secret());
        return true;
    } catch {
        return false;
    }
}