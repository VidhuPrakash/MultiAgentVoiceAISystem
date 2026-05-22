"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdmin = seedAdmin;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const index_1 = require("./index");
const schema_1 = require("./schema");
async function seedAdmin() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME ?? "Admin";
    if (!email || !password) {
        console.warn("[seed] ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin seed");
        return;
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 12);
    await index_1.db
        .insert(schema_1.users)
        .values({
        name,
        email,
        passwordHash,
        role: "admin",
    })
        .onConflictDoUpdate({
        target: schema_1.users.email,
        set: {
            name,
            passwordHash,
            role: "admin",
        },
    });
    console.log(`[seed] Admin user upserted: ${email}`);
}
