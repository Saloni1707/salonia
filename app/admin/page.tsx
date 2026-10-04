import { redirect } from "next/navigation";

import { getItems } from "@/lib/items";
import { isOwner } from "@/lib/auth";
import Canvas from "../components/canvas";

export const dynamic = "force-dynamic";
export const metadata = { title: "Studio", robots: { index: false, follow: false } };

export default async function Admin() {
  if (!(await isOwner())) redirect("/admin/login"); // runs on the server, before anything is sent
  return <Canvas items={await getItems()} owner />;
}