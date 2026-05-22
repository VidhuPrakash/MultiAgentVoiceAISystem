"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllUserSessions = exports.deleteSessionByToken = exports.getSessionByToken = exports.createSession = exports.hashToken = exports.getUserByIdSafe = exports.getUserById = exports.getUserByEmail = exports.createUser = exports.checkExistingUserWithEmail = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = require("crypto");
const db_1 = require("../../db");
const schema_1 = require("../../db/schema");
// Check user is existing one
const checkExistingUserWithEmail = async (email) => {
    const existing = await db_1.db.query.users.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_1.users.email, email),
    });
    if (existing)
        return true;
    return false;
};
exports.checkExistingUserWithEmail = checkExistingUserWithEmail;
// Create user
const createUser = async (user) => {
    const [data] = await db_1.db
        .insert(schema_1.users)
        .values({
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: "user",
    })
        .returning({
        id: schema_1.users.id,
        name: schema_1.users.name,
        email: schema_1.users.email,
        role: schema_1.users.role,
        plan: schema_1.users.plan,
    });
    return data;
};
exports.createUser = createUser;
// Get user by email
const getUserByEmail = async (email) => await db_1.db.query.users.findFirst({
    where: (0, drizzle_orm_1.eq)(schema_1.users.email, email),
});
exports.getUserByEmail = getUserByEmail;
// Get user by id
const getUserById = async (id) => await db_1.db.query.users.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.users.id, id) });
exports.getUserById = getUserById;
// Get user by id wihout password
const getUserByIdSafe = async (id) => await db_1.db.query.users.findFirst({
    where: (0, drizzle_orm_1.eq)(schema_1.users.id, id),
    columns: { passwordHash: false },
});
exports.getUserByIdSafe = getUserByIdSafe;
// Hash a token for safe storage
const hashToken = (token) => (0, crypto_1.createHash)("sha256").update(token).digest("hex");
exports.hashToken = hashToken;
// Save refresh token session to DB
const createSession = async (userId, token) => {
    const tokenHash = (0, exports.hashToken)(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await db_1.db.insert(schema_1.sessions).values({ userId, tokenHash, expiresAt });
    return tokenHash;
};
exports.createSession = createSession;
// Look up session by refresh token
const getSessionByToken = async (token) => {
    const tokenHash = (0, exports.hashToken)(token);
    return db_1.db.query.sessions.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_1.sessions.tokenHash, tokenHash),
    });
};
exports.getSessionByToken = getSessionByToken;
// Delete a single session (logout)
const deleteSessionByToken = async (token) => {
    const tokenHash = (0, exports.hashToken)(token);
    await db_1.db.delete(schema_1.sessions).where((0, drizzle_orm_1.eq)(schema_1.sessions.tokenHash, tokenHash));
};
exports.deleteSessionByToken = deleteSessionByToken;
// Delete all sessions for a user (logout all devices)
const deleteAllUserSessions = async (userId) => {
    await db_1.db.delete(schema_1.sessions).where((0, drizzle_orm_1.eq)(schema_1.sessions.userId, userId));
};
exports.deleteAllUserSessions = deleteAllUserSessions;
