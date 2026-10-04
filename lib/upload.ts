export async function uploadImage(file: File) {
    const sign = await (await fetch("/api/upload-sign", { method: "POST" })).json();

    if (sign.error) throw new Error(sign.error);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("api_key", sign.apiKey);
    fd.append("timestamp", sign.timestamp);
    fd.append("signature", sign.signature);
    fd.append("folder", sign.folder);

    const up = await (
        await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, { method: "POST", body: fd })
    ).json();
    if (!up.secure_url) throw new Error(up.error?.message ?? "Upload failed");
    return { url: up.secure_url as string, width: up.width as number, height: up.height as number };
}