import { eq } from "drizzle-orm";
import { createHash } from "crypto";
import { db } from "../../db";
import { users, sessions } from "../../db/schema";
import { User } from "../../types/user";

// Check user is existing one
export const checkExistingUserWithEmail = async (email: string) => {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existing) return true;
  return false;
};
// Create user
export const createUser = async (user: User) => {
  const [data] = await db
    .insert(users)
    .values({
      name: user.name!,
      email: user.email!,
      passwordHash: user.passwordHash!,
      role: "user",
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    });

  return data;
};
// Get user by email
export const getUserByEmail = async (email: string) =>
  await db.query.users.findFirst({
    where: eq(users.email, email),
  });
// Get user by id
export const getUserById = async (id: string) =>
  await db.query.users.findFirst({ where: eq(users.id, id) });
// Get user by id wihout password
export const getUserByIdSafe = async (id: string) =>
  await db.query.users.findFirst({
    where: eq(users.id, id),
    columns: { passwordHash: false },
  });

// Hash a token for safe storage
export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

// Save refresh token session to DB
export const createSession = async (userId: string, token: string) => {
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await db.insert(sessions).values({ userId, tokenHash, expiresAt });
  return tokenHash;
};

// Look up session by refresh token
export const getSessionByToken = async (token: string) => {
  const tokenHash = hashToken(token);
  return db.query.sessions.findFirst({
    where: eq(sessions.tokenHash, tokenHash),
  });
};

// Delete a single session (logout)
export const deleteSessionByToken = async (token: string) => {
  const tokenHash = hashToken(token);
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
};

// Delete all sessions for a user (logout all devices)
export const deleteAllUserSessions = async (userId: string) => {
  await db.delete(sessions).where(eq(sessions.userId, userId));
};
