import Fastify from "fastify";
import axios from "axios";
import dotenv from "dotenv";
import mockData from "./mockData.json";

dotenv.config();
const fastify = Fastify({ logger: true });
const USE_MOCK = process.env.USE_MOCK === "true";
const API_URL = process.env.BAZAARVOICE_API_URL || "";

fastify.get("/productReviews", async (_, reply) => {
  try {
    const data = USE_MOCK ? mockData : (await axios.get(API_URL)).data;
    return reply.send(data);
  } catch (error) {
    return reply.status(500).send({ error: "Failed to fetch data" });
  }
});

fastify.listen({ port: 3001 }, (err) => {
  if (err) throw err;
  console.log("Backend running on http://localhost:3001");
});
