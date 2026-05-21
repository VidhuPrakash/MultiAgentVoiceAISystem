import "dotenv/config";

import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import webhookRouter from "./webhook/webhook";
import authRouter from "./module/auth/route";
import { errorHandler } from "./middleware/error";
import { seedAdmin } from "./db/seed";
import adminRouter from "./module/admin/route";

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
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests" },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts, try later" },
});

app.use(globalLimiter);
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Routes
app.use("/webhook", webhookRouter);
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/admin", adminRouter);

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
  await seedAdmin();
  console.log(`Server running on port ${PORT}`);
});
