import Fastify from "fastify";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();
const fastify = Fastify({ logger: true });

// Global Toggle
const USE_MOCK = process.env.USE_MOCK === "true";

// API URLs (Set in .env)
const API_URLS = {
  featuredReviews: process.env.FEATURED_REVIEWS_API_URL || "",
  imageReviews: process.env.IMAGE_REVIEWS_API_URL || "",
  reviewList: process.env.REVIEW_LIST_API_URL || "",
  devices: process.env.DEVICES_API_URL || "",
};

// Load mock data dynamically
const loadMockData = (filename: string) => {
  const filePath = path.join(__dirname, "mockData", filename);
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
};

// Helper function for pagination
const paginate = (data: any[], page: number, limit: number) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return {
    totalItems: data.length,
    totalPages: Math.ceil(data.length / limit),
    currentPage: page,
    data: data.slice(startIndex, endIndex),
  };
};

// API 1: Get Device Reviews
fastify.get("/getDeviceReviews", async (_, reply) => {
  try {
    if (USE_MOCK) {
      return reply.send(loadMockData("devices.json"));
    }
    const response = await axios.get(API_URLS.devices);
    return reply.send(response.data);
  } catch (error) {
    return reply.status(500).send({ error: "Failed to fetch device reviews" });
  }
});

// API 2: Get Featured Reviews by SKU Code (With Pagination)
fastify.get("/getFeaturedReviews", async (request, reply) => {
  try {
    const {
      skuCode,
      page = "1",
      limit = "10",
    } = request.query as { skuCode?: string; page?: string; limit?: string };
    if (!skuCode) return reply.status(400).send({ error: "Missing skuCode" });

    if (USE_MOCK) {
      const data = loadMockData("featuredReviews.json").featuredReviews.filter(
        (item: any) => item.skuCode === skuCode
      );
      return reply.send(paginate(data, parseInt(page), parseInt(limit)));
    }

    const response = await axios.get(
      `${API_URLS.featuredReviews}?skuCode=${skuCode}&page=${page}&limit=${limit}`
    );
    return reply.send(response.data);
  } catch (error) {
    return reply
      .status(500)
      .send({ error: "Failed to fetch featured reviews" });
  }
});

// API 3: Get Device Reviews with Images by SKU Code (With Pagination)
fastify.get("/getDeviceReviewsWithImages", async (request, reply) => {
  try {
    const {
      skuCode,
      page = "1",
      limit = "10",
    } = request.query as { skuCode?: string; page?: string; limit?: string };
    if (!skuCode) return reply.status(400).send({ error: "Missing skuCode" });

    if (USE_MOCK) {
      const data = loadMockData("imageReviews.json").filter(
        (item: any) => item.skuCode === skuCode
      );
      return reply.send(paginate(data, parseInt(page), parseInt(limit)));
    }

    const response = await axios.get(
      `${API_URLS.imageReviews}?skuCode=${skuCode}&page=${page}&limit=${limit}`
    );
    return reply.send(response.data);
  } catch (error) {
    return reply.status(500).send({ error: "Failed to fetch image reviews" });
  }
});

// API 4: Get Review List by SKU Code (With Pagination)
fastify.get("/getReviewList", async (request, reply) => {
  try {
    const {
      skuCode,
      page = "1",
      limit = "10",
    } = request.query as { skuCode?: string; page?: string; limit?: string };
    if (!skuCode) return reply.status(400).send({ error: "Missing skuCode" });

    if (USE_MOCK) {
      const data = loadMockData("reviewList.json").filter(
        (item: any) => item.skuCode === skuCode
      );
      return reply.send(paginate(data, parseInt(page), parseInt(limit)));
    }

    const response = await axios.get(
      `${API_URLS.reviewList}?skuCode=${skuCode}&page=${page}&limit=${limit}`
    );
    return reply.send(response.data);
  } catch (error) {
    return reply.status(500).send({ error: "Failed to fetch review list" });
  }
});

// Start Server
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
fastify.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
  console.log(`Backend running on ${address}`);
});
