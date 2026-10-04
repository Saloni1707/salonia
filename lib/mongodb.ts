import { MongoClient } from "mongodb";

const globalForMongo = globalThis as unknown as { _mongo?: Promise<MongoClient> };

// Reuse one connection instead of opening a new one on every request / hot reload.
export const clientPromise = (globalForMongo._mongo ??= new MongoClient(process.env.MONGODB_URL!).connect());

export async function db() {
  return (await clientPromise).db("portfolio");
}