"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefresh = exports.verifyAccess = exports.signRefresh = exports.signAccess = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const signAccess = (payload) => jsonwebtoken_1.default.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
exports.signAccess = signAccess;
const signRefresh = (payload) => jsonwebtoken_1.default.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
exports.signRefresh = signRefresh;
const verifyAccess = (token) => jsonwebtoken_1.default.verify(token, ACCESS_SECRET);
exports.verifyAccess = verifyAccess;
const verifyRefresh = (token) => jsonwebtoken_1.default.verify(token, REFRESH_SECRET);
exports.verifyRefresh = verifyRefresh;
