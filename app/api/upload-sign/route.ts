import { createHash } from "crypto";
import { isOwner } from "@/lib/auth";

export async function POST() {
    if (!(await isOwner())) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = "portfolio";

    const signature = createHash("sha1")
        .update(`folder=${folder}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`)
        .digest("hex");

    return Response.json({
        signature, timestamp, folder,
        apiKey: process.env.CLOUDINARY_API_KEY,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    });
}