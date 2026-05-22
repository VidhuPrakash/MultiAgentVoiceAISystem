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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = getUsers;
exports.getUser = getUser;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.blockUser = blockUser;
exports.unblockUser = unblockUser;
exports.getAgents = getAgents;
exports.updateAgent = updateAgent;
exports.getCalls = getCalls;
exports.getCall = getCall;
exports.getDashboardSummary = getDashboardSummary;
exports.getUsersOverTime = getUsersOverTime;
exports.getPlanDistribution = getPlanDistribution;
exports.getTopMinutesUsers = getTopMinutesUsers;
exports.getCallsOverTime = getCallsOverTime;
exports.getCallStatusDistribution = getCallStatusDistribution;
exports.getAvgCallDuration = getAvgCallDuration;
const validation_1 = require("./validation");
const svc = __importStar(require("./service"));
const response_1 = require("../../helper/response");
async function getUsers(req, res, next) {
    try {
        const { page, limit } = validation_1.paginationSchema.parse(req.query);
        const result = await svc.getAllUsers(page, limit);
        (0, response_1.ok)(res, result);
    }
    catch (e) {
        next(e);
    }
}
async function getUser(req, res, next) {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const user = await svc.getUserById(id);
        if (!user)
            return (0, response_1.fail)(res, 404, "User not found");
        (0, response_1.ok)(res, user);
    }
    catch (e) {
        next(e);
    }
}
async function createUser(req, res, next) {
    try {
        const parsed = validation_1.createUserSchema.safeParse(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map((e) => ({
                field: e.path[0],
                message: e.message,
            }));
            return res.status(400).json({ success: false, errors });
        }
        const result = await svc.adminCreateUser(parsed.data);
        if (result.error)
            return (0, response_1.fail)(res, 409, result.error);
        (0, response_1.ok)(res, result.user, "User created");
    }
    catch (e) {
        next(e);
    }
}
async function updateUser(req, res, next) {
    try {
        const parsed = validation_1.updateUserSchema.safeParse(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map((e) => ({
                field: e.path[0],
                message: e.message,
            }));
            return res.status(400).json({ success: false, errors });
        }
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const updated = await svc.adminUpdateUser(id, parsed.data);
        if (!updated)
            return (0, response_1.fail)(res, 404, "User not found");
        (0, response_1.ok)(res, updated, "User updated");
    }
    catch (e) {
        next(e);
    }
}
async function deleteUser(req, res, next) {
    try {
        // prevent admin deleting themselves
        if (req.params.id === req.user.userId)
            return (0, response_1.fail)(res, 400, "Cannot delete your own account");
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const deleted = await svc.adminDeleteUser(id);
        if (!deleted)
            return (0, response_1.fail)(res, 404, "User not found");
        (0, response_1.ok)(res, null, "User deleted");
    }
    catch (e) {
        next(e);
    }
}
async function blockUser(req, res, next) {
    try {
        if (req.params.id === req.user.userId)
            return (0, response_1.fail)(res, 400, "Cannot block your own account");
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const updated = await svc.blockUnblockUser(id, true);
        if (!updated)
            return (0, response_1.fail)(res, 404, "User not found");
        (0, response_1.ok)(res, updated, "User blocked");
    }
    catch (e) {
        next(e);
    }
}
async function unblockUser(req, res, next) {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const updated = await svc.blockUnblockUser(id, false);
        if (!updated)
            return (0, response_1.fail)(res, 404, "User not found");
        (0, response_1.ok)(res, updated, "User unblocked");
    }
    catch (e) {
        next(e);
    }
}
async function getAgents(req, res, next) {
    try {
        const { page, limit } = validation_1.paginationSchema.parse(req.query);
        const result = await svc.getAllAgents(page, limit);
        (0, response_1.ok)(res, result);
    }
    catch (e) {
        next(e);
    }
}
async function updateAgent(req, res, next) {
    try {
        const parsed = validation_1.updateAgentSchema.safeParse(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map((e) => ({
                field: e.path[0],
                message: e.message,
            }));
            return res.status(400).json({ success: false, errors });
        }
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const updated = await svc.adminUpdateAgent(id, parsed.data);
        if (!updated)
            return (0, response_1.fail)(res, 404, "Agent not found");
        (0, response_1.ok)(res, updated, "Agent updated");
    }
    catch (e) {
        next(e);
    }
}
async function getCalls(req, res, next) {
    try {
        const { page, limit } = validation_1.paginationSchema.parse(req.query);
        const result = await svc.getAllCalls(page, limit);
        (0, response_1.ok)(res, result);
    }
    catch (e) {
        next(e);
    }
}
async function getCall(req, res, next) {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const call = await svc.getCallById(id);
        if (!call)
            return (0, response_1.fail)(res, 404, "Call not found");
        (0, response_1.ok)(res, call);
    }
    catch (e) {
        next(e);
    }
}
async function getDashboardSummary(req, res, next) {
    try {
        const data = await svc.getDashboardSummary();
        (0, response_1.ok)(res, data);
    }
    catch (e) {
        next(e);
    }
}
async function getUsersOverTime(req, res, next) {
    try {
        const { range } = validation_1.analyticsRangeSchema.parse(req.query);
        (0, response_1.ok)(res, await svc.getUsersOverTime(range));
    }
    catch (e) {
        next(e);
    }
}
async function getPlanDistribution(req, res, next) {
    try {
        (0, response_1.ok)(res, await svc.getPlanDistribution());
    }
    catch (e) {
        next(e);
    }
}
async function getTopMinutesUsers(req, res, next) {
    try {
        (0, response_1.ok)(res, await svc.getTopMinutesUsers());
    }
    catch (e) {
        next(e);
    }
}
async function getCallsOverTime(req, res, next) {
    try {
        const { range } = validation_1.analyticsRangeSchema.parse(req.query);
        (0, response_1.ok)(res, await svc.getCallsOverTime(range));
    }
    catch (e) {
        next(e);
    }
}
async function getCallStatusDistribution(req, res, next) {
    try {
        (0, response_1.ok)(res, await svc.getCallStatusDistribution());
    }
    catch (e) {
        next(e);
    }
}
async function getAvgCallDuration(req, res, next) {
    try {
        (0, response_1.ok)(res, await svc.getAvgCallDuration());
    }
    catch (e) {
        next(e);
    }
}
