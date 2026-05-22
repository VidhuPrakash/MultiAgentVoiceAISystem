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
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const ctrl = __importStar(require("./controller"));
const adminRouter = (0, express_1.Router)();
adminRouter.use(auth_1.requireAdmin);
adminRouter.get("/users", ctrl.getUsers);
adminRouter.post("/users", ctrl.createUser);
adminRouter.get("/users/:id", ctrl.getUser);
adminRouter.patch("/users/:id", ctrl.updateUser);
adminRouter.delete("/users/:id", ctrl.deleteUser);
adminRouter.post("/users/:id/block", ctrl.blockUser);
adminRouter.post("/users/:id/unblock", ctrl.unblockUser);
adminRouter.get("/agents", ctrl.getAgents);
adminRouter.patch("/agents/:id", ctrl.updateAgent);
adminRouter.get("/calls", ctrl.getCalls);
adminRouter.get("/calls/:id", ctrl.getCall);
adminRouter.get("/analytics/summary", ctrl.getDashboardSummary);
adminRouter.get("/analytics/users-over-time", ctrl.getUsersOverTime);
adminRouter.get("/analytics/plan-distribution", ctrl.getPlanDistribution);
adminRouter.get("/analytics/top-minutes-users", ctrl.getTopMinutesUsers);
adminRouter.get("/analytics/calls-over-time", ctrl.getCallsOverTime);
adminRouter.get("/analytics/call-status", ctrl.getCallStatusDistribution);
adminRouter.get("/analytics/avg-call-duration", ctrl.getAvgCallDuration);
exports.default = adminRouter;
