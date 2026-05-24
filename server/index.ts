import "dotenv/config";

import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import webhookRouter from "./webhook/webhook";
import authRouter from "./module/auth/route";
import { errorHandler } from "./middleware/error";
import { seedAdmin } from "./scripts/admin";
import adminRouter from "./module/admin/route";
import userAgentRouter from "./module/user/route";
import callRouter from "./module/call/route";
import leadsRouter from "./module/leads/route";
import billingRouter from "./module/billing/route";
import userAnalyticsRouter from "./module/analytics/route";
const app = express();

// Trust the first proxy (Next.js dev proxy / reverse proxy in prod)
app.set("trust proxy", 1);

// Security
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: process.env.NODE_ENV === "production" ? 300 : 5000,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests",
  },

  skipSuccessfulRequests: true,
  skip: (req) => {
    return (
      process.env.NODE_ENV !== "production" &&
      (req.ip === "::1" || req.ip === "127.0.0.1")
    );
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: process.env.NODE_ENV === "production" ? 20 : 1000,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many auth attempts, try later",
  },
});

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Routes
app.use("/webhook", webhookRouter);
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/user/analytics", apiLimiter, userAnalyticsRouter);
app.use("/api/user/billing", apiLimiter, billingRouter);
app.use("/api/user/leads", apiLimiter, leadsRouter);
app.use("/api/user/calls", apiLimiter, callRouter);
app.use("/api/user/agents", apiLimiter, userAgentRouter);
app.use("/api/admin", apiLimiter, adminRouter);

app.get("/", (_, res) => {
  res.json({
    message: "Server running",
  });
});

app.use((_, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

//Global error handler
app.use(errorHandler);

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});
