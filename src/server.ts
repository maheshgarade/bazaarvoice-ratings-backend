import Fastify from "fastify";
import cors from "@fastify/cors";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();
const fastify = Fastify({ logger: true });

// Enable CORS
fastify.register(cors, {
  origin: "http://localhost:3000", // Allow requests only from your frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
});

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
fastify.get("/getProducts", async (_, reply) => {
  try {
    if (USE_MOCK) {
      return reply.send(loadMockData("devices.json"));
    }
    const response = await axios.get(API_URLS.devices);
    return reply.send(response.data);
  } catch (error) {
    fastify.log.error("Error fetching device reviews:", error.message);
    return reply.status(500).send({ error: "Failed to fetch device reviews" });
  }
});

// API 2: Get Product by SKU Code
fastify.get("/getProductBySku", async (request, reply) => {
  try {
    const { skuCode } = request.query as { skuCode?: string };

    // Validate the SKU code
    if (!skuCode) {
      return reply.status(400).send({ error: "Missing skuCode" });
    }

    // Fetch product data from mock or external API
    if (USE_MOCK) {
      const devices = loadMockData("devices.json").devices;
      const product = devices.find((device: any) => device.skuCode === skuCode);

      if (!product) {
        return reply.status(404).send({ error: "Product not found" });
      }

      return reply.send(product);
    }

    // If not using mock data, fetch from an API
    const response = await axios.get(`${API_URLS.devices}?skuCode=${skuCode}`);
    return reply.send(response.data);
  } catch (error) {
    fastify.log.error("Error fetching product by SKU code:", error.message);
    return reply.status(500).send({ error: "Failed to fetch product" });
  }
});

// API 3: Get Featured Reviews by SKU Code
fastify.get("/getFeaturedReviews", async (request, reply) => {
  try {
    const {
      skuCode,
      page = "1",
      limit = "10",
    } = request.query as {
      skuCode?: string;
      page?: string;
      limit?: string;
    };
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
    fastify.log.error("Error fetching featured reviews:", error.message);
    return reply
      .status(500)
      .send({ error: "Failed to fetch featured reviews" });
  }
});

// API 4: Get Reviews with Images by SKU Code
fastify.get("/getReviewsWithImages", async (request, reply) => {
  try {
    const {
      skuCode,
      page = "1",
      limit = "10",
    } = request.query as {
      skuCode?: string;
      page?: string;
      limit?: string;
    };
    if (!skuCode) return reply.status(400).send({ error: "Missing skuCode" });

    if (USE_MOCK) {
      const data = loadMockData("imageReviews.json").imageReviews.filter(
        (item: any) => item.skuCode === skuCode
      );
      return reply.send(paginate(data, parseInt(page), parseInt(limit)));
    }

    const response = await axios.get(
      `${API_URLS.imageReviews}?skuCode=${skuCode}&page=${page}&limit=${limit}`
    );
    return reply.send(response.data);
  } catch (error) {
    fastify.log.error("Error fetching image reviews:", error.message);
    return reply.status(500).send({ error: "Failed to fetch image reviews" });
  }
});

// API 5: Get Review List by SKU Code
fastify.get("/getReviewList", async (request, reply) => {
  try {
    const {
      skuCode,
      page = "1",
      limit = "10",
    } = request.query as {
      skuCode?: string;
      page?: string;
      limit?: string;
    };
    if (!skuCode) return reply.status(400).send({ error: "Missing skuCode" });

    if (USE_MOCK) {
      const data = loadMockData("reviewList.json").reviews.filter(
        (item: any) => item.skuCode === skuCode
      );
      return reply.send(paginate(data, parseInt(page), parseInt(limit)));
    }

    const response = await axios.get(
      `${API_URLS.reviewList}?skuCode=${skuCode}&page=${page}&limit=${limit}`
    );
    return reply.send(response.data);
  } catch (error) {
    fastify.log.error("Error fetching review list:", error.message);
    return reply.status(500).send({ error: "Failed to fetch review list" });
  }
});

// Start Server
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3003;
fastify.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    fastify.log.error("Error starting server:", err.message);
    process.exit(1);
  }
  console.log(`Backend running on ${address}`);
});
