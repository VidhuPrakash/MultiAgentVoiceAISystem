"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fail = exports.ok = void 0;
const ok = (res, data, message = "Success") => res.json({ success: true, message, data });
exports.ok = ok;
const fail = (res, status, message) => res.status(status).json({ success: false, message });
exports.fail = fail;
