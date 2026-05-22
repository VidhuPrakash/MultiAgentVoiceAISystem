"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required").max(100).trim(),
    email: zod_1.z.string().email("Invalid email address").toLowerCase().trim(),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address").toLowerCase().trim(),
    password: zod_1.z.string().min(1, "Password is required"),
});
