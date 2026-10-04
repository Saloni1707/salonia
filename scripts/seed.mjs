import { MongoClient } from "mongodb";

const client = await new MongoClient(process.env.MONGODB_URL).connect();
const col = client.db("portfolio").collection("items");
await col.deleteMany({});
await col.insertMany([
  { type: "art", title: "First painting", x: -420, y: -260, w: 240, h: 300, color: "#d9c7b8" },
  { type: "article", title: "On slow mornings", body: "Placeholder text.", x: 60, y: -340, w: 200, h: 140, color: "#b8c7d9" },
  { type: "art", title: "Sketchbook, page 12", x: 340, y: -80, w: 260, h: 200, color: "#c9d9b8" },
  { type: "article", title: "A letter about winter", body: "Placeholder text.", x: -200, y: 120, w: 180, h: 220, color: "#d9b8c7" },
]);
await client.close();
console.log("seeded");