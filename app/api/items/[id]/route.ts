import {ObjectId} from "mongodb"
import {isOwner} from "@/lib/auth"
import {db} from "@/lib/mongodb"

type Ctx = {params:Promise<{id:string}>};

export async function PATCH(req:Request,{params}:Ctx){
    if (!(await isOwner())) return Response.json({error:"Unauthorized"},{status:401});
    const {id} = await params;
    if (!ObjectId.isValid(id)) return Response.json({error:"Bad id"},{status:400});

    const b =  await req.json().catch(() => null);
    if (!b) return Response.json({error:"Bad request"},{status:400});

    const set:Record<string,number | string> = {};

    for (const k of ["x","y","w"] as const){
        if (typeof b[k] == "number" && Number.isFinite(b[k])) set[k]=b[k];
    }

    if (typeof b.title === "string") set.title = b.title.slic(0,120);
    if (!Object.keys(set).length) return Response.json({error:"Nothing to update"},{status:400});

    await (await db()).collection("items").updateOne({_id:new ObjectId(id)},{$set:set});
    return Response.json({ok:true});
}

export async function DELETE(_req:Request,{params}:Ctx){
    if (!(await isOwner())) return Response.json({error:"Unauthorized"},{status:401});
    const {id} = await params;
    if(!ObjectId.isValid(id)) return Response.json({error:"Bad id"},{status:400});

    await (await db()).collection("items").deleteOne({_id: new ObjectId(id)});
    return Response.json({ok:true});
}