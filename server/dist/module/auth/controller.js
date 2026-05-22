"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.meController = exports.logoutController = exports.refreshTokenController = exports.LoginUserController = exports.RegisterUserController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const token_1 = require("../../lib/token");
const cookies_1 = require("../../lib/cookies");
const svc = __importStar(require("./service"));
const validation_1 = require("./validation");
const response_1 = require("../../helper/response");
/*
Register user controller
@route POST /api/auth/register
*/
const RegisterUserController = async (req, res) => {
    try {
        const parsed = validation_1.registerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                errors: parsed.error.issues.map((e) => ({
                    field: e.path[0],
                    message: e.message,
                })),
                success: false,
            });
        }
        const { name, email, password } = parsed.data;
        const existing = await svc.checkExistingUserWithEmail(email);
        if (existing)
            return (0, response_1.fail)(res, 409, "Email already registered");
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const user = await svc.createUser({
            name,
            email,
            passwordHash,
        });
        const payload = {
            userId: user.id,
            role: user.role ?? "user",
            plan: user?.plan ?? "free",
        };
        const accessToken = (0, token_1.signAccess)(payload);
        const refreshToken = (0, token_1.signRefresh)(payload);
        await svc.createSession(user.id, refreshToken);
        (0, cookies_1.setRefreshCookie)(res, refreshToken);
        (0, response_1.ok)(res, { accessToken, user }, "User registered successfully");
    }
    catch (error) {
        (0, response_1.fail)(res, 500, "Something went wrong");
    }
};
exports.RegisterUserController = RegisterUserController;
/*
Login user controller
@route POST /api/auth/login
*/
const LoginUserController = async (req, res) => {
    try {
        const parsed = validation_1.loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                errors: parsed.error.issues.map((e) => ({
                    field: e.path[0],
                    message: e.message,
                })),
                success: false,
            });
        }
        const { email, password } = parsed.data;
        const user = await svc.getUserByEmail(email);
        if (!user)
            return (0, response_1.fail)(res, 401, "Invalid credentials");
        if (user.isBlocked)
            return (0, response_1.fail)(res, 403, "Account blocked. Contact support.");
        const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!valid)
            return (0, response_1.fail)(res, 401, "Invalid credentials");
        const payload = {
            userId: user.id,
            role: user.role ?? "user",
            plan: user?.plan ?? "free",
        };
        const accessToken = (0, token_1.signAccess)(payload);
        const refreshToken = (0, token_1.signRefresh)(payload);
        await svc.createSession(user.id, refreshToken);
        (0, cookies_1.setRefreshCookie)(res, refreshToken);
        (0, response_1.ok)(res, {
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        }, "Login successful");
    }
    catch (error) {
        (0, response_1.fail)(res, 500, "Something went wrong");
    }
};
exports.LoginUserController = LoginUserController;
/*
refresh user controller
@route POST /api/auth/refresh
*/
const refreshTokenController = async (req, res) => {
    const token = req.cookies[cookies_1.REFRESH_COOKIE];
    if (!token)
        return (0, response_1.fail)(res, 401, "No refresh token");
    try {
        const session = await svc.getSessionByToken(token);
        if (!session || session.expiresAt < new Date()) {
            (0, cookies_1.clearRefreshCookie)(res);
            return (0, response_1.fail)(res, 401, "Session expired. Please login again.");
        }
        const payload = (0, token_1.verifyRefresh)(token);
        await svc.deleteSessionByToken(token);
        const newRefreshToken = (0, token_1.signRefresh)({
            userId: payload.userId,
            role: payload.role,
            plan: payload.plan,
        });
        await svc.createSession(payload.userId, newRefreshToken);
        (0, cookies_1.setRefreshCookie)(res, newRefreshToken);
        const newAccess = (0, token_1.signAccess)({
            userId: payload.userId,
            role: payload.role,
            plan: payload.plan,
        });
        (0, response_1.ok)(res, { accessToken: newAccess });
    }
    catch {
        (0, cookies_1.clearRefreshCookie)(res);
        return (0, response_1.fail)(res, 401, "Session expired. Please login again.");
    }
};
exports.refreshTokenController = refreshTokenController;
/*
Logout controller
@route POST /api/auth/logout
*/
const logoutController = async (req, res) => {
    try {
        const token = req.cookies[cookies_1.REFRESH_COOKIE];
        if (token) {
            await svc.deleteSessionByToken(token).catch(() => { });
        }
        (0, cookies_1.clearRefreshCookie)(res);
        (0, response_1.ok)(res, null, "Logged out successfully");
    }
    catch (error) {
        (0, response_1.fail)(res, 500, "Something went wrong");
    }
};
exports.logoutController = logoutController;
/*
Me controller
@route POST /api/auth/me
*/
const meController = async (req, res) => {
    try {
        const user = await svc.getUserByIdSafe(req.user.userId);
        if (!user)
            return (0, response_1.fail)(res, 404, "User not found");
        (0, response_1.ok)(res, user, "User fetched successfully");
    }
    catch (error) {
        (0, response_1.fail)(res, 500, "Something went wrong");
    }
};
exports.meController = meController;
