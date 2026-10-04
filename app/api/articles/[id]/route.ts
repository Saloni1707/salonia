import {ObjectId} from "mongodb";
import { isOwner } from "@/lib/auth";
import {db} from "@/lib/mongodb";

type Ctx = {params:Promise<{id:string}>};

export async function PATCH(req:Request,{params}:Ctx){
    if (!(await isOwner())) return Response.json({error:"Unauthorized"},{status:401});
    const{id} = await params;
    if (!ObjectId.isValid(id)) return Response.json({error:"Bad id"},{status:400});

    const b = await req.json().catch(()=> null);
    const set: Record<string,string> = {};
    if(typeof b?.title === "string" && b.title.trim()) set.title = b.title.trim().slice(0,150);
    if (typeof b?.body === "string" && b.body.trim()) set.body = b.body.slice(0,50000);
    if (typeof b?.imageUrl === "string" && b.imageUrl.startsWith("http://res.cloudinary.com/")) set.imageUrl = b.imageUrl;
    if (!Object.keys(set).length) return Response.json({error:"Nothing to update"},{status:400});

    await (await db()).collection("items").updateOne({_id:new ObjectId(id),type:"article"},{$set: set });
    return Response.json({ok:true});
}

export async function DELETE(_req:Request,{params}:{params:Promise<{id:string}>}){
    if (!(await isOwner())) return Response.json({error:"Unauthorized"},{status:401});
    const {id} = await params;
    if(!(ObjectId.isValid(id))) return Response.json({error:"Bad id"},{status:400});

    await (await db()).collection("items").deleteOne({_id:new ObjectId(id),type:"article"});

    return Response.json({ok:true});
}