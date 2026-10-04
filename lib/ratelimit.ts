import {db} from "./mongodb";

const MAX = 5;
const WINDOW = 15*60*1000;

const fails = async() => (await db()).collection("loginFails");

export async function tooMany(ip:string){
    const since = new Date(Date.now() - WINDOW);
    return (await (await fails()).countDocuments({ip,at:{$gt:since}})) >= MAX;
}

export async function recordFail(ip:string){
    const col = await fails();
    await col.insertOne({ip,at:new Date()});
    await col.createIndex({at:1},{expireAfterSeconds:3600})
}

export async function clearFails(ip:string){
    await (await fails()).deleteMany({ip})
}