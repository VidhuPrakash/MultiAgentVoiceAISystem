"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const webhook_1 = __importDefault(require("./webhook/webhook"));
const route_1 = __importDefault(require("./module/auth/route"));
const error_1 = require("./middleware/error");
const seed_1 = require("./db/seed");
const route_2 = __importDefault(require("./module/admin/route"));
const route_3 = __importDefault(require("./module/user/route"));
const app = (0, express_1.default)();
// Trust the first proxy (Next.js dev proxy / reverse proxy in prod)
app.set("trust proxy", 1);
// Security
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
}));
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests" },
});
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "production" ? 20 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many auth attempts, try later" },
});
app.use(globalLimiter);
app.use(express_1.default.json({ limit: "10kb" }));
app.use((0, cookie_parser_1.default)());
// Routes
app.use("/webhook", webhook_1.default);
app.use("/api/auth", authLimiter, route_1.default);
// app.use("/api/auth", authRouter);
app.use("/api/admin", route_2.default);
app.use("/api/user/agents", route_3.default);
app.get("/", (_, res) => {
    res.json({
        message: "Server running",
    });
});
app.use((_, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});
//Global error handler
app.use(error_1.errorHandler);
process.on("unhandledRejection", (reason) => {
    console.error("Unhandled rejection:", reason);
});
process.on("uncaughtException", (err) => {
    console.error("Uncaught exception:", err);
    process.exit(1);
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    await (0, seed_1.seedAdmin)();
    console.log(`Server running on port ${PORT}`);
});
