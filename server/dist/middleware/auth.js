"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
const zod_1 = require("zod");
const token_1 = require("../lib/token");
const bearerTokenSchema = zod_1.z
    .string()
    .regex(/^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/, "Malformed token");
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
        return res.status(401).json({ error: "No token" });
    const raw = authHeader.slice(7);
    const parsed = bearerTokenSchema.safeParse(raw);
    if (!parsed.success)
        return res.status(401).json({ error: "Malformed token" });
    try {
        req.user = (0, token_1.verifyAccess)(parsed.data);
        next();
    }
    catch {
        return res.status(401).json({ error: "Token expired or invalid" });
    }
}
function requireAdmin(req, res, next) {
    requireAuth(req, res, () => {
        if (req.user?.role !== "admin")
            return res.status(403).json({ error: "Admin only" });
        next();
    });
}
