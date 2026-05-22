"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFRESH_COOKIE = void 0;
exports.setRefreshCookie = setRefreshCookie;
exports.clearRefreshCookie = clearRefreshCookie;
exports.REFRESH_COOKIE = process.env.REFRESH_COOKIE;
function setRefreshCookie(res, token) {
    res.cookie(exports.REFRESH_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
    });
}
function clearRefreshCookie(res) {
    res.clearCookie(exports.REFRESH_COOKIE, { httpOnly: true, path: "/" });
}
