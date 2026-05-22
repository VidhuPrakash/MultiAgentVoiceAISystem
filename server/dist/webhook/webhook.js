"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_orm_1 = require("drizzle-orm");
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const router = (0, express_1.Router)();
router.post("/vapi", async (req, res) => {
    const { message } = req.body;
    if (message.type === "call-started") {
        const [user] = await db_1.db
            .select({ id: schema_1.users.id })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.vapiPhoneNumberId, message.call.phoneNumberId))
            .limit(1);
        if (!user) {
            res.status(404).json({ error: "User not found for this phone number" });
            return;
        }
        await db_1.db.insert(schema_1.calls).values({
            userId: user.id,
            vapiCallId: message.call.id,
            callerNumber: message.call.customer?.number,
            status: "in-progress",
            startedAt: new Date(),
        });
    }
    if (message.type === "end-of-call-report") {
        await db_1.db
            .update(schema_1.calls)
            .set({
            status: "completed",
            duration: message.durationSeconds,
            transcript: message.transcript,
            recordingUrl: message.recordingUrl,
            endedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.calls.vapiCallId, message.call.id));
    }
    res.json({ ok: true });
});
exports.default = router;
