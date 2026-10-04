
import {redirect} from "next/navigation";
import {isOwner} from "@/lib/auth";
import { getArticles } from "@/lib/items";
import ArticleAdmin from "@/app/components/ArticleAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Articles · Studio", robots: { index: false, follow: false } };

export default async function adminArticles(){
    if (!(await isOwner())) redirect("/admin/login");
    return <ArticleAdmin articles={await getArticles()}/>;
}