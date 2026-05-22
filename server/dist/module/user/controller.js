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
exports.listAgents = listAgents;
exports.getAgent = getAgent;
exports.createAgent = createAgent;
exports.updateAgent = updateAgent;
exports.deleteAgent = deleteAgent;
const validation_1 = require("./validation");
const svc = __importStar(require("./service"));
// Plan limits — how many agents per plan
const AGENT_LIMITS = {
    free: 1,
    starter: 5,
    pro: 20,
};
const ok = (res, data, message = "Success", status = 200) => res.status(status).json({ success: true, message, data });
const fail = (res, status, message) => res.status(status).json({ success: false, message });
// GET /api/user/agents
async function listAgents(req, res, next) {
    try {
        const agents = await svc.getUserAgents(req.user.userId);
        ok(res, agents);
    }
    catch (e) {
        next(e);
    }
}
// GET /api/user/agents/:id
async function getAgent(req, res, next) {
    try {
        const parsed = validation_1.agentIdSchema.safeParse(req.params);
        if (!parsed.success)
            return fail(res, 400, "Invalid agent ID");
        const agent = await svc.getAgentById(parsed.data.id, req.user.userId);
        if (!agent)
            return fail(res, 404, "Agent not found");
        ok(res, agent);
    }
    catch (e) {
        next(e);
    }
}
// POST /api/user/agents
async function createAgent(req, res, next) {
    try {
        const parsed = validation_1.createAgentSchema.safeParse(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map((e) => ({
                field: e.path[0],
                message: e.message,
            }));
            return res.status(400).json({ success: false, errors });
        }
        // Enforce plan agent limit
        const plan = req.user.plan ?? "free";
        const limit = AGENT_LIMITS[plan] ?? 1;
        const current = await svc.getUserAgentCount(req.user.userId);
        if (current >= limit) {
            return fail(res, 403, `Your ${plan} plan allows up to ${limit} agent${limit > 1 ? "s" : ""}. Upgrade to create more.`);
        }
        const agent = await svc.createAgent(req.user.userId, parsed.data);
        ok(res, agent, "Agent created", 201);
    }
    catch (e) {
        next(e);
    }
}
// PATCH /api/user/agents/:id
async function updateAgent(req, res, next) {
    try {
        const idParsed = validation_1.agentIdSchema.safeParse(req.params);
        if (!idParsed.success)
            return fail(res, 400, "Invalid agent ID");
        const parsed = validation_1.updateAgentSchema.safeParse(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map((e) => ({
                field: e.path[0],
                message: e.message,
            }));
            return res.status(400).json({ success: false, errors });
        }
        const updated = await svc.updateAgent(idParsed.data.id, req.user.userId, parsed.data);
        if (!updated)
            return fail(res, 404, "Agent not found");
        ok(res, updated, "Agent updated");
    }
    catch (e) {
        next(e);
    }
}
// DELETE /api/user/agents/:id
async function deleteAgent(req, res, next) {
    try {
        const parsed = validation_1.agentIdSchema.safeParse(req.params);
        if (!parsed.success)
            return fail(res, 400, "Invalid agent ID");
        const deleted = await svc.deleteAgent(parsed.data.id, req.user.userId);
        if (!deleted)
            return fail(res, 404, "Agent not found");
        ok(res, null, "Agent deleted");
    }
    catch (e) {
        next(e);
    }
}
